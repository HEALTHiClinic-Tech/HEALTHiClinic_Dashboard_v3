"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Database, Key, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

export default function SetupNotice() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <CardTitle className="text-2xl">Setup Required</CardTitle>
            </div>
            <CardDescription className="mt-2">
              Complete the following steps to connect your dashboard to Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2 mt-1">
                  <Database className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">1. Create Supabase Project</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Sign up or log in to Supabase and create a new project
                  </p>
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    Go to Supabase <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2 mt-1">
                  <Database className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">2. Set Up Database</h3>
                  <p className="text-sm text-gray-600">
                    Run the SQL from <code className="bg-gray-100 px-1 py-0.5 rounded">supabase-schema.sql</code> in your Supabase SQL Editor
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 rounded-full p-2 mt-1">
                  <Key className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">3. Configure Environment</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Create a <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file with your Supabase credentials:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono">
                    <div>NEXT_PUBLIC_SUPABASE_URL=your_project_url</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 rounded-full p-2 mt-1">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">4. Restart Development Server</h3>
                  <p className="text-sm text-gray-600">
                    After adding your environment variables, restart the development server:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono mt-2">
                    npm run dev
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                Need help? Check the <code className="bg-gray-100 px-1 py-0.5 rounded">README.md</code> for detailed instructions.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}