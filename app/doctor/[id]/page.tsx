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
import { getDoctorTheme } from "@/lib/doctorThemes"


interface DoctorData {
  id: string
  title: string
  first_name: string
  last_name: string
  specialty: string
  active: boolean
  weekly_target?: number
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
  const monthsWorked = Math.ceil(weeksWorked / 4.33)
  const avgPerMonth = Math.round(avgPerWeek * 4.33)
  const targetPercentage = stats?.target_completion_percentage || 0
  
  // Get color theme for this doctor using centralized theme system
  const theme = doctor ? getDoctorTheme(doctor, true) : getDoctorTheme({ first_name: '', last_name: '' }, true)

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
    <div className={`min-h-screen bg-gradient-to-br ${theme.lightGradient} p-8`}>
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
                <CardTitle className={`text-sm font-medium ${theme.titleColor}`}>Avg per Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${theme.valueColor}`}>{avgPerMonth}</div>
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
                <CardTitle className={`text-sm font-medium ${theme.titleColor}`}>Months Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${theme.valueColor}`}>{monthsWorked}</div>
                <p className={`text-xs ${theme.subTextColor} mt-2`}>Out of {new Date().getMonth() + 1} months</p>
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
                <CardTitle>Monthly Performance Trend</CardTitle>
                <CardDescription>Appointments per month in {currentYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.chartGradientStart} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.chartGradientStart} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Appointments', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="appointments" 
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
              <CardTitle>Monthly Performance Summary</CardTitle>
              <CardDescription>Monthly appointment data for {currentYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Month</th>
                      <th className="text-center py-3 px-4">Appointments</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-center py-3 px-4">Target</th>
                      <th className="text-center py-3 px-4">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((month, index) => {
                      const monthlyTarget = Math.round((doctor?.weekly_target || 30) * 4.33)
                      const performance = ((month.appointments / monthlyTarget) * 100).toFixed(0)
                      const currentMonth = new Date().getMonth()
                      return (
                        <tr key={month.month} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            {month.month} {currentYear}
                            {index === currentMonth && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Current</span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4 font-semibold">{month.appointments}</td>
                          <td className="text-center py-3 px-4">
                            {(() => {
                              const percentage = (month.appointments / monthlyTarget) * 100
                              if (percentage >= 100) {
                                return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">On Target</span>
                              } else if (percentage >= 67) {
                                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Below Target</span>
                              } else {
                                return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Low</span>
                              }
                            })()}
                          </td>
                          <td className="text-center py-3 px-4 text-gray-600">{monthlyTarget}</td>
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