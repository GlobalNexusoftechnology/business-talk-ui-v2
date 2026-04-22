'use client'

import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'

export default function AdminPostsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary-900 mb-6">Posts Management</h1>
      <Card>
        <div className="text-center py-12">
          <p className="text-secondary-600 mb-4">Posts management interface</p>
          <Button variant="primary">View Posts</Button>
        </div>
      </Card>
    </div>
  )
}
