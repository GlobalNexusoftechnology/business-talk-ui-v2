
import { MapPin, Briefcase, Calendar, Camera, UserPlus, Check, Loader2, MessageCircle } from 'lucide-react';

export interface ProfileHeaderProps {
  profileData: any;
  connectState: 'connect' | 'pending' | 'connected';
  loading: boolean;
  onConnect: () => void;
}

export function ProfileHeader({ profileData, connectState, loading, onConnect }: ProfileHeaderProps) {
  return (
    <div className="bg-white shadow-md mx-4 md:mx-6 mb-6 rounded-2xl relative -mt-12" style={{ border: '1px solid #E8E8E8' }}>
      <div className="p-6 pt-24">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="absolute -top-12 left-6 flex-shrink-0 relative group">
            <img
              src={profileData.avatar}
              alt={profileData.name}
              className="w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-xl"
            />
            <button 
              className="absolute bottom-2 right-2 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#2B2B2B',
                border: '1px solid #E8E8E8'
              }}
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-w-0 pt-4 md:pt-12">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#2B2B2B' }}>
              {profileData.name}
            </h1>
            <p className="text-lg mb-4" style={{ color: '#5F6368' }}>
              {profileData.title}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6" style={{ color: '#5F6368' }}>
              {profileData.company && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>{profileData.company}</span>
                </div>
              )}
              {profileData.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{profileData.location}</span>
                </div>
              )}
              {profileData.joinedDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {profileData.joinedDate}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all shadow-sm ${connectState === 'connected' ? 'bg-green-50 border-green-500 text-green-700' : connectState === 'pending' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'}`}
                onClick={onConnect}
                disabled={connectState !== 'connect' || loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : connectState === 'connected' ? <Check className="w-4 h-4" /> : connectState === 'pending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {connectState === 'connect' && 'Connect'}
                {connectState === 'pending' && 'Pending'}
                {connectState === 'connected' && 'Connected'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
