export interface Doctor {
  id: string
  title: string
  first_name: string
  last_name: string
  specialty?: string
  active: boolean
  weekly_target?: number
  created_at: string
  updated_at: string
}

export interface WeeklyAppointment {
  id: string
  doctor_id: string
  year: number
  week_number: number
  appointment_count: number
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface AppointmentTarget {
  id: string
  doctor_id?: string
  year: number
  weekly_target?: number
  monthly_target?: number
  yearly_target?: number
  created_at: string
  updated_at: string
}

export interface DoctorStatsYTD {
  doctor_id: string
  title: string
  first_name: string
  last_name: string
  specialty?: string
  year: number
  weeks_worked: number
  total_appointments: number
  avg_appointments_per_week: number
  max_weekly_appointments: number
  min_weekly_appointments: number
  weekly_target?: number
  yearly_target?: number
  target_completion_percentage?: number
}

export interface WeeklyTrend {
  year: number
  week_number: number
  total_appointments: number
  active_doctors: number
  avg_appointments: number
}