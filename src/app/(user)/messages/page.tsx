'use client';

import React, { useState, useMemo } from 'react';
import {
  Panel,
  Group,
  Separator,
} from 'react-resizable-panels';
import {
  Search,
  Users,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
} from 'lucide-react';

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  isGroup?: boolean;
  members?: number;
};

type Message = {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
};

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    avatar:
      "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjE4Mjg0OXww&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage:
      "Thanks for the insights on the funding strategy!",
    timestamp: "10m ago",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Priya Sharma",
    avatar:
      "https://images.unsplash.com/photo-1615702669705-0d3002c6801c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIyNzA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "Let's schedule a call next week",
    timestamp: "1h ago",
    unread: 0,
    online: true,
  },
  {
    id: "group1",
    name: "Startup Founders India",
    avatar:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZ3xlbnwxfHx8fDE3NzUwNTM5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage:
      "Ankit: Great discussion on product-market fit!",
    timestamp: "2h ago",
    unread: 5,
    online: true,
    isGroup: true,
    members: 156,
  },
  {
    id: "3",
    name: "Ankit Verma",
    avatar:
      "https://images.unsplash.com/photo-1621610085923-4e8234a10784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjB3b3JraW5nfGVufDF8fHx8MTc3MjI5MDcxMnww&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "I reviewed the business plan. Looks great!",
    timestamp: "3h ago",
    unread: 0,
    online: false,
  },
  {
    id: "group2",
    name: "Product Managers Network",
    avatar:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFpbnN0b3JtaW5nJTIwbWVldGluZ3xlbnwxfHx8fDE3NzUwNTM5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage:
      "Sarah: Anyone using Jira for roadmap planning?",
    timestamp: "4h ago",
    unread: 0,
    online: true,
    isGroup: true,
    members: 89,
  },
  {
    id: "4",
    name: "Sarah Thompson",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMjkwNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "The marketing campaign results are in!",
    timestamp: "5h ago",
    unread: 1,
    online: false,
  },
  {
    id: "group3",
    name: "Digital Marketing Hub",
    avatar:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjB0ZWFtfGVufDF8fHx8MTc3NTA1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "Michael: Check out this new SEO strategy",
    timestamp: "1 day ago",
    unread: 3,
    online: true,
    isGroup: true,
    members: 234,
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Hi! I saw your post about Series A funding. Great insights!",
    sender: "other",
    timestamp: "2:30 PM",
  },
  {
    id: "2",
    text: "Thanks! Happy to share more details if you're interested.",
    sender: "me",
    timestamp: "2:32 PM",
  },
  {
    id: "3",
    text: "Absolutely! We're currently preparing for our own Series A round. What metrics did you focus on?",
    sender: "other",
    timestamp: "2:35 PM",
  },
  {
    id: "4",
    text: "The key ones were: MRR growth, customer retention rate, and CAC payback period. Investors really care about unit economics.",
    sender: "me",
    timestamp: "2:38 PM",
  },
  {
    id: "5",
    text: "Thanks for the insights on the funding strategy!",
    sender: "other",
    timestamp: "2:40 PM",
  },
];

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>(mockConversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups'>('all');

  const filteredConversations = useMemo(() => {
    return mockConversations.filter((conv) => {
      if (activeTab === 'unread') return conv.unread > 0;
      if (activeTab === 'groups') return conv.isGroup;
      if (searchQuery.trim()) {
        return conv.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    setMessageInput('');
  };
  return (
    <div className="flex-1 flex min-h-0 h-screen overflow-hidden bg-[#F8F9FA] p-0 m-0">
      <Group orientation="horizontal" className="flex-1 min-h-0">
        <Panel defaultSize={25} minSize={18}>
          <div className="h-full min-h-0 flex flex-col bg-white border-r border-[#E8E8E8] p-0 m-0">

            {/* SEARCH */}
            <div className="p-4 border-b border-[#E8E8E8]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#E8E8E8] bg-[#F8F9FA] text-sm outline-none"
                />
              </div>
            </div>

            {/* TABS */}
            <div className="px-4 py-3 border-b border-[#E8E8E8] flex gap-2">
              {['all', 'unread', 'groups'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-1.5 text-sm rounded-lg ${
                    activeTab === tab
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConversation(c)}
                  className={`w-full p-3 flex gap-3 text-left border-b hover:bg-gray-50 ${
                    selectedConversation.id === c.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    {c.isGroup ? (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                        <Users className="w-2.5 h-2.5 text-white" />
                      </div>
                    ) : c.online ? (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-semibold truncate">
                        {c.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {c.timestamp}
                      </span>
                    </div>

                    {c.isGroup && (
                      <p className="text-xs text-gray-400">
                        {c.members} members
                      </p>
                    )}

                    <p className="text-xs text-gray-500 truncate">
                      {c.lastMessage}
                    </p>
                  </div>

                  {c.unread > 0 && (
                    <div className="w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                      {c.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <Separator className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize" />

        {/* RIGHT PANEL */}
        <Panel defaultSize={75}>
          <div className="h-full min-h-0 flex flex-col">

            {/* HEADER */}
            <div className="p-4 flex justify-between items-center bg-white border-b border-[#E8E8E8]">
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <img
                    src={selectedConversation.avatar}
                    alt={selectedConversation.name}
                    className="w-10 h-10 rounded-full"
                  />
                  {selectedConversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">
                    {selectedConversation.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.online ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 text-gray-600">
                <Phone />
                <Video />
                <MoreVertical />
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-[#F8F9FA]">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'me' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[65%] px-3 py-2 rounded-2xl ${
                      msg.sender === 'me'
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-white border rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-xs block mt-1 opacity-70">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* INPUT */}
            <div className="p-3 bg-white border-t flex gap-2">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Paperclip />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Smile />
              </button>

              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border bg-[#F8F9FA] text-sm outline-none"
              />

              <button
                onClick={handleSendMessage}
                className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                  messageInput
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                <Send />
              </button>
            </div>
          </div>
        </Panel>
      </Group>
    </div>
  );
};

export default MessagesPage;