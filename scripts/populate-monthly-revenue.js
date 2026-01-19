/**
 * Script to populate monthly revenue data for all doctors
 * Data extracted from HEALTHiClinic payment summary screenshots
 * Period: September 2024 - January 2026 (17 months)
 *
 * Usage: node scripts/populate-monthly-revenue.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Revenue data extracted from screenshots - keyed by doctor name
// Each entry: { year, month, credit_card, cash, other, internet_transfer, cheque, hicaps, amex, medicare_epc, ndis, insurance }
const revenueData = {
  'Damien Lafferty': [
    // 2024
    { year: 2024, month: 9, credit_card: 8170.70, cash: 250.00, other: 95.00, internet_transfer: 9170.00, hicaps: 834.30 },
    { year: 2024, month: 10, credit_card: 6179.00, cash: 766.40, internet_transfer: 9595.00, hicaps: 4294.60 },
    { year: 2024, month: 11, credit_card: 6468.60, internet_transfer: 4450.00, hicaps: 176.40 },
    { year: 2024, month: 12, credit_card: 1678.00, cash: 200.00, internet_transfer: 4900.00, hicaps: 102.00 },
    // 2025
    { year: 2025, month: 1, credit_card: 10094.70, internet_transfer: 5183.75, hicaps: 1050.30 },
    { year: 2025, month: 2, credit_card: 10591.05, other: 110.00, internet_transfer: 1715.00, hicaps: 1298.95 },
    { year: 2025, month: 3, credit_card: 12796.75, internet_transfer: 250.00, hicaps: 1323.25, amex: 95.00 },
    { year: 2025, month: 4, credit_card: 10033.04, internet_transfer: 250.00, hicaps: 1186.95, amex: 225.00 },
    { year: 2025, month: 5, credit_card: 14279.90, internet_transfer: 950.00, hicaps: 1520.10, amex: 160.00 },
    { year: 2025, month: 6, credit_card: 6716.30, cash: 95.00, internet_transfer: 3100.00, hicaps: 693.70, amex: 250.00 },
    { year: 2025, month: 7, credit_card: 17052.60, hicaps: 2127.40 },
    { year: 2025, month: 8, credit_card: 9367.70, hicaps: 807.30 },
    { year: 2025, month: 9, credit_card: 12145.60, cash: 255.00, hicaps: 1189.40 },
    { year: 2025, month: 10, credit_card: 18196.50, hicaps: 1852.50, amex: 256.00 },
    { year: 2025, month: 11, credit_card: 18213.50, internet_transfer: 3290.00, hicaps: 1679.50, amex: 1282.00 },
    { year: 2025, month: 12, credit_card: 17351.25, cash: 290.00, internet_transfer: 115.00, hicaps: 2112.50, amex: 95.00 },
    // 2026
    { year: 2026, month: 1, credit_card: 4167.60, hicaps: 447.40 },
  ],
  'Joseph Gracé': [
    { year: 2025, month: 8, credit_card: 7261.85, cash: 1095.00 },
    { year: 2025, month: 9, credit_card: 17242.25 },
    { year: 2025, month: 10, credit_card: 23075.39, cash: 662.00 },
    { year: 2025, month: 11, credit_card: 12421.79, cash: 570.00 },
    { year: 2025, month: 12, credit_card: 5339.05 },
  ],
  'Hamid Hajian': [
    { year: 2025, month: 8, credit_card: 1760.00 },
    { year: 2025, month: 9, credit_card: 16821.80, cash: 750.00 },
    { year: 2025, month: 10, credit_card: 2522.65 },
    { year: 2025, month: 11, credit_card: 6820.90, amex: 1029.00 },
    { year: 2025, month: 12, credit_card: 7449.75, cash: 639.25 },
    { year: 2026, month: 1, credit_card: 5110.00, cash: 1010.75 },
  ],
  'Carlos Tahuil-Ochoa': [
    { year: 2025, month: 8, credit_card: 550.00 },
    { year: 2025, month: 9, credit_card: 7631.90 },
    { year: 2025, month: 10, credit_card: 4410.90, amex: 100.00 },
    { year: 2025, month: 11, credit_card: 3901.40, cash: 50.00, amex: 355.00 },
    { year: 2025, month: 12, credit_card: 6209.05, cash: 360.75, other: 412.30, amex: 800.00 },
    { year: 2026, month: 1, credit_card: 705.00 },
  ],
  'David Robinson': [
    { year: 2025, month: 8, credit_card: 1560.00 },
    { year: 2025, month: 9, credit_card: 912.30 },
    { year: 2025, month: 10, credit_card: 6975.57, amex: 350.00 },
    { year: 2025, month: 11, credit_card: 4537.30, cash: 500.00, amex: 850.00 },
    { year: 2025, month: 12, credit_card: 450.00 },
  ],
  'Kristopher Sanford': [
    { year: 2025, month: 7, credit_card: 249.00 },
    { year: 2025, month: 8, credit_card: 368.00 },
    { year: 2025, month: 9, credit_card: 353.90, hicaps: 198.10 },
    { year: 2025, month: 10, credit_card: 390.70, hicaps: 180.50 },
    { year: 2025, month: 11, credit_card: 688.55, hicaps: 415.45 },
    { year: 2025, month: 12, credit_card: 1071.55, hicaps: 151.45 },
    { year: 2026, month: 1, credit_card: 422.90, hicaps: 172.10 },
  ],
  'Niro Sivathasan': [
    { year: 2025, month: 9, credit_card: 270.00 },
    { year: 2025, month: 10, credit_card: 9430.00 },
    { year: 2025, month: 11, credit_card: 150.00, internet_transfer: 540.00 },
    { year: 2025, month: 12, credit_card: 6498.40, internet_transfer: 270.00 },
    { year: 2026, month: 1, credit_card: 300.00 },
  ],
  'Kelby Govender': [
    { year: 2025, month: 8, credit_card: 500.00 },
    { year: 2025, month: 9, credit_card: 2910.00 },
    { year: 2025, month: 10, credit_card: 175.00 },
    { year: 2025, month: 11, credit_card: 4475.00 },
    { year: 2025, month: 12, credit_card: 2350.00 },
    { year: 2026, month: 1, credit_card: 200.00 },
  ],
};

// Helper function to get month name
function getMonthName(month) {
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month];
}

async function populateRevenue() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('💰 HEALTHiClinic Monthly Revenue Data Population');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Step 1: Get all doctors from database
  console.log('🔍 Fetching doctors from database...\n');

  const { data: doctors, error: doctorError } = await supabase
    .from('doctors')
    .select('id, first_name, last_name')
    .eq('active', true);

  if (doctorError) {
    console.error('Error fetching doctors:', doctorError);
    process.exit(1);
  }

  // Create a map of doctor names to IDs
  const doctorMap = {};
  doctors.forEach(doc => {
    const fullName = `${doc.first_name} ${doc.last_name}`;
    doctorMap[fullName] = doc.id;
    console.log(`  ✓ Found: ${fullName} (${doc.id.substring(0, 8)}...)`);
  });
  console.log(`\n  Total doctors found: ${doctors.length}\n`);

  // Step 2: Prepare all revenue records
  console.log('📊 Preparing revenue records...\n');

  const allRecords = [];
  let totalRevenue = 0;
  let recordCount = 0;

  for (const [doctorName, revenues] of Object.entries(revenueData)) {
    const doctorId = doctorMap[doctorName];

    if (!doctorId) {
      console.log(`  ⚠️  Doctor "${doctorName}" not found in database - skipping`);
      continue;
    }

    console.log(`  Processing: ${doctorName}`);

    for (const rev of revenues) {
      // Calculate total for this record
      const total = (rev.credit_card || 0) + (rev.cash || 0) + (rev.other || 0) +
                    (rev.internet_transfer || 0) + (rev.cheque || 0) + (rev.hicaps || 0) +
                    (rev.amex || 0) + (rev.medicare_epc || 0) + (rev.ndis || 0) + (rev.insurance || 0);

      allRecords.push({
        doctor_id: doctorId,
        year: rev.year,
        month: rev.month,
        credit_card: rev.credit_card || 0,
        cash: rev.cash || 0,
        other: rev.other || 0,
        internet_transfer: rev.internet_transfer || 0,
        cheque: rev.cheque || 0,
        hicaps: rev.hicaps || 0,
        amex: rev.amex || 0,
        medicare_epc: rev.medicare_epc || 0,
        ndis: rev.ndis || 0,
        insurance: rev.insurance || 0,
        notes: `Imported from HEALTHiClinic reports on ${new Date().toISOString().split('T')[0]}`
      });

      totalRevenue += total;
      recordCount++;
      console.log(`    - ${getMonthName(rev.month)} ${rev.year}: $${total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`);
    }
  }

  console.log(`\n  Total records to insert: ${recordCount}`);
  console.log(`  Combined revenue: $${totalRevenue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}\n`);

  // Step 3: Upsert all records
  console.log('💾 Inserting/updating revenue records...\n');

  const { data: result, error: upsertError } = await supabase
    .from('monthly_revenue')
    .upsert(allRecords, {
      onConflict: 'doctor_id,year,month'
    })
    .select();

  if (upsertError) {
    console.error('❌ Error inserting revenue:', upsertError);
    process.exit(1);
  }

  console.log('✅ Successfully inserted/updated all revenue records!\n');

  // Step 4: Generate summary report
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📋 REVENUE DATA SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Query to get totals by doctor
  const { data: summary } = await supabase
    .from('monthly_revenue')
    .select('doctor_id, total, year, month');

  // Calculate totals per doctor
  const doctorTotals = {};
  const yearlyTotals = {};

  for (const rec of summary || []) {
    // Doctor totals
    if (!doctorTotals[rec.doctor_id]) {
      doctorTotals[rec.doctor_id] = { total: 0, months: 0 };
    }
    doctorTotals[rec.doctor_id].total += parseFloat(rec.total);
    doctorTotals[rec.doctor_id].months++;

    // Yearly totals
    if (!yearlyTotals[rec.year]) {
      yearlyTotals[rec.year] = 0;
    }
    yearlyTotals[rec.year] += parseFloat(rec.total);
  }

  // Display doctor rankings
  console.log('🏆 DOCTOR REVENUE RANKINGS (All Time)\n');

  const rankings = Object.entries(doctorTotals)
    .map(([id, data]) => {
      const doctor = doctors.find(d => d.id === id);
      return {
        name: doctor ? `${doctor.first_name} ${doctor.last_name}` : 'Unknown',
        ...data
      };
    })
    .sort((a, b) => b.total - a.total);

  rankings.forEach((doc, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
    const avg = doc.total / doc.months;
    console.log(`  ${medal} ${doc.name.padEnd(25)} $${doc.total.toLocaleString('en-AU', { minimumFractionDigits: 2 }).padStart(12)} (${doc.months} months, avg: $${avg.toLocaleString('en-AU', { minimumFractionDigits: 2 })})`);
  });

  // Display yearly totals
  console.log('\n📅 YEARLY REVENUE TOTALS\n');

  Object.entries(yearlyTotals)
    .sort(([a], [b]) => a - b)
    .forEach(([year, total]) => {
      console.log(`  ${year}: $${total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`);
    });

  const grandTotal = Object.values(yearlyTotals).reduce((sum, val) => sum + val, 0);
  console.log(`\n  GRAND TOTAL: $${grandTotal.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 Revenue data population complete!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

populateRevenue().catch(console.error);
