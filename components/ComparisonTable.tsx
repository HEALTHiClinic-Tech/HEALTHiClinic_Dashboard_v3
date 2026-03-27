"use client"

import { useEffect, useState } from "react"
import { supabase, isConfigured } from "@/lib/supabase"
import {
  Trophy, TrendingUp, TrendingDown, Calendar, Users,
  ArrowUpDown, ArrowUp, ArrowDown, BarChart3
} from "lucide-react"

type ViewMode = 'weekly' | 'monthly' | 'yearly'
type SortColumn = 'name' | 'total' | 'rank' | string
type SortDirection = 'asc' | 'desc'

interface Doctor {
  id: string
  first_name: string
  last_name: string
  title: string
  specialty: string
}

interface WeeklyAppointment {
  doctor_id: string
  week_number: number
  year: number
  appointment_count: number
}

interface DoctorComparison {
  doctor: Doctor
  periodData: { [key: string]: number }
  total: number
  rank: number
  avgPerPeriod: number
  trend: number // percentage change from previous period
}

export default function ComparisonTable() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<WeeklyAppointment[]>([])
  const [comparisons, setComparisons] = useState<DoctorComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [sortColumn, setSortColumn] = useState<SortColumn>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [periods, setPeriods] = useState<string[]>([])

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  useEffect(() => {
    if (!isConfigured()) {
      setError('Database configuration missing')
      setLoading(false)
      return
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (doctors.length > 0 && appointments.length > 0) {
      processComparisons()
    }
  }, [doctors, appointments, viewMode, selectedYear, sortColumn, sortDirection])

  const fetchData = async () => {
    try {
      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .eq('active', true)

      if (doctorsError) throw doctorsError

      // Fetch all weekly appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('weekly_appointments')
        .select('*')
        .order('year', { ascending: true })
        .order('week_number', { ascending: true })

      if (appointmentsError) throw appointmentsError

      setDoctors(doctorsData || [])
      setAppointments(appointmentsData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const processComparisons = () => {
    const currentMonth = new Date().getMonth() + 1
    const currentWeek = getWeekNumber(new Date())

    // Filter appointments by selected year
    const yearAppointments = appointments.filter(a => a.year === selectedYear)

    // Generate periods based on view mode
    let periodList: string[] = []

    switch (viewMode) {
      case 'weekly':
        // Show weeks for selected year (up to current week if current year)
        const maxWeek = selectedYear === new Date().getFullYear() ? currentWeek : 52
        for (let w = 1; w <= Math.min(maxWeek, 52); w++) {
          periodList.push(`W${w}`)
        }
        // Limit to last 12 weeks for display
        if (periodList.length > 12) {
          periodList = periodList.slice(-12)
        }
        break

      case 'monthly':
        // Show months for selected year (up to current month if current year)
        const maxMonth = selectedYear === new Date().getFullYear() ? currentMonth : 12
        for (let m = 1; m <= maxMonth; m++) {
          periodList.push(monthNames[m - 1])
        }
        break

      case 'yearly':
        // Show available years
        const years = Array.from(new Set(appointments.map(a => a.year))).sort()
        periodList = years.map(y => String(y))
        break
    }

    setPeriods(periodList)

    // Process each doctor's data
    const doctorComparisons: DoctorComparison[] = doctors.map(doctor => {
      const doctorAppointments = appointments.filter(a => a.doctor_id === doctor.id)
      const periodData: { [key: string]: number } = {}

      switch (viewMode) {
        case 'weekly':
          periodList.forEach(period => {
            const weekNum = parseInt(period.replace('W', ''))
            const weekData = doctorAppointments.find(
              a => a.year === selectedYear && a.week_number === weekNum
            )
            periodData[period] = weekData?.appointment_count || 0
          })
          break

        case 'monthly':
          periodList.forEach((period, idx) => {
            const monthNum = idx + 1 + (12 - periodList.length) // Adjust for partial year
            // Aggregate weekly data into monthly
            const monthAppointments = doctorAppointments.filter(a => {
              if (a.year !== selectedYear) return false
              const weekMonth = getMonthFromWeek(a.week_number, a.year)
              return weekMonth === (monthNames.indexOf(period) + 1)
            })
            periodData[period] = monthAppointments.reduce((sum, a) => sum + a.appointment_count, 0)
          })
          break

        case 'yearly':
          periodList.forEach(year => {
            const yearNum = parseInt(year)
            const yearAppts = doctorAppointments.filter(a => a.year === yearNum)
            periodData[year] = yearAppts.reduce((sum, a) => sum + a.appointment_count, 0)
          })
          break
      }

      const total = Object.values(periodData).reduce((sum, val) => sum + val, 0)
      const nonZeroPeriods = Object.values(periodData).filter(v => v > 0).length
      const avgPerPeriod = nonZeroPeriods > 0 ? total / nonZeroPeriods : 0

      // Calculate trend (compare last two periods with data)
      const values = Object.values(periodData)
      const lastTwo = values.slice(-2)
      const trend = lastTwo.length === 2 && lastTwo[0] > 0
        ? ((lastTwo[1] - lastTwo[0]) / lastTwo[0]) * 100
        : 0

      return {
        doctor,
        periodData,
        total,
        rank: 0, // Will be set after sorting
        avgPerPeriod,
        trend
      }
    })

    // Sort by total to assign ranks
    const sortedByTotal = [...doctorComparisons].sort((a, b) => b.total - a.total)
    sortedByTotal.forEach((comp, idx) => {
      comp.rank = idx + 1
    })

    // Apply user sorting
    let sorted = [...doctorComparisons]

    if (sortColumn === 'name') {
      sorted.sort((a, b) => {
        const nameA = `${a.doctor.first_name} ${a.doctor.last_name}`
        const nameB = `${b.doctor.first_name} ${b.doctor.last_name}`
        return sortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      })
    } else if (sortColumn === 'total') {
      sorted.sort((a, b) => sortDirection === 'asc' ? a.total - b.total : b.total - a.total)
    } else if (sortColumn === 'rank') {
      sorted.sort((a, b) => sortDirection === 'asc' ? a.rank - b.rank : b.rank - a.rank)
    } else if (periods.includes(sortColumn)) {
      sorted.sort((a, b) => {
        const valA = a.periodData[sortColumn] || 0
        const valB = b.periodData[sortColumn] || 0
        return sortDirection === 'asc' ? valA - valB : valB - valA
      })
    }

    setComparisons(sorted)
  }

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  const getMonthFromWeek = (weekNumber: number, year: number): number => {
    // Approximate month from week number
    const jan4 = new Date(year, 0, 4)
    const weekOne = new Date(jan4)
    weekOne.setDate(jan4.getDate() - jan4.getDay() + 1)
    const targetDate = new Date(weekOne)
    targetDate.setDate(weekOne.getDate() + (weekNumber - 1) * 7)
    return targetDate.getMonth() + 1
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 text-blue-500" />
      : <ArrowDown className="w-4 h-4 text-blue-500" />
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="inline-flex items-center gap-1 text-yellow-600 font-bold"><Trophy className="w-4 h-4" /> 1st</span>
    if (rank === 2) return <span className="inline-flex items-center gap-1 text-gray-500 font-bold"><Trophy className="w-4 h-4" /> 2nd</span>
    if (rank === 3) return <span className="inline-flex items-center gap-1 text-amber-700 font-bold"><Trophy className="w-4 h-4" /> 3rd</span>
    return <span className="text-gray-600">{rank}th</span>
  }

  const getAvailableYears = () => {
    const years = Array.from(new Set(appointments.map(a => a.year))).sort((a, b) => b - a)
    return years.length > 0 ? years : [new Date().getFullYear()]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  // Calculate totals row
  const periodTotals: { [key: string]: number } = {}
  periods.forEach(period => {
    periodTotals[period] = comparisons.reduce((sum, c) => sum + (c.periodData[period] || 0), 0)
  })
  const grandTotal = comparisons.reduce((sum, c) => sum + c.total, 0)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Appointments Comparison</h2>
              <p className="text-sm text-gray-500">Compare doctor performance across time periods</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            {viewMode !== 'yearly' && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getAvailableYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="inline-flex bg-white border border-gray-300 rounded-lg p-1">
              {(['weekly', 'monthly', 'yearly'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th
                className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 z-10"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center gap-2">
                  Rank {getSortIcon('rank')}
                </div>
              </th>
              <th
                className="sticky left-16 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 z-10 min-w-[180px]"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Doctor {getSortIcon('name')}
                </div>
              </th>
              {periods.map(period => (
                <th
                  key={period}
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[70px]"
                  onClick={() => handleSort(period)}
                >
                  <div className="flex items-center justify-center gap-1">
                    {period} {getSortIcon(period)}
                  </div>
                </th>
              ))}
              <th
                className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-blue-50 min-w-[100px]"
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center justify-center gap-1">
                  Total {getSortIcon('total')}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[80px]">
                Avg
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[80px]">
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comparisons.map((comp, idx) => (
              <tr
                key={comp.doctor.id}
                className={`hover:bg-blue-50/50 transition-colors ${
                  comp.rank === 1 ? 'bg-yellow-50/50' :
                  comp.rank === 2 ? 'bg-gray-50/30' :
                  comp.rank === 3 ? 'bg-amber-50/30' : ''
                }`}
              >
                <td className="sticky left-0 bg-inherit px-4 py-3 whitespace-nowrap z-10">
                  {getRankBadge(comp.rank)}
                </td>
                <td className="sticky left-16 bg-inherit px-4 py-3 whitespace-nowrap z-10">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {comp.doctor.title} {comp.doctor.first_name} {comp.doctor.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{comp.doctor.specialty || 'Phlebologist'}</div>
                  </div>
                </td>
                {periods.map(period => {
                  const value = comp.periodData[period] || 0
                  const maxInPeriod = Math.max(...comparisons.map(c => c.periodData[period] || 0))
                  const isMax = value > 0 && value === maxInPeriod

                  return (
                    <td
                      key={period}
                      className={`px-4 py-3 text-center whitespace-nowrap ${
                        isMax ? 'bg-green-100 font-bold text-green-700' :
                        value === 0 ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {value}
                    </td>
                  )
                })}
                <td className="px-4 py-3 text-center whitespace-nowrap bg-blue-50 font-bold text-blue-700">
                  {comp.total}
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap text-gray-600">
                  {comp.avgPerPeriod.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  {comp.trend !== 0 ? (
                    <span className={`inline-flex items-center gap-1 ${
                      comp.trend > 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {comp.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(comp.trend).toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
              <td className="sticky left-0 bg-gray-100 px-4 py-3 z-10"></td>
              <td className="sticky left-16 bg-gray-100 px-4 py-3 text-gray-700 z-10">
                Total ({comparisons.length} doctors)
              </td>
              {periods.map(period => (
                <td key={period} className="px-4 py-3 text-center text-gray-700">
                  {periodTotals[period] || 0}
                </td>
              ))}
              <td className="px-4 py-3 text-center bg-blue-100 text-blue-800">
                {grandTotal}
              </td>
              <td className="px-4 py-3 text-center text-gray-600">
                {comparisons.length > 0 ? (grandTotal / comparisons.length).toFixed(1) : 0}
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{grandTotal}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Total Appointments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{comparisons.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Active Doctors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {comparisons.length > 0 ? (grandTotal / comparisons.length).toFixed(1) : 0}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Avg per Doctor</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {comparisons[0]?.doctor ? `${comparisons[0].doctor.title || 'Dr.'} ${comparisons[0].doctor.last_name}` : '-'}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Top Performer</div>
          </div>
        </div>
      </div>
    </div>
  )
}
