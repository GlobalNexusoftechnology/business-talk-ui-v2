'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useWebSocket } from '@/providers/WebSocketProvider';
import apiClient from '@/lib/api-client';
import { useSearchParams } from 'next/navigation'
import EmojiPicker from 'emoji-picker-react';


import {
  Search,
  Send,
  Smile,
  Users,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react';

// ✅ ENTIRE YOUR ORIGINAL CODE — NO CHANGES BELOW

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
  createdAt: number;

  senderId?: string;
  senderName?: string;
  senderAvatar?: string;

  status?: 'sent' | 'delivered' | 'seen';
};

const MessagesClient = () => {
  const { wsManager } = useWebSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups'>('all');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const searchParams = useSearchParams()
  const conversationIdFromURL = searchParams.get('conversationId')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [showMobileList, setShowMobileList] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiToggleRef = useRef<HTMLButtonElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ================== 🆕 TYPING INDICATOR ================== */
  useEffect(() => {
    if (!wsManager) return;

    const handler = (data: any) => {
      if (data.conversationId !== selectedConversation?.id) return;

      setTypingUser(data.userName);

      setTimeout(() => setTypingUser(null), 2000);
    };

    return wsManager.on('typing', handler);
  }, [wsManager, selectedConversation]);

  /* ================= FETCH CONVERSATIONS ================= */
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setConversationsLoading(true);
        const res = await apiClient.getConversations();

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        const formatted = res.data.map((c: any) => {
          const conv = c.conversation;

          let avatar =  conv.cover_image || `https://ui-avatars.com/api/name=${encodeURIComponent(c.title || 'User')}`;
          let name = conv.title;

          const isGroup = conv.is_group;

          if (!isGroup) {
            const otherUser = conv.participants?.find(
              (p: any) => p.user?.id !== currentUser.id
            )?.user;

            if (otherUser) {
              name = otherUser.full_name || otherUser.username;
              avatar = otherUser.profile_photo || `https://ui-avatars.com/api/name=${encodeURIComponent(otherUser.full_name || 'User')}`;
            }
          } else {
            avatar = conv.cover_image || `https://ui-avatars.com/api/name=${encodeURIComponent(conv.title || 'User')}`;
            name =
              conv.title ||
              conv.participants?.map((p: any) => p.user?.username).join(', ');
          }

          const lastMsg = conv.messages?.[conv.messages.length - 1];

          return {
            id: conv.id,
            name: name || 'Unknown',
            avatar,
            lastMessage: lastMsg?.content || '',
            timestamp: lastMsg
              ? new Date(Number(lastMsg.created_on)).toLocaleTimeString()
              : '',
            unread: 0,
            online: true,
            isGroup,
            members: conv.participants?.length,
          };
        });

        setConversations(formatted);

        if (conversationIdFromURL) {
          const found = formatted.find((c: any) => c.id === conversationIdFromURL);
          setSelectedConversation(found || formatted[0]);
        } else {
          setSelectedConversation(formatted[0]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setConversationsLoading(false);
      }
    };

    fetchConversations();
  }, [conversationIdFromURL]);

  /* ================= FETCH MESSAGES ================= */
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await apiClient.getMessages(selectedConversation.id);

        const user = JSON.parse(localStorage.getItem('user') || '{}');

        const formatted = res.data
          .map((m: any) => ({
            id: m.id,
            text: m.content,
            sender: m.sender?.id === user.id ? 'me' : 'other',
            timestamp: new Date(Number(m.created_on)).toLocaleTimeString(),
            createdAt: Number(m.created_on),
            senderId: m.sender?.id,
            senderName: m.sender?.full_name || m.sender?.username,
            senderAvatar: m.sender?.profile_photo ||  `https://ui-avatars.com/api/name=${encodeURIComponent(m.sender?.full_name || m.sender?.username || 'User')}`,
            status: m.status || 'sent',
          }))
          .sort((a: Message, b: Message) => a.createdAt - b.createdAt);

        setMessages(formatted);

      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!wsManager) return;

    const handler = (data: any) => {
      if (data.conversationId !== selectedConversation?.id) return;

      const user = JSON.parse(localStorage.getItem('user') || '{}');

      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          text: data.content,
          sender: data.sender?.id === user.id ? 'me' : 'other',
          timestamp: new Date(Number(data.created_on)).toLocaleTimeString(),
          createdAt: Number(data.created_on),
          senderId: data.sender?.id,
          senderName: data.sender?.full_name || data.sender?.username,
          senderAvatar: data.sender?.profile_photo || `https://ui-avatars.com/api/name=${encodeURIComponent(data.sender?.full_name || data.sender?.username || 'User')}`,
          status: data.status || 'sent',
        },
      ]);
    };

    return wsManager.on('message', handler);
  }, [wsManager, selectedConversation]);

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (emojiPickerRef.current?.contains(target)) return;
      if (emojiToggleRef.current?.contains(target)) return;

      setShowEmojiPicker(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const tempId = Date.now().toString();

    const tempMessage: Message = {
      id: tempId,
      text: messageInput,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString(),
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await apiClient.sendMessage(
        selectedConversation.id,
        messageInput
      );

      const realMessage = res.data;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                id: realMessage.id,
                text: realMessage.content,
                sender: 'me',
                timestamp: new Date(Number(realMessage.created_on)).toLocaleTimeString(),
                createdAt: Number(realMessage.created_on),
              }
            : msg
        )
      );

      wsManager?.emit('send_message', realMessage);

    } catch {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }

    setMessageInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (activeTab === 'unread') return conv.unread > 0;
      if (activeTab === 'groups') return conv.isGroup;
      if (searchQuery.trim()) {
        return conv.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [conversations, activeTab, searchQuery]);

  if (conversationsLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (!conversationsLoading && conversations.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <MessageCircle className="w-9 h-9 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">No conversations yet</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Message people from their profiles to start a conversation. Your chats will appear here.
          </p>
          <a
            href="/people"
            className="mt-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Find People
          </a>
        </div>
      </div>
    );
  }

  if (!selectedConversation) return null;

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileString = event.target?.result as string;
      await apiClient.sendMessageWithAttachment(
        selectedConversation.id,
        fileString,
      );
    };
    reader.readAsDataURL(file);
  };

