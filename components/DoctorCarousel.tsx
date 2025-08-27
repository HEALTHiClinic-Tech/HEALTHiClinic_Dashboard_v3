"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { DoctorStatsYTD } from "@/types/database"
import { ChevronLeft, ChevronRight, Play, Pause, Activity, TrendingUp, Target, Award, Sparkles, Star, Zap, Calendar } from "lucide-react"
import React from "react"
import styles from "@/styles/DoctorCarousel.module.css"
import { getDoctorTheme } from "@/lib/doctorThemes"

type TimeInterval = 'daily' | 'weekly' | 'monthly' | '3-monthly' | '6-monthly' | 'ytd' | 'all-time'

interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

export default function DoctorCarousel() {
  const [doctors, setDoctors] = useState<DoctorStatsYTD[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('weekly')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    fetchDoctorStats()
  }, [])

  useEffect(() => {
    if (doctors.length > 0 && isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % doctors.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [doctors.length, isPlaying])

  useEffect(() => {
    if (doctors[currentIndex]) {
      fetchChartData(doctors[currentIndex].doctor_id, timeInterval)
    }
  }, [currentIndex, doctors, timeInterval])

  const fetchDoctorStats = async () => {
    try {
      console.log('Fetching doctor stats...')
      
      const { data, error } = await supabase
        .from('doctor_stats_ytd')
        .select('*')
        .order('total_appointments', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Fetched', data?.length || 0, 'doctors')
      
      if (data && data.length > 0) {
        setDoctors(data)
      } else {
        setError('No doctor data available')
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchChartData = async (doctorId: string, interval: TimeInterval) => {
    try {
      const { data, error } = await supabase
        .from('weekly_appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('year', { ascending: true })
        .order('week_number', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        let formattedData: ChartDataPoint[] = []
        
        switch (interval) {
          case 'daily':
            // Show last 8 days (simulated from weekly data)
            formattedData = data.slice(-8).map((w, i) => ({
              label: `Day ${i + 1}`,
              value: Math.round((Number(w.appointment_count) || 0) / 5)
            }))
            break
            
          case 'weekly':
            // Show last 12 weeks
            formattedData = data.slice(-12).map(w => ({
              label: `Week ${w.week_number}`,
              value: Number(w.appointment_count) || 0
            }))
            break
            
          case 'monthly':
            // Group by month
            const monthlyData = new Map<string, number>()
            data.forEach(w => {
              const date = new Date(w.week_start_date)
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              const monthKey = monthNames[date.getMonth()]
              const current = monthlyData.get(monthKey) || 0
              monthlyData.set(monthKey, current + (Number(w.appointment_count) || 0))
            })
            formattedData = Array.from(monthlyData.entries()).slice(-6).map(([label, value]) => ({
              label,
              value
            }))
            break
            
          case 'ytd':
            // Year to date - monthly
            const ytdData = new Map<string, number>()
            const currentYear = new Date().getFullYear()
            data.forEach(w => {
              const date = new Date(w.week_start_date)
              if (date.getFullYear() === currentYear) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                const monthKey = monthNames[date.getMonth()]
                const current = ytdData.get(monthKey) || 0
                ytdData.set(monthKey, current + (Number(w.appointment_count) || 0))
              }
            })
            formattedData = Array.from(ytdData.entries()).map(([label, value]) => ({
              label,
              value
            }))
            break
            
          default:
            // Default to weekly
            formattedData = data.slice(-12).map(w => ({
              label: `W${w.week_number}`,
              value: Number(w.appointment_count) || 0
            }))
        }
        
        setChartData(formattedData)
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + doctors.length) % doctors.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % doctors.length)
  }

  // Generate smooth line chart path
  const generateLinePath = (data: ChartDataPoint[], width: number, height: number) => {
    if (data.length === 0) return ''
    
    // Dynamic max value with proper rounding
    const maxValue = Math.max(12, Math.ceil(Math.max(...data.map(d => d.value)) / 3) * 3)
    
    const points = data.map((d, i) => {
      const x = 70 + (i / (data.length - 1)) * 780
      const y = 320 - (d.value / maxValue) * 260
      return { x, y, value: d.value }
    })
    
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`
    }
    
    // Create smooth curve using Catmull-Rom spline for natural flow
    let path = `M ${points[0].x} ${points[0].y}`
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(points.length - 1, i + 2)]
      
      // Smooth control points
      const tension = 0.5
      const cp1x = p1.x + (p2.x - p0.x) / 6 * tension
      const cp1y = p1.y + (p2.y - p0.y) / 6 * tension
      const cp2x = p2.x - (p3.x - p1.x) / 6 * tension
      const cp2y = p2.y - (p3.y - p1.y) / 6 * tension
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }
    
    return path
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <div style={{
          background: 'rgba(255, 0, 0, 0.2)',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div>Error Loading Carousel</div>
          <div style={{ fontSize: '1rem', marginTop: '0.5rem', opacity: 0.8 }}>{error}</div>
        </div>
      </div>
    )
  }

  if (doctors.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>
          No doctor data available
        </div>
      </div>
    )
  }

  const currentDoctor = doctors[currentIndex]
  const ranking = currentIndex + 1
  const maxChartValue = Math.max(...chartData.map(d => d.value))
  
  // Get doctor-specific theme
  const doctorTheme = getDoctorTheme({
    first_name: currentDoctor.first_name,
    last_name: currentDoctor.last_name
  })
  
  // Create dynamic gradient based on doctor theme
  const getGradientStyle = () => {
    const themes = {
      'Joseph-Grace': 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 25%, #dc2626 50%, #ef4444 75%, #b91c1c 100%)',
      'Hamid-Hajian': 'linear-gradient(135deg, #0c4a6e 0%, #075985 25%, #0891b2 50%, #06b6d4 75%, #0e7490 100%)',
      'Default': 'linear-gradient(135deg, #8B2C2C 0%, #A63F3F 25%, #B34444 50%, #9C3737 75%, #7A2626 100%)'
    }
    const doctorKey = `${currentDoctor.first_name}-${currentDoctor.last_name}`
    return themes[doctorKey] || themes['Default']
  }

  // Calculate stats
  const bestWeek = chartData.length > 0 
    ? chartData.reduce((best, current) => current.value > best.value ? current : best, chartData[0])
    : null
  const currentPeriod = chartData[chartData.length - 1]
  const average = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length)
    : 0

  return (
    <div 
      className={styles.container}
      style={{
        background: getGradientStyle(),
        transition: 'background 1s ease-in-out'
      }}
    >
      {/* Animated background elements */}
      <div className={styles.floatingOrb1} />
      <div className={styles.floatingOrb2} />
      <div className={styles.floatingOrb3} />
      <div className={styles.shimmerOverlay} />
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            Doctor Performance Showcase
            <Sparkles className={styles.sparkleIcon} />
          </h1>
          
          <div className={styles.controls}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`${styles.controlButton} ${styles.playButton}`}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button
              onClick={handlePrevious}
              className={styles.controlButton}
            >
              <ChevronLeft size={24} />
            </button>
            
            <span className={styles.counter}>
              {currentIndex + 1} / {doctors.length}
            </span>
            
            <button
              onClick={handleNext}
              className={styles.controlButton}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Time Interval Selector */}
        <div className={styles.intervalSelector}>
          <Calendar className={styles.calendarIcon} />
          {[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: '3-monthly', label: '3-Monthly' },
            { value: '6-monthly', label: '6-Monthly' },
            { value: 'ytd', label: 'Year to Date' },
            { value: 'all-time', label: 'All Time' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeInterval(option.value as TimeInterval)}
              className={`${styles.intervalButton} ${
                timeInterval === option.value ? styles.intervalButtonActive : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Removed progress dots - they're above in the header now */}

        {/* Main Card Layout */}
        <div className={styles.carouselContent}>
            {/* Left: Doctor Info Card */}
            <div className={`${styles.doctorCard} ${styles.glowCard}`}>
              <div className={`${styles.rankingBadge} ${styles.floatAnimation}`}>#{ranking}</div>
              
              <h2 className={styles.doctorName}>
                Dr. {currentDoctor.first_name} {currentDoctor.last_name}
              </h2>
              
              <p className={styles.specialty}>
                {currentDoctor.specialty || 'Vascular Surgeon'}
              </p>
              
              <div className={`${styles.targetBadge} ${styles.pulseAnimation}`}>
                <Target className={styles.targetIcon} />
                <span>Weekly Target</span>
                <span className={styles.targetNumber}>{currentDoctor.weekly_target || 8} appointments</span>
              </div>
              
              <div className={styles.metricsList}>
                <div className={styles.metricItem}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Total Appointments</span>
                    <Activity className={styles.metricIcon} />
                  </div>
                  <div className={styles.metricValue}>{currentDoctor.total_appointments}</div>
                </div>
                
                <div className={styles.metricItem}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Average per Week</span>
                    <TrendingUp className={styles.metricIcon} />
                  </div>
                  <div className={styles.metricValue}>
                    {Math.round(currentDoctor.avg_appointments_per_week * 10) / 10}
                  </div>
                </div>
                
                <div className={styles.metricItem}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>YTD Target Progress</span>
                    <Target className={styles.metricIcon} />
                  </div>
                  <div className={styles.metricValue}>
                    {currentDoctor.target_completion_percentage || 37.5}%
                  </div>
                  <div className={styles.metricGoal}>
                    Goal: {(currentDoctor.weekly_target || 8) * currentDoctor.weeks_worked}
                  </div>
                </div>
                
                <div className={styles.metricItem}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Weeks Worked</span>
                  </div>
                  <div className={styles.metricValue}>
                    {currentDoctor.weeks_worked} weeks
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Chart Card */}
            <div className={`${styles.chartCard} ${styles.glowCard}`}>
              <h3 className={styles.chartTitle}>
                {timeInterval === 'daily' ? 'Daily' :
                 timeInterval === 'weekly' ? 'Weekly' :
                 timeInterval === 'monthly' ? 'Monthly' :
                 timeInterval === 'ytd' ? 'Year to Date' :
                 'All Time'} Performance Trend
              </h3>
                
              {/* Line Chart */}
              <div className={styles.chartContainer}>
                <svg className={styles.lineChart} viewBox="0 0 900 400" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFA500" stopOpacity="0.8"/>
                      <stop offset="95%" stopColor="#FFA500" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines - horizontal with proper spacing */}
                  {(() => {
                    const maxVal = Math.max(12, Math.ceil(Math.max(...chartData.map(d => d.value)) / 3) * 3)
                    const steps = 4
                    return Array.from({ length: steps + 1 }, (_, i) => {
                      const value = (maxVal / steps) * i
                      const y = 320 - (value / maxVal) * 260
                      return (
                        <g key={`grid-${i}`}>
                          <line
                            x1="70"
                            y1={y}
                            x2="850"
                            y2={y}
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeWidth="1"
                            strokeDasharray="3,3"
                          />
                          <text
                            x="50"
                            y={y + 4}
                            fill="rgba(255, 255, 255, 0.5)"
                            fontSize="11"
                            textAnchor="end"
                          >
                            {Math.round(value)}
                          </text>
                        </g>
                      )
                    })
                  })()}
                  
                  {/* Chart area and line */}
                  {chartData.length > 0 && (
                    <>
                      {/* Area fill under the line */}
                      <path
                        d={`${generateLinePath(chartData, 900, 400)} L 850 320 L 70 320 Z`}
                        fill="url(#areaGradient)"
                      />
                      
                      {/* Main line */}
                      <path
                        d={generateLinePath(chartData, 900, 400)}
                        fill="none"
                        stroke="#FFA500"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Data points - small dots only */}
                      {chartData.map((point, i) => {
                        const maxVal = Math.max(12, Math.ceil(Math.max(...chartData.map(d => d.value)) / 3) * 3)
                        const x = 70 + (i / (chartData.length - 1)) * 780
                        const y = 320 - (point.value / maxVal) * 260
                        
                        return (
                          <circle
                            key={`dot-${i}`}
                            cx={x}
                            cy={y}
                            r="5"
                            fill="#FFA500"
                            stroke="white"
                            strokeWidth="2"
                          />
                        )
                      })}
                    </>
                  )}
                  
                  {/* X-axis labels */}
                  {chartData.map((point, i) => {
                    // Show every 2nd or 3rd label if too many
                    if (chartData.length > 10 && i % 2 !== 0) return null
                    const x = 70 + (i / (chartData.length - 1)) * 780
                    return (
                      <text
                        key={`xlabel-${i}`}
                        x={x}
                        y={345}
                        textAnchor="middle"
                        fill="rgba(255, 255, 255, 0.5)"
                        fontSize="10"
                      >
                        {point.label}
                      </text>
                    )
                  })}
                  
                  {/* Axes */}
                  <line x1="70" y1="60" x2="70" y2="320" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1"/>
                  <line x1="70" y1="320" x2="850" y2="320" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1"/>
                  
                  {/* Axis labels */}
                  <text
                    x="25"
                    y="190"
                    fill="rgba(255, 255, 255, 0.5)"
                    fontSize="11"
                    transform="rotate(-90, 25, 190)"
                    textAnchor="middle"
                  >
                    Appointments
                  </text>
                  
                  <text
                    x="460"
                    y="375"
                    fill="rgba(255, 255, 255, 0.5)"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {timeInterval === 'daily' ? 'Day' :
                     timeInterval === 'weekly' ? 'Week Number' :
                     timeInterval === 'monthly' ? 'Month' :
                     'Period'}
                  </text>
                </svg>
              </div>
              
              {/* Stats Summary */}
              <div className={styles.statsSummary}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Best Week</div>
                  <div className={styles.summaryPrimary}>{bestWeek?.label || 'Week 43'}</div>
                  <div className={styles.summaryValue}>{bestWeek?.value || 9}</div>
                </div>
                
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Current Period</div>
                  <div className={styles.summaryPrimary}>{currentPeriod?.label || 'Week 24'}</div>
                  <div className={styles.summaryValue}>{currentPeriod?.value || 1}</div>
                </div>
                
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Weekly Average</div>
                  <div className={styles.summaryPrimary}>Across 50 weeks</div>
                  <div className={styles.summaryValue}>{average || 3}</div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}