import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ─── Configuration ───────────────────────────────────────────────────────────

const CLINIKO_API_KEY = process.env.CLINIKO_API_KEY || ''
const CLINIKO_BASE_URL = process.env.CLINIKO_API_BASE_URL || 'https://api.au1.cliniko.com/v1'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const CRON_SECRET = process.env.CRON_SECRET || ''

// HEALTHiClinic business ID in Cliniko
const HEALTHICLINIC_BUSINESS_ID = '1603211934910383114'

// Number of weeks to sync (keep small for Hobby plan timeout)
const WEEKS_TO_SYNC = 3

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CLINIKO_HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'HEALTHiClinic Dashboard (info@echoflowsolutions.com.au)',
  'Authorization': 'Basic ' + Buffer.from(CLINIKO_API_KEY + ':').toString('base64')
}

async function clinikoFetch(endpoint: string, params: Record<string, string | string[]> = {}) {
  const url = new URL(`${CLINIKO_BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v))
    } else {
      url.searchParams.set(key, value)
    }
  })

  const response = await fetch(url.toString(), { headers: CLINIKO_HEADERS })
  if (!response.ok) {
    throw new Error(`Cliniko API ${response.status}: ${await response.text()}`)
  }
  return response.json()
}

function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { week: weekNumber, year: d.getUTCFullYear() }
}

function getSydneyOffsetHours(date: Date): number {
  const month = date.getMonth()
  if (month >= 3 && month <= 9) {
    if (month === 3) {
      const firstSunday = new Date(date.getFullYear(), 3, 1)
      while (firstSunday.getDay() !== 0) firstSunday.setDate(firstSunday.getDate() + 1)
      return date < firstSunday ? 11 : 10
    }
    if (month === 9) {
      const firstSunday = new Date(date.getFullYear(), 9, 1)
      while (firstSunday.getDay() !== 0) firstSunday.setDate(firstSunday.getDate() + 1)
      return date >= firstSunday ? 11 : 10
    }
    return 10
  }
  return 11
}

interface ClinikoAppointment {
  patient_name: string | null
  did_not_arrive: boolean
  cancelled_at: string | null
  starts_at: string
  business?: { links?: { self?: string } }
}

async function countWeeklyAppointments(clinikoId: string, weekStart: Date) {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const offsetStart = getSydneyOffsetHours(weekStart)
  const offsetEnd = getSydneyOffsetHours(weekEnd)

  const utcStart = new Date(weekStart)
  utcStart.setHours(utcStart.getHours() - offsetStart)
  const utcEnd = new Date(weekEnd)
  utcEnd.setHours(utcEnd.getHours() - offsetEnd)

  let allAppointments: ClinikoAppointment[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const data = await clinikoFetch(`/practitioners/${clinikoId}/appointments`, {
      'q[]': [
        `starts_at:>=:${utcStart.toISOString().replace('.000Z', 'Z')}`,
        `starts_at:<:${utcEnd.toISOString().replace('.000Z', 'Z')}`
      ],
      'per_page': '100',
      'page': String(page)
    })

    const appointments = data.appointments || []
    allAppointments = allAppointments.concat(appointments)
    hasMore = appointments.length >= 100
    page++
  }

  // Filter to HEALTHiClinic business only
  const healthiAppts = allAppointments.filter((a: ClinikoAppointment) => {
    const bizUrl = a.business?.links?.self || ''
    return bizUrl.endsWith(`/${HEALTHICLINIC_BUSINESS_ID}`)
  })

  // Count valid: has patient, not DNA, not cancelled
  return healthiAppts.filter((a: ClinikoAppointment) =>
    a.patient_name !== null &&
    a.patient_name !== undefined &&
    !a.did_not_arrive &&
    a.cancelled_at === null
  ).length
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!CLINIKO_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const startTime = Date.now()

  try {
    // 1. Fetch practitioners from both systems
    const clinikoData = await clinikoFetch('/practitioners')
    const clinikoPractitioners = clinikoData.practitioners.filter((p: { active: boolean }) => p.active)

    const { data: supabaseDoctors, error: dbError } = await supabase
      .from('doctors')
      .select('*')
      .eq('active', true)

    if (dbError) throw new Error(`Supabase: ${dbError.message}`)

    // 2. Match by name
    const matches = clinikoPractitioners
      .map((cp: { id: string; first_name: string; last_name: string; title: string }) => {
        const sd = supabaseDoctors?.find(
          (d: { first_name: string; last_name: string }) =>
            d.first_name.toLowerCase() === cp.first_name.toLowerCase() &&
            d.last_name.toLowerCase() === cp.last_name.toLowerCase()
        )
        return sd ? { clinikoId: cp.id, supabaseId: sd.id, name: `${cp.title} ${cp.first_name} ${cp.last_name}` } : null
      })
      .filter(Boolean) as { clinikoId: string; supabaseId: string; name: string }[]

    // 3. Calculate weeks to sync
    const today = new Date()
    const weeks: { weekNumber: number; year: number; startDate: Date; startDateStr: string }[] = []

    // Go back WEEKS_TO_SYNC weeks from current Monday
    const dayOfWeek = today.getDay() || 7
    const currentMonday = new Date(today)
    currentMonday.setDate(today.getDate() - dayOfWeek + 1)

    for (let i = WEEKS_TO_SYNC - 1; i >= 0; i--) {
      const weekStart = new Date(currentMonday)
      weekStart.setDate(currentMonday.getDate() - i * 7)
      const { week, year } = getISOWeek(weekStart)
      weeks.push({
        weekNumber: week,
        year,
        startDate: weekStart,
        startDateStr: weekStart.toISOString().split('T')[0]
      })
    }

    // 4. Fetch counts and build records
    const records: {
      doctor_id: string
      year: number
      week_number: number
      week_start_date: string
      appointment_count: number
      notes: string
    }[] = []

    const syncLog: string[] = []

    for (const doctor of matches) {
      for (const week of weeks) {
        const count = await countWeeklyAppointments(doctor.clinikoId, week.startDate)
        records.push({
          doctor_id: doctor.supabaseId,
          year: week.year,
          week_number: week.weekNumber,
          week_start_date: week.startDateStr,
          appointment_count: count,
          notes: `Auto-synced from Cliniko on ${new Date().toISOString().split('T')[0]}`
        })
        syncLog.push(`${doctor.name} Week ${week.weekNumber}: ${count}`)
      }
    }

    // 5. Upsert to Supabase
    const { error: upsertError } = await supabase
      .from('weekly_appointments')
      .upsert(records, { onConflict: 'doctor_id,year,week_number' })

    if (upsertError) throw new Error(`Upsert: ${upsertError.message}`)

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    const totalAppts = records.reduce((sum, r) => sum + r.appointment_count, 0)

    return NextResponse.json({
      success: true,
      message: `Synced ${records.length} records for ${matches.length} doctors across ${weeks.length} weeks`,
      totalAppointments: totalAppts,
      doctorsMatched: matches.length,
      weeksSynced: weeks.length,
      recordsUpserted: records.length,
      durationSeconds: parseFloat(duration),
      syncLog
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
