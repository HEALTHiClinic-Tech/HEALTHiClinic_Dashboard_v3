"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutDashboard, Settings, Database, Presentation } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin", label: "Data Entry", icon: Database },
    { href: "/carousel", label: "Carousel", icon: Presentation },
    { href: "/carousel2", label: "Carousel 2", icon: Presentation },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-10">
            <Link href="/" className="flex items-center">
              <div className="bg-white rounded-lg px-3 py-1.5 shadow-md hover:shadow-lg transition-shadow">
                <Image
                  src="/healthiclinic-logo-v2.png"
                  alt="HEALTHiClinic Logo"
                  width={320}
                  height={80}
                  className="h-14 w-auto object-contain"
                  priority
                />
              </div>
            </Link>
            
            <div className="hidden md:flex space-x-4 ml-8">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{link.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-blue-100 rounded-lg -z-10"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">Live</span>
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  )
}