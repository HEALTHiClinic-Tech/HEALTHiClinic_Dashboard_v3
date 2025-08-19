"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { DoctorStatsYTD } from "@/types/database"
import { Activity, TrendingUp, Target, Award, ChevronLeft, ChevronRight, Play, Pause, Calendar, Sparkles } from "lucide-react"
import React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

type TimeInterval = 'daily' | 'weekly' | 'monthly' | '3-monthly' | '6-monthly' | 'ytd' | 'all-time'

// Color themes for different doctors
const colorThemes = [
  {
    name: "Ocean",
    gradient: "from-blue-900 via-cyan-800 to-teal-900",
    primary: "#06b6d4", // cyan-500
    secondary: "#0891b2", // cyan-600
    accent: "#22d3ee", // cyan-400
    chartGradientStart: "#06b6d4",
    chartGradientEnd: "#0e7490"
  },
  {
    name: "Sunset",
    gradient: "from-orange-900 via-red-800 to-pink-900",
    primary: "#f97316", // orange-500
    secondary: "#ea580c", // orange-600
    accent: "#fb923c", // orange-400
    chartGradientStart: "#f97316",
    chartGradientEnd: "#dc2626"
  },
  {
    name: "Forest",
    gradient: "from-green-900 via-emerald-800 to-teal-900",
    primary: "#10b981", // emerald-500
    secondary: "#059669", // emerald-600
    accent: "#34d399", // emerald-400
    chartGradientStart: "#10b981",
    chartGradientEnd: "#047857"
  },
  {
    name: "Royal",
    gradient: "from-purple-900 via-violet-800 to-indigo-900",
    primary: "#8b5cf6", // violet-500
    secondary: "#7c3aed", // violet-600
    accent: "#a78bfa", // violet-400
    chartGradientStart: "#8b5cf6",
    chartGradientEnd: "#6d28d9"
  },
  {
    name: "Ruby",
    gradient: "from-rose-900 via-pink-800 to-fuchsia-900",
    primary: "#ec4899", // pink-500
    secondary: "#db2777", // pink-600
    accent: "#f472b6", // pink-400
    chartGradientStart: "#ec4899",
    chartGradientEnd: "#be185d"
  },
  {
    name: "Golden",
    gradient: "from-amber-900 via-yellow-800 to-orange-900",
    primary: "#f59e0b", // amber-500
    secondary: "#d97706", // amber-600
    accent: "#fbbf24", // amber-400
    chartGradientStart: "#f59e0b",
    chartGradientEnd: "#b45309"
  },
  {
    name: "Arctic",
    gradient: "from-slate-900 via-blue-900 to-cyan-900",
    primary: "#3b82f6", // blue-500
    secondary: "#2563eb", // blue-600
    accent: "#60a5fa", // blue-400
    chartGradientStart: "#3b82f6",
    chartGradientEnd: "#1e40af"
  },
  {
    name: "Lavender",
    gradient: "from-indigo-900 via-purple-800 to-pink-900",
    primary: "#6366f1", // indigo-500
    secondary: "#4f46e5", // indigo-600
    accent: "#818cf8", // indigo-400
    chartGradientStart: "#6366f1",
    chartGradientEnd: "#4338ca"
  }
]

