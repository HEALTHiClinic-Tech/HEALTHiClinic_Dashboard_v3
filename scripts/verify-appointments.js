/**
 * Script to verify Dr. Damien Lafferty's appointment data in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAppointments() {
  console.log('🔍 Verifying Dr. Damien Lafferty\'s appointments in database...\n');

  // Get doctor ID
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, first_name, last_name')
    .eq('first_name', 'Damien')
    .eq('last_name', 'Lafferty');

  if (!doctors || doctors.length === 0) {
    console.log('❌ Doctor not found');
    return;
  }

  const doctorId = doctors[0].id;

  // Get all appointments for this doctor
  const { data: appointments, error } = await supabase
    .from('weekly_appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('year', { ascending: true })
    .order('week_number', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ VERIFIED: Dr. Damien Lafferty Appointments in Database');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Records Found: ${appointments.length}\n`);

  appointments.forEach(apt => {
    console.log(`Week ${apt.week_number.toString().padStart(2)} of ${apt.year}: ${apt.appointment_count.toString().padStart(2)} appointments (${apt.week_start_date})`);
  });

  const total = appointments.reduce((sum, apt) => sum + apt.appointment_count, 0);
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`📊 Total Appointments: ${total}`);
  console.log('═══════════════════════════════════════════════════════════');
}

verifyAppointments().catch(console.error);
