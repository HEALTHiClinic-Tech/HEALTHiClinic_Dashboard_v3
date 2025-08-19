"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, isConfigured } from "@/lib/supabase"
import { DoctorStatsYTD, WeeklyTrend } from "@/types/database"
import { Activity, TrendingUp, Users, Calendar, Target, Award } from "lucide-react"
import SetupNotice from "@/components/SetupNotice"
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
  PieChart,
  Pie,
  Cell
} from "recharts"
import { format, startOfYear, getWeek } from "date-fns"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function Dashboard() {
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
    } else {
      setLoading(false)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, trendsResponse] = await Promise.all([
        supabase
          .from('doctor_stats_ytd')
          .select('*')
          .eq('year', currentYear),
        supabase
          .from('weekly_trends')
          .select('*')
          .eq('year', currentYear)
          .order('week_number', { ascending: true })
      ])

      if (statsResponse.error) {
        console.error('Error fetching doctor stats:', statsResponse.error)
      }
      if (trendsResponse.error) {
        console.error('Error fetching weekly trends:', trendsResponse.error)
      }

      if (statsResponse.data && statsResponse.data.length > 0) {
        // Filter out entries with null values and ensure all numeric fields have defaults
        const cleanedStats = statsResponse.data.map(stat => ({
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
      
      if (trendsResponse.data && trendsResponse.data.length > 0) {
        // Filter out entries with null values
        const cleanedTrends = trendsResponse.data
          .map(trend => ({
            ...trend,
            total_appointments: Number(trend.total_appointments) || 0,
            active_doctors: Number(trend.active_doctors) || 0,
            avg_appointments: Number(trend.avg_appointments) || 0
          }))
        setWeeklyTrends(cleanedTrends)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalAppointments = doctorStats.reduce((sum, doc) => sum + (doc.total_appointments || 0), 0)
  const totalDoctors = doctorStats.length
  const avgAppointmentsPerDoctor = totalDoctors > 0 ? Math.round(totalAppointments / totalDoctors) : 0
  const topPerformer = doctorStats.length > 0 ? doctorStats.reduce((top, doc) => 
    (!top || (doc.total_appointments || 0) > (top.total_appointments || 0)) ? doc : top, 
    doctorStats[0]
  ) : null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  if (!isConfigured()) {
    return <SetupNotice />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
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

  if (!loading && totalAppointments === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="text-2xl">No Data Available</CardTitle>
              <CardDescription>
                The dashboard is ready but there's no appointment data for {currentYear} yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                To get started:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Go to the <a href="/admin" className="text-blue-600 hover:underline">Data Entry page</a></li>
                <li>Add doctors to the system if not already added</li>
                <li>Enter weekly appointment counts for each doctor</li>
                <li>Return to the dashboard to see the statistics</li>
              </ol>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Quick Tip:</p>
                <p className="text-sm text-blue-700">
                  You can also run the sample data SQL script in your Supabase SQL editor to populate with test data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HEALTHiClinic Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Year-to-Date Performance {currentYear}</p>
            </div>
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
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="h-4 w-4 text-blue-600" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {totalAppointments.toLocaleString()}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-2">
                Year to date
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              <Users className="h-4 w-4 text-green-600 animate-pulse" />
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                {totalDoctors}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-2">
                Currently tracking
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Doctor</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                {avgAppointmentsPerDoctor}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-2">
                Appointments YTD
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
              <Award className="h-4 w-4 text-amber-600 animate-bounce" />
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-lg font-bold truncate"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {topPerformer ? `Dr. ${topPerformer.first_name} ${topPerformer.last_name}` : 'N/A'}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-2">
                {topPerformer?.total_appointments || 0} appointments
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle>Weekly Appointment Trends</CardTitle>
                <CardDescription>Appointments per week throughout {currentYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyTrends}>
                    <defs>
                      <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week_number" label={{ value: 'Week', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Appointments', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total_appointments" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorAppointments)"
                      strokeWidth={2}
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
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
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    <Bar 
                      dataKey="total_appointments" 
                      animationDuration={1500}
                    >
                      {doctorStats.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
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
                    <AnimatePresence>
                      {doctorStats.map((doctor, index) => (
                        <motion.tr
                          key={doctor.doctor_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium">
                            Dr. {doctor.first_name} {doctor.last_name}
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
                                  <motion.div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(doctor.target_completion_percentage, 100)}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
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
                        </motion.tr>
                      ))}
                    </AnimatePresence>
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