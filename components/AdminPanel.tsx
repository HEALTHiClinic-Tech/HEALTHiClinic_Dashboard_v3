"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Users, Database } from "lucide-react"
import DataEntry from "@/components/DataEntry"
import DoctorManagementSimple from "@/components/DoctorManagementSimple"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors'>('appointments')

  const tabs = [
    { id: 'appointments', label: 'Appointment Entry', icon: Calendar },
    { id: 'doctors', label: 'Doctor Management', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative py-4 px-2 flex items-center space-x-2 transition-colors ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'appointments' ? (
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Appointment Entry
                </h1>
                <p className="text-gray-600 mb-8">Record weekly appointment counts for doctors</p>
                <DataEntry />
              </div>
            ) : (
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Doctor Management
                </h1>
                <p className="text-gray-600 mb-8">Comprehensive doctor information management</p>
                <DoctorManagementSimple />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}