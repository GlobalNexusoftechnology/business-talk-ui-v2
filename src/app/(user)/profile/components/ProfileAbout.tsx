export function ProfileAbout({ profile }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border">
      <h2 className="text-xl font-semibold mb-4">About</h2>
      <p className="text-gray-600">
        {profile.about || 'No bio available'}
      </p>
    </div>
  )
}