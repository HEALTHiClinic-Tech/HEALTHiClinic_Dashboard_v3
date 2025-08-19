"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Activity, Calendar, TrendingUp, Target, Award, User } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts"
import { format, getWeek } from "date-fns"

// Color themes matching the carousel
const colorThemes = [
  {
    name: "Ocean",
    gradient: "from-cyan-50 via-blue-50 to-teal-50",
    cardGradient: "from-cyan-50 to-cyan-100",
    borderColor: "border-cyan-200",
    titleColor: "text-cyan-700",
    valueColor: "text-cyan-900",
    subTextColor: "text-cyan-600",
    chartColor: "#06b6d4",
    chartGradientStart: "#06b6d4",
    chartGradientEnd: "#0e7490",
    barColor: "#0891b2",
    progressBg: "bg-cyan-200",
    progressBar: "from-cyan-500 to-cyan-600"
  },
  {
    name: "Sunset",
    gradient: "from-orange-50 via-red-50 to-pink-50",
    cardGradient: "from-orange-50 to-orange-100",
    borderColor: "border-orange-200",
    titleColor: "text-orange-700",
    valueColor: "text-orange-900",
    subTextColor: "text-orange-600",
    chartColor: "#f97316",
    chartGradientStart: "#f97316",
    chartGradientEnd: "#dc2626",
    barColor: "#ea580c",
    progressBg: "bg-orange-200",
    progressBar: "from-orange-500 to-orange-600"
  },
  {
    name: "Forest",
    gradient: "from-green-50 via-emerald-50 to-teal-50",
    cardGradient: "from-green-50 to-green-100",
    borderColor: "border-green-200",
    titleColor: "text-green-700",
    valueColor: "text-green-900",
    subTextColor: "text-green-600",
    chartColor: "#10b981",
    chartGradientStart: "#10b981",
    chartGradientEnd: "#047857",
    barColor: "#059669",
    progressBg: "bg-green-200",
    progressBar: "from-green-500 to-green-600"
  },
  {
    name: "Royal",
    gradient: "from-purple-50 via-violet-50 to-indigo-50",
    cardGradient: "from-purple-50 to-purple-100",
    borderColor: "border-purple-200",
    titleColor: "text-purple-700",
    valueColor: "text-purple-900",
    subTextColor: "text-purple-600",
    chartColor: "#8b5cf6",
    chartGradientStart: "#8b5cf6",
    chartGradientEnd: "#6d28d9",
    barColor: "#7c3aed",
    progressBg: "bg-purple-200",
    progressBar: "from-purple-500 to-purple-600"
  },
  {
    name: "Ruby",
    gradient: "from-rose-50 via-pink-50 to-fuchsia-50",
    cardGradient: "from-rose-50 to-rose-100",
    borderColor: "border-rose-200",
    titleColor: "text-rose-700",
    valueColor: "text-rose-900",
    subTextColor: "text-rose-600",
    chartColor: "#ec4899",
    chartGradientStart: "#ec4899",
    chartGradientEnd: "#be185d",
    barColor: "#db2777",
    progressBg: "bg-rose-200",
    progressBar: "from-rose-500 to-rose-600"
  },
  {
    name: "Golden",
    gradient: "from-amber-50 via-yellow-50 to-orange-50",
    cardGradient: "from-amber-50 to-amber-100",
    borderColor: "border-amber-200",
    titleColor: "text-amber-700",
    valueColor: "text-amber-900",
    subTextColor: "text-amber-600",
    chartColor: "#f59e0b",
    chartGradientStart: "#f59e0b",
    chartGradientEnd: "#b45309",
    barColor: "#d97706",
    progressBg: "bg-amber-200",
    progressBar: "from-amber-500 to-amber-600"
  },
  {
    name: "Arctic",
    gradient: "from-slate-50 via-blue-50 to-cyan-50",
    cardGradient: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    titleColor: "text-blue-700",
    valueColor: "text-blue-900",
    subTextColor: "text-blue-600",
    chartColor: "#3b82f6",
    chartGradientStart: "#3b82f6",
    chartGradientEnd: "#1e40af",
    barColor: "#2563eb",
    progressBg: "bg-blue-200",
    progressBar: "from-blue-500 to-blue-600"
  },
  {
    name: "Lavender",
    gradient: "from-indigo-50 via-purple-50 to-pink-50",
    cardGradient: "from-indigo-50 to-indigo-100",
    borderColor: "border-indigo-200",
    titleColor: "text-indigo-700",
    valueColor: "text-indigo-900",
    subTextColor: "text-indigo-600",
    chartColor: "#6366f1",
    chartGradientStart: "#6366f1",
    chartGradientEnd: "#4338ca",
    barColor: "#4f46e5",
    progressBg: "bg-indigo-200",
    progressBar: "from-indigo-500 to-indigo-600"
  }
]

interface DoctorData {
  id: string
  title: string
  first_name: string
  last_name: string
  specialty: string
  active: boolean
  created_at: string
  updated_at: string
}

interface WeeklyData {
  week_number: number
  appointment_count: number
  notes?: string
}