return (
    <div className="h-[100dvh] w-full flex overflow-hidden bg-[#F8F9FA]">

      {/* LEFT — Conversation list */}
      <div
        className={`
          h-full flex flex-col bg-white border-r overflow-hidden
          w-full md:w-80 lg:w-96 shrink-0
          ${showMobileList ? 'flex' : 'hidden'} md:flex
        `}
      >
        {/* SEARCH */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 text-sm"
            />
          </div>
        </div>

        {/* TABS */}
        <div className="p-3 flex gap-2 border-b">
          {['all', 'unread', 'groups'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1.5 text-sm rounded-lg capitalize ${
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {filteredConversations.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedConversation(c);
                setShowMobileList(false);
              }}
              className={`w-full p-3 flex gap-3 text-left border-b ${
                selectedConversation?.id === c.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative shrink-0">
                {!c.avatar ? (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {c.name?.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                )}
                {c.isGroup && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <Users className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{c.name}</h3>
                <p className="text-xs text-gray-500 truncate">
                  {c.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DIVIDER — desktop only */}
      <div className="hidden md:block w-px bg-gray-200 shrink-0" />

      {/* RIGHT — Chat area */}
      <div
        className={`
          h-full flex flex-col overflow-hidden flex-1
          ${!showMobileList ? 'flex' : 'hidden'} md:flex
        `}
      >
        {/* HEADER */}
        <div className="p-3 md:p-4 flex justify-between items-center bg-white border-b">
          <div className="flex gap-2 md:gap-3 items-center min-w-0">
            {/* Back button — mobile only */}
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 shrink-0"
              onClick={() => setShowMobileList(true)}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <img
              src={selectedConversation.avatar}
              alt={selectedConversation.name}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-semibold text-sm md:text-base truncate">{selectedConversation.name}</h2>
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 min-h-0 p-3 md:p-4 space-y-1 overflow-y-auto bg-white">
          {messages.map((msg) => {
            const isMe = msg.sender === 'me';
            const isGroup = selectedConversation.isGroup;

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && isGroup && (
                  <img
                    src={msg.senderAvatar || `https://ui-avatars.com/api/name=${encodeURIComponent(msg.senderName || 'User')}`}
                    alt={msg.senderName}
                    className="w-6 h-6 md:w-7 md:h-7 rounded-full mr-2 self-end shrink-0"
                  />
                )}

                <div className="max-w-[80%] md:max-w-[70%]">
                  {!isMe && isGroup && (
                    <p className="text-xs text-gray-500 ml-1 mb-1">
                      {msg.senderName}
                    </p>
                  )}

                  <div
                    className={`px-3 py-2 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-[#DCF8C6] text-black rounded-br-sm'
                        : 'bg-gray-100 text-black rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                      {isMe && (
                        <span className="text-[10px] text-gray-500">
                          {msg.status === 'seen' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-2 md:p-3 bg-white border-t flex items-end gap-2 relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            ref={emojiToggleRef}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 shrink-0"
          >
            <Smile className="w-5 h-5" />
          </button>

          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-14 left-2 md:left-10 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          <textarea
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              wsManager?.emit('typing', { conversationId: selectedConversation.id });
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message"
            className="flex-1 px-3 md:px-4 py-2 border rounded resize-none max-h-28 overflow-y-auto text-sm"
          />

          <button
            onClick={handleSendMessage}
            className="bg-black text-white px-2.5 md:px-3 py-2 rounded shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>

          {typingUser && (
            <div className="absolute -top-5 left-10 text-xs text-gray-500">
              {typingUser} is typing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesClient;