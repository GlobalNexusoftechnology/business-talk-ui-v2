

export interface ProfileTabsProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function ProfileTabs({ tabs, activeTab, setActiveTab }: ProfileTabsProps) {
  return (
    <div className="px-6 md:px-16 flex gap-6 overflow-x-auto border-b" style={{ borderColor: '#E8E8E8' }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`py-4 font-medium transition-all relative capitalize whitespace-nowrap text-sm md:text-base ${activeTab === tab.key ? 'text-blue-600' : 'text-gray-500'}`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
              style={{ backgroundColor: '#2B2B2B' }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