export default function DoctorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.id as string
  
  const [doctor, setDoctor] = useState<DoctorData | null>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [doctorIndex, setDoctorIndex] = useState(0)
  const currentYear = new Date().getFullYear()
  const currentWeek = getWeek(new Date())

  useEffect(() => {
    if (doctorId) {
      fetchDoctorData()
    }
  }, [doctorId])

  const fetchDoctorData = async () => {
    try {
      // Fetch doctor info
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single()

      if (doctorError) throw doctorError
      setDoctor(doctorData)

      // Fetch weekly appointments
      const { data: weeklyAppointments, error: weeklyError } = await supabase
        .from('weekly_appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('year', currentYear)
        .order('week_number', { ascending: true })

      if (weeklyError) throw weeklyError
      
      const formattedWeekly = weeklyAppointments.map(w => ({
        week_number: w.week_number,
        appointment_count: Number(w.appointment_count) || 0,
        notes: w.notes
      }))
      setWeeklyData(formattedWeekly)

      // Fetch doctor stats
      const { data: statsData, error: statsError } = await supabase
        .from('doctor_stats_ytd')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('year', currentYear)
        .single()

      if (statsError) throw statsError
      setStats(statsData)
      
      // Get all doctors to determine the index for color theme
      const { data: allDoctors } = await supabase
        .from('doctor_stats_ytd')
        .select('doctor_id, total_appointments')
        .eq('year', currentYear)
        .order('total_appointments', { ascending: false })
      
      if (allDoctors) {
        const index = allDoctors.findIndex(d => d.doctor_id === doctorId)
        setDoctorIndex(index !== -1 ? index : 0)
      }

    } catch (error) {
      console.error('Error fetching doctor data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <p className="text-center text-gray-600">Doctor not found</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Return to Dashboard
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const totalAppointments = stats?.total_appointments || 0
  const avgPerWeek = stats?.avg_appointments_per_week || 0
  const weeksWorked = stats?.weeks_worked || 0
  const targetPercentage = stats?.target_completion_percentage || 0
  
  // Get color theme for this doctor
  const theme = colorThemes[doctorIndex % colorThemes.length]

  // Calculate month-by-month data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthWeeks = weeklyData.filter(w => {
      const weekMonth = Math.floor((w.week_number - 1) / 4.33)
      return weekMonth === i
    })
    return {
      month: format(new Date(currentYear, i, 1), 'MMM'),
      appointments: monthWeeks.reduce((sum, w) => sum + w.appointment_count, 0)
    }
  }).slice(0, new Date().getMonth() + 1)

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} p-8`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {doctor.title || 'Dr.'} {doctor.first_name} {doctor.last_name}
              </h1>
              <p className="text-gray-600 mt-2">{doctor.specialty || 'General Practice'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Performance Year</p>
              <p className="text-3xl font-bold text-primary">{currentYear}</p>
              <p className="text-sm text-gray-600 mt-1">Week {currentWeek}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${theme.cardGradient} ${theme.borderColor}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${theme.titleColor}`}>Total Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${theme.valueColor}`}>{totalAppointments}</div>
                <p className={`text-xs ${theme.subTextColor} mt-2`}>Year to date</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`bg-gradient-to-br ${theme.cardGradient} ${theme.borderColor}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${theme.titleColor}`}>Avg per Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${theme.valueColor}`}>{avgPerWeek}</div>
                <p className={`text-xs ${theme.subTextColor} mt-2`}>Average appointments</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={`bg-gradient-to-br ${theme.cardGradient} ${theme.borderColor}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${theme.titleColor}`}>Weeks Worked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${theme.valueColor}`}>{weeksWorked}</div>
                <p className={`text-xs ${theme.subTextColor} mt-2`}>Out of {currentWeek} weeks</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className={`bg-gradient-to-br ${theme.cardGradient} ${theme.borderColor}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${theme.titleColor}`}>Target Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${theme.valueColor}`}>{targetPercentage}%</div>
                <div className={`w-full ${theme.progressBg} rounded-full h-2 mt-2`}>
                  <div
                    className={`bg-gradient-to-r ${theme.progressBar} h-2 rounded-full`}
                    style={{ width: `${Math.min(targetPercentage, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle>Weekly Performance Trend</CardTitle>
                <CardDescription>Appointments per week in {currentYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.chartGradientStart} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.chartGradientStart} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week_number" label={{ value: 'Week', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Appointments', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="appointment_count" 
                      stroke={theme.chartColor} 
                      fillOpacity={1} 
                      fill="url(#appointmentGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>Total appointments by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="appointments" fill={theme.barColor} radius={[8, 8, 0, 0]}>
                      {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === monthlyData.length - 1 ? theme.chartColor : theme.barColor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Weeks Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Weekly Performance</CardTitle>
              <CardDescription>Last 10 weeks of appointment data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Week</th>
                      <th className="text-center py-3 px-4">Appointments</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Notes</th>
                      <th className="text-center py-3 px-4">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyData.slice(-10).reverse().map((week) => {
                      const performance = ((week.appointment_count / 30) * 100).toFixed(0)
                      return (
                        <tr key={week.week_number} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            Week {week.week_number}
                            {week.week_number === currentWeek && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Current</span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4 font-semibold">{week.appointment_count}</td>
                          <td className="text-center py-3 px-4">
                            {week.appointment_count >= 30 ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">On Target</span>
                            ) : week.appointment_count >= 20 ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Below Target</span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Low</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{week.notes || '-'}</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    Number(performance) >= 100 ? 'bg-green-500' :
                                    Number(performance) >= 67 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(Number(performance), 100)}%` }}
                                />
                              </div>
                              <span className="ml-2 text-xs font-medium">{performance}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}