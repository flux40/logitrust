'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Headphones, 
  Users, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Search,
  MessageCircle,
  Check,
  User,
  Mail,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Conversation {
  id: string
  customer_name: string
  customer_email: string
  status: string
  unread_count: number
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  conversation_id: string
  message: string
  sender_role: 'customer' | 'admin'
  sender_name: string
  created_at: string
  is_read: boolean
}

interface CustomerInfo {
  full_name: string
  email: string
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [adminName, setAdminName] = useState('Support Agent')
  const [isAdmin, setIsAdmin] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check admin access
  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login?redirect=/dashboard/admin/chat')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single()

    if (userData?.role !== 'admin') {
      router.push('/dashboard/customer')
      return
    }

    setIsAdmin(true)
    setAdminName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Support Agent')
    await loadConversations()
    setIsLoading(false)
  }

  // Load conversations and setup realtime
  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      toast.error('Failed to load conversations')
    } else {
      setConversations(data || [])
    }
  }

  // Setup realtime subscription for new conversations and messages
  useEffect(() => {
    if (!isAdmin) return

    // Subscribe to new conversations
    const conversationsSubscription = supabase
      .channel('admin-conversations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' }, 
        () => {
          loadConversations()
        }
      )
      .subscribe()

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('admin-messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          const newMessage = payload.new as Message
          
          // If this message is for the selected conversation, add it to messages
          if (selectedConversation?.id === newMessage.conversation_id) {
            setMessages(prev => [...prev, newMessage])
            markMessageAsRead(newMessage.id)
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          } else {
            // Otherwise, just reload conversations to update unread count
            loadConversations()
            // Show notification for new message
            toast.info(`New message from customer`, {
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => {
                  const conv = conversations.find(c => c.id === newMessage.conversation_id)
                  if (conv) setSelectedConversation(conv)
                }
              }
            })
          }
        }
      )
      .subscribe()

    return () => {
      conversationsSubscription.unsubscribe()
      messagesSubscription.unsubscribe()
    }
  }, [isAdmin, selectedConversation?.id])

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      loadCustomerInfo(selectedConversation.customer_email)
      markConversationAsRead(selectedConversation.id)
    }
  }, [selectedConversation])

  // Setup realtime for selected conversation messages
  useEffect(() => {
    if (!selectedConversation?.id) return

    const channel = supabase
      .channel(`conversation-${selectedConversation.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        }, 
        (payload) => {
          const newMessage = payload.new as Message
          console.log('New message received:', newMessage)
          setMessages(prev => [...prev, newMessage])
          markMessageAsRead(newMessage.id)
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      toast.error('Failed to load messages')
    } else {
      setMessages(data || [])
    }
  }

  const loadCustomerInfo = async (email: string) => {
    const { data } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('email', email)
      .single()
    
    if (data) {
      setCustomerInfo(data)
    } else {
      setCustomerInfo({ full_name: email.split('@')[0], email })
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId)
  }

  const markConversationAsRead = async (conversationId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('sender_role', 'customer')
      .eq('is_read', false)
    
    // Update unread count in conversation
    await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId)
    
    // Reload conversations to update unread count in sidebar
    loadConversations()
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation.id,
        sender_name: adminName,
        sender_role: 'admin',
        message: inputMessage.trim()
      })

    if (error) {
      toast.error('Failed to send message: ' + error.message)
    } else {
      setInputMessage('')
      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id)
    }
    
    setIsSending(false)
    inputRef.current?.focus()
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const resolveConversation = async () => {
    if (!selectedConversation) return
    
    const { error } = await supabase
      .from('conversations')
      .update({ status: 'resolved' })
      .eq('id', selectedConversation.id)

    if (error) {
      toast.error('Failed to resolve conversation')
    } else {
      toast.success('Conversation marked as resolved')
      setSelectedConversation(null)
      loadConversations()
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">Active</span>
      case 'resolved':
        return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">Resolved</span>
      default:
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">{status}</span>
    }
  }

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-navy text-white p-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin" className="hover:bg-white/10 p-1 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Headphones className="w-5 h-5 text-gold" />
                Customer Support Dashboard
              </h1>
              <p className="text-white/70 text-sm mt-1">Manage customer conversations in real-time</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-full md:w-80 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-bold text-navy flex items-center gap-2">
                <Users className="w-4 h-4 text-gold" />
                Conversations
                <span className="text-sm text-gray-500 ml-auto">{conversations.length}</span>
              </h2>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gold focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b ${
                      selectedConversation?.id === conv.id ? 'bg-gold/5 border-l-4 border-l-gold' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-navy">{conv.customer_name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{conv.customer_email}</p>
                    <div className="flex justify-between items-center">
                      {getStatusBadge(conv.status)}
                      {conv.unread_count > 0 && (
                        <span className="bg-gold text-navy text-xs px-2 py-0.5 rounded-full font-semibold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="bg-white border-b p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-navy">{selectedConversation.customer_name}</h3>
                    <p className="text-xs text-gray-500">{selectedConversation.customer_email}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedConversation.status === 'active' && (
                      <button
                        onClick={resolveConversation}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => loadMessages(selectedConversation.id)}
                      className="p-1 text-gray-500 hover:text-gold transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Info Bar */}
              {customerInfo && (
                <div className="bg-gray-50 border-b p-3 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gold" />
                    <span>{customerInfo.full_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gold" />
                    <span>{customerInfo.email}</span>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Headphones className="w-12 h-12 text-gold/50 mb-4" />
                    <p className="text-gray-500 text-sm">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Send a reply to start the conversation</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-4 flex ${message.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.sender_role === 'admin' ? 'order-2' : 'order-1'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">
                            {message.sender_role === 'admin' ? 'You (Support Agent)' : selectedConversation.customer_name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-sm ${
                            message.sender_role === 'admin'
                              ? 'bg-gold text-navy rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p>{message.message}</p>
                        </div>
                        {message.sender_role === 'admin' && message.is_read && (
                          <div className="flex justify-end mt-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="bg-white border-t p-3 overflow-x-auto">
                <div className="flex gap-2">
                  {['Yes', 'No', 'I will check', 'Please provide your tracking number', 'Thank you', 'We will update you soon'].map((reply) => (
                    <button
                      key={reply}
                      onClick={() => setInputMessage(reply)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gold/20 text-gray-700 hover:text-navy text-xs rounded-full transition-all whitespace-nowrap"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isSending}
                    className="bg-gold text-navy px-4 py-2 rounded-lg hover:bg-gold/90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-500">Select a conversation</h3>
                <p className="text-gray-400 mt-2">Choose a customer to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}