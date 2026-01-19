/**
 * Script to list all doctors in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listDoctors() {
  console.log('📋 Listing all doctors in the database...\n');

  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('*')
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('DOCTORS IN DATABASE');
  console.log('═══════════════════════════════════════════════════════════');

  doctors.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc.title} ${doc.first_name} ${doc.last_name}`);
    console.log(`   ID: ${doc.id}`);
    console.log(`   Specialty: ${doc.specialty || 'N/A'}`);
    console.log(`   Weekly Target: ${doc.weekly_target || 'N/A'}`);
    console.log(`   Active: ${doc.active}`);
    console.log('');
  });

  console.log(`Total: ${doctors.length} doctors`);
}

listDoctors().catch(console.error);
