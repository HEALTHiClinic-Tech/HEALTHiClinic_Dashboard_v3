import DoctorManagement from "@/components/DoctorManagement"

export default function DoctorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <DoctorManagement />
      </div>
    </div>
  )
}