"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, isConfigured } from "@/lib/supabase"
import { DoctorStatsYTD, WeeklyTrend } from "@/types/database"

export default function SimpleDashboard() {
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
      const { data: statsData, error: statsError } = await supabase
        .from('doctor_stats_ytd')
        .select('*')
        .eq('year', currentYear)

      const { data: trendsData, error: trendsError } = await supabase
        .from('weekly_trends')
        .select('*')
        .eq('year', currentYear)
        .order('week_number', { ascending: true })

      if (statsError) throw statsError
      if (trendsError) throw trendsError

      setDoctorStats(statsData || [])
      setWeeklyTrends(trendsData || [])
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
                  <p className="font-medium">
                    Dr. {doctor.first_name} {doctor.last_name}
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