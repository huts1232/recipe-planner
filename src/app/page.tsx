'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      title: "Smart Meal Planning",
      description: "Create weekly meal plans that fit your dietary preferences, cooking skills, and schedule. Our AI suggests recipes based on your taste.",
      icon: "🍽️"
    },
    {
      title: "Automated Grocery Lists",
      description: "Automatically generate shopping lists from your meal plans. Organized by store aisle with quantity calculations and cost estimates.",
      icon: "🛒"
    },
    {
      title: "Recipe Discovery",
      description: "Browse thousands of recipes with detailed nutrition info, cooking instructions, and difficulty ratings. Save favorites to your collection.",
      icon: "👨‍🍳"
    },
    {
      title: "Pantry Management",
      description: "Track ingredients in your pantry with expiration dates and quantity tracking. Get alerts before items expire and recipe suggestions.",
      icon: "🏠"
    },
    {
      title: "Nutrition Tracking",
      description: "Monitor calories, macros, and micronutrients automatically. Set goals and track progress with detailed analytics and insights.",
      icon: "📊"
    },
    {
      title: "Community Recipes",
      description: "Share your favorite recipes with the community. Rate and review recipes from other home cooks to discover new favorites.",
      icon: "❤️"
    }
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for individuals getting started",
      features: [
        "Up to 5 recipes",
        "Basic meal planning",
        "Simple grocery lists",
        "Community access"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$9",
      period: "/month",
      description: "Everything you need for meal planning success",
      features: [
        "Unlimited recipes",
        "Advanced meal planning",
        "Smart grocery lists",
        "Pantry management",
        "Nutrition tracking",
        "Recipe collections",
        "Priority support"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Admin dashboard",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantees"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Working Parent",
      content: "Recipe Planner has transformed how our family eats. I save 3 hours every week on meal planning and grocery shopping. The kids actually eat the vegetables now!",
      initials: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Fitness Coach",
      content: "The nutrition tracking is incredibly detailed. I use it for all my clients' meal plans. The macro calculations are spot-on and save me tons of time.",
      initials: "MR"
    },
    {
      name: "Emma Thompson",
      role: "Food Blogger",
      content: "I've tried every meal planning app out there. Recipe Planner is the only one that handles complex dietary restrictions properly. Game changer for my gluten-free family.",
      initials: "ET"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-white">
                Recipe Planner
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/recipes" className="text-gray-300 hover:text-white transition-colors">
                Recipes
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-3">
                <Link href="#features" className="text-gray-300 hover:text-white">Features</Link>
                <Link href="#pricing" className="text-gray-300 hover:text-white">Pricing</Link>
                <Link href="/recipes" className="text-gray-300 hover:text-white">Recipes</Link>
                <Link href="/login" className="text-gray-300 hover:text-white">Login</Link>
                <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-center">
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
            Plan Meals,<br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Shop Smart,
            </span><br />
            Cook Confidently
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12">
            The complete solution for meal planning, grocery shopping, and nutrition tracking. 
            Transform your kitchen routine with intelligent planning tools that save time and reduce food waste.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/signup" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/recipes" 
              className="border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              Browse Recipes
            </Link>
          </div>

          <p className="text-gray-500 text-sm">
            <span className="font-semibold text-purple-400">1,000+</span> teams trust Recipe Planner to simplify their meal planning
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              Everything you need for meal success
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive tools that work together to make meal planning, shopping, and cooking effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`rounded-2xl p-8 relative ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-purple-600/20 to-blue-600/20 border-2 border-purple-500' 
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <svg className="h-5 w-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              Loved by home cooks everywhere
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              See how Recipe Planner is transforming kitchens and saving time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.initials}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl p-12 border border-purple-500/30">
          <h2 className="text-4xl font-black text-white mb-6">
            Ready to transform your kitchen?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks who have simplified their meal planning with Recipe Planner. 
            Start your free trial today.
          </p>
          <Link 
            href="/signup" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold text-white mb-4">Recipe Planner</h3>
              <p className="text-gray-400 mb-4">
                The complete solution for meal planning, grocery shopping, and nutrition tracking.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/recipes" className="text-gray-400 hover:text-white transition-colors">Recipes</Link></li>
                <li><Link href="/meal-plans" className="text-gray-400 hover:text-white transition-colors">Meal Plans</Link></li>
                <li><Link href="/grocery-lists" className="text-gray-400 hover:text-white transition-colors">Grocery Lists</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
                <li><Link href="/feedback" className="text-gray-400 hover:text-white transition-colors">Feedback</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Recipe Planner. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}