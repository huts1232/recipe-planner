'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, Users, Clock, Star, ArrowRight, Loader2, ChefHat, ShoppingCart, Calendar, BookOpen } from 'lucide-react'

interface StatsData {
  totalRecipes: number
  totalMealPlans: number
  totalGroceryLists: number
  avgCookTime: number
  totalIngredients: number
  avgRating: number
}

interface ActivityItem {
  id: string
  type: 'recipe' | 'meal_plan' | 'grocery_list'
  title: string
  created_at: string
  user_name: string
}

interface ChartData {
  label: string
  value: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statsData, setStatsData] = useState<StatsData>({
    totalRecipes: 0,
    totalMealPlans: 0,
    totalGroceryLists: 0,
    avgCookTime: 0,
    totalIngredients: 0,
    avgRating: 0
  })
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      loadAnalytics()
    }

    checkAuth()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Load stats data
      const [recipesResult, mealPlansResult, groceryListsResult, ingredientsResult, ratingsResult] = await Promise.all([
        supabase.from('recipes').select('id, cook_time').eq('is_public', true),
        supabase.from('meal_plans').select('id'),
        supabase.from('grocery_lists').select('id'),
        supabase.from('ingredients').select('id'),
        supabase.from('recipe_ratings').select('rating')
      ])

      const totalRecipes = recipesResult.data?.length || 0
      const totalMealPlans = mealPlansResult.data?.length || 0
      const totalGroceryLists = groceryListsResult.data?.length || 0
      const totalIngredients = ingredientsResult.data?.length || 0
      
      const cookTimes = recipesResult.data?.map(r => r.cook_time).filter(Boolean) || []
      const avgCookTime = cookTimes.length > 0 ? cookTimes.reduce((a, b) => a + b, 0) / cookTimes.length : 0
      
      const ratings = ratingsResult.data?.map(r => r.rating).filter(Boolean) || []
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

      setStatsData({
        totalRecipes,
        totalMealPlans,
        totalGroceryLists,
        avgCookTime: Math.round(avgCookTime),
        totalIngredients,
        avgRating: Math.round(avgRating * 10) / 10
      })

      // Load chart data - recipes created by month
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      const { data: monthlyRecipes } = await supabase
        .from('recipes')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .eq('is_public', true)

      const monthlyData: { [key: string]: number } = {}
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      monthlyRecipes?.forEach(recipe => {
        const date = new Date(recipe.created_at)
        const monthKey = months[date.getMonth()]
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
      })

      const chartDataArray = Object.entries(monthlyData).map(([label, value]) => ({
        label,
        value
      }))

      setChartData(chartDataArray)

      // Load recent activity
      const { data: recentRecipes } = await supabase
        .from('recipes')
        .select('id, title, created_at, users!inner(full_name)')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentMealPlans } = await supabase
        .from('meal_plans')
        .select('id, title, created_at, users!inner(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentGroceryLists } = await supabase
        .from('grocery_lists')
        .select('id, title, created_at, users!inner(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)

      const activities: ActivityItem[] = [
        ...(recentRecipes?.map(item => ({
          id: item.id,
          type: 'recipe' as const,
          title: item.title,
          created_at: item.created_at,
          user_name: item.users?.full_name || 'Anonymous'
        })) || []),
        ...(recentMealPlans?.map(item => ({
          id: item.id,
          type: 'meal_plan' as const,
          title: item.title,
          created_at: item.created_at,
          user_name: item.users?.full_name || 'Anonymous'
        })) || []),
        ...(recentGroceryLists?.map(item => ({
          id: item.id,
          type: 'grocery_list' as const,
          title: item.title,
          created_at: item.created_at,
          user_name: item.users?.full_name || 'Anonymous'
        })) || [])
      ]

      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setRecentActivity(activities.slice(0, 10))

    } catch (err: any) {
      console.error('Error loading analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'recipe':
        return <BookOpen className="w-4 h-4 text-orange-400" />
      case 'meal_plan':
        return <Calendar className="w-4 h-4 text-blue-400" />
      case 'grocery_list':
        return <ShoppingCart className="w-4 h-4 text-green-400" />
      default:
        return <ChefHat className="w-4 h-4 text-purple-400" />
    }
  }

  const getActivityLink = (item: ActivityItem) => {
    switch (item.type) {
      case 'recipe':
        return `/recipes/${item.id}`
      case 'meal_plan':
        return `/meal-plans/${item.id}`
      case 'grocery_list':
        return `/grocery-lists/${item.id}`
      default:
        return '#'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={() => loadAnalytics()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-slate-400">Track your Recipe Planner platform performance</p>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">{statsData.totalRecipes}</div>
            </div>
            <h3 className="text-slate-300 font-medium mb-1">Total Recipes</h3>
            <p className="text-slate-500 text-sm">Public recipes created</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{statsData.totalMealPlans}</div>
            </div>
            <h3 className="text-slate-300 font-medium mb-1">Meal Plans</h3>
            <p className="text-slate-500 text-sm">Total meal plans created</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{statsData.totalGroceryLists}</div>
            </div>
            <h3 className="text-slate-300 font-medium mb-1">Grocery Lists</h3>
            <p className="text-slate-500 text-sm">Shopping lists generated</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{statsData.avgCookTime}min</div>
            </div>
            <h3 className="text-slate-300 font-medium mb-1">Avg Cook Time</h3>
            <p className="text-slate-500 text-sm">Average recipe cook time</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <ChefHat className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">{statsData.totalIngredients}</div>
            </div>
            <h3 className="text-slate-300 font-medium mb-1">Total Ingredients</h3>
            <p className="text-slate-500 text-sm">Ingredients in database</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <Star className="w-6 h-6 text-pink-400" />
              </div>
              <div className="text-2xl font-bold text-white">{statsData.avgRating}</div>
            </div>
            <h3 className="text-slate-300 font-medium mb-1">Avg Rating</h3>
            <p className="text-slate-500 text-sm">Average recipe rating</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Recipe Creation Trends</h2>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No data available</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  {chartData.map((item, index) => {
                    const maxValue = Math.max(...chartData.map(d => d.value))
                    const barHeight = maxValue > 0 ? (item.value / maxValue) * 160 : 0
                    const x = (index * 50) + 30
                    const y = 180 - barHeight

                    return (
                      <g key={item.label}>
                        <rect
                          x={x}
                          y={y}
                          width={30}
                          height={barHeight}
                          fill="url(#gradient)"
                          rx={2}
                        />
                        <text
                          x={x + 15}
                          y={195}
                          textAnchor="middle"
                          className="text-xs fill-slate-400"
                        >
                          {item.label}
                        </text>
                        <text
                          x={x + 15}
                          y={y - 5}
                          textAnchor="middle"
                          className="text-xs fill-white"
                        >
                          {item.value}
                        </text>
                      </g>
                    )
                  })}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            </div>

            {recentActivity.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {recentActivity.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={getActivityLink(item)}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        by {item.user_name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}