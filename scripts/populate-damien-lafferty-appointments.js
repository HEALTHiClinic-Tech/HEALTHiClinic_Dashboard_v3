/**
 * Script to populate Dr. Damien Lafferty's weekly appointment data
 *
 * Usage: node scripts/populate-damien-lafferty-appointments.js
 *
 * Data extracted from HEALTHiClinic appointment reports
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dr. Damien Lafferty's appointment data extracted from screenshots
const appointmentData = [
  { weekStart: '2025-10-27', year: 2025, weekNumber: 44, appointments: 25 },  // Oct 27 - Nov 2
  { weekStart: '2025-11-03', year: 2025, weekNumber: 45, appointments: 20 },  // Nov 3 - Nov 9
  { weekStart: '2025-11-10', year: 2025, weekNumber: 46, appointments: 24 },  // Nov 10 - Nov 16
  { weekStart: '2025-11-17', year: 2025, weekNumber: 47, appointments: 19 },  // Nov 17 - Nov 23
  { weekStart: '2025-11-24', year: 2025, weekNumber: 48, appointments: 25 },  // Nov 24 - Nov 30
  { weekStart: '2025-12-01', year: 2025, weekNumber: 49, appointments: 25 },  // Dec 1 - Dec 7
  { weekStart: '2025-12-08', year: 2025, weekNumber: 50, appointments: 28 },  // Dec 8 - Dec 14
  { weekStart: '2025-12-15', year: 2025, weekNumber: 51, appointments: 31 },  // Dec 15 - Dec 21
  { weekStart: '2025-12-22', year: 2025, weekNumber: 52, appointments: 0 },   // Dec 22 - Dec 28
  { weekStart: '2025-12-29', year: 2025, weekNumber: 1, appointments: 0 },    // Dec 29 - Jan 4 (Week 1 of 2026)
  { weekStart: '2026-01-05', year: 2026, weekNumber: 2, appointments: 1 },    // Jan 5 - Jan 11
  { weekStart: '2026-01-12', year: 2026, weekNumber: 3, appointments: 24 },   // Jan 12 - Jan 18
  { weekStart: '2026-01-19', year: 2026, weekNumber: 4, appointments: 14 },   // Jan 19 - Jan 25
  { weekStart: '2026-01-26', year: 2026, weekNumber: 5, appointments: 14 },   // Jan 26 - Feb 1
  { weekStart: '2026-02-02', year: 2026, weekNumber: 6, appointments: 19 },   // Feb 2 - Feb 8
  { weekStart: '2026-02-09', year: 2026, weekNumber: 7, appointments: 17 },   // Feb 9 - Feb 15
  { weekStart: '2026-02-16', year: 2026, weekNumber: 8, appointments: 15 },   // Feb 16 - Feb 22
  { weekStart: '2026-02-23', year: 2026, weekNumber: 9, appointments: 19 },   // Feb 23 - Mar 1
  { weekStart: '2026-03-02', year: 2026, weekNumber: 10, appointments: 22 },  // Mar 2 - Mar 8
  { weekStart: '2026-03-09', year: 2026, weekNumber: 11, appointments: 15 },  // Mar 9 - Mar 15
  { weekStart: '2026-03-16', year: 2026, weekNumber: 12, appointments: 23 },  // Mar 16 - Mar 22
  { weekStart: '2026-03-23', year: 2026, weekNumber: 13, appointments: 25 },  // Mar 23 - Mar 29
  { weekStart: '2026-03-30', year: 2026, weekNumber: 14, appointments: 15 },  // Mar 30 - Apr 5
];

async function populateAppointments() {
  console.log('🔍 Looking for Dr. Damien Lafferty in the database...\n');

  // Step 1: Find Dr. Damien Lafferty's ID
  const { data: doctors, error: doctorError } = await supabase
    .from('doctors')
    .select('*')
    .eq('first_name', 'Damien')
    .eq('last_name', 'Lafferty');

  if (doctorError) {
    console.error('Error fetching doctor:', doctorError);
    process.exit(1);
  }

  if (!doctors || doctors.length === 0) {
    console.error('❌ Dr. Damien Lafferty not found in the database.');
    console.log('Please make sure the doctor exists in the doctors table.');
    process.exit(1);
  }

  const doctor = doctors[0];
  console.log(`✅ Found Dr. Damien Lafferty!`);
  console.log(`   ID: ${doctor.id}`);
  console.log(`   Specialty: ${doctor.specialty || 'Not specified'}`);
  console.log(`   Weekly Target: ${doctor.weekly_target || 'Not set'}`);
  console.log('');

  // Step 2: Prepare appointment records
  console.log('📊 Preparing appointment data for insertion...\n');

  const records = appointmentData.map(data => ({
    doctor_id: doctor.id,
    year: data.year,
    week_number: data.weekNumber,
    week_start_date: data.weekStart,
    appointment_count: data.appointments,
    notes: `Imported from HEALTHiClinic reports on ${new Date().toISOString().split('T')[0]}`
  }));

  // Step 3: Upsert all records (insert or update if exists)
  console.log('💾 Inserting appointment data...\n');

  const { data: result, error: upsertError } = await supabase
    .from('weekly_appointments')
    .upsert(records, {
      onConflict: 'doctor_id,year,week_number'
    })
    .select();

  if (upsertError) {
    console.error('❌ Error inserting appointments:', upsertError);
    process.exit(1);
  }

  console.log('✅ Successfully inserted/updated appointment data!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 SUMMARY - Dr. Damien Lafferty Appointments');
  console.log('═══════════════════════════════════════════════════════════');

  let totalAppointments = 0;
  appointmentData.forEach(data => {
    const status = data.appointments === 0 ? '🏖️ (Holiday)' :
                   data.appointments >= 25 ? '🌟 Great!' :
                   data.appointments >= 20 ? '✅ Good' : '📊';
    console.log(`Week ${data.weekNumber.toString().padStart(2)} of ${data.year} (${data.weekStart}): ${data.appointments.toString().padStart(2)} appointments ${status}`);
    totalAppointments += data.appointments;
  });

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📈 Total Appointments: ${totalAppointments}`);
  console.log(`📊 Average per Week: ${(totalAppointments / appointmentData.length).toFixed(1)}`);
  console.log(`📅 Weeks Covered: ${appointmentData.length}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n🎉 Done! The data should now appear in your dashboard.');
}

populateAppointments().catch(console.error);
