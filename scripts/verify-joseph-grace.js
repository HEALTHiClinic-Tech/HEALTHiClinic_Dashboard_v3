/**
 * Script to verify Dr. Joseph Gracé's appointment data in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAppointments() {
  console.log('🔍 Verifying Dr. Joseph Gracé\'s appointments in database...\n');

  // Get doctor ID
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, first_name, last_name, weekly_target')
    .eq('first_name', 'Joseph')
    .eq('last_name', 'Gracé');

  if (!doctors || doctors.length === 0) {
    console.log('❌ Doctor not found');
    return;
  }

  const doctor = doctors[0];

  // Get appointments for Oct 2025 - Jan 2026
  const { data: appointments, error } = await supabase
    .from('weekly_appointments')
    .select('*')
    .eq('doctor_id', doctor.id)
    .gte('week_start_date', '2025-10-27')
    .lte('week_start_date', '2026-01-25')
    .order('week_start_date', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ VERIFIED: Dr. Joseph Gracé Appointments in Database');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Records Found for Period: ${appointments.length}\n`);

  appointments.forEach(apt => {
    console.log(`Week ${apt.week_number.toString().padStart(2)} of ${apt.year}: ${apt.appointment_count.toString().padStart(2)} appointments (${apt.week_start_date})`);
  });

  const total = appointments.reduce((sum, apt) => sum + apt.appointment_count, 0);
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`📊 Total Appointments: ${total}`);
  console.log(`🎯 Weekly Target: ${doctor.weekly_target}/week`);
  console.log('═══════════════════════════════════════════════════════════');
}

verifyAppointments().catch(console.error);
