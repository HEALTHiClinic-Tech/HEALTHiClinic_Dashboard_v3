# Doctor Performance Showcase Carousel - Complete Documentation
## Version: August 21, 2025

This document contains the complete implementation details of the Doctor Performance Showcase Carousel component, including all styling, animations, and technical specifications.

---

## Table of Contents
1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Visual Design Specifications](#visual-design-specifications)
4. [Animation & Effects](#animation--effects)
5. [Doctor-Specific Theming](#doctor-specific-theming)
6. [Layout Structure](#layout-structure)
7. [CSS Styling Details](#css-styling-details)
8. [React Component Implementation](#react-component-implementation)
9. [Critical Code Sections](#critical-code-sections)

---

## Overview

The carousel is a full-screen, animated doctor performance dashboard that displays:
- Doctor information with ranking
- Performance metrics
- Interactive line chart with weekly/monthly/yearly data
- Smooth transitions between doctors
- Dynamic color themes per doctor

### Key Features
- **Full viewport height** (100vh)
- **Auto-rotating carousel** (5-second intervals)
- **Responsive grid layout** (1fr 2fr split)
- **Glass morphism design** with backdrop blur
- **Dynamic gradient backgrounds** that change per doctor
- **Multiple animation layers** (floating orbs, shimmer, pulse effects)

---

## Component Architecture

### File Structure
```
/components/DoctorCarousel.tsx       # Main React component
/styles/DoctorCarousel.module.css    # All styling and animations
/lib/doctorThemes.ts                 # Doctor color theme definitions
/lib/supabase.ts                     # Database connection
```

### Data Flow
1. Fetches doctor stats from `doctor_stats_ytd` table
2. Fetches chart data from `weekly_appointments` table
3. Auto-rotates through doctors every 5 seconds
4. Updates chart data when doctor or time interval changes

---

## Visual Design Specifications

### Container Dimensions
- **Height**: 100vh (full viewport)
- **Padding**: 1rem 2rem
- **Max Width**: 1400px (centered)
- **Background**: Dynamic gradient based on current doctor

### Typography Scale
- **Title**: 2.75rem (600 weight)
- **Ranking Badge**: 8rem (700 weight) 
- **Doctor Name**: 2.5rem (600 weight)
- **Specialty**: 1.375rem
- **Metric Values**: 3.5rem (700 weight)
- **Metric Labels**: 1.25rem
- **Chart Title**: 1.625rem
- **Summary Values**: 3rem (700 weight)

### Color Palette
- **Primary Orange**: #FF8C42 (chart line)
- **Gold**: #FFD700 (sparkle icon, highlights)
- **Target Badge**: #FFB84D
- **Glass Effect**: rgba(0, 0, 0, 0.3) with blur(20px)
- **Borders**: rgba(255, 255, 255, 0.1)

---

## Animation & Effects

### Keyframe Animations

#### Float Animation (15-25 seconds)
```css
- Orb 1: 15s ease-in-out infinite
- Orb 2: 20s ease-in-out infinite reverse  
- Orb 3: 25s ease-in-out infinite
- Movement pattern: translateY(-30px to 20px) with X-axis variation
```

#### Shimmer Effect (8 seconds)
```css
- Sweeps across screen left to right
- Linear gradient with 3% opacity
- Infinite loop with opacity fade
```

#### Pulse Animation (2 seconds)
```css
- Scale: 1 to 1.05
- Opacity: 1 to 0.9
- Applied to: target badge, active buttons, chart highlights
```

#### Float Up/Down (3 seconds)
```css
- TranslateY: 0 to -10px
- Applied to: ranking badge
- Ease-in-out timing
```

#### Glow Effect (4 seconds)
```css
- Box shadow animation on cards
- Varies from 20px to 80px blur radius
- White color at 10-20% opacity
```

### Hover Effects
- **Cards**: translateY(-2px) with 40px shadow
- **Buttons**: scale(1.1) with glow
- **Metric Values**: scale(1.05) with text shadow
- **Chart Dots**: increase radius to 12px with enhanced glow

---

## Doctor-Specific Theming

### Gradient Definitions
```javascript
'Joseph-Grace': 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 25%, #dc2626 50%, #ef4444 75%, #b91c1c 100%)'
'Hamid-Hajian': 'linear-gradient(135deg, #0c4a6e 0%, #075985 25%, #0891b2 50%, #06b6d4 75%, #0e7490 100%)'
'Default': 'linear-gradient(135deg, #8B2C2C 0%, #A63F3F 25%, #B34444 50%, #9C3737 75%, #7A2626 100%)'
```

### Transition
- **Duration**: 1 second
- **Timing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Property**: background gradient

---

## Layout Structure

### Grid Layout
```
Main Container (100vh)
├── Header (flex, space-between)
│   ├── Title with sparkle icon
│   └── Controls (play/pause, prev, next, counter)
├── Time Interval Selector (centered)
│   └── 7 buttons (Daily to All Time)
└── Carousel Content (grid: 1fr 2fr)
    ├── Doctor Card (left)
    │   ├── Ranking Badge (#1, #2, etc.)
    │   ├── Doctor Name
    │   ├── Specialty
    │   ├── Target Badge
    │   └── Metrics List (4 items)
    └── Chart Card (right)
        ├── Chart Title
        ├── SVG Line Chart (800x350 viewBox)
        └── Summary Cards (3 columns)
```

### Spacing System
- **Component Gap**: 0.75rem (wrapper)
- **Card Padding**: 2rem
- **Card Gap**: 1.25rem (doctor), 1rem (chart)
- **Metrics Gap**: 1.25rem
- **Summary Cards Gap**: 1rem

---

## CSS Styling Details

### Critical Classes

#### Container & Effects
```css
.container {
  height: 100vh;
  padding: 1rem 2rem;
  position: relative;
  overflow: hidden;
  transition: background 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.floatingOrb1, .floatingOrb2, .floatingOrb3 {
  position: absolute;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(40-80px);
  animation: float 15-25s ease-in-out infinite;
}

.shimmerOverlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
  animation: shimmer 8s infinite;
}
```

#### Card Styling
```css
.doctorCard, .chartCard {
  background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glowCard::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, rgba(255,215,0,0.2), rgba(255,165,0,0.2));
  border-radius: 24px;
  opacity: 0;
  animation: glow 4s ease-in-out infinite;
  filter: blur(10px);
}
```

#### Chart Specifications
```css
.chartContainer {
  height: 350px;
  margin: 1rem 0;
}

.lineChart {
  width: 100%;
  height: 350px;
}

.chartLine {
  stroke: #FF8C42;
  stroke-width: 5;
  filter: drop-shadow(0 0 10px rgba(255,140,66,0.6));
  animation: drawLine 2s ease-in-out;
}

.chartDot {
  fill: #FF8C42;
  stroke: white;
  stroke-width: 3;
  r: 10;
  filter: drop-shadow(0 0 8px rgba(255,140,66,0.8));
}
```

---

## React Component Implementation

### Key State Variables
```typescript
const [doctors, setDoctors] = useState<DoctorStatsYTD[]>([])
const [currentIndex, setCurrentIndex] = useState(0)
const [isPlaying, setIsPlaying] = useState(true)
const [timeInterval, setTimeInterval] = useState<TimeInterval>('weekly')
const [chartData, setChartData] = useState<ChartDataPoint[]>([])
```

### Auto-rotation Logic
```typescript
useEffect(() => {
  if (doctors.length > 0 && isPlaying) {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % doctors.length)
    }, 5000)
    return () => clearInterval(interval)
  }
}, [doctors.length, isPlaying])
```

### Dynamic Gradient Function
```typescript
const getGradientStyle = () => {
  const themes = {
    'Joseph-Grace': 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 25%, #dc2626 50%, #ef4444 75%, #b91c1c 100%)',
    'Hamid-Hajian': 'linear-gradient(135deg, #0c4a6e 0%, #075985 25%, #0891b2 50%, #06b6d4 75%, #0e7490 100%)',
    'Default': 'linear-gradient(135deg, #8B2C2C 0%, #A63F3F 25%, #B34444 50%, #9C3737 75%, #7A2626 100%)'
  }
  const doctorKey = `${currentDoctor.first_name}-${currentDoctor.last_name}`
  return themes[doctorKey] || themes['Default']
}
```

### Chart Path Generation
```typescript
const generateLinePath = (data: ChartDataPoint[], width: number, height: number) => {
  // Calculates smooth cubic bezier curve through data points
  // Maps data values to SVG coordinates
  // Returns SVG path string
}
```

---

## Critical Code Sections

### Component Structure (Simplified)
```jsx
<div className={styles.container} style={{ background: getGradientStyle() }}>
  {/* Animated background elements */}
  <div className={styles.floatingOrb1} />
  <div className={styles.floatingOrb2} />
  <div className={styles.floatingOrb3} />
  <div className={styles.shimmerOverlay} />
  
  <div className={styles.wrapper}>
    {/* Header with title and controls */}
    {/* Time interval selector */}
    
    <div className={styles.carouselContent}>
      {/* Doctor Card */}
      <div className={`${styles.doctorCard} ${styles.glowCard}`}>
        <div className={`${styles.rankingBadge} ${styles.floatAnimation}`}>
        {/* Doctor info and metrics */}
      </div>
      
      {/* Chart Card */}
      <div className={`${styles.chartCard} ${styles.glowCard}`}>
        {/* SVG chart and summary cards */}
      </div>
    </div>
  </div>
</div>
```

### Button Controls
- **Play/Pause**: 52x52px, orange gradient when playing
- **Previous/Next**: 52x52px, white 15% background
- **Counter**: "1 / 2" format, 1.375rem font

### Time Intervals
- Daily, Weekly, Monthly, 3-Monthly, 6-Monthly, Year to Date, All Time
- Active state: Orange gradient with pulse animation
- Inactive: Transparent with 70% white text

---

## Responsive Breakpoints

```css
@media (max-width: 1200px) {
  .carouselContent {
    grid-template-columns: 350px 1fr;
  }
}

@media (max-width: 768px) {
  .carouselContent {
    grid-template-columns: 1fr;
  }
  .statsSummary {
    grid-template-columns: 1fr;
  }
}
```

---

## Database Tables Used

### doctor_stats_ytd
- doctor_id, first_name, last_name
- total_appointments, avg_appointments_per_week
- target_completion_percentage, weekly_target
- weeks_worked, specialty

### weekly_appointments
- doctor_id, year, week_number
- week_start_date, appointment_count

---

## Recovery Instructions

If the carousel breaks, use this document to:

1. **Restore CSS**: Copy all animation keyframes and class definitions
2. **Fix Layout**: Check grid structure (1fr 2fr) and container heights
3. **Restore Animations**: Ensure all animation classes are applied to correct elements
4. **Fix Gradients**: Check getGradientStyle() function and doctor mappings
5. **Verify Dimensions**: Title 2.75rem, Ranking 8rem, Metrics 3.5rem, Chart 350px height
6. **Check Effects**: Floating orbs (3), shimmer overlay, glow cards, pulse animations

---

## Testing Checklist

- [ ] Carousel auto-rotates every 5 seconds
- [ ] Background gradient changes with each doctor
- [ ] All animations are running (float, shimmer, pulse, glow)
- [ ] Hover effects work on cards, buttons, and metrics
- [ ] Chart displays correctly with 350px height
- [ ] Time interval buttons show active state
- [ ] No scrolling needed on standard viewport
- [ ] Glass morphism effect visible on cards
- [ ] Text shadows and glows are visible

---

## Notes

- The carousel is designed for 1920x1080 and larger screens
- Optimal viewing at 100% zoom level
- Chrome/Safari recommended for best backdrop-filter support
- All measurements in rem for scalability
- Animations use GPU-accelerated properties (transform, opacity)

---

**Last Updated**: August 21, 2025
**Version**: 3.0 (Enhanced with animations and doctor themes)
**Status**: Production Ready