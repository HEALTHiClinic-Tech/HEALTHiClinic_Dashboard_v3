"use client"

import Navigation from "@/components/Navigation"
import ComparisonTable from "@/components/ComparisonTable"
import { BarChart3 } from "lucide-react"

export default function ComparisonsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />

      <main className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Data Comparison</h1>
                <p className="text-gray-500">Compare performance metrics across all doctors</p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <ComparisonTable />
        </div>
      </main>
    </div>
  )
}
