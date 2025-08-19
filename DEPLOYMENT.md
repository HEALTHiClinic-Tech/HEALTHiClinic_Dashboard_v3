# Vercel Deployment Guide

## Environment Variables Required

When deploying to Vercel, you need to add the following environment variables in your Vercel project settings:

### Required Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to Deploy to Vercel

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import from GitHub: `HEALTHiClinic-Tech/HEALTHiClinic_Dashboard_v3`

2. **Configure Environment Variables**
   - In the "Environment Variables" section during import (or in Settings → Environment Variables after deployment)
   - Add the two required variables above with your Supabase credentials

3. **Deploy Settings** (Already configured in vercel.json)
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Click Deploy**
   - Vercel will automatically build and deploy your application
   - You'll get a production URL like `your-project.vercel.app`

## Post-Deployment

1. **Update Supabase URL Whitelist**
   - Go to your Supabase project settings
   - Add your Vercel domains to the allowed URLs:
     - `https://your-project.vercel.app`
     - `https://your-custom-domain.com` (if using custom domain)

2. **Configure Custom Domain (Optional)**
   - In Vercel project settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

## Troubleshooting

- **Build Errors**: Check that all environment variables are set correctly
- **Database Connection Issues**: Ensure Supabase project is active and URLs are whitelisted
- **404 Errors**: Next.js App Router handles routing automatically, no additional configuration needed

## Automatic Deployments

Once connected, Vercel will automatically deploy:
- Every push to the `main` branch (Production)
- Every pull request (Preview deployments)

## Performance Optimizations

The application is already optimized for Vercel with:
- Static generation where possible
- Dynamic imports for heavy components
- Proper TypeScript configuration
- Tailwind CSS purging for minimal CSS bundle