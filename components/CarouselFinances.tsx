"use client"

import { useEffect, useState, useRef } from "react"
import { supabase, isConfigured } from "@/lib/supabase"
import {
  Pause, Play, ChevronLeft, ChevronRight, Sparkles, Trophy, Target,
  TrendingUp, TrendingDown, Calendar, DollarSign, Minimize, Maximize,
  CreditCard, Banknote, Wallet, Building, PiggyBank
} from "lucide-react"

type TimeInterval = 'monthly' | '3-monthly' | '6-monthly' | 'ytd' | 'all-time'

interface RevenueDataPoint {
  label: string
  value: number
  date?: string
  month?: number
  year?: number
}

interface PaymentMethodBreakdown {
  credit_card: number
  cash: number
  other: number
  internet_transfer: number
  cheque: number
  hicaps: number
  amex: number
  medicare_epc: number
  ndis: number
  insurance: number
}

interface DoctorRevenue {
  doctor_id: string
  doctor_name: string
  title: string
  first_name: string
  last_name: string
  specialty: string
  total_revenue: number
  avg_monthly_revenue: number
  months_worked: number
  best_month: { month: string; value: number }
  payment_breakdown: PaymentMethodBreakdown
  monthly_data: RevenueDataPoint[]
  growth_percentage: number
}

