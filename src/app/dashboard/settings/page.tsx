'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User, Settings, Bell, Shield, Trash2, Save, Loader2, User as UserIcon } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  dietary_preferences: string[] | null
  cooking_skill_level: string | null
  default_servings: number | null
  calorie_goal: number | null
}

interface NotificationSettings {
  meal_reminders: boolean
  grocery_reminders: boolean
  recipe_suggestions: boolean
  weekly_meal_plan: boolean
}

const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
)

const TabButton = ({ 
  active, 
  onClick, 
  icon: Icon, 
  children 
}: { 
  active: boolean
  onClick: () => void
  icon: any
  children: React.ReactNode 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
      active 
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
        : 'text-gray-300 hover:text-white hover:bg-slate-700'
    }`}
  >
    <Icon className="h-4 w-4" />
    {children}
  </button>
)

const ToggleSwitch = ({ 
  enabled, 
  onChange, 
  label 
}: { 
  enabled: boolean
  onChange: (enabled: boolean) => void
  label: string 
}) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-white font-medium">{label}</span>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
)

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    meal_reminders: true,
    grocery_reminders: true,
    recipe_suggestions: false,
    weekly_meal_plan: true
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const supabase = useMemo(() => 
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), 
    []
  )

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError('')

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        window.location.href = '/login'
        return
      }

      setUser(user)

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      if (profileData) {
        setProfile(profileData)
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          dietary_preferences: [],
          cooking_skill_level: 'beginner',
          default_servings: 4,
          calorie_goal: 2000
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single()

        if (createError) throw createError
        setProfile(createdProfile)
      }

    } catch (err: any) {
      console.error('Error loading user data:', err)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          dietary_preferences: profile.dietary_preferences,
          cooking_skill_level: profile.cooking_skill_level,
          default_servings: profile.default_servings,
          calorie_goal: profile.calorie_goal,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)

    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    try {
      setDeleteLoading(true)
      setError('')

      // Delete user data
      await supabase.from('users').delete().eq('id', user.id)
      
      // Sign out
      await supabase.auth.signOut()
      
      window.location.href = '/'

    } catch (err: any) {
      console.error('Error deleting account:', err)
      setError('Failed to delete account')
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-gray-400">
            Manage your account preferences and settings
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-900/20 border border-green-800 rounded-lg p-4">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-700 p-6">
            <div className="flex gap-2">
              <TabButton
                active={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
                icon={UserIcon}
              >
                Profile
              </TabButton>
              <TabButton
                active={activeTab === 'notifications'}
                onClick={() => setActiveTab('notifications')}
                icon={Bell}
              >
                Notifications
              </TabButton>
              <TabButton
                active={activeTab === 'danger'}
                onClick={() => setActiveTab('danger')}
                icon={Shield}
              >
                Danger Zone
              </TabButton>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && profile && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cooking Skill Level
                  </label>
                  <select
                    value={profile.cooking_skill_level || 'beginner'}
                    onChange={(e) => setProfile({ ...profile, cooking_skill_level: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Servings
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={profile.default_servings || 4}
                      onChange={(e) => setProfile({ ...profile, default_servings: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Daily Calorie Goal
                    </label>
                    <input
                      type="number"
                      min="1000"
                      max="5000"
                      value={profile.calorie_goal || 2000}
                      onChange={(e) => setProfile({ ...profile, calorie_goal: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dietary Preferences
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb', 'low-sodium'].map((diet) => (
                      <button
                        key={diet}
                        onClick={() => {
                          const current = profile.dietary_preferences || []
                          const updated = current.includes(diet)
                            ? current.filter(d => d !== diet)
                            : [...current, diet]
                          setProfile({ ...profile, dietary_preferences: updated })
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          (profile.dietary_preferences || []).includes(diet)
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        }`}
                      >
                        {diet.charAt(0).toUpperCase() + diet.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Spinner /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                  <div className="space-y-1 bg-slate-700/50 rounded-lg p-4">
                    <ToggleSwitch
                      enabled={notifications.meal_reminders}
                      onChange={(enabled) => setNotifications({ ...notifications, meal_reminders: enabled })}
                      label="Meal planning reminders"
                    />
                    <ToggleSwitch
                      enabled={notifications.grocery_reminders}
                      onChange={(enabled) => setNotifications({ ...notifications, grocery_reminders: enabled })}
                      label="Grocery shopping reminders"
                    />
                    <ToggleSwitch
                      enabled={notifications.recipe_suggestions}
                      onChange={(enabled) => setNotifications({ ...notifications, recipe_suggestions: enabled })}
                      label="Recipe suggestions"
                    />
                    <ToggleSwitch
                      enabled={notifications.weekly_meal_plan}
                      onChange={(enabled) => setNotifications({ ...notifications, weekly_meal_plan: enabled })}
                      label="Weekly meal plan summaries"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Spinner /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Danger Zone</h3>
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-red-400 font-semibold mb-2">Delete Account</h4>
                        <p className="text-gray-300 text-sm mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                          All your recipes, meal plans, and data will be permanently deleted.
                        </p>
                      </div>
                    </div>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-slate-800 rounded-lg p-4">
                          <p className="text-yellow-400 font-medium mb-3">
                            ⚠️ Are you absolutely sure?
                          </p>
                          <p className="text-gray-300 text-sm mb-4">
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={handleDeleteAccount}
                              disabled={deleteLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deleteLoading ? <Spinner /> : <Trash2 className="h-4 w-4" />}
                              {deleteLoading ? 'Deleting...' : 'Yes, delete my account'}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}