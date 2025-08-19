# HEALTHiClinic Dashboard

A modern, real-time dashboard for tracking year-to-date doctor appointments at the HEALTHiClinic facility.

## Features

- **Real-time Dashboard**: Live updates with animated visualizations
- **Doctor Performance Tracking**: Monitor appointment counts per doctor
- **Weekly Trends**: Track appointment patterns throughout the year
- **Data Entry Portal**: Easy interface for recording weekly appointment data
- **Doctor Management**: Add and manage doctor records
- **Responsive Design**: Works on all screen sizes, optimized for facility monitors
- **Beautiful Animations**: Smooth transitions and engaging visual effects

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Copy and run the SQL from `supabase-schema.sql` to create all necessary tables and views
4. Go to Settings → API to find your project URL and anon key

### 2. Environment Configuration

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3005`

### 4. Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Usage

### Dashboard View (/)
- Displays real-time statistics for all doctors
- Shows weekly appointment trends
- Highlights top performers
- Auto-refreshes every 30 seconds

### Data Entry Portal (/admin)
- **Record Appointments**: Enter weekly appointment counts for each doctor
- **Add Doctors**: Register new doctors in the system
- **Update Records**: Modify existing appointment data

## Database Schema

### Tables
- **doctors**: Stores doctor information
- **weekly_appointments**: Records appointment counts per doctor per week
- **appointment_targets**: Optional yearly/monthly/weekly targets

### Views
- **doctor_stats_ytd**: Aggregated year-to-date statistics
- **weekly_trends**: Weekly appointment trends across all doctors

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Recharts**: Data visualization
- **Supabase**: Backend as a Service
- **Lucide Icons**: Beautiful icon set

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with Node.js

## Monitor Display Settings

For optimal display on facility monitors:

1. Set monitors to full-screen mode (F11 in most browsers)
2. Disable screen timeout/sleep
3. Use auto-refresh browser extension if needed
4. Consider using kiosk mode for dedicated displays

## Support

For issues or questions, please contact the IT department or create an issue in the project repository.