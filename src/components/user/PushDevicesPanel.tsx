'use client'

import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { getTimeAgo } from '@/lib/utils'

type Device = {
  id: string
  token: string
  platform: 'android' | 'ios' | 'web'
  device_name?: string | null
  app_version?: string | null
  last_seen?: number | null
  last_delivery_at?: number | null
  is_active?: boolean
  is_muted?: boolean
  failure_count?: number
  topics?: string[]
  createdAt?: string
  updatedAt?: string
}

export default function PushDevicesPanel() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.listMyDevices()
      setDevices(res.data ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleMute = async (d: Device) => {
    try {
      setProcessingId(d.id)
      const updated = await apiClient.patchDevice(d.id, { is_muted: !d.is_muted })
      setDevices((prev) => prev.map((p) => (p.id === d.id ? updated.data ?? { ...p, is_muted: !p.is_muted } : p)))
    } catch (err) {
      // ignore — could add toast
    } finally {
      setProcessingId(null)
    }
  }

  const deactivate = async (d: Device) => {
    if (!confirm('Deactivate this device?')) return
    try {
      setProcessingId(d.id)
      await apiClient.deactivateDevice(d.id)
      setDevices((prev) => prev.filter((p) => p.id !== d.id))
    } catch (err) {
      // ignore
    } finally {
      setProcessingId(null)
    }
  }

  const deactivateAll = async () => {
    if (!confirm('Deactivate all devices for this account?')) return
    try {
      setLoading(true)
      await apiClient.deactivateAllDevices()
      setDevices([])
    } catch (err) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Registered Devices</h3>
        <button
          className="text-xs text-red-600 hover:underline"
          onClick={deactivateAll}
          disabled={loading}
        >
          Deactivate All
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading devices…</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : devices.length === 0 ? (
        <div className="text-sm text-gray-600">No devices registered for push notifications.</div>
      ) : (
        <div className="space-y-3">
          {devices.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{d.device_name ?? `${d.platform} device`}</div>
                <div className="text-xs text-gray-500">{d.app_version ?? '—'} · {d.platform}</div>
                <div className="text-xs text-gray-400 mt-1">Last seen: {d.last_seen ? getTimeAgo(Number(d.last_seen)) : 'Never'}</div>
                <div className="text-xs text-gray-400">Registered: {d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">{d.failure_count ? `Failures: ${d.failure_count}` : ''}</div>
                <button
                  className="px-3 py-1 text-xs rounded border"
                  onClick={() => toggleMute(d)}
                  disabled={processingId === d.id}
                >
                  {d.is_muted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  className="px-3 py-1 text-xs rounded bg-red-50 text-red-600 border border-red-100"
                  onClick={() => deactivate(d)}
                  disabled={processingId === d.id}
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
