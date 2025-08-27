"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { DoctorStatsYTD } from "@/types/database"
import { ChevronLeft, ChevronRight, Play, Pause, Activity, TrendingUp, Target, Trophy, Calendar, Sparkles, Maximize, Minimize } from "lucide-react"
import React from "react"

type TimeInterval = 'weekly' | 'monthly' | '3-monthly' | '6-monthly' | 'ytd' | 'all-time'

interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

export default function Carousel2() {
  const [doctors, setDoctors] = useState<DoctorStatsYTD[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('weekly')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDoctorStats()
  }, [])
  
  // Add initial data fetch to ensure we have data
  useEffect(() => {
    if (doctors.length === 0) {
      // If no doctors yet, wait
      return
    }
    // Ensure we fetch chart data for the first doctor
    if (doctors[0]) {
      fetchChartData(doctors[0].doctor_id, timeInterval)
    }
  }, [doctors])

  useEffect(() => {
    if (doctors.length > 0 && isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % doctors.length)
      }, 3000) // Changed from 5000ms to 3000ms (3 seconds)
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
      const { data, error } = await supabase
        .from('doctor_stats_ytd')
        .select('*')
        .order('total_appointments', { ascending: false })

      if (error) throw error
      
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
        console.log('Raw data from Supabase:', data)
        let formattedData: ChartDataPoint[] = []
        
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth() + 1
        const currentWeek = Math.ceil((currentDate.getDate() + new Date(currentYear, currentMonth - 1, 1).getDay()) / 7)
        
        // Helper function to get Monday date for a week number
        const getMondayDate = (year: number, weekNumber: number) => {
          const jan1 = new Date(year, 0, 1)
          const daysToAdd = (weekNumber - 1) * 7
          const firstMonday = new Date(jan1)
          const dayOfWeek = jan1.getDay()
          const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7
          firstMonday.setDate(jan1.getDate() + daysUntilMonday + daysToAdd)
          const month = firstMonday.toLocaleString('en-US', { month: 'short' })
          const day = firstMonday.getDate()
          return `${month} ${day}`
        }
        
        switch (interval) {
          case 'weekly':
            // Show from beginning of current year to date
            const yearData = data.filter(w => w.year === currentYear)
            formattedData = yearData.map(w => ({
              label: getMondayDate(currentYear, w.week_number),
              value: Number(w.appointment_count) || 0
            }))
            // If more than 12 weeks, show last 12 for better visibility
            if (formattedData.length > 12) {
              formattedData = formattedData.slice(-12)
            }
            break
            
          case 'monthly':
            // Show last 4 weeks with Monday dates
            const last4Weeks = data.slice(-4)
            formattedData = last4Weeks.map(w => ({
              label: getMondayDate(w.year, w.week_number),
              value: Number(w.appointment_count) || 0
            }))
            break
            
          case '3-monthly':
            // Aggregate last 3 months
            const monthlyData3: { [key: string]: number } = {}
            const threeMonthsAgo = currentMonth - 2
            
            data.forEach(w => {
              const monthFromWeek = Math.ceil(w.week_number / 4.33)
              const monthKey = `${w.year}-${String(monthFromWeek).padStart(2, '0')}`
              
              if (w.year === currentYear && monthFromWeek >= threeMonthsAgo && monthFromWeek <= currentMonth) {
                if (!monthlyData3[monthKey]) monthlyData3[monthKey] = 0
                monthlyData3[monthKey] += Number(w.appointment_count) || 0
              }
            })
            
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            formattedData = Object.entries(monthlyData3)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([key, value]) => {
                const month = parseInt(key.split('-')[1]) - 1
                return {
                  label: monthNames[month],
                  value: value
                }
              })
            break
            
          case '6-monthly':
            // Aggregate last 6 months
            const monthlyData6: { [key: string]: number } = {}
            const sixMonthsAgo = currentMonth - 5
            
            data.forEach(w => {
              const monthFromWeek = Math.ceil(w.week_number / 4.33)
              const effectiveYear = monthFromWeek + sixMonthsAgo <= 0 ? currentYear - 1 : currentYear
              const effectiveMonth = monthFromWeek + sixMonthsAgo <= 0 ? 12 + (monthFromWeek + sixMonthsAgo) : monthFromWeek
              
              if ((effectiveYear === currentYear && effectiveMonth >= Math.max(1, sixMonthsAgo) && effectiveMonth <= currentMonth) ||
                  (effectiveYear === currentYear - 1 && sixMonthsAgo < 1)) {
                const monthKey = `${w.year}-${String(Math.ceil(w.week_number / 4.33)).padStart(2, '0')}`
                if (!monthlyData6[monthKey]) monthlyData6[monthKey] = 0
                monthlyData6[monthKey] += Number(w.appointment_count) || 0
              }
            })
            
            const monthNames6 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            formattedData = Object.entries(monthlyData6)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .slice(-6)
              .map(([key, value]) => {
                const month = parseInt(key.split('-')[1]) - 1
                return {
                  label: monthNames6[month],
                  value: value
                }
              })
            break
            
          case 'ytd':
            // Year to date - aggregate by month from January to current month
            const monthlyDataYTD: { [key: string]: number } = {}
            
            data.forEach(w => {
              if (w.year === currentYear) {
                const monthFromWeek = Math.ceil(w.week_number / 4.33)
                if (monthFromWeek <= currentMonth) {
                  const monthKey = String(monthFromWeek).padStart(2, '0')
                  if (!monthlyDataYTD[monthKey]) monthlyDataYTD[monthKey] = 0
                  monthlyDataYTD[monthKey] += Number(w.appointment_count) || 0
                }
              }
            })
            
            const monthNamesYTD = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            formattedData = Object.entries(monthlyDataYTD)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([key, value]) => ({
                label: monthNamesYTD[parseInt(key) - 1],
                value: value
              }))
            break
            
          case 'all-time':
            // All time from September (month 9) to current - aggregate by month
            const monthlyDataAll: { [key: string]: number } = {}
            
            data.forEach(w => {
              const monthFromWeek = Math.ceil(w.week_number / 4.33)
              // Include data from September (month 9) onwards
              if ((w.year === currentYear - 1 && monthFromWeek >= 9) || 
                  (w.year === currentYear && monthFromWeek <= currentMonth)) {
                const monthKey = `${w.year}-${String(monthFromWeek).padStart(2, '0')}`
                if (!monthlyDataAll[monthKey]) monthlyDataAll[monthKey] = 0
                monthlyDataAll[monthKey] += Number(w.appointment_count) || 0
              }
            })
            
            const monthNamesAll = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            formattedData = Object.entries(monthlyDataAll)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([key, value]) => {
                const [year, month] = key.split('-')
                const monthIndex = parseInt(month) - 1
                const shortYear = year.slice(2)
                return {
                  label: `${monthNamesAll[monthIndex]}'${shortYear}`,
                  value: value
                }
              })
            break
        }
        
        console.log('Formatted chart data:', formattedData)
        setChartData(formattedData)
      } else {
        console.log('No data returned from Supabase')
        setChartData([])
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)
      setChartData([])
    }
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + doctors.length) % doctors.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % doctors.length)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && carouselRef.current) {
      carouselRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err)
      })
    }
  }

  // Generate SVG path for smooth chart line
  const generateChartPath = () => {
    if (chartData.length === 0) return ''
    
    const maxValue = Math.max(24, Math.max(...chartData.map(d => d.value)))
    const width = 100
    const height = 100
    const padding = 5
    
    const points = chartData.map((d, i) => ({
      x: padding + (i / (chartData.length - 1)) * (width - 2 * padding),
      y: height - padding - (d.value / maxValue) * (height - 2 * padding)
    }))
    
    // Create smooth curve
    let path = `M ${points[0].x} ${points[0].y}`
    
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 2
      const cp1y = points[i - 1].y
      const cp2x = points[i - 1].x + (points[i].x - points[i - 1].x) / 2
      const cp2y = points[i].y
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`
    }
    
    // Close the path for area fill
    path += ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    
    return path
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  if (error || doctors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 flex items-center justify-center">
        <div className="text-white text-xl">No data available</div>
      </div>
    )
  }

  const currentDoctor = doctors[currentIndex]
  const ranking = currentIndex + 1

  // Doctor-specific gradients
  const getDoctorGradient = () => {
    const doctorName = `${currentDoctor.first_name} ${currentDoctor.last_name}`.toLowerCase()
    
    const doctorGradients: { [key: string]: string } = {
      // Dr. Joseph Grace - Deep crimson red gradient (like the reference)
      'joseph grace': 'from-red-900 via-red-700 to-rose-600',
      
      // Dr. Hamid Hajian - Ocean blue gradient
      'hamid hajian': 'from-blue-900 via-blue-700 to-cyan-500',
      
      // Additional doctor gradients - using index-based assignment
      'default0': 'from-red-900 via-red-700 to-rose-600',           // Same as Joseph Grace for index 0
      'default1': 'from-purple-900 via-violet-700 to-fuchsia-600',  // Purple/Violet
      'default2': 'from-emerald-900 via-green-700 to-lime-600',     // Green/Emerald
      'default3': 'from-amber-900 via-orange-700 to-yellow-500',    // Sunset Orange
      'default4': 'from-indigo-900 via-blue-800 to-sky-600',        // Deep Blue
      'default5': 'from-teal-900 via-cyan-700 to-teal-500',         // Teal/Cyan
      'default6': 'from-pink-900 via-rose-700 to-pink-500',         // Pink/Rose
      'default7': 'from-gray-900 via-slate-700 to-gray-600',        // Slate/Gray
    }
    
    // First check for exact name match, then fall back to index-based gradient
    return doctorGradients[doctorName] || doctorGradients[`default${currentIndex % 8}`]
  }
  
  const currentGradient = getDoctorGradient()

  // Calculate stats
  const bestWeek = chartData.length > 0 
    ? chartData.reduce((best, current) => current.value > best.value ? current : best, chartData[0])
    : null
  const currentPeriod = chartData[chartData.length - 1]
  const average = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length)
    : 0

  return (
    <div ref={carouselRef} className={`min-h-screen bg-gradient-to-br ${currentGradient} transition-all duration-1500 ease-in-out relative overflow-auto`}>
      {/* Animated background elements with glow */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Shimmer overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 8s infinite;
        }
        @keyframes glow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)); }
          50% { filter: brightness(1.2) drop-shadow(0 0 40px rgba(255, 255, 255, 0.5)); }
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>

      <div className="relative z-10 container mx-auto px-4 py-1 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] animate-glow">
              Doctor Performance Showcase
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all transform hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
            </button>
            
            <button
              onClick={handlePrevious}
              className="p-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all transform hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <span className="text-white font-semibold drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{currentIndex + 1} / {doctors.length}</span>
            </div>
            
            <button
              onClick={handleNext}
              className="p-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all transform hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all transform hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-6 h-6 text-white" /> : <Maximize className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Time Interval Selector with glow */}
        <div className="flex justify-center gap-1 mb-2">
          <div className="inline-flex bg-black/20 backdrop-blur rounded-2xl p-1 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <Calendar className="w-5 h-5 text-white/70 self-center ml-3 mr-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            {['weekly', 'monthly', '3-monthly', '6-monthly', 'ytd', 'all-time'].map((interval) => (
              <button
                key={interval}
                onClick={() => setTimeInterval(interval as TimeInterval)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timeInterval === interval
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-[0_0_25px_rgba(255,165,0,0.5)] transform scale-105 animate-pulse'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {interval === 'ytd' ? 'Year to Date' : 
                 interval === 'all-time' ? 'All Time' :
                 interval.charAt(0).toUpperCase() + interval.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-2">
          {doctors.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white rounded-full'
                  : 'w-2 h-2 bg-white/40 rounded-full hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          {/* Doctor Info Card with shimmer */}
          <div className="relative bg-black/30 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 overflow-hidden group animate-fadeIn">
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="flex items-center gap-2 mb-4 relative">
              <div className="text-6xl font-black text-white drop-shadow-[0_0_40px_rgba(255,215,0,0.6)] animate-float">
                #{ranking}
              </div>
              <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_25px_rgba(255,215,0,0.8)] animate-pulse" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              Dr. {currentDoctor.first_name} {currentDoctor.last_name}
            </h2>
            <p className="text-white/80 text-lg font-semibold mb-4">{currentDoctor.specialty || 'Phlebologist'}</p>
            
            <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl p-3 mb-4 border border-orange-400/30 shadow-[0_0_30px_rgba(255,165,0,0.3)] hover:shadow-[0_0_40px_rgba(255,165,0,0.5)] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-orange-400 drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]" />
                  <span className="text-white/90 font-medium">Weekly Target</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]">
                  {currentDoctor.weekly_target || 40} appointments
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-base font-semibold uppercase tracking-wide">Total Appointments</span>
                  <Activity className="w-6 h-6 text-white/60" />
                </div>
                <div className="text-4xl font-black text-white">{currentDoctor.total_appointments}</div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-base font-semibold uppercase tracking-wide">Average per Week</span>
                  <TrendingUp className="w-6 h-6 text-white/60" />
                </div>
                <div className="text-4xl font-black text-white">
                  {Math.round(currentDoctor.avg_appointments_per_week * 10) / 10}
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-base font-semibold uppercase tracking-wide">YTD Target Progress</span>
                  <Target className="w-6 h-6 text-white/60" />
                </div>
                <div className="text-4xl font-black text-white mb-2">
                  {currentDoctor.target_completion_percentage || 26.8}%
                </div>
                <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                    style={{ width: `${currentDoctor.target_completion_percentage || 26.8}%` }}
                  />
                </div>
                <p className="text-white/60 text-base font-medium mt-3">Goal: {(currentDoctor.weekly_target || 40) * currentDoctor.weeks_worked}</p>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all">
                <span className="text-white/80 text-base font-semibold uppercase tracking-wide">Weeks Worked</span>
                <div className="text-4xl font-black text-white mt-2">{currentDoctor.weeks_worked} weeks</div>
              </div>
            </div>
          </div>

          {/* Chart Card with glow */}
          <div className="lg:col-span-2 relative bg-black/30 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl overflow-hidden group flex flex-col animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                {timeInterval === 'weekly' ? 'Weekly' : 
                 timeInterval === 'monthly' ? 'Monthly' :
                 timeInterval === '3-monthly' ? '3 Month' :
                 timeInterval === '6-monthly' ? '6 Month' :
                 timeInterval === 'ytd' ? 'Year to Date' :
                 'All Time'} Performance Trend
              </h3>
              <div className="bg-white/10 backdrop-blur px-3 py-1 rounded-lg">
                <span className="text-white/60 text-xs font-medium">
                  {timeInterval === 'weekly' || timeInterval === 'monthly' 
                    ? 'Appointments per Week' 
                    : 'Appointments per Month'}
                </span>
              </div>
            </div>
            
            {/* Bar Chart - Tailwind CSS Style */}
            <div className="relative h-[495px] mb-3 bg-gradient-to-br from-black/20 to-black/10 backdrop-blur-sm rounded-2xl p-6 overflow-hidden">
              
              {/* Grid background */}
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              
              {/* Chart container */}
              <div className="relative h-full">
                {/* Chart area */}
                <div className="absolute inset-0 pb-8">
                  <div className="relative h-full flex items-end justify-between gap-2">
                    {chartData.length > 0 ? chartData.map((point, i) => {
                      const maxValue = Math.max(...chartData.map(d => d.value), 24)
                      const heightPixels = (point.value / maxValue) * 400 // Use fixed pixel height
                      
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end relative group">
                          {/* Value label */}
                          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="text-white font-bold text-sm bg-black/60 backdrop-blur px-2 py-1 rounded-lg whitespace-nowrap">
                              {point.value}
                            </span>
                          </div>
                          
                          {/* Bar */}
                          <div 
                            className="w-full rounded-t-lg transition-all duration-300 relative"
                            style={{ 
                              height: `${heightPixels}px`,
                              minHeight: '4px',
                              background: 'linear-gradient(to top, #06b6d4, #38bdf8, #93c5fd)',
                              boxShadow: '0 -4px 20px rgba(6, 182, 212, 0.4)',
                              opacity: 1
                            }}
                          >
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                 style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.1), transparent)' }}></div>
                          </div>
                          
                          {/* X-axis label */}
                          <div className="absolute -bottom-6 text-white/60 text-xs font-medium">
                            {point.label}
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white/50">Loading chart data...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-[calc(100%-32px)] flex flex-col justify-between text-white/50 text-xs font-medium">
                  <span>24</span>
                  <span>18</span>
                  <span>12</span>
                  <span>6</span>
                  <span>0</span>
                </div>
                
                {/* Horizontal grid lines */}
                <div className="absolute left-6 right-6 top-0 h-[calc(100%-32px)] pointer-events-none">
                  {[0, 25, 50, 75].map((y) => (
                    <div
                      key={y}
                      className="absolute w-full border-t border-white/10 border-dashed"
                      style={{ top: `${y}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Summary Cards with glow */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center hover:bg-white/15 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] group">
                <div className="text-white/80 text-sm font-semibold tracking-wide uppercase mb-1">Best Week</div>
                <div className="text-white text-lg font-bold mb-2">{bestWeek?.label || 'Week 31'}</div>
                <div className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover:animate-pulse">
                  {bestWeek?.value || 24}
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-xs text-white/60 uppercase tracking-wider mb-1">vs Target</div>
                  <div className="text-lg font-bold text-green-400">
                    {bestWeek ? `${Math.round((bestWeek.value / (currentDoctor.weekly_target || 40)) * 100)}%` : '60%'}
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center hover:bg-white/15 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] group">
                <div className="text-white/80 text-sm font-semibold tracking-wide uppercase mb-1">Current Period</div>
                <div className="text-white text-lg font-bold mb-2">{currentPeriod?.label || 'Week 34'}</div>
                <div className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover:animate-pulse">
                  {currentPeriod?.value || 12}
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Trend</div>
                  <div className="flex items-center justify-center gap-1">
                    {currentPeriod && chartData.length > 1 && chartData[chartData.length - 2] ? (
                      currentPeriod.value > chartData[chartData.length - 2].value ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-lg font-bold text-green-400">
                            +{currentPeriod.value - chartData[chartData.length - 2].value}
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                          <span className="text-lg font-bold text-red-400">
                            {currentPeriod.value - chartData[chartData.length - 2].value}
                          </span>
                        </>
                      )
                    ) : (
                      <span className="text-lg font-bold text-white/60">—</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center hover:bg-white/15 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] group">
                <div className="text-white/80 text-sm font-semibold tracking-wide uppercase mb-1">Weekly Average</div>
                <div className="text-white text-lg font-bold mb-2">Across {currentDoctor.weeks_worked} weeks</div>
                <div className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover:animate-pulse">
                  {average || 10}
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Performance</div>
                  <div className="text-lg font-bold">
                    {average >= (currentDoctor.weekly_target || 40) ? (
                      <span className="text-green-400">On Target 🎯</span>
                    ) : average >= (currentDoctor.weekly_target || 40) * 0.8 ? (
                      <span className="text-yellow-400">Near Target</span>
                    ) : (
                      <span className="text-orange-400">Below Target</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}