// Centralized doctor theme management
export const colorThemes = [
  {
    name: "Ocean",
    gradient: "from-blue-900 via-cyan-800 to-teal-900",
    primary: "#06b6d4", // cyan-500
    secondary: "#0891b2", // cyan-600
    accent: "#22d3ee", // cyan-400
    chartGradientStart: "#06b6d4",
    chartGradientEnd: "#0e7490",
    // Light theme for individual pages
    lightGradient: "from-cyan-50 via-blue-50 to-teal-50",
    cardGradient: "from-cyan-50 to-cyan-100",
    borderColor: "border-cyan-200",
    titleColor: "text-cyan-700",
    valueColor: "text-cyan-900",
    subTextColor: "text-cyan-600",
    chartColor: "#06b6d4",
    barColor: "#0891b2",
    progressBg: "bg-cyan-200",
    progressBar: "from-cyan-500 to-cyan-600"
  },
  {
    name: "Crimson",
    gradient: "from-red-900 via-red-800 to-rose-900",
    primary: "#dc2626", // red-600
    secondary: "#b91c1c", // red-700
    accent: "#ef4444", // red-500
    chartGradientStart: "#991b1b", // red-800
    chartGradientEnd: "#7f1d1d", // red-900
    // Light theme for individual pages
    lightGradient: "from-orange-50 via-red-50 to-pink-50",
    cardGradient: "from-orange-50 to-orange-100",
    borderColor: "border-orange-200",
    titleColor: "text-orange-700",
    valueColor: "text-orange-900",
    subTextColor: "text-orange-600",
    chartColor: "#f97316",
    barColor: "#ea580c",
    progressBg: "bg-orange-200",
    progressBar: "from-orange-500 to-orange-600"
  },
  {
    name: "Forest",
    gradient: "from-green-900 via-emerald-800 to-teal-900",
    primary: "#10b981", // emerald-500
    secondary: "#059669", // emerald-600
    accent: "#34d399", // emerald-400
    chartGradientStart: "#10b981",
    chartGradientEnd: "#047857",
    // Light theme for individual pages
    lightGradient: "from-green-50 via-emerald-50 to-teal-50",
    cardGradient: "from-green-50 to-green-100",
    borderColor: "border-green-200",
    titleColor: "text-green-700",
    valueColor: "text-green-900",
    subTextColor: "text-green-600",
    chartColor: "#10b981",
    barColor: "#059669",
    progressBg: "bg-green-200",
    progressBar: "from-green-500 to-green-600"
  },
  {
    name: "Royal",
    gradient: "from-purple-900 via-violet-800 to-indigo-900",
    primary: "#8b5cf6", // violet-500
    secondary: "#7c3aed", // violet-600
    accent: "#a78bfa", // violet-400
    chartGradientStart: "#8b5cf6",
    chartGradientEnd: "#6d28d9",
    // Light theme for individual pages
    lightGradient: "from-purple-50 via-violet-50 to-indigo-50",
    cardGradient: "from-purple-50 to-purple-100",
    borderColor: "border-purple-200",
    titleColor: "text-purple-700",
    valueColor: "text-purple-900",
    subTextColor: "text-purple-600",
    chartColor: "#8b5cf6",
    barColor: "#7c3aed",
    progressBg: "bg-purple-200",
    progressBar: "from-purple-500 to-purple-600"
  },
  {
    name: "Ruby",
    gradient: "from-rose-900 via-pink-800 to-fuchsia-900",
    primary: "#ec4899", // pink-500
    secondary: "#db2777", // pink-600
    accent: "#f472b6", // pink-400
    chartGradientStart: "#ec4899",
    chartGradientEnd: "#be185d",
    // Light theme for individual pages
    lightGradient: "from-rose-50 via-pink-50 to-fuchsia-50",
    cardGradient: "from-rose-50 to-rose-100",
    borderColor: "border-rose-200",
    titleColor: "text-rose-700",
    valueColor: "text-rose-900",
    subTextColor: "text-rose-600",
    chartColor: "#ec4899",
    barColor: "#db2777",
    progressBg: "bg-rose-200",
    progressBar: "from-rose-500 to-rose-600"
  },
  {
    name: "Golden",
    gradient: "from-amber-900 via-yellow-800 to-orange-900",
    primary: "#f59e0b", // amber-500
    secondary: "#d97706", // amber-600
    accent: "#fbbf24", // amber-400
    chartGradientStart: "#f59e0b",
    chartGradientEnd: "#b45309",
    // Light theme for individual pages
    lightGradient: "from-amber-50 via-yellow-50 to-orange-50",
    cardGradient: "from-amber-50 to-amber-100",
    borderColor: "border-amber-200",
    titleColor: "text-amber-700",
    valueColor: "text-amber-900",
    subTextColor: "text-amber-600",
    chartColor: "#f59e0b",
    barColor: "#d97706",
    progressBg: "bg-amber-200",
    progressBar: "from-amber-500 to-amber-600"
  },
  {
    name: "Arctic",
    gradient: "from-slate-900 via-blue-900 to-cyan-900",
    primary: "#3b82f6", // blue-500
    secondary: "#2563eb", // blue-600
    accent: "#60a5fa", // blue-400
    chartGradientStart: "#3b82f6",
    chartGradientEnd: "#1e40af",
    // Light theme for individual pages
    lightGradient: "from-slate-50 via-blue-50 to-cyan-50",
    cardGradient: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    titleColor: "text-blue-700",
    valueColor: "text-blue-900",
    subTextColor: "text-blue-600",
    chartColor: "#3b82f6",
    barColor: "#2563eb",
    progressBg: "bg-blue-200",
    progressBar: "from-blue-500 to-blue-600"
  },
  {
    name: "Lavender",
    gradient: "from-indigo-900 via-purple-900 to-pink-900",
    primary: "#6366f1", // indigo-500
    secondary: "#4f46e5", // indigo-600
    accent: "#818cf8", // indigo-400
    chartGradientStart: "#6366f1",
    chartGradientEnd: "#4338ca",
    // Light theme for individual pages
    lightGradient: "from-indigo-50 via-purple-50 to-pink-50",
    cardGradient: "from-indigo-50 to-indigo-100",
    borderColor: "border-indigo-200",
    titleColor: "text-indigo-700",
    valueColor: "text-indigo-900",
    subTextColor: "text-indigo-600",
    chartColor: "#6366f1",
    barColor: "#4f46e5",
    progressBg: "bg-indigo-200",
    progressBar: "from-indigo-500 to-indigo-600"
  }
]

