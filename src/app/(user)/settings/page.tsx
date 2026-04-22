'use client'

import { User, Lock, Bell, Shield, Mail, Smartphone, Eye, Globe } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [profileVisibility, setProfileVisibility] = useState('public')
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'account', label: 'Account & Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ]

  return (
    <div className="p-6 overflow-y-auto" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#212529' }}>
            Settings
          </h1>
          <p style={{ color: '#5F6368' }}>Manage your account settings and preferences</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-2" style={{ border: '1px solid #E8E8E8' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1"
                    style={{
                      backgroundColor: activeTab === tab.id ? '#E3F2FD' : 'transparent',
                      color: activeTab === tab.id ? '#1976D2' : '#5F6368',
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = '#F8F9FA'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            {/* Profile Settings Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ border: '1px solid #E8E8E8' }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#212529' }}>
                    Profile Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue="John Doe"
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: '#F8F9FA',
                          border: '1px solid #E8E8E8',
                          color: '#212529',
                        }}
                        onFocus={(e) => (e.currentTarget.style.outlineColor = '#1976D2')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>
                        Professional Title
                      </label>
                      <input
                        type="text"
                        defaultValue="Business Development Manager"
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: '#F8F9FA',
                          border: '1px solid #E8E8E8',
                          color: '#212529',
                        }}
                        onFocus={(e) => (e.currentTarget.style.outlineColor = '#1976D2')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>
                        Company
                      </label>
                      <input
                        type="text"
                        defaultValue="Tech Ventures Inc."
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: '#F8F9FA',
                          border: '1px solid #E8E8E8',
                          color: '#212529',
                        }}
                        onFocus={(e) => (e.currentTarget.style.outlineColor = '#1976D2')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>
                        Location
                      </label>
                      <input
                        type="text"
                        defaultValue="Mumbai, India"
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: '#F8F9FA',
                          border: '1px solid #E8E8E8',
                          color: '#212529',
                        }}
                        onFocus={(e) => (e.currentTarget.style.outlineColor = '#1976D2')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        defaultValue="Passionate about building innovative solutions and connecting with like-minded professionals."
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                        style={{
                          backgroundColor: '#F8F9FA',
                          border: '1px solid #E8E8E8',
                          color: '#212529',
                        }}
                        onFocus={(e) => (e.currentTarget.style.outlineColor = '#1976D2')}
                      />
                    </div>

                    <button
                      className="px-6 py-3 text-white rounded-lg transition-all"
                      style={{ backgroundColor: '#212529' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3D3D3D')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212529')}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account & Security Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ border: '1px solid #E8E8E8' }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#212529' }}>
                    Account Security
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue="john.doe@example.com"
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: '#F8F9FA',
                          border: '1px solid #E8E8E8',
                          color: '#212529',
                        }}
                        onFocus={(e) => (e.currentTarget.style.outlineColor = '#1976D2')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: '#F8F9FA',
                          border: '1px solid #E8E8E8',
                          color: '#212529',
                        }}
                        onFocus={(e) => (e.currentTarget.style.outlineColor = '#1976D2')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: '#F8F9FA',
                          border: '1px solid #E8E8E8',
                          color: '#212529',
                        }}
                        onFocus={(e) => (e.currentTarget.style.outlineColor = '#1976D2')}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5" style={{ color: '#5F6368' }} />
                        <div>
                          <p className="font-medium" style={{ color: '#212529' }}>
                            Two-Factor Authentication
                          </p>
                          <p className="text-sm" style={{ color: '#5F6368' }}>
                            Add an extra layer of security
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                        style={{ backgroundColor: twoFactorAuth ? '#1976D2' : '#BDBDBD' }}
                      >
                        <span
                          className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                          style={{ transform: twoFactorAuth ? 'translateX(24px)' : 'translateX(4px)' }}
                        />
                      </button>
                    </div>

                    <button
                      className="px-6 py-3 text-white rounded-lg transition-all"
                      style={{ backgroundColor: '#212529' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3D3D3D')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212529')}
                    >
                      Update Security Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ border: '1px solid #E8E8E8' }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#212529' }}>
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5" style={{ color: '#5F6368' }} />
                        <div>
                          <p className="font-medium" style={{ color: '#212529' }}>
                            Email Notifications
                          </p>
                          <p className="text-sm" style={{ color: '#5F6368' }}>
                            Receive notifications via email
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                        style={{ backgroundColor: emailNotifications ? '#1976D2' : '#BDBDBD' }}
                      >
                        <span
                          className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                          style={{ transform: emailNotifications ? 'translateX(24px)' : 'translateX(4px)' }}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5" style={{ color: '#5F6368' }} />
                        <div>
                          <p className="font-medium" style={{ color: '#212529' }}>
                            Push Notifications
                          </p>
                          <p className="text-sm" style={{ color: '#5F6368' }}>
                            Receive push notifications on your device
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                        style={{ backgroundColor: pushNotifications ? '#1976D2' : '#BDBDBD' }}
                      >
                        <span
                          className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                          style={{ transform: pushNotifications ? 'translateX(24px)' : 'translateX(4px)' }}
                        />
                      </button>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                      <p className="font-medium mb-3" style={{ color: '#212529' }}>
                        Email me about:
                      </p>
                      <div className="space-y-2">
                        {['New connections', 'Post likes and comments', 'Messages', 'Group activity', 'Weekly summary'].map(
                          (item) => (
                            <label key={item} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked
                                className="w-4 h-4 rounded"
                                style={{ accentColor: '#1976D2' }}
                              />
                              <span className="text-sm" style={{ color: '#212529' }}>
                                {item}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    <button
                      className="px-6 py-3 text-white rounded-lg transition-all"
                      style={{ backgroundColor: '#212529' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3D3D3D')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212529')}
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ border: '1px solid #E8E8E8' }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#212529' }}>
                    Privacy Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Eye className="w-5 h-5" style={{ color: '#5F6368' }} />
                        <p className="font-medium" style={{ color: '#212529' }}>
                          Profile Visibility
                        </p>
                      </div>
                      <div className="space-y-2">
                        {[
                          { value: 'public', label: 'Public - Anyone can see your profile' },
                          {
                            value: 'connections',
                            label: 'Connections Only - Only your connections can see your full profile',
                          },
                          { value: 'private', label: 'Private - Only you can see your profile' },
                        ].map((option) => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="visibility"
                              value={option.value}
                              checked={profileVisibility === option.value}
                              onChange={(e) => setProfileVisibility(e.target.value)}
                              className="w-4 h-4"
                              style={{ accentColor: '#1976D2' }}
                            />
                            <span className="text-sm" style={{ color: '#212529' }}>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="w-5 h-5" style={{ color: '#5F6368' }} />
                        <p className="font-medium" style={{ color: '#212529' }}>
                          Who can see your:
                        </p>
                      </div>
                      <div className="space-y-3">
                        {['Connections list', 'Email address', 'Phone number', 'Posts and activity'].map((item) => (
                          <div key={item} className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#212529' }}>
                              {item}
                            </span>
                            <select
                              className="px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2"
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E8E8E8',
                                color: '#212529',
                              }}
                              onFocus={(e) => (e.currentTarget.style.outlineColor = '#1976D2')}
                            >
                              <option>Everyone</option>
                              <option>Connections</option>
                              <option>Only me</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      className="px-6 py-3 text-white rounded-lg transition-all"
                      style={{ backgroundColor: '#212529' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3D3D3D')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212529')}
                    >
                      Save Privacy Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
