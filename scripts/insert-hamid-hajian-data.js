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

// Dr. Hamid Hajian's appointment data
const appointmentData = [
  // 2024
  { date: '2024-09-09', appointments: 4 },
  { date: '2024-09-16', appointments: 6 },
  { date: '2024-09-23', appointments: 8 },
  { date: '2024-09-30', appointments: 3 },
  { date: '2024-10-07', appointments: 0 },  // No appointments
  { date: '2024-10-14', appointments: 4 },
  { date: '2024-10-21', appointments: 9 },
  { date: '2024-10-28', appointments: 3 },
  { date: '2024-11-04', appointments: 6 },
  { date: '2024-11-11', appointments: 4 },
  { date: '2024-11-18', appointments: 3 },
  { date: '2024-11-25', appointments: 3 },
  { date: '2024-12-02', appointments: 6 },
  { date: '2024-12-09', appointments: 5 },
  { date: '2024-12-16', appointments: 1 },
  { date: '2024-12-23', appointments: 1 },
  { date: '2024-12-30', appointments: 0 },  // No appointments
  
  // 2025
  { date: '2025-01-06', appointments: 0 },  // No appointments
  { date: '2025-01-13', appointments: 6 },
  { date: '2025-01-20', appointments: 3 },
  { date: '2025-01-27', appointments: 1 },
  { date: '2025-02-03', appointments: 4 },
  { date: '2025-02-10', appointments: 5 },
  { date: '2025-02-17', appointments: 2 },
  { date: '2025-02-24', appointments: 1 },
  { date: '2025-03-03', appointments: 5 },
  { date: '2025-03-10', appointments: 5 },
  { date: '2025-03-17', appointments: 2 },
  { date: '2025-03-24', appointments: 2 },
  { date: '2025-03-31', appointments: 7 },
  { date: '2025-04-07', appointments: 1 },
  { date: '2025-04-14', appointments: 4 },
  { date: '2025-04-21', appointments: 1 },
  { date: '2025-04-28', appointments: 2 },
  { date: '2025-05-05', appointments: 2 },
  { date: '2025-05-12', appointments: 1 },
  { date: '2025-05-19', appointments: 3 },
  { date: '2025-05-26', appointments: 4 },
  { date: '2025-06-02', appointments: 5 },
  { date: '2025-06-09', appointments: 1 },
  { date: '2025-06-16', appointments: 2 },
  { date: '2025-06-23', appointments: 3 },
  { date: '2025-06-30', appointments: 3 },
  { date: '2025-07-07', appointments: 5 },
  { date: '2025-07-14', appointments: 1 },
  { date: '2025-07-21', appointments: 3 },
  { date: '2025-07-28', appointments: 3 },
  { date: '2025-08-04', appointments: 6 },
  { date: '2025-08-11', appointments: 3 },
  { date: '2025-08-18', appointments: 3 }
]

async function insertAppointmentData() {
  try {
    console.log('🔍 Finding Dr. Hamid Hajian in the database...')
    
    // Find Dr. Hamid Hajian's ID
    const { data: doctors, error: doctorError } = await supabase
      .from('doctors')
      .select('id, first_name, last_name')
      .eq('first_name', 'Hamid')
      .eq('last_name', 'Hajian')
      .single()
    
    if (doctorError) {
      console.error('❌ Error finding doctor:', doctorError)
      
      // If doctor not found, list all doctors to help identify the correct one
      console.log('\n📋 Listing all doctors in the database:')
      const { data: allDoctors, error: listError } = await supabase
        .from('doctors')
        .select('id, title, first_name, last_name')
        .order('last_name', { ascending: true })
      
      if (!listError && allDoctors) {
        allDoctors.forEach(doc => {
          console.log(`  - ${doc.title || 'Dr.'} ${doc.first_name} ${doc.last_name} (ID: ${doc.id})`)
        })
        console.log('\nPlease check if Dr. Hamid Hajian exists with a different spelling.')
      }
      return
    }
    
    if (!doctors) {
      console.error('❌ Dr. Hamid Hajian not found in database')
      
      // Offer to create the doctor if not found
      console.log('\n💡 Would you like to create Dr. Hamid Hajian in the database first?')
      console.log('   Run: npm run create-doctor "Hamid" "Hajian"')
      return
    }
    
    console.log(`✅ Found Dr. Hamid Hajian with ID: ${doctors.id}`)
    const doctorId = doctors.id
    
    // First, delete any existing data for Dr. Hamid Hajian to avoid duplicates
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
      // Include ALL weeks, even those with 0 appointments
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
    console.log('\n📊 Verification Summary for Dr. Hamid Hajian:')
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
      
      // Year-by-year breakdown
      const yearBreakdown = {}
      summary.forEach(record => {
        if (!yearBreakdown[record.year]) {
          yearBreakdown[record.year] = {
            appointments: 0,
            weeks: 0
          }
        }
        yearBreakdown[record.year].appointments += record.appointment_count
        yearBreakdown[record.year].weeks++
      })
      
      console.log('\n📅 Year-by-Year Breakdown:')
      Object.keys(yearBreakdown).sort().forEach(year => {
        const data = yearBreakdown[year]
        console.log(`  ${year}: ${data.appointments} appointments across ${data.weeks} weeks (avg: ${(data.appointments / data.weeks).toFixed(1)}/week)`)
      })
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
console.log('🚀 Starting data insertion for Dr. Hamid Hajian...')
console.log('📊 Data Summary:')
console.log('  - Total unique appointments: 165')
console.log('  - Weeks with appointments: 47 out of 50')
console.log('  - Average appointments per active week: 3.5')
console.log('  - Date range: September 9, 2024 to August 18, 2025\n')

insertAppointmentData()