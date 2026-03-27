/**
 * Automated Cliniko → Supabase Appointment Sync Script
 *
 * Pulls weekly appointment counts directly from the Cliniko API
 * and upserts them into the Supabase weekly_appointments table.
 *
 * Usage:
 *   node scripts/sync-cliniko-appointments.js                    # Sync current week
 *   node scripts/sync-cliniko-appointments.js --weeks 10         # Sync last 10 weeks
 *   node scripts/sync-cliniko-appointments.js --from 2026-01-26 --to 2026-03-30  # Sync date range
 *   node scripts/sync-cliniko-appointments.js --week 5 --year 2026              # Sync specific week
 *
 * Requires in .env.local:
 *   CLINIKO_API_KEY=your-api-key
 *   CLINIKO_API_BASE_URL=https://api.au1.cliniko.com/v1
 *   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// ─── Configuration ───────────────────────────────────────────────────────────

const CLINIKO_API_KEY = process.env.CLINIKO_API_KEY;
const CLINIKO_BASE_URL = process.env.CLINIKO_API_BASE_URL || 'https://api.au1.cliniko.com/v1';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// HEALTHiClinic business ID in Cliniko - filter appointments to this location only
const HEALTHICLINIC_BUSINESS_ID = '1603211934910383114';

// Sydney timezone offset: AEDT (UTC+11) Oct-Apr, AEST (UTC+10) Apr-Oct
// We use Australia/Sydney for proper DST handling
const TIMEZONE = 'Australia/Sydney';

if (!CLINIKO_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing required environment variables. Check .env.local for:');
  console.error('   CLINIKO_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Cliniko API Helpers ─────────────────────────────────────────────────────

const CLINIKO_HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'HEALTHiClinic Dashboard (info@echoflowsolutions.com.au)',
  'Authorization': 'Basic ' + Buffer.from(CLINIKO_API_KEY + ':').toString('base64')
};

// Rate limiting: Cliniko allows ~200 requests/minute
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 350; // ms between requests

async function clinikoFetch(endpoint, params = {}) {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  const url = new URL(`${CLINIKO_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v));
    } else {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), { headers: CLINIKO_HEADERS });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cliniko API error ${response.status}: ${body}`);
  }

  return response.json();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Date/Week Helpers ───────────────────────────────────────────────────────

/**
 * Get ISO week number and year for a given date
 */
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { week: weekNumber, year: d.getUTCFullYear() };
}

/**
 * Get the Monday of a given ISO week
 */
function getWeekStartDate(year, weekNumber) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (weekNumber - 1) * 7);
  return monday;
}

/**
 * Convert a local Sydney date to UTC for Cliniko API queries
 * This handles AEDT/AEST transitions properly
 */
function sydneyToUTC(dateStr) {
  // Create a date string with timezone
  const date = new Date(dateStr + 'T00:00:00');

  // Use Intl to figure out the UTC offset for Sydney on this date
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
    timeZoneName: 'shortOffset'
  });

  // Get offset for this date in Sydney
  const parts = formatter.formatToParts(date);
  const tzName = parts.find(p => p.type === 'timeZoneName')?.value || '+11';
  const offsetMatch = tzName.match(/([+-])(\d+)/);
  const offsetHours = offsetMatch ? parseInt(offsetMatch[1] + offsetMatch[2]) : 11;

  // Convert: Sydney midnight = UTC (midnight - offset)
  const utcDate = new Date(date);
  utcDate.setHours(utcDate.getHours() - offsetHours);
  return utcDate.toISOString().replace('.000Z', 'Z');
}

/**
 * Simple offset calculation for Sydney timezone
 * AEDT (UTC+11): First Sunday of October to First Sunday of April
 * AEST (UTC+10): First Sunday of April to First Sunday of October
 */
function getSydneyOffsetHours(date) {
  const month = date.getMonth(); // 0-indexed
  // Simple heuristic: Nov-Mar = AEDT (+11), May-Sep = AEST (+10)
  // Apr and Oct need more careful handling
  if (month >= 3 && month <= 9) { // Apr-Oct
    if (month === 3) { // April - check if before first Sunday
      const firstSunday = new Date(date.getFullYear(), 3, 1);
      while (firstSunday.getDay() !== 0) firstSunday.setDate(firstSunday.getDate() + 1);
      return date < firstSunday ? 11 : 10;
    }
    if (month === 9) { // October - check if after first Sunday
      const firstSunday = new Date(date.getFullYear(), 9, 1);
      while (firstSunday.getDay() !== 0) firstSunday.setDate(firstSunday.getDate() + 1);
      return date >= firstSunday ? 11 : 10;
    }
    return 10; // AEST
  }
  return 11; // AEDT
}

// ─── Core Logic ──────────────────────────────────────────────────────────────

