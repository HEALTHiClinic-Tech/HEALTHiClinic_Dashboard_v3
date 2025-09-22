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

async function verifyWeeklyTargets() {
  try {
    console.log('🔍 Checking weekly targets for all doctors...\n')
    
    // Fetch all doctors with their weekly targets
    const { data: doctors, error: doctorError } = await supabase
      .from('doctors')
      .select('id, title, first_name, last_name, weekly_target')
      .order('last_name', { ascending: true })
    
    if (doctorError) {
      console.error('❌ Error fetching doctors:', doctorError)
      return
    }
    
    if (!doctors || doctors.length === 0) {
      console.log('⚠️ No doctors found in the database')
      return
    }
    
    console.log('📊 Doctor Weekly Targets:')
    console.log('=' .repeat(60))
    
    doctors.forEach(doctor => {
      const fullName = `${doctor.title || 'Dr.'} ${doctor.first_name} ${doctor.last_name}`
      const target = doctor.weekly_target || 'NOT SET'
      const status = doctor.weekly_target ? '✅' : '⚠️'
      
      console.log(`${status} ${fullName.padEnd(35)} Weekly Target: ${target}`)
    })
    
    console.log('=' .repeat(60))
    
    // Check if any doctors don't have weekly targets set
    const doctorsWithoutTargets = doctors.filter(d => !d.weekly_target)
    
    if (doctorsWithoutTargets.length > 0) {
      console.log('\n⚠️ WARNING: The following doctors DO NOT have weekly targets set:')
      doctorsWithoutTargets.forEach(doctor => {
        console.log(`   - ${doctor.title || 'Dr.'} ${doctor.first_name} ${doctor.last_name}`)
      })
      console.log('\n💡 To fix this, edit each doctor in the Admin Panel and set their weekly target.')
    } else {
      console.log('\n✅ All doctors have weekly targets set!')
    }
    
    // Now check the doctor_stats_ytd view to see if it's calculating correctly
    console.log('\n🔍 Checking doctor_stats_ytd view calculations...\n')
    
    const currentYear = new Date().getFullYear()
    const { data: stats, error: statsError } = await supabase
      .from('doctor_stats_ytd')
      .select('*')
      .eq('year', currentYear)
    
    if (statsError) {
      console.error('❌ Error fetching doctor stats:', statsError)
      return
    }
    
    if (stats && stats.length > 0) {
      console.log('📈 Year-to-Date Statistics:')
      console.log('=' .repeat(80))
      console.log('Doctor'.padEnd(30) + 'Weekly Target'.padEnd(15) + 'Avg/Week'.padEnd(12) + 'Target %'.padEnd(10) + 'Status')
      console.log('-' .repeat(80))
      
      stats.forEach(stat => {
        const fullName = `${stat.title || 'Dr.'} ${stat.first_name} ${stat.last_name}`
        const weeklyTarget = stat.weekly_target || 'N/A'
        const avgPerWeek = stat.avg_appointments_per_week || 0
        const targetPercentage = stat.target_completion_percentage || 0
        
        let status = '❌ Below'
        if (targetPercentage >= 100) status = '🎯 On Target'
        else if (targetPercentage >= 80) status = '✅ Good'
        else if (targetPercentage >= 50) status = '⚠️ Fair'
        
        console.log(
          fullName.padEnd(30) +
          String(weeklyTarget).padEnd(15) +
          String(avgPerWeek).padEnd(12) +
          `${targetPercentage}%`.padEnd(10) +
          status
        )
      })
      
      console.log('=' .repeat(80))
    }
    
    // Check for any issues with the view
    const missingTargetsInView = stats.filter(s => !s.weekly_target)
    if (missingTargetsInView.length > 0) {
      console.log('\n⚠️ WARNING: The doctor_stats_ytd view is missing weekly_target for some doctors.')
      console.log('This may require running the database migration script.')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the verification
console.log('🚀 Starting weekly target verification...\n')
verifyWeeklyTargets()