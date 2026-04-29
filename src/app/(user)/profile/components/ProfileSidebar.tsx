import { Mail, Phone } from 'lucide-react'

export function ProfileSidebar({ profile }: any) {
  return (
    <div className="space-y-6">

      {/* CONTACT */}
      <div className="bg-white p-6 rounded-2xl border">
        <h2 className="font-semibold mb-4">Contact</h2>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-2 items-center">
            <Mail className="w-4 h-4" /> {profile.email}
          </div>
          <div className="flex gap-2 items-center">
            <Phone className="w-4 h-4" /> {profile.phone_number || 'N/A'}
          </div>
        </div>
      </div>

    </div>
  )
}