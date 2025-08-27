"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, isConfigured } from "@/lib/supabase"
import { DoctorStatsYTD, WeeklyTrend } from "@/types/database"
import { Activity, TrendingUp, Users, Calendar, Target, Award, Presentation, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
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
import { getDoctorColor, getDoctorColors } from "@/lib/doctorThemes"

const COLORS = getDoctorColors()

export default function FullDashboard() {
  const router = useRouter()
  const [doctorStats, setDoctorStats] = useState<DoctorStatsYTD[]>([])
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const currentYear = new Date().getFullYear()
  const currentWeek = getWeek(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isConfigured()) {
      fetchDashboardData()
      const interval = setInterval(fetchDashboardData, 30000)
      return () => clearInterval(interval)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: statsData, error: statsError } = await supabase
        .from('doctor_stats_ytd')
        .select('*')
        .eq('year', currentYear)

      const { data: trendsData, error: trendsError } = await supabase
        .from('weekly_trends')
        .select('*')
        .eq('year', currentYear)
        .order('week_number', { ascending: true })

      if (statsError) console.error('Stats error:', statsError)
      if (trendsError) console.error('Trends error:', trendsError)

      if (statsData) {
        const cleanedStats = statsData.map(stat => ({
          ...stat,
          total_appointments: Number(stat.total_appointments) || 0,
          weeks_worked: Number(stat.weeks_worked) || 0,
          avg_appointments_per_week: Number(stat.avg_appointments_per_week) || 0,
          max_weekly_appointments: Number(stat.max_weekly_appointments) || 0,
          min_weekly_appointments: Number(stat.min_weekly_appointments) || 0,
          target_completion_percentage: Number(stat.target_completion_percentage) || 0
        }))
        setDoctorStats(cleanedStats)
      }

      if (trendsData) {
        const cleanedTrends = trendsData.map(trend => ({
          ...trend,
          week_number: Number(trend.week_number),
          total_appointments: Number(trend.total_appointments) || 0,
          active_doctors: Number(trend.active_doctors) || 0,
          avg_appointments: Number(trend.avg_appointments) || 0
        }))
        setWeeklyTrends(cleanedTrends)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Convert weekly trends to monthly trends
  const monthlyTrends = (() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthData = new Map()
    
    weeklyTrends.forEach(week => {
      // Calculate which month this week belongs to
      const monthIndex = Math.floor((week.week_number - 1) / 4.33)
      if (monthIndex >= 0 && monthIndex < 12) {
        const monthKey = monthNames[monthIndex]
        const existing = monthData.get(monthKey) || { 
          appointments: 0, 
          doctors: new Set(),
          weekCount: 0 
        }
        existing.appointments += week.total_appointments
        existing.weekCount++
        // Track unique doctors
        for (let i = 0; i < week.active_doctors; i++) {
          existing.doctors.add(i)
        }
        monthData.set(monthKey, existing)
      }
    })
    
    return monthNames
      .filter(month => monthData.has(month))
      .map(month => {
        const data = monthData.get(month)
        return {
          month,
          total_appointments: data.appointments,
          active_doctors: data.doctors.size || doctorStats.length,
          avg_appointments: Math.round(data.appointments / data.weekCount)
        }
      })
  })()

  const totalAppointments = doctorStats.reduce((sum, doc) => sum + doc.total_appointments, 0)
  const totalDoctors = doctorStats.length
  const avgAppointmentsPerDoctor = totalDoctors > 0 ? Math.round(totalAppointments / totalDoctors) : 0
  const topPerformer = doctorStats.length > 0 
    ? doctorStats.reduce((top, doc) => 
        doc.total_appointments > (top?.total_appointments || 0) ? doc : top, doctorStats[0])
    : null

  if (!isConfigured()) {
    return <div className="p-8">Please configure Supabase</div>
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HEALTHiClinic Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Year-to-Date Performance {currentYear}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/carousel')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <Presentation className="h-5 w-5" />
                <span>View Carousel</span>
              </button>
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-800">
                  {format(currentTime, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-3xl font-bold text-primary">
                  {format(currentTime, 'HH:mm:ss')}
                </p>
                <p className="text-sm text-gray-600">Week {currentWeek} of {currentYear}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalAppointments.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">Year to date</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalDoctors}</div>
                <p className="text-xs text-muted-foreground mt-2">Currently tracking</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg per Doctor</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgAppointmentsPerDoctor}</div>
                <p className="text-xs text-muted-foreground mt-2">Appointments YTD</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                <Award className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate">
                  {topPerformer ? `${topPerformer.title || 'Dr.'} ${topPerformer.first_name} ${topPerformer.last_name}` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {topPerformer?.total_appointments || 0} appointments
                </p>
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
                <CardTitle>Monthly Appointment Trends</CardTitle>
                <CardDescription>Appointments per month throughout {currentYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrends}>
                    <defs>
                      <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="total_appointments" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorAppointments)"
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
                <CardTitle>Doctor Performance Comparison</CardTitle>
                <CardDescription>Total appointments by doctor</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={doctorStats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="last_name" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_appointments">
                      {doctorStats.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getDoctorColor(entry)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Doctor Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Doctor Statistics</CardTitle>
              <CardDescription>Detailed performance metrics for each doctor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Doctor</th>
                      <th className="text-left py-3 px-4">Specialty</th>
                      <th className="text-center py-3 px-4">Total</th>
                      <th className="text-center py-3 px-4">Avg/Week</th>
                      <th className="text-center py-3 px-4">Weeks Worked</th>
                      <th className="text-center py-3 px-4">Target %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorStats.map((doctor, index) => (
                      <tr 
                        key={doctor.doctor_id} 
                        className="border-b hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/doctor/${doctor.doctor_id}`)}
                      >
                        <td className="py-3 px-4 font-medium">
                          <div className="flex items-center justify-between">
                            <span>{doctor.title || 'Dr.'} {doctor.first_name} {doctor.last_name}</span>
                            <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </td>
                        <td className="py-3 px-4">{doctor.specialty || 'N/A'}</td>
                        <td className="text-center py-3 px-4 font-semibold">
                          {doctor.total_appointments}
                        </td>
                        <td className="text-center py-3 px-4">
                          {doctor.avg_appointments_per_week}
                        </td>
                        <td className="text-center py-3 px-4">
                          {doctor.weeks_worked}
                        </td>
                        <td className="text-center py-3 px-4">
                          {doctor.target_completion_percentage ? (
                            <div className="flex items-center justify-center">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(doctor.target_completion_percentage, 100)}%` }}
                                />
                              </div>
                              <span className="ml-2 text-xs font-medium">
                                {doctor.target_completion_percentage}%
                              </span>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}