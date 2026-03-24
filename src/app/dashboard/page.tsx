'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Calendar, ChefHat, ShoppingCart, Settings, Plus, Clock, Users, TrendingUp, X, Save, BookOpen, Star } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string | null
  dietary_preferences: string[] | null
  cooking_skill_level: string | null
  default_servings: number | null
  calorie_goal: number | null
}

interface Recipe {
  id: string
  title: string
  description: string
  prep_time: number
  cook_time: number
  servings: number
  difficulty_level: string
  cuisine_type: string
  dietary_tags: string[]
  image_url: string | null
  created_by: string
  is_public: boolean
  created_at: string
}

interface MealPlan {
  id: string
  title: string
  week_start_date: string
  is_active: boolean
  created_at: string
}

interface GroceryList {
  id: string
  title: string
  store_name: string | null
  estimated_total: number | null
  is_completed: boolean
  created_at: string
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
  </div>
)

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end p-4 pb-0">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([])
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [showMealPlanModal, setShowMealPlanModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stats, setStats] = useState({
    totalRecipes: 0,
    activeMealPlans: 0,
    pendingGroceryLists: 0,
    weeklyMeals: 0
  })
  
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    prep_time: 15,
    cook_time: 30,
    servings: 4,
    difficulty_level: 'easy',
    cuisine_type: 'american',
    dietary_tags: [] as string[],
    instructions: ''
  })

  const [newMealPlan, setNewMealPlan] = useState({
    title: '',
    week_start_date: new Date().toISOString().split('T')[0]
  })

  const router = useRouter()
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        
        if (error || !authUser) {
          router.push('/login')
          return
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (userError) {
          console.error('Error fetching user data:', userError)
        } else {
          setUser(userData)
        }

        await Promise.all([
          loadRecipes(authUser.id),
          loadMealPlans(authUser.id),
          loadGroceryLists(authUser.id),
          loadStats(authUser.id)
        ])

      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  const loadRecipes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .or(`created_by.eq.${userId},is_public.eq.true`)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setRecipes(data || [])
    } catch (error) {
      console.error('Error loading recipes:', error)
    }
  }

  const loadMealPlans = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setMealPlans(data || [])
    } catch (error) {
      console.error('Error loading meal plans:', error)
    }
  }

  const loadGroceryLists = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setGroceryLists(data || [])
    } catch (error) {
      console.error('Error loading grocery lists:', error)
    }
  }

  const loadStats = async (userId: string) => {
    try {
      const [recipesCount, mealPlansCount, groceryListsCount, weeklyMealsCount] = await Promise.all([
        supabase.from('recipes').select('id', { count: 'exact' }).eq('created_by', userId),
        supabase.from('meal_plans').select('id', { count: 'exact' }).eq('user_id', userId).eq('is_active', true),
        supabase.from('grocery_lists').select('id', { count: 'exact' }).eq('user_id', userId).eq('is_completed', false),
        supabase.from('meal_plan_entries').select('id', { count: 'exact' }).eq('meal_plan_id', mealPlans[0]?.id || '')
      ])

      setStats({
        totalRecipes: recipesCount.count || 0,
        activeMealPlans: mealPlansCount.count || 0,
        pendingGroceryLists: groceryListsCount.count || 0,
        weeklyMeals: weeklyMealsCount.count || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          ...newRecipe,
          created_by: user.id,
          is_public: false
        })
        .select()
        .single()

      if (error) throw error

      setRecipes(prev => [data, ...prev.slice(0, 4)])
      setShowRecipeModal(false)
      setNewRecipe({
        title: '',
        description: '',
        prep_time: 15,
        cook_time: 30,
        servings: 4,
        difficulty_level: 'easy',
        cuisine_type: 'american',
        dietary_tags: [],
        instructions: ''
      })
      await loadStats(user.id)
    } catch (error) {
      console.error('Error creating recipe:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateMealPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          ...newMealPlan,
          user_id: user.id,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      setMealPlans(prev => [data, ...prev.slice(0, 4)])
      setShowMealPlanModal(false)
      setNewMealPlan({
        title: '',
        week_start_date: new Date().toISOString().split('T')[0]
      })
      await loadStats(user.id)
    } catch (error) {
      console.error('Error creating meal plan:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDietaryTagToggle = (tag: string) => {
    setNewRecipe(prev => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter(t => t !== tag)
        : [...prev.dietary_tags, tag]
    }))
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 min-h-screen p-6">
          <div className="flex items-center space-x-2 mb-8">
            <ChefHat className="h-8 w-8 text-purple-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Recipe Planner
            </h1>
          </div>
          
          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center space-x-2 p-3 rounded-lg bg-purple-600 text-white">
              <Calendar className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/meal-plans" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-700 transition-colors">
              <Calendar className="h-5 w-5" />
              <span>Meal Plans</span>
            </Link>
            <Link href="/recipes" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-700 transition-colors">
              <BookOpen className="h-5 w-5" />
              <span>Recipes</span>
            </Link>
            <Link href="/grocery-lists" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-700 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              <span>Grocery Lists</span>
            </Link>
            <Link href="/settings" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-700 transition-colors">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user?.full_name || 'Chef'}! 👋
            </h2>
            <p className="text-slate-400">
              Ready to plan some delicious meals?
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Recipes</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.totalRecipes}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Meal Plans</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.activeMealPlans}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Lists</p>
                  <p className="text-2xl font-bold text-green-400">{stats.pendingGroceryLists}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Weekly Meals</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.weeklyMeals}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowRecipeModal(true)}
                  className="w-full flex items-center space-x-2 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create New Recipe</span>
                </button>
                <button
                  onClick={() => setShowMealPlanModal(true)}
                  className="w-full flex items-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>New Meal Plan</span>
                </button>
                <Link
                  href="/grocery-lists"
                  className="w-full flex items-center space-x-2 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>View Grocery Lists</span>
                </Link>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recipes.slice(0, 3).length > 0 ? (
                  recipes.slice(0, 3).map((recipe) => (
                    <div key={recipe.id} className="flex items-center space-x-3 p-2 hover:bg-slate-700 rounded">
                      <ChefHat className="h-4 w-4 text-purple-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{recipe.title}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(recipe.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Recipes */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recent Recipes</h3>
                <Link href="/recipes" className="text-purple-400 hover:text-purple-300 text-sm">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recipes.length > 0 ? (
                  recipes.map((recipe) => (
                    <Link
                      key={recipe.id}
                      href={`/recipes/${recipe.id}`}
                      className="block p-3 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{recipe.title}</p>
                          <p className="text-sm text-slate-400">
                            {recipe.prep_time + recipe.cook_time} mins • {recipe.servings} servings
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{recipe.difficulty_level}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No recipes yet. Create your first recipe!</p>
                )}
              </div>
            </div>

            {/* Recent Meal Plans */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Meal Plans</h3>
                <Link href="/meal-plans" className="text-blue-400 hover:text-blue-300 text-sm">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {mealPlans.length > 0 ? (
                  mealPlans.map((plan) => (
                    <Link
                      key={plan.id}
                      href={`/meal-plans/${plan.id}`}
                      className="block p-3 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{plan.title}</p>
                          <p className="text-sm text-slate-400">
                            Week of {new Date(plan.week_start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          plan.is_active 
                            ? 'bg-green-600 text-green-100' 
                            : 'bg-slate-600 text-slate-300'
                        }`}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No meal plans yet. Create your first meal plan!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Recipe Modal */}
      <Modal isOpen={showRecipeModal} onClose={() => setShowRecipeModal(false)}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Create New Recipe</h3>
          <form onSubmit={handleCreateRecipe} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipe Title</label>
              <input
                type="text"
                value={newRecipe.title}
                onChange={(e) => setNewRecipe(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={newRecipe.description}
                onChange={(e) => setNewRecipe(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prep Time (minutes)</label>
                <input
                  type="number"
                  value={newRecipe.prep_time}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, prep_time: parseInt(e.target.value) }))}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cook Time (minutes)</label>
                <input
                  type="number"
                  value={newRecipe.cook_time}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, cook_time: parseInt(e.target.value) }))}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Servings</label>
                <input
                  type="number"
                  value={newRecipe.servings}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={newRecipe.difficulty_level}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, difficulty_level: e.target.value }))}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cuisine Type</label>
              <select
                value={newRecipe.cuisine_type}
                onChange={(e) => setNewRecipe(prev => ({ ...prev, cuisine_type: e.target.value }))}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="american">American</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="asian">Asian</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="indian">Indian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dietary Tags</label>
              <div className="flex flex-wrap gap-2">
                {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleDietaryTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      newRecipe.dietary_tags.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instructions</label>
              <textarea
                value={newRecipe.instructions}
                onChange={(e) => setNewRecipe(prev => ({ ...prev, instructions: e.target.value }))}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                placeholder="Step-by-step cooking instructions..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Recipe</span>
                </>
              )}
            </button>
          </form>
        </div>
      </Modal>

      {/* Create Meal Plan Modal */}
      <Modal isOpen={showMealPlanModal} onClose={() => setShowMealPlanModal(false)}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Create New Meal Plan</h3>
          <form onSubmit={handleCreateMealPlan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Meal Plan Title</label>
              <input
                type="text"
                value={newMealPlan.title}
                onChange={(e) => setNewMealPlan(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Week of January 15th"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Week Start Date</label>
              <input
                type="date"
                value={newMealPlan.week_start_date}
                onChange={(e) => setNewMealPlan(prev => ({ ...prev, week_start_date: e.target.value }))}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Meal Plan</span>
                </>
              )}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  )
}