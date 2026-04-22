export function ProfileStats({ stats }: { stats: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-wrap gap-8 justify-between border" style={{ borderColor: '#E8E8E8' }}>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold text-gray-900">{stats.connections}</span>
        <span className="text-xs text-gray-500">Connections</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold text-gray-900">{stats.followers}</span>
        <span className="text-xs text-gray-500">Followers</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold text-gray-900">{stats.posts}</span>
        <span className="text-xs text-gray-500">Posts</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold text-gray-900">{stats.groups}</span>
        <span className="text-xs text-gray-500">Groups</span>
      </div>
    </div>
  );
}
