"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Doctor } from "@/types/database"
import { 
  UserPlus, 
  Trash2, 
  Edit, 
  Eye, 
  Save, 
  X, 
  Check, 
  AlertCircle,
  Search,
  Briefcase,
  User,
  Calendar,
  Activity,
  Target
} from "lucide-react"
import { format } from "date-fns"

interface DoctorStats {
  total_appointments: number
  weeks_worked: number
  avg_appointments_per_week: number
}

export default function DoctorManagementSimple() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [doctorStats, setDoctorStats] = useState<DoctorStats | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [newDoctor, setNewDoctor] = useState({
    title: "Dr.",
    first_name: "",
    last_name: "",
    specialty: "",
    weekly_target: "80"
  })

  const [editForm, setEditForm] = useState({
    title: "",
    weekly_target: "80",
    first_name: "",
    last_name: "",
    specialty: ""
  })

  const titleOptions = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms.", ""]

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('last_name', { ascending: true })

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
      showMessage('error', 'Failed to fetch doctors')
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctorStats = async (doctorId: string) => {
    try {
      const currentYear = new Date().getFullYear()
      const { data, error } = await supabase
        .from('doctor_stats_ytd')
        .select('total_appointments, weeks_worked, avg_appointments_per_week')
        .eq('doctor_id', doctorId)
        .eq('year', currentYear)
        .single()

      if (error) throw error
      
      setDoctorStats({
        total_appointments: Number(data?.total_appointments) || 0,
        weeks_worked: Number(data?.weeks_worked) || 0,
        avg_appointments_per_week: Number(data?.avg_appointments_per_week) || 0
      })
    } catch (error) {
      console.error('Error fetching doctor stats:', error)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('doctors')
        .insert([{
          title: newDoctor.title || "Dr.",
          first_name: newDoctor.first_name,
          last_name: newDoctor.last_name,
          specialty: newDoctor.specialty || null,
          weekly_target: parseInt(newDoctor.weekly_target) || 80
        }])

      if (error) throw error

      showMessage('success', 'Doctor added successfully!')
      setNewDoctor({
        title: "Dr.",
        first_name: "",
        last_name: "",
        specialty: "",
        weekly_target: "80"
      })
      setShowAddForm(false)
      fetchDoctors()
    } catch (error) {
      console.error('Error adding doctor:', error)
      showMessage('error', 'Failed to add doctor.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDoctor) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          title: editForm.title,
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          specialty: editForm.specialty || null,
          weekly_target: parseInt(editForm.weekly_target) || 80
        })
        .eq('id', editingDoctor.id)

      if (error) throw error

      showMessage('success', 'Doctor updated successfully!')
      setEditingDoctor(null)
      fetchDoctors()
    } catch (error) {
      console.error('Error updating doctor:', error)
      showMessage('error', 'Failed to update doctor')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDoctor = async (doctor: Doctor) => {
    if (!confirm(`Are you sure you want to delete ${doctor.title} ${doctor.first_name} ${doctor.last_name}? This will also delete all their appointment records.`)) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctor.id)

      if (error) throw error

      showMessage('success', 'Doctor deleted successfully!')
      fetchDoctors()
    } catch (error) {
      console.error('Error deleting doctor:', error)
      showMessage('error', 'Failed to delete doctor')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (doctor: Doctor) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ active: !doctor.active })
        .eq('id', doctor.id)

      if (error) throw error

      showMessage('success', `Doctor ${doctor.active ? 'deactivated' : 'activated'} successfully!`)
      fetchDoctors()
    } catch (error) {
      console.error('Error toggling doctor status:', error)
      showMessage('error', 'Failed to update doctor status')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowDetails(true)
    await fetchDoctorStats(doctor.id)
  }

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setEditForm({
      title: doctor.title || "Dr.",
      weekly_target: String(doctor.weekly_target || 80),
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      specialty: doctor.specialty || ""
    })
  }

  const filteredDoctors = doctors.filter(doctor => {
    const searchLower = searchTerm.toLowerCase()
    return (
      doctor.first_name.toLowerCase().includes(searchLower) ||
      doctor.last_name.toLowerCase().includes(searchLower) ||
      doctor.specialty?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </motion.div>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <UserPlus className="h-6 w-6 mr-2 text-blue-600" />
                Doctor Management
              </CardTitle>
              <CardDescription>Manage doctor records and information</CardDescription>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add New Doctor
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Add Doctor Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200"
              >
                <h3 className="text-lg font-semibold mb-4">Add New Doctor</h3>
                <form onSubmit={handleAddDoctor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <select
                      value={newDoctor.title}
                      onChange={(e) => setNewDoctor({ ...newDoctor, title: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {titleOptions.map(title => (
                        <option key={title} value={title}>
                          {title || "(No title)"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input
                      type="text"
                      value={newDoctor.first_name}
                      onChange={(e) => setNewDoctor({ ...newDoctor, first_name: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={newDoctor.last_name}
                      onChange={(e) => setNewDoctor({ ...newDoctor, last_name: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Specialty</label>
                    <input
                      type="text"
                      value={newDoctor.specialty}
                      onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Cardiology"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Target className="inline h-4 w-4 mr-1" />
                      Weekly Target
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newDoctor.weekly_target}
                      onChange={(e) => setNewDoctor({ ...newDoctor, weekly_target: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="80"
                    />
                    <p className="text-xs text-gray-500 mt-1">Appointments per week</p>
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Doctor
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Doctors List */}
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Total: {filteredDoctors.length} doctors ({filteredDoctors.filter(d => d.active).length} active)
            </div>
            
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border ${
                  doctor.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
                }`}
              >
                {editingDoctor?.id === doctor.id ? (
                  // Edit Form
                  <form onSubmit={handleUpdateDoctor} className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Edit className="h-5 w-5 mr-2 text-blue-600" />
                        Edit Doctor Information
                      </h3>
                      <span className="text-sm text-gray-500">
                        Editing: {editForm.title} {editForm.first_name} {editForm.last_name}
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <select
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {titleOptions.map(title => (
                            <option key={title} value={title}>
                              {title || "(No title)"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                        <input
                          type="text"
                          value={editForm.specialty}
                          onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Cardiology"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Target className="inline h-4 w-4 mr-1" />
                          Weekly Target
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.weekly_target}
                          onChange={(e) => setEditForm({ ...editForm, weekly_target: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="80"
                        />
                        <p className="text-xs text-gray-500 mt-1">Appointments per week</p>
                      </div>
                    </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingDoctor(null)}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  // Display Mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {doctor.first_name[0]}{doctor.last_name[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {doctor.title} {doctor.first_name} {doctor.last_name}
                            {!doctor.active && (
                              <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                Inactive
                              </span>
                            )}
                          </h3>
                          <div className="text-sm text-gray-600">
                            {doctor.specialty || 'General Practice'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(doctor)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditDoctor(doctor)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(doctor)}
                        className={`p-2 rounded-lg transition-colors ${
                          doctor.active 
                            ? 'text-amber-600 hover:bg-amber-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={doctor.active ? 'Deactivate' : 'Activate'}
                      >
                        {doctor.active ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Doctor Details Modal */}
      <AnimatePresence>
        {showDetails && selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">Doctor Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-medium">{selectedDoctor.title} {selectedDoctor.first_name} {selectedDoctor.last_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Specialty</p>
                          <p className="font-medium">{selectedDoctor.specialty || 'General Practice'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-medium">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              selectedDoctor.active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {selectedDoctor.active ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  {doctorStats && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Performance Statistics (YTD)</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-600">Total Appointments</p>
                          <p className="text-2xl font-bold text-blue-900">{doctorStats.total_appointments}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-600">Weeks Worked</p>
                          <p className="text-2xl font-bold text-green-900">{doctorStats.weeks_worked}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-600">Avg per Week</p>
                          <p className="text-2xl font-bold text-purple-900">{doctorStats.avg_appointments_per_week}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* System Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">System Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Created At</p>
                          <p className="font-medium">
                            {format(new Date(selectedDoctor.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Last Updated</p>
                          <p className="font-medium">
                            {format(new Date(selectedDoctor.updated_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Database ID */}
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">Database ID: {selectedDoctor.id}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}