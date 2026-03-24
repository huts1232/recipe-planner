'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, Clock, Calendar, User, Bot, Loader2, ArrowLeft } from 'lucide-react'

interface Conversation {
  id: string
  chatbot_name: string
  visitor_message: string
  bot_response: string
  created_at: string
  duration_ms: number
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  const supabase = useMemo(() => 
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), 
    []
  )

  useEffect(() => {
    checkAuth()
    loadConversations()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const loadConversations = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Mock conversation data since the table structure doesn't include conversations
      // In a real app, you'd have a conversations table
      const mockConversations: Conversation[] = [
        {
          id: '1',
          chatbot_name: 'Recipe Assistant',
          visitor_message: 'I need help planning meals for the week',
          bot_response: 'I\'d be happy to help you plan your weekly meals! What are your dietary preferences and how many people are you cooking for?',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          duration_ms: 2300
        },
        {
          id: '2',
          chatbot_name: 'Cooking Helper',
          visitor_message: 'What\'s a good recipe for chicken breast?',
          bot_response: 'Here are some delicious chicken breast recipes: Herb-Crusted Chicken, Honey Garlic Chicken, and Mediterranean Chicken. Would you like the full recipe for any of these?',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          duration_ms: 1800
        },
        {
          id: '3',
          chatbot_name: 'Meal Planner Bot',
          visitor_message: 'How do I create a balanced meal plan?',
          bot_response: 'A balanced meal plan should include proteins, vegetables, whole grains, and healthy fats. I recommend planning 3 meals and 2 snacks per day, with variety in colors and nutrients.',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          duration_ms: 3200
        }
      ]

      setConversations(mockConversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
      setError('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              href="/dashboard"
              className="flex items-center text-slate-400 hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Conversations</h1>
              <p className="text-slate-400">View all chatbot conversations and interactions</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-slate-800 rounded-lg px-4 py-2">
                <span className="text-sm text-slate-400">Total Conversations</span>
                <p className="text-2xl font-bold text-white">{conversations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Conversations Table */}
        {conversations.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center">
            <MessageCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Conversations Yet</h3>
            <p className="text-slate-400 mb-6">
              Conversations with your Recipe Planner chatbots will appear here
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Bot className="h-4 w-4 mr-2" />
                        Chatbot
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Visitor Message
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Response
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Duration
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {conversations.map((conversation) => (
                    <tr key={conversation.id} className="hover:bg-slate-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {conversation.chatbot_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white max-w-xs">
                          <p className="truncate" title={conversation.visitor_message}>
                            {conversation.visitor_message}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-300 max-w-md">
                          <p className="line-clamp-2" title={conversation.bot_response}>
                            {conversation.bot_response}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">
                          {formatDate(conversation.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-slate-300">
                            {formatDuration(conversation.duration_ms)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Average Response Time</p>
                <p className="text-2xl font-bold text-white">
                  {conversations.length > 0 
                    ? formatDuration(conversations.reduce((acc, c) => acc + c.duration_ms, 0) / conversations.length)
                    : '0s'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Chatbots</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(conversations.map(c => c.chatbot_name)).size}
                </p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">This Week</p>
                <p className="text-2xl font-bold text-white">
                  {conversations.filter(c => 
                    new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}