export default function DoctorCarousel() {
  const [doctors, setDoctors] = useState<DoctorStatsYTD[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('weekly')
  const [dataLoading, setDataLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const currentYear = new Date().getFullYear()
  
  // Ensure client-side only rendering for animations
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchDoctorStats()
  }, [])

  useEffect(() => {
    if (doctors.length > 0 && isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % doctors.length)
      }, 5000) // Change every 5 seconds

      return () => clearInterval(interval)
    }
  }, [doctors.length, isPlaying])

  useEffect(() => {
    if (doctors[currentIndex]) {
      fetchIntervalData(doctors[currentIndex].doctor_id, timeInterval)
    }
  }, [currentIndex, doctors, timeInterval])

  const fetchDoctorStats = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_stats_ytd')
        .select('*')
        .eq('year', currentYear)
        .order('total_appointments', { ascending: false })

      if (error) throw error

      if (data) {
        const cleanedStats = data.map(stat => ({
          ...stat,
          total_appointments: Number(stat.total_appointments) || 0,
          weeks_worked: Number(stat.weeks_worked) || 0,
          avg_appointments_per_week: Number(stat.avg_appointments_per_week) || 0,
          target_completion_percentage: Number(stat.target_completion_percentage) || 0,
          weekly_target: Number(stat.weekly_target) || 80
        }))
        setDoctors(cleanedStats)
      }
    } catch (error) {
      console.error('Error fetching doctor stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchIntervalData = async (doctorId: string, interval: TimeInterval) => {
    setDataLoading(true)
    try {
      // For all-time, filter from September 9, 2024 onwards
      const startDate = '2024-09-09' // Monday, September 9th, 2024
      
      let query = supabase
        .from('weekly_appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('week_start_date', { ascending: true })
      
      if (interval === 'all-time') {
        query = query.gte('week_start_date', startDate)
      }
      
      const { data, error } = await query

      if (error) throw error

      if (data) {
        let formattedData: ChartDataPoint[] = []
        
        switch (interval) {
          case 'daily':
            // Group by day (expand weekly data to daily estimates)
            formattedData = data.slice(-8).map(w => ({
              label: `Week ${w.week_number}`,
              value: Math.round((Number(w.appointment_count) || 0) / 5), // Divide by 5 for daily average
              date: w.week_start_date
            }))
            break
            
          case 'weekly':
            formattedData = data.map(w => ({
              label: `Week ${w.week_number}`,
              value: Number(w.appointment_count) || 0,
              date: w.week_start_date
            }))
            break
            
          case 'monthly':
            // Group by month
            const monthlyData = new Map<string, number>()
            data.forEach(w => {
              const month = new Date(w.week_start_date).toLocaleString('default', { month: 'short' })
              const current = monthlyData.get(month) || 0
              monthlyData.set(month, current + (Number(w.appointment_count) || 0))
            })
            formattedData = Array.from(monthlyData.entries()).map(([month, count]) => ({
              label: month,
              value: count
            }))
            break
            
          case '3-monthly':
            // Group by quarter
            const quarterlyData = new Map<string, number>()
            data.forEach(w => {
              const quarter = `Q${Math.ceil((new Date(w.week_start_date).getMonth() + 1) / 3)}`
              const current = quarterlyData.get(quarter) || 0
              quarterlyData.set(quarter, current + (Number(w.appointment_count) || 0))
            })
            formattedData = Array.from(quarterlyData.entries()).map(([quarter, count]) => ({
              label: quarter,
              value: count
            }))
            break
            
          case '6-monthly':
            // Group by half-year
            const halfYearData = new Map<string, number>()
            data.forEach(w => {
              const half = new Date(w.week_start_date).getMonth() < 6 ? 'H1' : 'H2'
              const current = halfYearData.get(half) || 0
              halfYearData.set(half, current + (Number(w.appointment_count) || 0))
            })
            formattedData = Array.from(halfYearData.entries()).map(([half, count]) => ({
              label: half + ' ' + currentYear,
              value: count
            }))
            break
            
          case 'ytd':
            // Year to date - weekly view for entire year
            formattedData = data.map(w => ({
              label: `W${w.week_number}`,
              value: Number(w.appointment_count) || 0,
              date: w.week_start_date
            }))
            break
            
          case 'all-time':
            // All time from September 9, 2024 - monthly aggregation for better visualization
            const allTimeData = new Map<string, number>()
            data.forEach(w => {
              const date = new Date(w.week_start_date)
              const monthYear = `${date.toLocaleString('default', { month: 'short' })} '${date.getFullYear().toString().slice(-2)}`
              const current = allTimeData.get(monthYear) || 0
              allTimeData.set(monthYear, current + (Number(w.appointment_count) || 0))
            })
            formattedData = Array.from(allTimeData.entries()).map(([monthYear, count]) => ({
              label: monthYear,
              value: count
            }))
            break
        }
        
        setChartData(formattedData)
      }
    } catch (error) {
      console.error('Error fetching interval data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + doctors.length) % doctors.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % doctors.length)
  }

  if (loading || doctors.length === 0 || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentDoctor = doctors[currentIndex]
  const ranking = currentIndex + 1
  // Get color theme for current doctor (cycle through themes if more doctors than themes)
  const currentTheme = colorThemes[currentIndex % colorThemes.length]

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} p-8 transition-all duration-1000`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center">
            Doctor Performance Showcase
            <Sparkles className="h-8 w-8 ml-3 text-yellow-400 animate-pulse" />
          </h1>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white" />
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              
              <span className="text-white font-medium px-4">
                {currentIndex + 1} / {doctors.length}
              </span>
              
              <button
                onClick={handleNext}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Time Interval Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl p-2">
            <Calendar className="h-5 w-5 text-white ml-2" />
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
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeInterval === option.value
                    ? 'bg-white/30 text-white shadow-lg transform scale-105'
                    : 'bg-transparent text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {doctors.map((doctor, index) => (
            <div
              key={doctor.doctor_id}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8' : 'w-2 bg-white/30'
              }`}
              style={index === currentIndex ? { backgroundColor: currentTheme.primary } : {}}
            />
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDoctor.doctor_id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Doctor Info Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white h-full relative overflow-hidden group">
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`text-6xl font-bold ${
                      ranking === 1 ? 'text-yellow-400' :
                      ranking === 2 ? 'text-gray-300' :
                      ranking === 3 ? 'text-orange-400' : 'text-white/60'
                    }`}>
                      #{ranking}
                    </div>
                    {ranking === 1 && <Award className="h-12 w-12 text-yellow-400" />}
                  </div>
                  <CardTitle className="text-3xl mt-4">
                    {currentDoctor.title || 'Dr.'} {currentDoctor.first_name} {currentDoctor.last_name}
                  </CardTitle>
                  <p className="text-white/80 text-lg">{currentDoctor.specialty || 'General Practice'}</p>
                  
                  {/* Weekly Target Display */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-white/20 to-white/10 rounded-lg border border-white/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-yellow-400" />
                        <span className="text-white/90 font-medium">Weekly Target</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-400">
                        {currentDoctor.weekly_target || 80} appointments
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:scale-[1.02] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Total Appointments</span>
                      <Activity className="h-5 w-5" style={{ color: currentTheme.accent }} />
                    </div>
                    <p className="text-4xl font-bold">{currentDoctor.total_appointments.toLocaleString()}</p>
                  </div>

                  <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:scale-[1.02] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Average per Week</span>
                      <TrendingUp className="h-5 w-5" style={{ color: currentTheme.primary }} />
                    </div>
                    <p className="text-4xl font-bold">{currentDoctor.avg_appointments_per_week}</p>
                  </div>

                  <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:scale-[1.02] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">YTD Target Progress</span>
                      <Target className="h-5 w-5" style={{ color: currentTheme.accent }} />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-4xl font-bold">{currentDoctor.target_completion_percentage}%</p>
                      <p className="text-sm text-white/70">
                        Goal: {((currentDoctor.weekly_target || 80) * currentDoctor.weeks_worked).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 mt-3">
                      <div
                        className="h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${Math.min(currentDoctor.target_completion_percentage || 0, 100)}%`,
                          background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.accent})` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:scale-[1.02] transition-transform">
                    <span className="text-white/80">Weeks Worked</span>
                    <p className="text-2xl font-bold mt-1">{currentDoctor.weeks_worked} weeks</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full relative overflow-hidden group">
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center">
                    {timeInterval === 'daily' && 'Daily'}
                    {timeInterval === 'weekly' && 'Weekly'}
                    {timeInterval === 'monthly' && 'Monthly'}
                    {timeInterval === '3-monthly' && 'Quarterly'}
                    {timeInterval === '6-monthly' && 'Semi-Annual'}
                    {timeInterval === 'ytd' && 'Year to Date'}
                    {timeInterval === 'all-time' && 'All Time (Since Sep 9, 2024)'}
                    {' Performance Trend'}
                    {dataLoading && (
                      <div className="ml-2 h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-visible">
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart 
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: timeInterval === 'all-time' ? 60 : 20 }}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={currentTheme.chartGradientStart} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={currentTheme.chartGradientStart} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                      <XAxis 
                        dataKey="label" 
                        stroke="rgba(255,255,255,0.7)"
                        tick={{ 
                          fill: 'rgba(255,255,255,0.9)', 
                          fontSize: 12,
                          fontWeight: 500
                        }}
                        angle={timeInterval === 'all-time' ? -45 : 0}
                        textAnchor={timeInterval === 'all-time' ? 'end' : 'middle'}
                        height={timeInterval === 'all-time' ? 60 : 30}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.7)"
                        tick={{ 
                          fill: 'rgba(255,255,255,0.8)', 
                          fontSize: 11
                        }}
                        label={{ 
                          value: 'Number of Appointments', 
                          angle: -90, 
                          position: 'insideLeft', 
                          fill: 'rgba(255,255,255,0.9)',
                          style: { fontWeight: 500 }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.95)', 
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderRadius: '8px',
                          padding: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}
                        labelStyle={{
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          marginBottom: '4px'
                        }}
                        formatter={(value: number) => [
                          `${value.toLocaleString()} appointments`,
                          'Total'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={currentTheme.primary} 
                        fillOpacity={1} 
                        fill="url(#colorGradient)"
                        strokeWidth={3}
                        animationDuration={1000}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm hover:scale-105 transition-transform">
                      <p className="text-white/60 text-sm">
                        {timeInterval === 'daily' ? 'Best Day' : 
                         timeInterval === 'monthly' ? 'Best Month' :
                         timeInterval === '3-monthly' ? 'Best Quarter' :
                         timeInterval === '6-monthly' ? 'Best Half' :
                         timeInterval === 'ytd' ? 'Best Week YTD' :
                         timeInterval === 'all-time' ? 'Best Month' :
                         'Best Week'}
                      </p>
                      {(() => {
                        if (chartData.length === 0) return <p className="text-2xl font-bold text-white">0</p>
                        const maxValue = Math.max(...chartData.map(d => d.value))
                        const bestPeriod = chartData.find(d => d.value === maxValue)
                        return (
                          <div>
                            <p className="text-lg font-semibold text-white/90">{bestPeriod?.label}</p>
                            <p className="text-2xl font-bold text-white">{maxValue.toLocaleString()}</p>
                          </div>
                        )
                      })()}
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm hover:scale-105 transition-transform">
                      <p className="text-white/60 text-sm">
                        {timeInterval === 'all-time' ? 'Latest Month' : 'Current Period'}
                      </p>
                      {chartData.length > 0 ? (
                        <div>
                          <p className="text-lg font-semibold text-white/90">
                            {chartData[chartData.length - 1]?.label}
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {(chartData[chartData.length - 1]?.value || 0).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-white">0</p>
                      )}
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm hover:scale-105 transition-transform">
                      <p className="text-white/60 text-sm">
                        {timeInterval === 'daily' ? 'Daily Average' :
                         timeInterval === 'weekly' ? 'Weekly Average' :
                         timeInterval === 'monthly' ? 'Monthly Average' :
                         timeInterval === '3-monthly' ? 'Quarterly Average' :
                         timeInterval === '6-monthly' ? 'Semi-Annual Average' :
                         timeInterval === 'ytd' ? 'Weekly Average YTD' :
                         timeInterval === 'all-time' ? 'Monthly Average' :
                         'Average'}
                      </p>
                      <div>
                        <p className="text-lg font-semibold text-white/90">
                          {(() => {
                            if (chartData.length === 0) return 'No data'
                            const unit = timeInterval === 'daily' ? 'days' :
                                       timeInterval === 'weekly' ? 'weeks' :
                                       timeInterval === 'monthly' || timeInterval === 'all-time' ? 'months' :
                                       timeInterval === '3-monthly' ? 'quarters' :
                                       timeInterval === '6-monthly' ? 'half-years' :
                                       timeInterval === 'ytd' ? 'weeks' : 'data points'
                            return `Across ${chartData.length} ${unit}`
                          })()}
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {chartData.length > 0 
                            ? Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toLocaleString()
                            : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}