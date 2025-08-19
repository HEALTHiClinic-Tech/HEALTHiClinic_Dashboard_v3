"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, isConfigured } from "@/lib/supabase"
import { Doctor, WeeklyAppointment } from "@/types/database"
import { Save, Plus, UserPlus, Calendar, Hash, Check, X, AlertCircle, User, Target } from "lucide-react"
import { format, getWeek, getYear, startOfWeek } from "date-fns"
import SetupNotice from "@/components/SetupNotice"
import WeekCalendarPicker from "./WeekCalendarPicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function DataEntry() {
  if (!isConfigured()) {
    return <SetupNotice />
  }
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [appointmentData, setAppointmentData] = useState<{ doctor_id: string; appointment_count: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [existingData, setExistingData] = useState<any[]>([])
  
  const [newDoctor, setNewDoctor] = useState({
    title: "Dr.",
    first_name: "",
    last_name: "",
    specialty: ""
  })
  const [showAddDoctor, setShowAddDoctor] = useState(false)

  useEffect(() => {
    if (isConfigured()) {
      fetchDoctors()
    }
  }, [])

  useEffect(() => {
    if (doctors.length > 0) {
      fetchExistingData()
    }
  }, [selectedWeek, doctors])

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('active', true)
      .order('last_name', { ascending: true })

    if (data) {
      setDoctors(data)
      // Initialize appointment data for all doctors
      setAppointmentData(data.map(doctor => ({
        doctor_id: doctor.id,
        appointment_count: "0"
      })))
    }
    if (error) console.error('Error fetching doctors:', error)
  }

  const fetchExistingData = async () => {
    try {
      const year = getYear(selectedWeek)
      const weekNum = getWeek(selectedWeek, { weekStartsOn: 1 })
      
      const { data, error } = await supabase
        .from('weekly_appointments')
        .select('*')
        .eq('year', year)
        .eq('week_number', weekNum)

      if (error) throw error

      if (data && data.length > 0) {
        setExistingData(data)
        // Update appointment data with existing values
        setAppointmentData(doctors.map(doctor => {
          const existing = data.find(d => d.doctor_id === doctor.id)
          return {
            doctor_id: doctor.id,
            appointment_count: String(existing?.appointment_count || 0)
          }
        }))
      } else {
        setExistingData([])
        // Reset to empty values
        setAppointmentData(doctors.map(doctor => ({
          doctor_id: doctor.id,
          appointment_count: "0"
        })))
      }
    } catch (error) {
      console.error('Error fetching existing data:', error)
    }
  }

  const handleAppointmentChange = (doctorId: string, value: string) => {
    setAppointmentData(prev => 
      prev.map(item => 
        item.doctor_id === doctorId 
          ? { ...item, appointment_count: value }
          : item
      )
    )
  }


  const handleSubmitAppointment = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const year = getYear(selectedWeek)
      const weekNum = getWeek(selectedWeek, { weekStartsOn: 1 })
      
      // Prepare the data for all doctors
      const dataToUpsert = appointmentData.map(item => ({
        doctor_id: item.doctor_id,
        year: year,
        week_number: weekNum,
        week_start_date: selectedWeek.toISOString().split('T')[0],
        appointment_count: parseInt(item.appointment_count) || 0,
        notes: null
      }))

      // Use upsert to insert or update
      const { error } = await supabase
        .from('weekly_appointments')
        .upsert(dataToUpsert, {
          onConflict: 'doctor_id,year,week_number'
        })

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: `Successfully saved appointment data for Week ${weekNum}, ${year}` 
      })
      
      // Refresh existing data
      fetchExistingData()
      setTimeout(() => setMessage(null), 5000)
    } catch (error: any) {
      console.error('Error saving appointment data:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to save appointment data. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('doctors')
        .insert({
          ...newDoctor,
          active: true
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Doctor added successfully!' })
      setNewDoctor({
        title: "Dr.",
        first_name: "",
        last_name: "",
        specialty: ""
      })
      setShowAddDoctor(false)
      fetchDoctors()
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      console.error('Error adding doctor:', error)
      setMessage({ type: 'error', text: 'Failed to add doctor. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Data Entry Portal
          </h1>
          <p className="text-gray-600 mt-2">Manage doctor appointments and records</p>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg flex items-center ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <X className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </motion.div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Record Weekly Appointments
            </CardTitle>
            <CardDescription>
              Select a week and enter appointment counts for each doctor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Week Selection */}
            <div className="space-y-4">
              <Label>Select Week</Label>
              
              {/* Current Selection Display */}
              <Card className="p-4 bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => setShowCalendar(!showCalendar)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-blue-900">
                      Week {getWeek(selectedWeek, { weekStartsOn: 1 })} of {getYear(selectedWeek)}
                    </p>
                    <p className="text-sm text-blue-700">
                      {format(selectedWeek, 'EEEE, MMMM d')} - {format(new Date(selectedWeek.getTime() + 6 * 24 * 60 * 60 * 1000), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </Card>

              {/* Calendar Picker */}
              {showCalendar && (
                <Card className="p-4">
                  <WeekCalendarPicker
                    selectedWeek={selectedWeek}
                    onWeekSelect={(week) => {
                      setSelectedWeek(week)
                      setShowCalendar(false)
                    }}
                    minYear={2024}
                    maxYear={2075}
                  />
                </Card>
              )}
            </div>

            {/* Doctor Appointment Entry Grid */}
            <div className="space-y-4">
              <Label>Enter Appointments for Each Doctor</Label>
              
              {existingData.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    Data already exists for this week. Updating will overwrite existing values.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {doctors.map(doctor => {
                  const data = appointmentData.find(d => d.doctor_id === doctor.id)
                  const existing = existingData.find(d => d.doctor_id === doctor.id)
                  
                  return (
                    <Card key={doctor.id} className={existing ? "border-green-200 bg-green-50/30" : ""}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {doctor.title || 'Dr.'} {doctor.first_name} {doctor.last_name}
                            </span>
                          </div>
                          {existing && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Has Data
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {doctor.specialty || 'General Practice'}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Hash className="h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              min="0"
                              placeholder="Enter 0 if no appointments"
                              value={data?.appointment_count !== undefined ? data.appointment_count : ''}
                              onChange={(e) => {
                                handleAppointmentChange(doctor.id, e.target.value)
                              }}
                              onFocus={(e) => e.target.select()}
                              className="flex-1"
                            />
                          </div>
                          
                          {/* Target Progress Bar */}
                          {data && data.appointment_count !== undefined && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Target: {doctor.weekly_target || 80}/week</span>
                                <span className={
                                  parseInt(data.appointment_count) >= (doctor.weekly_target || 80) ? "text-green-600 font-medium" : 
                                  parseInt(data.appointment_count) >= ((doctor.weekly_target || 80) * 0.8) ? "text-yellow-600" : "text-gray-500"
                                }>
                                  {Math.round((parseInt(data.appointment_count) / (doctor.weekly_target || 80)) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full transition-all ${
                                    parseInt(data.appointment_count) >= (doctor.weekly_target || 80) ? 'bg-green-500' : 
                                    parseInt(data.appointment_count) >= ((doctor.weekly_target || 80) * 0.8) ? 'bg-yellow-500' : 
                                    parseInt(data.appointment_count) >= ((doctor.weekly_target || 80) * 0.5) ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min((parseInt(data.appointment_count) / (doctor.weekly_target || 80)) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Summary with Target */}
            <div className="space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Combined Weekly Target</span>
                    </div>
                    <span className="text-xl font-bold text-blue-900">
                      {doctors.reduce((sum, doc) => sum + (doc.weekly_target || 80), 0)} appointments
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-blue-800 mb-1">Individual Targets:</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {doctors.map(d => (
                        <div key={d.id} className="text-xs text-blue-700">
                          • {d.title || 'Dr.'} {d.first_name} {d.last_name}: <span className="font-semibold">{d.weekly_target || 80}</span>/week
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total This Week</p>
                      <p className="text-2xl font-bold">
                        {appointmentData.reduce((sum, item) => sum + (parseInt(item.appointment_count) || 0), 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average per Doctor</p>
                      <p className="text-2xl font-bold">
                        {doctors.length > 0 ? Math.round(appointmentData.reduce((sum, item) => sum + (parseInt(item.appointment_count) || 0), 0) / doctors.length) : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Target Progress</p>
                      <p className="text-2xl font-bold">
                        {(() => {
                          const totalAppointments = appointmentData.reduce((sum, item) => sum + (parseInt(item.appointment_count) || 0), 0);
                          const totalTarget = doctors.reduce((sum, doc) => sum + (doc.weekly_target || 80), 0);
                          return totalTarget > 0 ? Math.round((totalAppointments / totalTarget) * 100) : 0;
                        })()}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmitAppointment} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Saving...' : 'Save All Appointment Data'}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-green-600" />
                  Doctor Management
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddDoctor(!showAddDoctor)}
                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors"
                >
                  {showAddDoctor ? 'Cancel' : 'Add New'}
                </motion.button>
              </CardTitle>
              <CardDescription>
                Add new doctors to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showAddDoctor ? (
                <form onSubmit={handleAddDoctor} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <select
                        value={newDoctor.title}
                        onChange={(e) => setNewDoctor({ ...newDoctor, title: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        value={newDoctor.first_name}
                        onChange={(e) => setNewDoctor({ ...newDoctor, first_name: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        value={newDoctor.last_name}
                        onChange={(e) => setNewDoctor({ ...newDoctor, last_name: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Specialty</label>
                    <input
                      type="text"
                      value={newDoctor.specialty}
                      onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                      placeholder="e.g., Cardiology, Pediatrics, Phlebology"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Add Doctor
                      </>
                    )}
                  </motion.button>
                </form>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-4">
                    Currently tracking {doctors.length} active doctors
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {doctors.map((doctor, index) => (
                      <motion.div
                        key={doctor.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium">
                          {doctor.title || 'Dr.'} {doctor.first_name} {doctor.last_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {doctor.specialty || 'General Practice'}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}