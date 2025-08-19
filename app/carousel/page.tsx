"use client"

import dynamic from 'next/dynamic'

const DoctorCarousel = dynamic(() => import('@/components/DoctorCarousel'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
})

export default function CarouselPage() {
  return <DoctorCarousel />
}