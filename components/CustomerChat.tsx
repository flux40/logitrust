'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Headphones, 
  Clock, 
  CheckCircle,
  Loader2,
  Users,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  message: string
  sender_role: 'customer' | 'admin'
  sender_name: string
  created_at: string
  is_read: boolean
}

interface Conversation {
  id: string
  customer_name: string
  customer_email: string
  status: string
  unread_count: number
}

export default function CustomerSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check if user is logged in
  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.email) {
      setCustomerEmail(user.email)
      setCustomerName(user.user_metadata?.full_name || user.email.split('@')[0])
      setIsLoggedIn(true)
      
      // Check for existing conversation
      await checkExistingConversation(user.email)
    }
  }

  const checkExistingConversation = async (email: string) => {
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_email', email)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      setConversation(existing)
      await loadMessages(existing.id)
    }
  }

  // Setup realtime subscription when conversation exists
  useEffect(() => {
    if (!conversation?.id) return

    console.log('Setting up realtime for conversation:', conversation.id)

    // Create the subscription
    const channel = supabase
      .channel(`customer-chat-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          console.log('📩 New message received:', newMessage)
          
          if (newMessage.sender_role === 'admin') {
            setMessages(prev => [...prev, newMessage])
            markMessagesAsRead()
            toast.info('New message from support!', { duration: 3000 })
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
      })

    // Cleanup: unsubscribe when component unmounts or conversation changes
    return () => {
      console.log('🧹 Cleaning up subscription')
      supabase.removeChannel(channel)
    }
  }, [conversation?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && conversation) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, isMinimized, conversation])

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error loading messages:', error)
    } else if (data) {
      setMessages(data)
    }
  }

  const markMessagesAsRead = async () => {
    if (!conversation?.id) return
    
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversation.id)
      .eq('sender_role', 'admin')
      .eq('is_read', false)
  }

  const startConversation = async () => {
    if (!customerName || !customerEmail) {
      toast.error('Please enter your name and email')
      return
    }

    setIsLoading(true)

    // Check for existing active conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_email', customerEmail)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      setConversation(existing)
      await loadMessages(existing.id)
      setIsLoading(false)
      toast.success('Connected to support!')
      return
    }

    // Create new conversation
    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to start conversation')
      setIsLoading(false)
      return
    }

    setConversation(newConversation)
    
    // Send welcome message
    await supabase
      .from('messages')
      .insert({
        conversation_id: newConversation.id,
        sender_name: 'System',
        sender_role: 'admin',
        message: `👋 Welcome ${customerName}! An agent will be with you shortly. Please describe your issue or question.`
      })

    setIsLoading(false)
    toast.success('Connected to support! An agent will respond shortly.')
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversation?.id || isSending) return

    setIsSending(true)
    
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_name: customerName || 'Customer',
        sender_role: 'customer',
        message: inputMessage.trim()
      })

    if (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } else {
      setInputMessage('')
      // Add message to local state immediately for instant feedback
      const tempMessage: Message = {
        id: Date.now().toString(),
        message: inputMessage.trim(),
        sender_role: 'customer',
        sender_name: customerName || 'Customer',
        created_at: new Date().toISOString(),
        is_read: false
      }
      setMessages(prev => [...prev, tempMessage])
    }
    
    setIsSending(false)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const handleOpenChat = () => {
    if (!isLoggedIn) {
      toast.error('Please login to contact support')
      router.push('/login')
      return
    }
    
    if (!conversation) {
      startConversation()
    }
    setIsOpen(true)
    setIsMinimized(false)
  }

  // Don't show anything if not logged in
  if (!isLoggedIn) {
    return null
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpenChat}
        className="fixed bottom-20 right-4 z-50 bg-gold text-navy p-3 rounded-full shadow-2xl hover:shadow-xl transition-all group md:bottom-6 md:right-6"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
        {conversation?.unread_count ? (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {conversation.unread_count}
          </span>
        ) : null}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && conversation && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
              isMinimized 
                ? 'bottom-24 right-4 w-72 h-14 md:bottom-6 md:right-6' 
                : 'bottom-24 right-4 w-[calc(100vw-2rem)] max-w-md h-[500px] md:bottom-6 md:right-6'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-navy to-navy/90 p-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-gold/20 p-2 rounded-full">
                    <Headphones className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Live Support</h3>
                    <p className="text-xs text-white/70 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Agents Online • 24/7
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="hover:bg-white/10 p-1 rounded-full transition-colors"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-white/10 p-1 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="bg-gray-50 p-2 flex justify-around text-xs border-b">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold" />
                    <span className="text-gray-600">Quick Response</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-gold" />
                    <span className="text-gray-600">Agents Online</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-gold" />
                    <span className="text-gray-600">SSL Secure</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-[340px] overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Headphones className="w-12 h-12 text-gold/50 mb-4" />
                      <p className="text-gray-500 text-sm">Start a conversation with our support team</p>
                      <p className="text-xs text-gray-400 mt-2">We typically respond within minutes</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 flex ${message.sender_role === 'customer' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.sender_role === 'customer' ? 'order-2' : 'order-1'}`}>
                          {message.sender_role === 'admin' && (
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center">
                                <Headphones className="w-2.5 h-2.5 text-gold" />
                              </div>
                              <span className="text-xs text-gray-500">Support Agent</span>
                            </div>
                          )}
                          <div
                            className={`p-3 rounded-2xl text-sm ${
                              message.sender_role === 'customer'
                                ? 'bg-gold text-navy rounded-br-none'
                                : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                            }`}
                          >
                            <p>{message.message}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-400">
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t bg-white">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gold focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isSending}
                      className="bg-gold text-navy p-2 rounded-lg hover:bg-gold/90 transition-all disabled:opacity-50"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}