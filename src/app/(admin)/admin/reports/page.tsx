'use client'

import { useEffect, useState } from 'react'
import adminApi from '@/lib/admin-api'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    adminApi.getReports().then((res) => {
      setReports(res.data.data)
    })
  }, [])

  const resolve = (id: string, action: string) => {
    adminApi.resolveReport(id, action).then(() => {
      setReports((prev) => prev.filter((r) => r.id !== id))
    })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      <Card>
        {reports.map((r) => (
          <div key={r.id} className="flex justify-between py-3 border-b">
            <div>
              <p>{r.reason}</p>
              <p className="text-xs">{r.content_type}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => resolve(r.id, 'REMOVE_POST')}>Remove</Button>
              <Button onClick={() => resolve(r.id, 'WARN_USER')}>Warn</Button>
              <Button onClick={() => resolve(r.id, 'BAN_USER')}>Ban</Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}