/**
 * Fetch all Cliniko practitioners (active only)
 */
async function fetchClinikoPractitioners() {
  const data = await clinikoFetch('/practitioners');
  return data.practitioners.filter(p => p.active);
}

/**
 * Fetch all Supabase doctors (active only)
 */
async function fetchSupabaseDoctors() {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('active', true);

  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data;
}

/**
 * Match Cliniko practitioners to Supabase doctors by name
 */
function matchPractitioners(clinikoPractitioners, supabaseDoctors) {
  const matches = [];

  for (const cp of clinikoPractitioners) {
    const sd = supabaseDoctors.find(d =>
      d.first_name.toLowerCase() === cp.first_name.toLowerCase() &&
      d.last_name.toLowerCase() === cp.last_name.toLowerCase()
    );

    if (sd) {
      matches.push({
        clinikoId: cp.id,
        supabaseId: sd.id,
        name: `${cp.title} ${cp.first_name} ${cp.last_name}`,
        weeklyTarget: sd.weekly_target
      });
    } else {
      console.log(`  ⚠️  No Supabase match for Cliniko practitioner: ${cp.title} ${cp.first_name} ${cp.last_name}`);
    }
  }

  return matches;
}

/**
 * Count valid appointments for a practitioner in a given week
 * Valid = has patient_name, not DNA, not cancelled
 */
async function countWeeklyAppointments(clinikoId, weekStartDate) {
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const startDateStr = weekStartDate.toISOString().split('T')[0];
  const endDateStr = weekEnd.toISOString().split('T')[0];

  // Convert Sydney dates to UTC for Cliniko API
  const offsetStart = getSydneyOffsetHours(weekStartDate);
  const offsetEnd = getSydneyOffsetHours(weekEnd);

  const utcStart = new Date(weekStartDate);
  utcStart.setHours(utcStart.getHours() - offsetStart);

  const utcEnd = new Date(weekEnd);
  utcEnd.setHours(utcEnd.getHours() - offsetEnd);

  const utcStartStr = utcStart.toISOString().replace('.000Z', 'Z');
  const utcEndStr = utcEnd.toISOString().replace('.000Z', 'Z');

  let allAppointments = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await clinikoFetch(`/practitioners/${clinikoId}/appointments`, {
      'q[]': [
        `starts_at:>=:${utcStartStr}`,
        `starts_at:<:${utcEndStr}`
      ],
      'per_page': '100',
      'page': String(page)
    });

    const appointments = data.appointments || [];
    allAppointments = allAppointments.concat(appointments);

    // Check for pagination
    if (appointments.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
  }

  // Filter to HEALTHiClinic business only
  const healthiClinicAppointments = allAppointments.filter(a => {
    const bizUrl = a.business?.links?.self || '';
    return bizUrl.endsWith(`/${HEALTHICLINIC_BUSINESS_ID}`);
  });

  // Count valid appointments: has patient, not DNA, not cancelled
  const validAppointments = healthiClinicAppointments.filter(a =>
    a.patient_name !== null &&
    a.patient_name !== undefined &&
    !a.did_not_arrive &&
    a.cancelled_at === null
  );

  return {
    total: healthiClinicAppointments.length,
    valid: validAppointments.length,
    dna: healthiClinicAppointments.filter(a => a.did_not_arrive).length,
    cancelled: healthiClinicAppointments.filter(a => a.cancelled_at !== null).length,
    blocks: healthiClinicAppointments.filter(a => a.patient_name === null || a.patient_name === undefined).length,
    otherLocations: allAppointments.length - healthiClinicAppointments.length
  };
}

/**
 * Sync appointments for a date range
 */
