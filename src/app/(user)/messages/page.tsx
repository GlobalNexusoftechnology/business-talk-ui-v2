'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useWebSocket } from '@/providers/WebSocketProvider';
import apiClient from '@/lib/api-client';
import { useSearchParams } from 'next/navigation'
import EmojiPicker from 'emoji-picker-react';

import {
  Panel,
  Group,
  Separator,
} from 'react-resizable-panels';

import {
  Search,
  Send,
  // Paperclip,
  Smile,
  Users,
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
  createdAt: number;

  senderId?: string;
  senderName?: string;
  senderAvatar?: string;

  status?: 'sent' | 'delivered' | 'seen';
};

const MessagesPage = () => {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const res = await apiClient.getConversations();

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        const formatted = res.data.map((c: any) => {
          const conv = c.conversation;

          let avatar = '/avatar.png';
          let name = conv.title;

          const isGroup = conv.is_group;

          if (!isGroup) {
            const otherUser = conv.participants?.find(
              (p: any) => p.user?.id !== currentUser.id
            )?.user;

            if (otherUser) {
              name = otherUser.full_name || otherUser.username;
              avatar = otherUser.profile_photo || '/avatar.png';
            }
          } else {
            avatar = '/avatar.png';
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

        // ✅ IMPORTANT: auto open correct conversation
        if (conversationIdFromURL) {
          const found = formatted.find((c: any) => c.id === conversationIdFromURL);
          setSelectedConversation(found || formatted[0]);
        } else {
          setSelectedConversation(formatted[0]);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchConversations();
  }, [conversationIdFromURL]);

  /* ================= FETCH MESSAGES ================= */

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        console.log("🔥 Fetching messages for:", selectedConversation.id);

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
            senderAvatar: m.sender?.profile_photo || '/avatar.png',

            status: m.status || 'sent',
          }))
          .sort((a: Message, b: Message) => a.createdAt - b.createdAt);

        setMessages(formatted);

      } catch (err) {
        console.error("❌ Fetch messages failed:", err);
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
          senderAvatar: data.sender?.profile_photo || '/avatar.png',

          status: data.status || 'sent',
        },
      ]);
    };

    return wsManager.on('message', handler);
  }, [wsManager, selectedConversation]);

   /* ================== 🆕 SEND MESSAGE ================== */
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

    // ✅ Optimistic UI
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await apiClient.sendMessage(
        selectedConversation.id,
        messageInput
      );

      const realMessage = res.data;

      // ✅ Replace temp message with real one
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

      // ✅ Emit socket (for other users)
      wsManager?.emit('send_message', realMessage);

    } catch (err) {
      console.error('Send message error', err);

      // ❌ Rollback UI if failed
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

  if (!selectedConversation) return null;

  // ✅ ENTER SEND
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ✅ EMOJI SELECT
  const handleEmojiClick = (emojiData: any) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  // ✅ FILE UPLOAD
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    try {
      // If sendMessageWithAttachment expects a string, send file as base64 or URL
      // Otherwise, if it expects a FormData, update the API definition
      // Here, we assume it expects a string (file name or base64)
      // If you want to send the file as base64 string:
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileString = event.target?.result as string;
        await apiClient.sendMessageWithAttachment(
          selectedConversation.id,
          fileString,
        );
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File upload failed", err);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F8F9FA]">
      <Group orientation="horizontal" className="flex-1 h-full">

        {/* LEFT PANEL */}
        <Panel defaultSize={25} className="h-full">
          <div className="h-full flex flex-col bg-white border-r overflow-hidden">

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
                  className={`px-3 py-1.5 text-sm rounded-lg ${
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
                  onClick={() => setSelectedConversation(c)}
                  className={`w-full p-3 flex gap-3 text-left border-b ${
                    selectedConversation.id === c.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    {!c.avatar ? (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full" />
                    )}
                    {c.isGroup && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <Users className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">{c.name}</h3>
                    <p className="text-xs text-gray-500 truncate">
                      {c.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <Separator />

        {/* RIGHT PANEL */}
        <Panel defaultSize={75} className="h-full">
          <div className="h-full flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className="p-4 flex justify-between items-center bg-white border-b">
              <div className="flex gap-3 items-center">
                <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-10 h-10 rounded-full" />
                <div>
                  <h2 className="font-semibold">{selectedConversation.name}</h2>
                </div>
              </div>

              {/* <div className="flex gap-2 text-gray-600">
                <Phone />
                <Video />
                <MoreVertical />
              </div> */}
            </div>

            {/* MESSAGES */}
            <div className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto bg-white">
              {messages.map((msg) => {
                const isMe = msg.sender === 'me';
                const isGroup = selectedConversation.isGroup;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* 👇 Avatar for group (other users only) */}
                    {!isMe && isGroup && (
                      <img
                        src={msg.senderAvatar || '/avatar.png'}
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-full mr-2 self-end"
                      />
                    )}

                    <div className="max-w-[70%]">

                      {/* 👇 Sender Name (Group only) */}
                      {!isMe && isGroup && (
                        <p className="text-xs text-gray-500 ml-1 mb-1">
                          {msg.senderName}
                        </p>
                      )}

                      {/* 💬 Message Bubble */}
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-[#DCF8C6] text-black rounded-br-sm'
                            : 'bg-gray-100 text-black rounded-bl-sm'
                        }`}
                      >
                        {msg.text}

                        {/* ⏱ TIME + STATUS */}
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-gray-500">
                            {msg.timestamp}
                          </span>

                          {/* ✅ Message ticks */}
                          {isMe && (
                            <span className="text-[10px] text-gray-500">
                              {msg.status === 'seen'
                                ? '✓✓'
                                : msg.status === 'delivered'
                                ? '✓✓'
                                : '✓'}
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
            <div className="p-3 bg-white border-t flex items-end gap-2 relative">

              {/* FILE BUTTON */}
              {/* <button onClick={() => fileInputRef.current?.click()}>
                <Paperclip />
              </button> */}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* EMOJI BUTTON */}
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <Smile />
              </button>

              {/* EMOJI PICKER */}
              {showEmojiPicker && (
                <div className="absolute bottom-14 left-10 z-50">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}

              {/* INPUT BOX */}
              <textarea
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);

                  wsManager?.emit('typing', {
                    conversationId: selectedConversation.id,
                  });
                }}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 border rounded resize-none max-h-28 overflow-y-auto"
              />

              {/* SEND BUTTON */}
              <button
                onClick={handleSendMessage}
                className="bg-black text-white px-3 py-2 rounded"
              >
                <Send />
              </button>

              {/* TYPING */}
              {typingUser && (
                <div className="absolute -top-5 left-12 text-xs text-gray-500">
                  {typingUser} is typing...
                </div>
              )}
            </div>

          </div>
        </Panel>

      </Group>
    </div>
  );
};

export default MessagesPage;