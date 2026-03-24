'use client'

import { useMemo, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings, User, Shield, Trash2, Save, AlertTriangle, CheckCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string | null
  dietary_preferences: string | null
  cooking_skill_level: string | null
  default_servings: number | null
  calorie_goal: number | null
  created_at: string
  updated_at: string
}

interface ProfileFormData {
  full_name: string
  dietary_preferences: string
  cooking_skill_level: string
  default_servings: string
  calorie_goal: string
}

const Spinner = () => (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
  </div>
)

const LoadingButton = ({ loading, children, ...props }: { loading: boolean, children: React.ReactNode, [key: string]: any }) => (
  <button
    disabled={loading}
    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    {...props}
  >
    {loading ? (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span>Loading...</span>
      </div>
    ) : children}
  </button>
)

export default function SettingsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<ProfileFormData>({
    full_name: '',
    dietary_preferences: '',
    cooking_skill_level: '',
    default_servings: '',
    calorie_goal: ''
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        router.push('/login')
        return
      }

      // Fetch user profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        setErrorMessage('Failed to load user data')
      } else if (userData) {
        setUser(userData)
        setProfileData({
          full_name: userData.full_name || '',
          dietary_preferences: userData.dietary_preferences || '',
          cooking_skill_level: userData.cooking_skill_level || '',
          default_servings: userData.default_servings?.toString() || '',
          calorie_goal: userData.calorie_goal?.toString() || ''
        })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setUpdateLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name.trim() || null,
          dietary_preferences: profileData.dietary_preferences.trim() || null,
          cooking_skill_level: profileData.cooking_skill_level || null,
          default_servings: profileData.default_servings ? parseInt(profileData.default_servings) : null,
          calorie_goal: profileData.calorie_goal ? parseInt(profileData.calorie_goal) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        setErrorMessage('Failed to update profile')
      } else {
        setSuccessMessage('Profile updated successfully!')
        // Refetch user data
        checkAuth()
      }
    } catch (error) {
      console.error('Update error:', error)
      setErrorMessage('Failed to update profile')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return

    setDeleteLoading(true)
    setErrorMessage('')

    try {
      // Delete user data first (cascade should handle related records)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (deleteError) {
        setErrorMessage('Failed to delete account')
      } else {
        // Sign out the user
        await supabase.auth.signOut()
        router.push('/')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setErrorMessage('Failed to delete account')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RP</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Recipe Planner
              </span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/recipes" className="text-slate-300 hover:text-white transition-colors">
                Recipes
              </Link>
              <Link href="/meal-plans" className="text-slate-300 hover:text-white transition-colors">
                Meal Plans
              </Link>
              <Link href="/grocery-lists" className="text-slate-300 hover:text-white transition-colors">
                Lists
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-slate-400">Manage your account and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-900/50 border border-green-700 rounded-lg p-4 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-green-300">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{errorMessage}</span>
          </div>
        )}

        <div className="grid gap-8">
          {/* Profile Section */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-6">
              <User className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cooking Skill Level
                  </label>
                  <select
                    value={profileData.cooking_skill_level}
                    onChange={(e) => setProfileData({ ...profileData, cooking_skill_level: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Default Servings
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={profileData.default_servings}
                    onChange={(e) => setProfileData({ ...profileData, default_servings: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 4"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Dietary Preferences
                  </label>
                  <input
                    type="text"
                    value={profileData.dietary_preferences}
                    onChange={(e) => setProfileData({ ...profileData, dietary_preferences: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Vegetarian, Gluten-free"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Daily Calorie Goal
                  </label>
                  <input
                    type="number"
                    min="1200"
                    max="5000"
                    value={profileData.calorie_goal}
                    onChange={(e) => setProfileData({ ...profileData, calorie_goal: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 2000"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <LoadingButton loading={updateLoading} type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </LoadingButton>
              </div>
            </form>
          </div>

          {/* Plan Information */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold">Plan Information</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-700">
                <div>
                  <h3 className="font-medium text-white">Current Plan</h3>
                  <p className="text-sm text-slate-400">Pro Plan - $9/month</p>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Active
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-700">
                <div>
                  <h3 className="font-medium text-white">Account Created</h3>
                  <p className="text-sm text-slate-400">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center py-3">
                <div>
                  <h3 className="font-medium text-white">Next Billing</h3>
                  <p className="text-sm text-slate-400">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-900/20 rounded-xl p-6 border border-red-800">
            <div className="flex items-center space-x-3 mb-6">
              <Trash2 className="h-6 w-6 text-red-400" />
              <h2 className="text-xl font-semibold text-red-300">Danger Zone</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-red-300 mb-2">Delete Account</h3>
                <p className="text-sm text-red-200/80 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="bg-red-950 border border-red-800 rounded-lg p-4">
                    <p className="text-red-200 text-sm mb-3">
                      Type <strong>DELETE</strong> to confirm account deletion:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full bg-slate-700 border border-red-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                      placeholder="Type DELETE here"
                    />
                    <div className="flex space-x-3">
                      <LoadingButton
                        loading={deleteLoading}
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE'}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm Delete
                      </LoadingButton>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmText('')
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}