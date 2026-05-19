'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
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
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

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

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSending, setIsSending] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadConversations()
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('admin-chat')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          const newMessage = payload.new as Message
          if (selectedConversation?.id === newMessage.conversation_id) {
            setMessages(prev => [...prev, newMessage])
            markMessageAsRead(newMessage.id)
          } else {
            loadConversations() // Reload to update unread count
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [selectedConversation])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    setIsLoading(false)
  }

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

  const markMessageAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId)
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation.id,
        sender_name: 'Support Agent',
        sender_role: 'admin',
        message: inputMessage.trim()
      })

    if (error) {
      toast.error('Failed to send message')
    } else {
      setInputMessage('')
    }
    
    setIsSending(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen flex">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" />
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
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 text-gold animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No conversations found
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
                      {new Date(conv.updated_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{conv.customer_email}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      conv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {conv.status}
                    </span>
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
            <div className="bg-white border-b p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-navy">{selectedConversation.customer_name}</h3>
                <p className="text-xs text-gray-500">{selectedConversation.customer_email}</p>
              </div>
              <button
                onClick={resolveConversation}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Mark Resolved
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
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
                    </div>
                    <div
                      className={`p-3 rounded-2xl ${
                        message.sender_role === 'admin'
                          ? 'bg-gold text-navy rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                      {message.sender_role === 'admin' && message.is_read && (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
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
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="bg-gold text-navy px-4 py-2 rounded-lg hover:bg-gold/90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Send
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500">Select a conversation</h3>
              <p className="text-gray-400 mt-2">Choose a customer to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}