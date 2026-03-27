"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, isConfigured } from "@/lib/supabase"
import { DoctorStatsYTD, WeeklyTrend } from "@/types/database"
import { useRouter } from 'next/navigation'
import { ExternalLink } from "lucide-react"

export default function SimpleDashboard() {
  const router = useRouter()
  const [doctorStats, setDoctorStats] = useState<DoctorStatsYTD[]>([])
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch doctors and their weekly appointments
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .eq('active', true)

      const { data: weeklyData, error: weeklyError } = await supabase
        .from('weekly_appointments')
        .select('*')
        .eq('year', currentYear)

      const { data: targetsData, error: targetsError } = await supabase
        .from('appointment_targets')
        .select('*')
        .eq('year', currentYear)

      if (doctorsError) throw doctorsError
      if (weeklyError) throw weeklyError

      // Transform doctors data to match expected format
      const transformedStats = doctorsData?.map(doctor => {
        // Get all weekly appointments for this doctor
        const doctorWeekly = weeklyData?.filter(w => w.doctor_id === doctor.id) || []
        
        // Calculate total appointments for the year
        const totalAppointments = doctorWeekly.reduce((sum, week) => sum + (week.appointment_count || 0), 0)
        
        // Get the doctor's target
        const doctorTarget = targetsData?.find(t => t.doctor_id === doctor.id)
        const weeklyTarget = doctor.weekly_target || doctorTarget?.weekly_target || 80
        
        return {
          id: doctor.id,
          doctor_id: doctor.id,
          doctor_name: `${doctor.title || 'Dr.'} ${doctor.first_name} ${doctor.last_name}`,
          title: doctor.title || 'Dr.',
          first_name: doctor.first_name,
          last_name: doctor.last_name,
          specialty: doctor.specialty || 'General Practice',
          year: currentYear,
          total_appointments: totalAppointments,
          completed_appointments: 0, // Not tracked in current schema
          cancelled_appointments: 0, // Not tracked in current schema
          revenue: 0, // Not tracked in current schema
          patient_satisfaction: 95, // Default value
          weeks_worked: doctorWeekly.length || 1,
          avg_appointments_per_week: doctorWeekly.length > 0 ? Math.round(totalAppointments / doctorWeekly.length) : 0,
          max_weekly_appointments: Math.max(...doctorWeekly.map(w => w.appointment_count || 0), 0),
          min_weekly_appointments: Math.min(...doctorWeekly.map(w => w.appointment_count || 0), 0),
          weekly_target: weeklyTarget,
          target_completion_percentage: 0,
          created_at: doctor.created_at,
          updated_at: doctor.updated_at
        }
      }) || []

      setDoctorStats(transformedStats)
      
      // Transform weekly data to trends
      const weeklyTrendsData = []
      for (let week = 1; week <= 52; week++) {
        const weekData = weeklyData?.filter(w => w.week_number === week) || []
        if (weekData.length > 0) {
          weeklyTrendsData.push({
            week_number: week,
            year: currentYear,
            total_appointments: weekData.reduce((sum, w) => sum + (w.appointment_count || 0), 0),
            active_doctors: weekData.length,
            avg_appointments: Math.round(weekData.reduce((sum, w) => sum + (w.appointment_count || 0), 0) / weekData.length)
          })
        }
      }
      setWeeklyTrends(weeklyTrendsData)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isConfigured()) {
    return <div>Supabase not configured</div>
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  const totalAppointments = doctorStats.reduce((sum, doc) => {
    const appointments = Number(doc.total_appointments) || 0
    return sum + appointments
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">HEALTHiClinic Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalAppointments}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{doctorStats.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weeks Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{weeklyTrends.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Doctor List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {doctorStats.map((doctor) => (
                <div key={doctor.doctor_id} className="p-2 border rounded">
                  <p 
                    className="font-medium cursor-pointer hover:text-blue-600 transition-colors inline-flex items-center group"
                    onClick={() => router.push(`/doctor/${doctor.doctor_id}`)}
                  >
                    {doctor.title || 'Dr.'} {doctor.first_name} {doctor.last_name}
                    <ExternalLink className="ml-2 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-sm text-gray-600">
                    Appointments: {Number(doctor.total_appointments) || 0}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}