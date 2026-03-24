'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Users, DollarSign, Activity, TrendingUp, Clock, Star, ChefHat, ShoppingCart } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  dietary_preferences: string[]
  cooking_skill_level: string
}

interface Recipe {
  id: string
  title: string
  created_at: string
  is_public: boolean
  created_by: string
  users: {
    full_name: string
  }
}

interface MealPlan {
  id: string
  title: string
  created_at: string
  users: {
    full_name: string
  }
}

function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = useMemo(() => 
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []
  )

  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    revenue: 0,
    activeRecipes: 0,
    averageRating: 0
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  async function checkAuthAndLoadData() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }

      // For demo purposes, assuming user is admin
      // In real app, you'd check user role/permissions
      
      await Promise.all([
        loadUsers(),
        loadRecipes(),
        loadMealPlans(),
        loadStats()
      ])
      
      setIsLoading(false)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load admin data')
      setIsLoading(false)
    }
  }

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  async function loadRecipes() {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id,
          title,
          created_at,
          is_public,
          created_by,
          users!recipes_created_by_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setRecipes(data || [])
    } catch (err) {
      console.error('Error loading recipes:', err)
    }
  }

  async function loadMealPlans() {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          id,
          title,
          created_at,
          users (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setMealPlans(data || [])
    } catch (err) {
      console.error('Error loading meal plans:', err)
    }
  }

  async function loadStats() {
    try {
      // Get total users count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Calculate revenue (users * $9)
      const revenue = (userCount || 0) * 9

      // Get active recipes count
      const { count: recipeCount } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true)

      // Get average rating
      const { data: ratingsData } = await supabase
        .from('recipe_ratings')
        .select('rating')

      const averageRating = ratingsData && ratingsData.length > 0
        ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
        : 0

      setStats({
        totalUsers: userCount || 0,
        revenue,
        activeRecipes: recipeCount || 0,
        averageRating: Math.round(averageRating * 10) / 10
      })
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage your Recipe Planner platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">+12% vs last month</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalUsers}</h3>
            <p className="text-slate-400">Total Users</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <span className="text-sm text-slate-400">Monthly</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">${stats.revenue}</h3>
            <p className="text-slate-400">Revenue</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <ChefHat className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">Public recipes</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.activeRecipes}</h3>
            <p className="text-slate-400">Active Recipes</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <span className="text-sm text-slate-400">Average rating</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.averageRating}</h3>
            <p className="text-slate-400">Recipe Rating</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Recent Users</h2>
            </div>
            <div className="p-6">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{user.full_name || 'Anonymous'}</h4>
                        <p className="text-sm text-slate-400">{user.email}</p>
                        <p className="text-xs text-slate-500">
                          Skill: {user.cooking_skill_level || 'Not set'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Joined</p>
                        <p className="text-xs text-slate-500">{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800 rounded-xl border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Recent Recipes */}
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Latest Recipes</h3>
                  {recipes.length === 0 ? (
                    <p className="text-slate-500 text-sm">No recipes yet</p>
                  ) : (
                    <div className="space-y-2">
                      {recipes.slice(0, 3).map((recipe) => (
                        <div key={recipe.id} className="flex items-center p-2 bg-slate-700/30 rounded">
                          <ChefHat className="h-4 w-4 text-purple-400 mr-2" />
                          <div className="flex-1">
                            <p className="text-sm text-white">{recipe.title}</p>
                            <p className="text-xs text-slate-400">
                              by {recipe.users?.full_name || 'Unknown'}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {formatDate(recipe.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Meal Plans */}
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Latest Meal Plans</h3>
                  {mealPlans.length === 0 ? (
                    <p className="text-slate-500 text-sm">No meal plans yet</p>
                  ) : (
                    <div className="space-y-2">
                      {mealPlans.slice(0, 3).map((plan) => (
                        <div key={plan.id} className="flex items-center p-2 bg-slate-700/30 rounded">
                          <Activity className="h-4 w-4 text-blue-400 mr-2" />
                          <div className="flex-1">
                            <p className="text-sm text-white">{plan.title}</p>
                            <p className="text-xs text-slate-400">
                              by {plan.users?.full_name || 'Unknown'}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {formatDate(plan.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}