export default function CarouselFinances() {
  const [doctors, setDoctors] = useState<DoctorRevenue[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('monthly')
  const [chartData, setChartData] = useState<RevenueDataPoint[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isConfigured()) {
      setError('Database configuration missing')
      setLoading(false)
      return
    }
    fetchDoctorRevenue()
  }, [])

  useEffect(() => {
    if (doctors.length > 0 && isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % doctors.length)
      }, 20000) // 20 seconds per slide
      return () => clearInterval(interval)
    }
  }, [doctors.length, isPlaying])

  useEffect(() => {
    if (doctors[currentIndex]) {
      processChartData(doctors[currentIndex], timeInterval)
    }
  }, [currentIndex, doctors, timeInterval])

  const fetchDoctorRevenue = async () => {
    try {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1

      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .eq('active', true)

      if (doctorsError) throw doctorsError

      // Fetch all revenue data
      const { data: revenueData, error: revenueError } = await supabase
        .from('monthly_revenue')
        .select('*')
        .order('year', { ascending: true })
        .order('month', { ascending: true })

      if (revenueError) throw revenueError

      if (doctorsData && doctorsData.length > 0 && revenueData) {
        const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        const transformedData: DoctorRevenue[] = doctorsData
          .map(doctor => {
            // Get all revenue records for this doctor
            const doctorRevenue = revenueData.filter(r => r.doctor_id === doctor.id)

            if (doctorRevenue.length === 0) return null

            // Calculate total revenue
            const totalRevenue = doctorRevenue.reduce((sum, r) => sum + parseFloat(r.total || 0), 0)

            // Calculate payment method breakdown
            const paymentBreakdown: PaymentMethodBreakdown = {
              credit_card: doctorRevenue.reduce((sum, r) => sum + parseFloat(r.credit_card || 0), 0),
              cash: doctorRevenue.reduce((sum, r) => sum + parseFloat(r.cash || 0), 0),
              other: doctorRevenue.reduce((sum, r) => sum + parseFloat(r.other || 0), 0),
              internet_transfer: doctorRevenue.reduce((sum, r) => sum + parseFloat(r.internet_transfer || 0), 0),
              cheque: doctorRevenue.reduce((sum, r) => sum + parseFloat(r.cheque || 0), 0),
              hicaps: doctorRevenue.reduce((sum, r) => sum + parseFloat(r.hicaps || 0), 0),
              amex: doctorRevenue.reduce((sum, r) => sum + parseFloat(r.amex || 0), 0),
              medicare_epc: doctorRevenue.reduce((sum, r) => sum + parseFloat(r.medicare_epc || 0), 0),
              ndis: doctorRevenue.reduce((sum, r) => sum + parseFloat(r.ndis || 0), 0),
              insurance: doctorRevenue.reduce((sum, r) => sum + parseFloat(r.insurance || 0), 0),
            }

            // Find best month
            const bestMonthRecord = doctorRevenue.reduce((best, current) =>
              parseFloat(current.total) > parseFloat(best.total) ? current : best
            , doctorRevenue[0])

            const bestMonth = {
              month: `${monthNames[bestMonthRecord.month]} ${bestMonthRecord.year}`,
              value: parseFloat(bestMonthRecord.total)
            }

            // Calculate growth (compare last 2 months)
            const sortedRevenue = [...doctorRevenue].sort((a, b) =>
              (a.year * 12 + a.month) - (b.year * 12 + b.month)
            )
            const lastMonth = sortedRevenue[sortedRevenue.length - 1]
            const prevMonth = sortedRevenue[sortedRevenue.length - 2]
            const growth = lastMonth && prevMonth
              ? ((parseFloat(lastMonth.total) - parseFloat(prevMonth.total)) / parseFloat(prevMonth.total)) * 100
              : 0

            // Prepare monthly data for charts
            const monthlyData: RevenueDataPoint[] = doctorRevenue.map(r => {
              // Safely parse the total - handle null, undefined, string, or number
              const rawTotal = r.total
              let parsedValue = 0
              if (rawTotal !== null && rawTotal !== undefined) {
                parsedValue = typeof rawTotal === 'number' ? rawTotal : parseFloat(String(rawTotal))
                if (isNaN(parsedValue)) parsedValue = 0
              }

              return {
                label: `${monthNames[r.month]}'${String(r.year).slice(2)}`,
                value: parsedValue,
                month: r.month,
                year: r.year
              }
            })

            return {
              doctor_id: doctor.id,
              doctor_name: `${doctor.title || 'Dr.'} ${doctor.first_name} ${doctor.last_name}`,
              title: doctor.title || 'Dr.',
              first_name: doctor.first_name,
              last_name: doctor.last_name,
              specialty: doctor.specialty || 'General Practice',
              total_revenue: totalRevenue,
              avg_monthly_revenue: totalRevenue / doctorRevenue.length,
              months_worked: doctorRevenue.length,
              best_month: bestMonth,
              payment_breakdown: paymentBreakdown,
              monthly_data: monthlyData,
              growth_percentage: growth
            }
          })
          .filter((d): d is DoctorRevenue => d !== null)
          .sort((a, b) => b.total_revenue - a.total_revenue)

        setDoctors(transformedData)

        // Initial chart data
        if (transformedData.length > 0) {
          processChartData(transformedData[0], timeInterval)
        }
      } else {
        setError('No revenue data available')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const processChartData = (doctor: DoctorRevenue, interval: TimeInterval) => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    let filteredData: RevenueDataPoint[] = []

    switch (interval) {
      case 'monthly':
        // Show all monthly data
        filteredData = [...doctor.monthly_data].sort((a, b) =>
          ((a.year || 0) * 12 + (a.month || 0)) - ((b.year || 0) * 12 + (b.month || 0))
        )
        break

      case '3-monthly':
        // Last 3 months
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

        filteredData = doctor.monthly_data
          .filter(d => {
            const dataDate = new Date((d.year || currentYear), (d.month || 1) - 1)
            return dataDate >= threeMonthsAgo
          })
          .sort((a, b) =>
            ((a.year || 0) * 12 + (a.month || 0)) - ((b.year || 0) * 12 + (b.month || 0))
          )
        break

      case '6-monthly':
        // Last 6 months
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        filteredData = doctor.monthly_data
          .filter(d => {
            const dataDate = new Date((d.year || currentYear), (d.month || 1) - 1)
            return dataDate >= sixMonthsAgo
          })
          .sort((a, b) =>
            ((a.year || 0) * 12 + (a.month || 0)) - ((b.year || 0) * 12 + (b.month || 0))
          )
        break

      case 'ytd':
        // Year to date
        filteredData = doctor.monthly_data
          .filter(d => d.year === currentYear && (d.month || 0) <= currentMonth)
          .sort((a, b) => (a.month || 0) - (b.month || 0))
          .map(d => ({
            ...d,
            label: monthNames[d.month || 0]
          }))
        break

      case 'all-time':
        // All data sorted chronologically
        filteredData = [...doctor.monthly_data].sort((a, b) =>
          ((a.year || 0) * 12 + (a.month || 0)) - ((b.year || 0) * 12 + (b.month || 0))
        )
        break
    }

    setChartData(filteredData)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + doctors.length) % doctors.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % doctors.length)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && carouselRef.current) {
      carouselRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(() => {})
    } else if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      }).catch(() => {})
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatCurrencyShort = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value.toFixed(0)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  if (error || doctors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <div className="text-white text-xl mb-2">No Revenue Data Available</div>
          <div className="text-white/60">Please run the data population script first</div>
        </div>
      </div>
    )
  }

  const currentDoctor = doctors[currentIndex]
  const ranking = currentIndex + 1

  // Doctor gradients - financial themed with emerald/gold tones
  const getDoctorGradient = () => {
    const doctorGradients = [
      'from-emerald-900 via-green-700 to-teal-600',        // Index 0 - Emerald/Teal (money green)
      'from-amber-900 via-yellow-700 to-orange-500',       // Index 1 - Gold/Amber
      'from-cyan-900 via-teal-700 to-emerald-600',         // Index 2 - Cyan/Emerald
      'from-violet-900 via-purple-700 to-fuchsia-600',     // Index 3 - Violet/Purple
      'from-rose-900 via-pink-700 to-red-600',             // Index 4 - Rose/Red
      'from-slate-900 via-zinc-700 to-gray-600',           // Index 5 - Premium Slate
      'from-indigo-900 via-blue-700 to-sky-600',           // Index 6 - Indigo/Blue
      'from-orange-900 via-amber-700 to-yellow-500',       // Index 7 - Sunset Orange
    ]

    return doctorGradients[currentIndex % doctorGradients.length]
  }

  const currentGradient = getDoctorGradient()

  // Payment method icon and color mapping
  const getPaymentMethodInfo = (method: string) => {
    const info: { [key: string]: { icon: React.ReactNode; color: string; label: string } } = {
      credit_card: { icon: <CreditCard className="w-4 h-4" />, color: 'from-blue-500 to-blue-600', label: 'Credit Card' },
      cash: { icon: <Banknote className="w-4 h-4" />, color: 'from-green-500 to-green-600', label: 'Cash' },
      hicaps: { icon: <Building className="w-4 h-4" />, color: 'from-purple-500 to-purple-600', label: 'HICAPS' },
      internet_transfer: { icon: <Wallet className="w-4 h-4" />, color: 'from-cyan-500 to-cyan-600', label: 'Bank Transfer' },
      amex: { icon: <CreditCard className="w-4 h-4" />, color: 'from-indigo-500 to-indigo-600', label: 'AMEX' },
      other: { icon: <PiggyBank className="w-4 h-4" />, color: 'from-gray-500 to-gray-600', label: 'Other' },
      cheque: { icon: <Wallet className="w-4 h-4" />, color: 'from-orange-500 to-orange-600', label: 'Cheque' },
      medicare_epc: { icon: <Building className="w-4 h-4" />, color: 'from-teal-500 to-teal-600', label: 'Medicare EPC' },
      ndis: { icon: <Building className="w-4 h-4" />, color: 'from-pink-500 to-pink-600', label: 'NDIS' },
      insurance: { icon: <Building className="w-4 h-4" />, color: 'from-amber-500 to-amber-600', label: 'Insurance' },
    }
    return info[method] || { icon: <DollarSign className="w-4 h-4" />, color: 'from-gray-500 to-gray-600', label: method }
  }

  // Get top payment methods for display
  const getTopPaymentMethods = () => {
    const methods = Object.entries(currentDoctor.payment_breakdown)
      .filter(([_, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return methods
  }

  // Calculate stats from chart data
  const periodTotal = chartData.reduce((sum, d) => sum + d.value, 0)
  const periodAverage = chartData.length > 0 ? periodTotal / chartData.length : 0
  const bestPeriod = chartData.length > 0
    ? chartData.reduce((best, current) => current.value > best.value ? current : best, chartData[0])
    : null
  const currentPeriod = chartData[chartData.length - 1] || null

  return (
    <div ref={carouselRef} className={`min-h-screen bg-gradient-to-br ${currentGradient} transition-all duration-1500 ease-in-out relative overflow-auto`}>
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Shimmer overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 8s infinite;
        }
        @keyframes glow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)); }
          50% { filter: brightness(1.2) drop-shadow(0 0 40px rgba(255, 255, 255, 0.5)); }
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>

      <div className="relative z-10 container mx-auto px-4 py-1 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] animate-glow">
              Financial Performance Showcase
            </h1>
            <DollarSign className="w-8 h-8 text-yellow-400 animate-pulse drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all transform hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
            </button>

            <button
              onClick={handlePrevious}
              className="p-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all transform hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <span className="text-white font-semibold drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{currentIndex + 1} / {doctors.length}</span>
            </div>

            <button
              onClick={handleNext}
              className="p-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all transform hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all transform hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-6 h-6 text-white" /> : <Maximize className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Time Interval Selector */}
        <div className="flex justify-center gap-1 mb-2">
          <div className="inline-flex bg-black/20 backdrop-blur rounded-2xl p-1 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <Calendar className="w-5 h-5 text-white/70 self-center ml-3 mr-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            {['monthly', '3-monthly', '6-monthly', 'ytd', 'all-time'].map((interval) => (
              <button
                key={interval}
                onClick={() => setTimeInterval(interval as TimeInterval)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timeInterval === interval
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] transform scale-105 animate-pulse'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {interval === 'ytd' ? 'Year to Date' :
                 interval === 'all-time' ? 'All Time' :
                 interval.charAt(0).toUpperCase() + interval.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-2">
          {doctors.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white rounded-full'
                  : 'w-2 h-2 bg-white/40 rounded-full hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          {/* Doctor Info Card */}
          <div className="relative bg-black/30 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 overflow-hidden group animate-fadeIn">
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="flex items-center gap-2 mb-4 relative">
              <div className="text-6xl font-black text-white drop-shadow-[0_0_40px_rgba(255,215,0,0.6)] animate-float">
                #{ranking}
              </div>
              <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_25px_rgba(255,215,0,0.8)] animate-pulse" />
            </div>

            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              Dr. {currentDoctor.first_name} {currentDoctor.last_name}
            </h2>
            <p className="text-white/80 text-lg font-semibold mb-4">{currentDoctor.specialty}</p>

            {/* Total Revenue - Updates based on selected time interval */}
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 mb-4 border border-emerald-400/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <div className="flex flex-col">
                    <span className="text-white/90 font-medium">
                      {timeInterval === 'all-time' ? 'Total Revenue' :
                       timeInterval === 'ytd' ? 'YTD Revenue' :
                       timeInterval === '3-monthly' ? '3-Month Revenue' :
                       timeInterval === '6-monthly' ? '6-Month Revenue' :
                       'Period Revenue'}
                    </span>
                    <span className="text-white/50 text-xs">
                      {chartData.length} {chartData.length === 1 ? 'month' : 'months'}
                    </span>
                  </div>
                </div>
                <span className="text-3xl font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                  {formatCurrency(periodTotal)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Monthly Average - Updates based on selected time interval */}
              <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 text-sm font-semibold uppercase tracking-wide">
                    {timeInterval === 'all-time' ? 'Monthly Average' : 'Period Average'}
                  </span>
                  <TrendingUp className="w-5 h-5 text-white/60" />
                </div>
                <div className="text-3xl font-black text-white">{formatCurrency(periodAverage)}</div>
              </div>

              {/* Best Month - Updates based on selected time interval */}
              <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 text-sm font-semibold uppercase tracking-wide">
                    {timeInterval === 'all-time' ? 'Best Month' : 'Best in Period'}
                  </span>
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-white/80 mb-1">{bestPeriod?.label || '-'}</div>
                <div className="text-3xl font-black text-white">{bestPeriod ? formatCurrency(bestPeriod.value) : '$0'}</div>
              </div>

              {/* Growth */}
              <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 text-sm font-semibold uppercase tracking-wide">Month-over-Month</span>
                  {currentDoctor.growth_percentage >= 0
                    ? <TrendingUp className="w-5 h-5 text-green-400" />
                    : <TrendingDown className="w-5 h-5 text-red-400" />
                  }
                </div>
                <div className={`text-3xl font-black ${currentDoctor.growth_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {currentDoctor.growth_percentage >= 0 ? '+' : ''}{currentDoctor.growth_percentage.toFixed(1)}%
                </div>
              </div>

              {/* Months in Period - Updates based on selected time interval */}
              <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all">
                <span className="text-white/80 text-sm font-semibold uppercase tracking-wide">
                  {timeInterval === 'all-time' ? 'Total Months Active' : 'Months in Period'}
                </span>
                <div className="text-3xl font-black text-white mt-1">{chartData.length} {chartData.length === 1 ? 'month' : 'months'}</div>
              </div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="lg:col-span-2 relative bg-black/30 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl overflow-hidden group flex flex-col animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                {timeInterval === 'monthly' ? 'Monthly' :
                 timeInterval === '3-monthly' ? '3 Month' :
                 timeInterval === '6-monthly' ? '6 Month' :
                 timeInterval === 'ytd' ? 'Year to Date' :
                 'All Time'} Revenue Trend
              </h3>
              <div className="bg-white/10 backdrop-blur px-3 py-1 rounded-lg">
                <span className="text-white/60 text-xs font-medium">Revenue per Month</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="relative h-[300px] mb-3 bg-gradient-to-br from-black/20 to-black/10 backdrop-blur-sm rounded-2xl p-6 overflow-hidden">
              <div className="relative h-full">
                <div className="absolute inset-0 pb-8">
                  <div className="relative h-full flex items-end justify-between gap-2">
                    {chartData.length > 0 ? chartData.map((point, i) => {
                      // Filter out any NaN values and ensure minimum maxValue of 1000
                      const validValues = chartData.map(d => d.value).filter(v => !isNaN(v) && v >= 0)
                      const maxValue = validValues.length > 0 ? Math.max(...validValues, 1000) : 1000
                      const heightPercent = maxValue > 0 ? Math.min(Math.max((point.value / maxValue) * 100, 0), 100) : 0

                      return (
                        <div key={i} className="flex-1 h-full flex flex-col items-center justify-end relative group/bar">
                          {/* Value label */}
                          <div className="absolute bottom-full mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 z-10">
                            <span className="text-white font-bold text-xs bg-black/60 backdrop-blur px-2 py-1 rounded-lg whitespace-nowrap">
                              {formatCurrency(point.value)}
                            </span>
                          </div>

                          {/* Bar */}
                          <div
                            className="w-full rounded-t-lg transition-all duration-300 relative"
                            style={{
                              height: `${heightPercent}%`,
                              minHeight: '4px',
                              background: 'linear-gradient(to top, #10b981, #34d399, #6ee7b7)',
                              boxShadow: '0 -4px 20px rgba(16, 185, 129, 0.4)',
                            }}
                          >
                            <div className="absolute inset-0 rounded-t-lg opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300"
                                 style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.1), transparent)' }}></div>
                          </div>

                          {/* X-axis label */}
                          <div className="absolute -bottom-6 text-white/60 text-xs font-medium whitespace-nowrap">
                            {point.label}
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white/50">No data for selected period</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center hover:bg-white/15 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] group/card">
                <div className="text-white/80 text-xs font-semibold tracking-wide uppercase mb-1">Best Month</div>
                <div className="text-white text-sm font-bold mb-1">{bestPeriod?.label || '-'}</div>
                <div className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover/card:animate-pulse">
                  {bestPeriod ? formatCurrencyShort(bestPeriod.value) : '$0'}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center hover:bg-white/15 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] group/card">
                <div className="text-white/80 text-xs font-semibold tracking-wide uppercase mb-1">Period Total</div>
                <div className="text-white text-sm font-bold mb-1">{chartData.length} months</div>
                <div className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover/card:animate-pulse">
                  {formatCurrencyShort(periodTotal)}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center hover:bg-white/15 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] group/card">
                <div className="text-white/80 text-xs font-semibold tracking-wide uppercase mb-1">Period Average</div>
                <div className="text-white text-sm font-bold mb-1">Per Month</div>
                <div className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover/card:animate-pulse">
                  {formatCurrencyShort(periodAverage)}
                </div>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-4">
              <h4 className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-3">Payment Method Breakdown</h4>
              <div className="grid grid-cols-5 gap-2">
                {getTopPaymentMethods().map(([method, value]) => {
                  const info = getPaymentMethodInfo(method)
                  const percentage = (value / currentDoctor.total_revenue) * 100

                  return (
                    <div key={method} className="bg-white/5 rounded-xl p-2 text-center hover:bg-white/10 transition-all">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r ${info.color} mb-2`}>
                        {info.icon}
                      </div>
                      <div className="text-white/70 text-xs font-medium truncate">{info.label}</div>
                      <div className="text-white font-bold text-sm">{formatCurrencyShort(value)}</div>
                      <div className="text-white/50 text-xs">{percentage.toFixed(1)}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