// Doctor theme assignments - consistent across all views
export interface DoctorInfo {
  first_name: string
  last_name: string
  id?: string
}

export function getDoctorThemeIndex(doctor: DoctorInfo): number {
  // Dr. Joseph Grace gets the Crimson theme (index 1)
  if (doctor.first_name === 'Joseph' && doctor.last_name === 'Grace') {
    return 1 // Crimson theme (deep red)
  }
  
  // Dr. Hamid Hajian gets the Ocean theme (index 0)
  if (doctor.first_name === 'Hamid' && doctor.last_name === 'Hajian') {
    return 0 // Ocean theme (blue/cyan)
  }
  
  // Map other doctors to remaining themes
  const doctorId = `${doctor.first_name}-${doctor.last_name}`
  const themeMapping: { [key: string]: number } = {
    'Liam-Anderson': 2,     // Forest (green)
    'Emma-Wilson': 3,       // Royal (purple)
    'Noah-Johnson': 5,      // Golden (amber)
    'Olivia-Brown': 6,      // Arctic (slate/blue)
    'William-Davis': 7,     // Lavender (indigo)
    'Sophia-Martinez': 4,   // Ruby (rose)
  }
  
  // If doctor is not in mapping, use a hash of their name to assign a consistent theme
  if (!(doctorId in themeMapping)) {
    let hash = 0
    for (let i = 0; i < doctorId.length; i++) {
      hash = doctorId.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash) % colorThemes.length
  }
  
  return themeMapping[doctorId] % colorThemes.length
}

export function getDoctorTheme(doctor: DoctorInfo, lightMode: boolean = false) {
  const themeIndex = getDoctorThemeIndex(doctor)
  return colorThemes[themeIndex]
}

// Get a doctor's color for charts in the main dashboard
export function getDoctorColor(doctor: DoctorInfo): string {
  const theme = getDoctorTheme(doctor)
  return theme.primary
}

// Get all doctor colors for multi-doctor charts
export function getDoctorColors(): string[] {
  return colorThemes.map(theme => theme.primary)
}