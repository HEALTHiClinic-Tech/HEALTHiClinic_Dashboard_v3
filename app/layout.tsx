import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/Navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HEALTHiClinic Dashboard",
  description: "Year-to-date appointment tracking dashboard for HEALTHiClinic facility",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  )
}