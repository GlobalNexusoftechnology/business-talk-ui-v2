'use client'

import { Card } from '@/components/shared/Card'
import { AlertCircle } from 'lucide-react'

export default function AdminModerationPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary-900 mb-6">Content Moderation</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm text-secondary-600">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-600">24</p>
        </Card>
        <Card>
          <p className="text-sm text-secondary-600">Critical</p>
          <p className="text-3xl font-bold text-red-600">4</p>
        </Card>
        <Card>
          <p className="text-sm text-secondary-600">Resolved</p>
          <p className="text-3xl font-bold text-green-600">186</p>
        </Card>
      </div>
      <Card>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 hover:bg-secondary-50 rounded-lg cursor-pointer">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-secondary-900">Offensive content reported</p>
                <p className="text-xs text-secondary-500">By User {i} - 2 hours ago</p>
              </div>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">High</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