async function syncAppointments(startDate, endDate) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Cliniko → Supabase Appointment Sync');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Date range: ${startDate.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]}`);
  console.log('');

  // Step 1: Fetch practitioners from both systems
  console.log('1. Fetching practitioners...');
  const [clinikoPractitioners, supabaseDoctors] = await Promise.all([
    fetchClinikoPractitioners(),
    fetchSupabaseDoctors()
  ]);

  console.log(`   Cliniko: ${clinikoPractitioners.length} active practitioners`);
  console.log(`   Supabase: ${supabaseDoctors.length} active doctors`);

  // Step 2: Match practitioners
  console.log('\n2. Matching practitioners...');
  const matches = matchPractitioners(clinikoPractitioners, supabaseDoctors);
  console.log(`   Matched: ${matches.length} doctors`);
  matches.forEach(m => console.log(`   ✅ ${m.name}`));

  if (matches.length === 0) {
    console.error('\n❌ No practitioners matched. Check names match between Cliniko and Supabase.');
    process.exit(1);
  }

  // Step 3: Calculate weeks to sync
  console.log('\n3. Calculating weeks...');
  const weeks = [];
  let current = new Date(startDate);
  // Ensure we start on a Monday
  while (current.getDay() !== 1) {
    current.setDate(current.getDate() - 1);
  }

  while (current < endDate) {
    const { week, year } = getISOWeek(current);
    weeks.push({
      weekNumber: week,
      year: year,
      startDate: new Date(current),
      startDateStr: current.toISOString().split('T')[0]
    });
    current.setDate(current.getDate() + 7);
  }

  console.log(`   Weeks to sync: ${weeks.length} (Week ${weeks[0]?.weekNumber} → Week ${weeks[weeks.length - 1]?.weekNumber})`);

  // Step 4: Fetch appointment counts
  console.log('\n4. Fetching appointment counts from Cliniko...\n');

  const records = [];
  let totalApiCalls = 0;

  for (const doctor of matches) {
    console.log(`   📋 ${doctor.name}:`);
    const target = doctor.weeklyTarget || 0;

    for (const week of weeks) {
      const counts = await countWeeklyAppointments(doctor.clinikoId, week.startDate);
      totalApiCalls++;

      const status = counts.valid === 0 ? '  ' :
                     counts.valid >= target && target > 0 ? '🌟' :
                     counts.valid >= target * 0.75 && target > 0 ? '✅' : '  ';

      const otherLoc = counts.otherLocations > 0 ? `, other locations: ${counts.otherLocations}` : '';
      console.log(`      Week ${week.weekNumber.toString().padStart(2)} (${week.startDateStr}): ${counts.valid.toString().padStart(3)} appointments ${status}  [total: ${counts.total}, blocks: ${counts.blocks}, DNA: ${counts.dna}${otherLoc}]`);

      records.push({
        doctor_id: doctor.supabaseId,
        year: week.year,
        week_number: week.weekNumber,
        week_start_date: week.startDateStr,
        appointment_count: counts.valid,
        notes: `Auto-synced from Cliniko on ${new Date().toISOString().split('T')[0]}`
      });
    }
    console.log('');
  }

  console.log(`   Total API calls: ${totalApiCalls}`);

  // Step 5: Upsert to Supabase
  console.log('\n5. Upserting to Supabase...');

  // Upsert in batches of 50
  const BATCH_SIZE = 50;
  let upserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('weekly_appointments')
      .upsert(batch, { onConflict: 'doctor_id,year,week_number' });

    if (error) {
      console.error(`   ❌ Batch upsert error: ${error.message}`);
      process.exit(1);
    }
    upserted += batch.length;
  }

  console.log(`   ✅ Upserted ${upserted} records`);

  // Step 6: Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  SYNC COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');

  for (const doctor of matches) {
    const doctorRecords = records.filter(r => r.doctor_id === doctor.supabaseId);
    const total = doctorRecords.reduce((sum, r) => sum + r.appointment_count, 0);
    const avg = (total / doctorRecords.length).toFixed(1);
    console.log(`  ${doctor.name}: ${total} total, ${avg} avg/week`);
  }

  const grandTotal = records.reduce((sum, r) => sum + r.appointment_count, 0);
  console.log(`\n  Grand Total: ${grandTotal} appointments across ${weeks.length} weeks`);
  console.log(`  Records Updated: ${upserted}`);
  console.log('═══════════════════════════════════════════════════════════');
}

// ─── CLI Argument Parsing ────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--weeks':
        options.weeks = parseInt(args[++i]);
        break;
      case '--from':
        options.from = args[++i];
        break;
      case '--to':
        options.to = args[++i];
        break;
      case '--week':
        options.week = parseInt(args[++i]);
        break;
      case '--year':
        options.year = parseInt(args[++i]);
        break;
      case '--help':
        console.log(`
Cliniko → Supabase Appointment Sync

Usage:
  node scripts/sync-cliniko-appointments.js                         # Sync current week
  node scripts/sync-cliniko-appointments.js --weeks 10              # Sync last 10 weeks
  node scripts/sync-cliniko-appointments.js --from 2026-01-26 --to 2026-03-30
  node scripts/sync-cliniko-appointments.js --week 5 --year 2026    # Sync specific week
        `);
        process.exit(0);
    }
  }

  return options;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const options = parseArgs();
  let startDate, endDate;

  if (options.from && options.to) {
    // Explicit date range
    startDate = new Date(options.from);
    endDate = new Date(options.to);
    endDate.setDate(endDate.getDate() + 7); // Include the final week
  } else if (options.week && options.year) {
    // Specific week
    startDate = getWeekStartDate(options.year, options.week);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
  } else if (options.weeks) {
    // Last N weeks
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - (options.weeks * 7));
  } else {
    // Default: current week
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;
    startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek + 1); // Monday
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
  }

  await syncAppointments(startDate, endDate);
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
