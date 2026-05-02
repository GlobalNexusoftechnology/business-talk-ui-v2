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
    <div className="flex gap-4 sm:gap-6 border-b px-4 sm:px-6 bg-white rounded-xl overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`pb-3 capitalize whitespace-nowrap text-sm sm:text-base shrink-0 ${
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