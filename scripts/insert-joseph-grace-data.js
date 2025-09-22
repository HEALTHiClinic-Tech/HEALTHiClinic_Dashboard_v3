const { createClient } = require('@supabase/supabase-js')

// Read environment variables from .env.local file
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

// Initialize Supabase client
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Function to get ISO week number
function getISOWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

// Dr. Joseph Grace's appointment data
const appointmentData = [
  // 2024
  { date: '2024-09-09', appointments: 16 },
  { date: '2024-09-16', appointments: 10 },
  { date: '2024-09-23', appointments: 5 },
  { date: '2024-09-30', appointments: 11 },
  { date: '2024-10-07', appointments: 2 },
  { date: '2024-10-14', appointments: 12 },
  { date: '2024-10-21', appointments: 2 },
  { date: '2024-10-28', appointments: 4 },
  { date: '2024-11-04', appointments: 16 },
  { date: '2024-11-11', appointments: 14 },
  { date: '2024-11-18', appointments: 11 },
  { date: '2024-11-25', appointments: 13 },
  { date: '2024-12-02', appointments: 11 },
  { date: '2024-12-09', appointments: 4 },
  { date: '2024-12-16', appointments: 2 },
  { date: '2024-12-23', appointments: 0 },
  { date: '2024-12-30', appointments: 0 },
  
  // 2025
  { date: '2025-01-06', appointments: 0 },
  { date: '2025-01-13', appointments: 4 },
  { date: '2025-01-20', appointments: 0 },
  { date: '2025-01-27', appointments: 0 },
  { date: '2025-02-03', appointments: 2 },
  { date: '2025-02-10', appointments: 0 },
  { date: '2025-02-17', appointments: 0 },
  { date: '2025-02-24', appointments: 0 },
  { date: '2025-03-03', appointments: 4 },
  { date: '2025-03-10', appointments: 0 },
  { date: '2025-03-17', appointments: 9 },
  { date: '2025-03-24', appointments: 3 },
  { date: '2025-03-31', appointments: 6 },
  { date: '2025-04-07', appointments: 11 },
  { date: '2025-04-14', appointments: 0 },
  { date: '2025-04-21', appointments: 8 },
  { date: '2025-04-28', appointments: 7 },
  { date: '2025-05-05', appointments: 7 },
  { date: '2025-05-12', appointments: 6 },
  { date: '2025-05-19', appointments: 4 },
  { date: '2025-05-26', appointments: 0 },
  { date: '2025-06-02', appointments: 9 },
  { date: '2025-06-09', appointments: 9 },
  { date: '2025-06-16', appointments: 14 },
  { date: '2025-06-23', appointments: 20 },
  { date: '2025-06-30', appointments: 0 },
  { date: '2025-07-07', appointments: 12 },
  { date: '2025-07-14', appointments: 0 },
  { date: '2025-07-21', appointments: 22 },
  { date: '2025-07-28', appointments: 24 },
  { date: '2025-08-04', appointments: 22 },
  { date: '2025-08-11', appointments: 21 },
  { date: '2025-08-18', appointments: 12 }
]

async function insertAppointmentData() {
  try {
    console.log('🔍 Finding Dr. Joseph Grace in the database...')
    
    // Find Dr. Joseph Grace's ID
    const { data: doctors, error: doctorError } = await supabase
      .from('doctors')
      .select('id, first_name, last_name')
      .eq('first_name', 'Joseph')
      .eq('last_name', 'Grace')
      .single()
    
    if (doctorError) {
      console.error('❌ Error finding doctor:', doctorError)
      return
    }
    
    if (!doctors) {
      console.error('❌ Dr. Joseph Grace not found in database')
      return
    }
    
    console.log(`✅ Found Dr. Joseph Grace with ID: ${doctors.id}`)
    const doctorId = doctors.id
    
    // First, delete any existing data for Dr. Joseph Grace to avoid duplicates
    console.log('🧹 Cleaning up any existing data...')
    const { error: deleteError } = await supabase
      .from('weekly_appointments')
      .delete()
      .eq('doctor_id', doctorId)
    
    if (deleteError) {
      console.error('❌ Error deleting existing data:', deleteError)
      return
    }
    
    console.log('📝 Preparing appointment records...')
    
    // Prepare all records for insertion
    const records = []
    
    for (const item of appointmentData) {
      // Skip weeks with 0 appointments - we don't need to insert these
      if (item.appointments === 0) continue
      
      const date = new Date(item.date)
      const year = date.getFullYear()
      const weekNumber = getISOWeek(date)
      
      records.push({
        doctor_id: doctorId,
        year: year,
        week_number: weekNumber,
        appointment_count: item.appointments,
        notes: `Week starting ${item.date}`
      })
    }
    
    console.log(`📊 Inserting ${records.length} weekly appointment records...`)
    
    // Insert all records in batches of 10
    const batchSize = 10
    let inserted = 0
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('weekly_appointments')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`❌ Error inserting batch starting at index ${i}:`, error)
        return
      }
      
      inserted += batch.length
      console.log(`✅ Inserted ${inserted}/${records.length} records...`)
    }
    
    console.log('✨ All appointment data successfully inserted!')
    
    // Verify the data
    console.log('\n📊 Verification Summary:')
    const { data: summary, error: summaryError } = await supabase
      .from('weekly_appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('year', { ascending: true })
      .order('week_number', { ascending: true })
    
    if (!summaryError && summary) {
      const totalAppointments = summary.reduce((sum, record) => sum + record.appointment_count, 0)
      const weeksWithAppointments = summary.length
      const avgPerWeek = (totalAppointments / weeksWithAppointments).toFixed(1)
      
      console.log(`📈 Total appointments: ${totalAppointments}`)
      console.log(`📅 Weeks with appointments: ${weeksWithAppointments}`)
      console.log(`📊 Average per active week: ${avgPerWeek}`)
      console.log(`📆 Date range: ${summary[0].year} Week ${summary[0].week_number} to ${summary[summary.length - 1].year} Week ${summary[summary.length - 1].week_number}`)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
console.log('🚀 Starting data insertion for Dr. Joseph Grace...\n')
insertAppointmentData()