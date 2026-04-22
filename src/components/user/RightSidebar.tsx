
'use client'

import { TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContentViewerContext } from '@/providers/ContentViewerProvider';
import { useState, useEffect } from 'react';

// --- MOCK DATA WITH IDs ---
const trendingQuestions = [
  { id: 'q1', question: 'How to scale a startup to 100Cr?', answers: '24' },
  { id: 'q2', question: 'Best marketing strategy in 2026?', answers: '18' },
  { id: 'q3', question: 'Angel vs Venture Capital?', answers: '32' },
  { id: 'q4', question: 'How to calculate EBITDA properly?', answers: '15' },
];

const trendingStories = [
  { id: 's1', title: 'Tech startup raises $50M Series B', time: '2h' },
  { id: 's2', title: 'New AI regulations impact SaaS companies', time: '4h' },
  { id: 's3', title: 'Global market trends for Q1 2026', time: '6h' },
];

const suggestedPeople = [
  {
    id: 'u1',
    name: 'Amit Patel',
    title: 'Venture Capitalist',
    avatar: 'https://images.unsplash.com/photo-1621610085923-4e8234a10784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjB3b3JraW5nfGVufDF8fHx8MTc3MjI5MDcxMnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'u2',
    name: 'Sneha Gupta',
    title: 'Growth Strategist',
    avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjE4Mjg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'u3',
    name: 'Vikram Singh',
    title: 'Serial Entrepreneur',
    avatar: 'https://images.unsplash.com/photo-1615702669705-0d3002c6801c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIyNzA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const suggestedGroups = [
  { 
    id: 'g1',
    name: 'Startup Founders India', 
    members: '12.5k members',
    description: 'Connect with startup founders across India',
    category: 'Entrepreneurship',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwdGVhbXxlbnwxfHx8fDE3NzIyMjI3NTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    memberAvatars: [
      'https://images.unsplash.com/photo-1621610085923-4e8234a10784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjB3b3JraW5nfGVufDF8fHx8MTc3MjI5MDcxMnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzQwNzUxMDE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NDA3NTEwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080'
    ]
  },
  { 
    id: 'g2',
    name: 'Business Analytics Hub', 
    members: '8.3k members',
    description: 'Data-driven insights for business growth',
    category: 'Analytics',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc0MDc1MTAxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    memberAvatars: [
      'https://images.unsplash.com/photo-1615702669705-0d3002c6801c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIyNzA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc0MDc1MTAxNHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc0MDc1MTAxNHww&ixlib=rb-4.1.0&q=80&w=1080'
    ]
  },
  { 
    id: 'g3',
    name: 'Product Management Leaders', 
    members: '15.2k members',
    description: 'Best practices in product development',
    category: 'Product',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwZGV2ZWxvcG1lbnR8ZW58MXx8fHwxNzQwNzUxMDE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    memberAvatars: [
      'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjE4Mjg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NDA3NTEwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1621610085923-4e8234a10784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjB3b3JraW5nfGVufDF8fHx8MTc3MjI5MDcxMnww&ixlib=rb-4.1.0&q=80&w=1080'
    ]
  },
  { 
    id: 'g4',
    name: 'Finance & Investment Club', 
    members: '20.8k members',
    description: 'Investment strategies and financial planning',
    category: 'Finance',
    image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzQwNzUxMDE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    memberAvatars: [
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzQwNzUxMDE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NDA3NTEwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1615702669705-0d3002c6801c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIyNzA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
    ]
  },
];

export function TrendingItem({ item, type, onClick }: {
  item: any;
  type: 'question' | 'story';
  onClick: (item: any) => void;
}) {
  return (
    <button
      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 fade-in-card"
      style={{ color: '#212529' }}
      onClick={() => onClick(item)}
    >
      <p className={type === 'story' ? 'text-sm mb-1' : 'text-sm'}>{item.question || item.title}</p>
      <p className="text-xs text-gray-500">
        {type === 'question' && (
          <>{item.answers} Answers</>
        )}
        {type === 'story' && (
          <>{item.time} ago</>
        )}
      </p>
    </button>
  );
}

export function UserCard({ person, onProfileClick, connectState, onConnectClick }: {
  person: any;
  onProfileClick: (person: any) => void;
  connectState: 'connect' | 'pending' | 'connected';
  onConnectClick: (person: any, state: 'connect' | 'pending' | 'connected') => void;
}) {
  return (
    <div className="flex items-center gap-3 fade-in-card">
      <img
        src={person.avatar}
        alt={person.name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer"
        onClick={() => onProfileClick(person)}
      />
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onProfileClick(person)}>
        <h3 className="font-medium text-sm truncate" style={{ color: '#212529' }}>
          {person.name}
        </h3>
        <p className="text-xs text-gray-500 truncate">{person.title}</p>
      </div>
      <button
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex-shrink-0 border border-[#212529] active:scale-95 ${connectState === 'connected' ? 'bg-[#212529] text-white' : 'bg-transparent text-[#212529]'}`}
        style={{
          backgroundColor: connectState === 'connected' ? '#212529' : 'transparent',
          color: connectState === 'connected' ? '#fff' : '#212529',
          cursor: connectState === 'pending' ? 'not-allowed' : 'pointer',
          opacity: connectState === 'pending' ? 0.7 : 1,
        }}
        disabled={connectState === 'pending'}
        onClick={() => onConnectClick(person, connectState)}
        onMouseEnter={e => {
          if (connectState === 'connected') {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3D3D3D';
          } else if (connectState === 'connect') {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F8F9FA';
          }
        }}

        onMouseLeave={e => {
          if (connectState === 'connected') {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#212529';
          } else if (connectState === 'connect') {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }
        }}
      >
        {connectState === 'connect' && 'Connect'}
        {connectState === 'pending' && 'Pending'}
        {connectState === 'connected' && 'Connected'}
      </button>
    </div>
  );
}

function GroupCard({ group, onClick, joinState, onJoinClick }: {
  group: any;
  onClick: (group: any) => void;
  joinState: 'join' | 'joined';
  onJoinClick: (group: any) => void;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all hover:shadow-md fade-in-card cursor-pointer"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E8E8' }}
      onClick={() => onClick(group)}
    >
      {/* Group Cover Image */}
      <div
        className="h-20 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${group.image})`, backgroundColor: '#F8F9FA' }}
      >
        {/* Category Badge on Cover */}
        <div
          className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#212529' }}
        >
          {group.category}
        </div>
      </div>
      {/* Group Content */}
      <div className="p-4" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-sm mb-2" style={{ color: '#212529' }}>
          {group.name}
        </h3>
        <p className="text-xs mb-3" style={{ color: '#5F6368' }}>
          {group.description}
        </p>
        {/* Member Avatars - Overlapping Style */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {group.memberAvatars.map((avatar: string, idx: number) => (
                <img
                  key={idx}
                  src={avatar}
                  alt={`Member ${idx + 1}`}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-white flex-shrink-0"
                />
              ))}
            </div>
            <span className="ml-2 text-xs font-medium" style={{ color: '#5F6368' }}>
              +{group.members.split('k')[0]}k
            </span>
          </div>
        </div>
        {/* Join Button */}
        <button
          className={`w-full py-2 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 ${joinState === 'joined' ? 'bg-[#212529] text-white' : 'bg-[#212529] text-white'}`}
          style={{
            backgroundColor: joinState === 'joined' ? '#212529' : '#212529',
            color: '#fff',
            opacity: joinState === 'joined' ? 0.85 : 1,
          }}
          onClick={() => onJoinClick(group)}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3D3D3D';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#212529';
          }}
        >
          {joinState === 'join' && 'Join Group'}
          {joinState === 'joined' && 'Joined'}
        </button>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---

export function RightSidebar() {
  const router = useRouter();
  const { open } = useContentViewerContext();
  const [connectStates, setConnectStates] = useState<{ [id: string]: 'connect' | 'pending' | 'connected' }>({});
  const [joinStates, setJoinStates] = useState<{ [id: string]: 'join' | 'joined' }>({});
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize states
  useEffect(() => {
    setConnectStates(
      suggestedPeople.reduce((acc, p) => {
        acc[p.id] = 'connect';
        return acc;
      }, {} as { [id: string]: 'connect' | 'pending' | 'connected' })
    );
    setJoinStates(
      suggestedGroups.reduce((acc, g) => {
        acc[g.id] = 'join';
        return acc;
      }, {} as { [id: string]: 'join' | 'joined' })
    );
  }, []);

  // --- HANDLERS ---

  // Trending click: open modal with only the selected content (global modal)
  const handleTrendingClick = (type: 'question' | 'story') => (item: any) => {
    if (isMobile) {
      router.push(`/${type}/${item.id}`);
    } else {
      open(type, item);
    }
  };

  const handleProfileClick = (person: any) => {
    router.push(`/profile/${person.id}`);
  };

  // Connect button logic: toggle connect <-> connected with animation
  const handleConnectClick = (person: any, state: 'connect' | 'pending' | 'connected') => {
    setConnectStates(prev => {
      if (state === 'connect') {
        setTimeout(() => {
          setConnectStates(p => ({ ...p, [person.id]: 'connected' }));
        }, 1000);
        return { ...prev, [person.id]: 'pending' };
      } else if (state === 'connected') {
        // Animate back to connect
        setTimeout(() => {
          setConnectStates(p => ({ ...p, [person.id]: 'connect' }));
        }, 1000);
        return { ...prev, [person.id]: 'pending' };
      }
      return prev;
    });
  };

  const handleGroupClick = (group: any) => {
    router.push(`/groups/${group.id}`);
  };

  const handleJoinClick = (group: any) => {
    setJoinStates(prev => {
      if (prev[group.id] === 'join') {
        return { ...prev, [group.id]: 'joined' };
      } else {
        return { ...prev, [group.id]: 'join' };
      }
    });
  };

  // --- ANIMATION CSS ---
  // Add fade-in and translate-y effect
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .fade-in-card {
        opacity: 0;
        transform: translateY(16px);
        animation: fadeInCard 0.5s cubic-bezier(.4,0,.2,1) forwards;
      }
      @keyframes fadeInCard {
        to {
          opacity: 1;
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <aside className="w-80 bg-white overflow-y-auto rounded-2xl shadow-sm" style={{ borderLeft: '1px solid #E8E8E8' }}>
      <div className="p-6 space-y-6">
        {/* Trending Header */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" style={{ color: '#212529' }} />
            <h2 className="font-semibold" style={{ color: '#212529' }}>Trending</h2>
          </div>
          {/* Questions */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3" style={{ color: '#212529' }}>Questions</h3>
            <div className="space-y-3">
              {trendingQuestions.map(item => (
                <TrendingItem key={item.id} item={item} type="question" onClick={handleTrendingClick('question')} />
              ))}
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-gray-200"></div>
        {/* Trending Stories */}
        <div>
          <h2 className="font-semibold mb-4" style={{ color: '#212529' }}>Stories</h2>
          <div className="space-y-3">
            {trendingStories.map(item => (
              <TrendingItem key={item.id} item={item} type="story" onClick={handleTrendingClick('story')} />
            ))}
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-gray-200"></div>
        {/* Suggested People */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: '#212529' }}>Suggested for You</h2>
            <button
              className="text-xs font-medium transition-colors"
              style={{ color: '#1A73E8' }}
              onClick={() => router.push('/people')}
            >
              See all
            </button>
          </div>
          <div className="space-y-4">
            {suggestedPeople.map(person => (
              <UserCard
                key={person.id}
                person={person}
                onProfileClick={handleProfileClick}
                connectState={connectStates[person.id] || 'connect'}
                onConnectClick={handleConnectClick}
              />
            ))}
          </div>
        </div>
        {/* Divider */}
        <div className="border-t" style={{ borderColor: '#E8E8E8' }}></div>
        {/* Suggested Groups - Proper Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: '#212529' }} />
              <h2 className="font-semibold" style={{ color: '#212529' }}>Groups for You</h2>
            </div>
            <button 
              className="text-xs font-medium transition-colors"
              style={{ color: '#1A73E8' }}
              tabIndex={-1}
              onClick={() => router.push('/groups')}
            >
              See all
            </button>
          </div>
          <div className="space-y-4">
            {suggestedGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={handleGroupClick}
                joinState={joinStates[group.id] || 'join'}
                onJoinClick={e => {
                  e.stopPropagation?.();
                  handleJoinClick(group);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}