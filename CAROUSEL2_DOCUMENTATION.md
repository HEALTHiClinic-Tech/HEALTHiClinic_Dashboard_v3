# Carousel2 Component Documentation

## Overview
The Carousel2 component is an enhanced doctor performance showcase dashboard that displays doctor statistics in a rotating carousel format with dynamic visualizations and performance metrics.

## Component Location
- **Main Component**: `/components/Carousel2.tsx`
- **Page Route**: `/app/carousel2/page.tsx`
- **Access URL**: `http://localhost:3005/carousel2`

## Key Features

### 1. **Doctor Statistics Display**
- Displays doctors ranked by total appointments (YTD)
- Shows comprehensive performance metrics for each doctor
- Auto-rotates through doctors every 5 seconds (configurable)

### 2. **Performance Metrics**
Each doctor card displays:
- **Ranking**: Position based on total appointments (#1, #2, etc.)
- **Weekly Target**: Individual doctor's appointment target (default: 40)
- **Total Appointments**: Year-to-date appointment count
- **Average per Week**: Calculated weekly average
- **YTD Target Progress**: Percentage of yearly target achieved
- **Weeks Worked**: Number of weeks the doctor has been active

### 3. **Interactive Chart Visualization**
- **Chart Height**: 495px (optimized for full-screen display)
- **Time Intervals**: Daily, Weekly, Monthly, 3-Monthly, 6-Monthly, YTD, All-Time
- **Chart Type**: Smooth area chart with gradient fill
- **Data Source**: Weekly appointment data from Supabase

### 4. **Summary Statistics Cards**
Three information cards below the chart:

#### Best Week Card
- Shows the week with highest appointments
- Displays appointment count
- Shows percentage vs weekly target

#### Current Period Card
- Shows the most recent period's data
- Displays appointment count
- Shows trend indicator (up/down) compared to previous period

#### Weekly Average Card
- Shows average across all weeks worked
- Displays performance status:
  - "On Target 🎯" - Meeting or exceeding target
  - "Near Target" - 80% or more of target
  - "Below Target" - Less than 80% of target

## Visual Design

### Color Themes
Each doctor has a unique gradient theme:
- **Dr. Joseph Grace**: Red gradient (`from-red-900 via-red-700 to-rose-600`)
- **Dr. Hamid Hajian**: Cyan/Teal gradient (`from-cyan-900 via-teal-700 to-blue-600`)
- **Others**: Rotating through purple, emerald, orange, indigo, and slate gradients

### Animations & Effects
- **Background Effects**: 
  - Animated floating orbs with blur effects
  - Shimmer overlay animation (8-second cycle)
  - Glow effects on key elements
- **Interactive Elements**:
  - Hover effects on all cards and buttons
  - Scale transformations on hover
  - Pulse animations on statistics
  - Shadow enhancements with glow

### Layout Specifications
- **Container**: Full viewport height with overflow-auto for scrollability
- **Grid Layout**: 3-column responsive grid (1 column on mobile)
- **Chart Container**: Fixed height of 495px
- **Card Spacing**: 3-unit gap between elements
- **Padding**: 5 units on main cards, 4 units on summary cards

## Controls

### Navigation Controls
- **Play/Pause Button**: Toggle auto-rotation
- **Previous/Next Buttons**: Manual navigation through doctors
- **Progress Dots**: Direct navigation to specific doctor
- **Counter Display**: Shows current position (e.g., "1 / 5")

### Time Interval Selector
Allows switching between different time periods for the chart display:
- Daily, Weekly, Monthly
- 3-Monthly, 6-Monthly
- Year to Date, All Time

## Data Integration

### Database Tables Used
1. **doctor_stats_ytd**: Main statistics source
   - Fields: doctor_id, first_name, last_name, specialty, total_appointments, avg_appointments_per_week, weeks_worked, weekly_target, target_completion_percentage

2. **weekly_appointments**: Chart data source
   - Fields: doctor_id, year, week_number, appointment_count

### Data Flow
1. Initial load fetches all doctor statistics ordered by total appointments
2. Chart data loads when doctor selection changes
3. Real-time updates through Supabase subscriptions (if implemented)

## Recent Modifications (August 25, 2025)

### Layout Adjustments
1. **Overflow Fix**: Changed main container from `overflow-hidden` to `overflow-auto` to prevent content cutoff
2. **Height Adjustment**: Changed content container from `h-screen` to `min-h-screen` for proper expansion
3. **Chart Height Optimization**: Increased from 320px → 420px → 495px for better space utilization
4. **Summary Cards Enhancement**: Added additional metrics below each card:
   - "vs Target" percentage for Best Week
   - "Trend" indicator for Current Period
   - "Performance" status for Weekly Average

### Visual Improvements
- Added margin bottom to main content grid
- Reduced spacing between chart and summary cards
- Enhanced glow and shadow effects
- Improved hover state animations

## Component Props
The Carousel2 component doesn't accept any props - all configuration is internal.

## State Management
- `doctors`: Array of doctor statistics
- `currentIndex`: Currently displayed doctor index
- `isPlaying`: Auto-rotation status
- `timeInterval`: Selected time period for chart
- `chartData`: Processed chart data points
- `loading`: Loading state
- `error`: Error state message

## Performance Considerations
- Chart renders only when doctor or time interval changes
- SVG path generation is optimized for smooth curves
- Animations use CSS transforms for GPU acceleration
- Background effects use will-change for optimization

## Browser Compatibility
- Requires modern browser with CSS Grid support
- Backdrop filter effects require webkit support
- Animations optimized for 60fps performance

## Troubleshooting

### Common Issues
1. **Content Cutoff**: Ensure container has `overflow-auto` and proper min-height
2. **Chart Not Displaying**: Check data fetching and console for errors
3. **Animations Lagging**: Reduce number of animated elements or simplify effects
4. **Layout Breaking**: Verify responsive grid breakpoints

### Debug Mode
Check browser console for:
- Data fetching errors
- Chart data processing logs
- Component lifecycle events

## Future Enhancements
- Add data export functionality
- Implement real-time updates
- Add filtering by department/specialty
- Include patient satisfaction metrics
- Add print-friendly view
- Implement keyboard navigation

## Backup Reference
This documentation represents the state of Carousel2 as of August 25, 2025, 14:01 PM.
Chart height is set to 495px for optimal display on standard screens.

---
*Last Updated: August 25, 2025*
*Version: 2.0*