export function ProfileTabs({
  activeTab,
  setActiveTab,
  isOwnProfile,
}: {
  activeTab: string
  setActiveTab: (tab: any) => void
  isOwnProfile?: boolean
}) {
  const tabs = isOwnProfile
    ? ['about', 'experience', 'education', 'gallery']
    : ['about', 'experience', 'education']

  return (
    <div className="flex gap-6 border-b px-6 bg-white rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`pb-3 capitalize ${
            activeTab === tab
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}