'use client'
import { useMemo, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bot, Plus, Edit3, Trash2, Calendar, Globe, MessageSquare, Power, PowerOff, X } from 'lucide-react'

interface Chatbot {
  id: string
  user_id: string
  name: string
  description: string
  website_url: string
  welcome_message: string
  is_active: boolean
  created_at: string
}

interface CreateChatbotData {
  name: string
  description: string
  website_url: string
  welcome_message: string
}

const Spinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
)

export default function ChatbotsPage() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  const router = useRouter()
  
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const [formData, setFormData] = useState<CreateChatbotData>({
    name: '',
    description: '',
    website_url: '',
    welcome_message: ''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchChatbots()
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    }
  }

  const fetchChatbots = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChatbots(data || [])
    } catch (error) {
      console.error('Error fetching chatbots:', error)
      setError('Failed to load chatbots')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChatbot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.description.trim()) return

    try {
      setCreating(true)
      const { data, error } = await supabase
        .from('chatbots')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          website_url: formData.website_url.trim(),
          welcome_message: formData.welcome_message.trim(),
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      setChatbots(prev => [data, ...prev])
      setShowCreateModal(false)
      setFormData({ name: '', description: '', website_url: '', welcome_message: '' })
    } catch (error) {
      console.error('Error creating chatbot:', error)
      setError('Failed to create chatbot')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteChatbot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(id)
      const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', id)

      if (error) throw error

      setChatbots(prev => prev.filter(bot => bot.id !== id))
    } catch (error) {
      console.error('Error deleting chatbot:', error)
      setError('Failed to delete chatbot')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setToggling(id)
      const { error } = await supabase
        .from('chatbots')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setChatbots(prev => 
        prev.map(bot => 
          bot.id === id ? { ...bot, is_active: !currentStatus } : bot
        )
      )
    } catch (error) {
      console.error('Error toggling chatbot status:', error)
      setError('Failed to update chatbot status')
    } finally {
      setToggling(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner />
              <p className="mt-4 text-slate-400">Loading chatbots...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Chatbots
            </h1>
            <p className="text-slate-400 mt-2">
              Manage your recipe planning chatbots
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Create New</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {chatbots.length === 0 ? (
          <div className="text-center py-16">
            <Bot className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No chatbots yet</h3>
            <p className="text-slate-500 mb-6">Create your first recipe planning chatbot to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Chatbot</span>
            </button>
          </div>
        ) : (
          /* Chatbots Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((chatbot) => (
              <div
                key={chatbot.id}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-200"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${
                    chatbot.is_active 
                      ? 'bg-green-900/50 text-green-300 border border-green-700' 
                      : 'bg-gray-900/50 text-gray-400 border border-gray-700'
                  }`}>
                    {chatbot.is_active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                    <span>{chatbot.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(chatbot.id, chatbot.is_active)}
                    disabled={toggling === chatbot.id}
                    className="p-1 hover:bg-slate-700 rounded transition-colors duration-200"
                  >
                    {toggling === chatbot.id ? (
                      <Spinner />
                    ) : chatbot.is_active ? (
                      <PowerOff className="h-4 w-4 text-slate-400 hover:text-red-400" />
                    ) : (
                      <Power className="h-4 w-4 text-slate-400 hover:text-green-400" />
                    )}
                  </button>
                </div>

                {/* Chatbot Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{chatbot.name}</h3>
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{chatbot.description}</p>
                  
                  {chatbot.website_url && (
                    <div className="flex items-center space-x-1 text-blue-400 text-xs mb-2">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{chatbot.website_url}</span>
                    </div>
                  )}

                  {chatbot.welcome_message && (
                    <div className="flex items-start space-x-1 text-slate-500 text-xs mb-3">
                      <MessageSquare className="h-3 w-3 mt-0.5" />
                      <span className="line-clamp-2">{chatbot.welcome_message}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1 text-slate-600 text-xs">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDate(chatbot.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-4 border-t border-slate-700">
                  <Link
                    href={`/dashboard/chatbots/${chatbot.id}/edit`}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center space-x-1 transition-colors duration-200"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteChatbot(chatbot.id)}
                    disabled={deleting === chatbot.id}
                    className="bg-red-900/50 hover:bg-red-900 text-red-300 hover:text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center space-x-1 transition-colors duration-200 border border-red-800"
                  >
                    {deleting === chatbot.id ? (
                      <Spinner />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Create New Chatbot</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateChatbot} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Recipe Assistant Bot"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Helps users plan meals and find recipes"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="website_url" className="block text-sm font-medium text-slate-300 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="welcome_message" className="block text-sm font-medium text-slate-300 mb-2">
                    Welcome Message
                  </label>
                  <textarea
                    id="welcome_message"
                    value={formData.welcome_message}
                    onChange={(e) => setFormData(prev => ({ ...prev, welcome_message: e.target.value }))}
                    rows={2}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Hi! I'm here to help you plan amazing meals..."
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={creating || !formData.name.trim() || !formData.description.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <Spinner />
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Create Chatbot</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}