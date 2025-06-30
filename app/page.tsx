"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Heart, TrendingUp, Users, Briefcase, BookOpen, Star, Sun, Shield, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import ConfessionViewer from "@/components/confession-viewer"

interface CategoryInfo {
  name: string
  icon: React.ReactNode
  description: string
  count: number
  gradient: string
  borderColor: string
  preview: string
  last_updated: string
}

const iconMap: Record<string, React.ReactNode> = {
  Heart: <Heart className="w-8 h-8" />,
  TrendingUp: <TrendingUp className="w-8 h-8" />,
  BookOpen: <BookOpen className="w-8 h-8" />,
  Users: <Users className="w-8 h-8" />,
  Briefcase: <Briefcase className="w-8 h-8" />,
  Star: <Star className="w-8 h-8" />,
  Sun: <Sun className="w-8 h-8" />,
  Shield: <Shield className="w-8 h-8" />,
  Compass: <Compass className="w-8 h-8" />,
}

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [stats, setStats] = useState({
    totalAffirmations: 0,
    totalCategories: 0,
    isDaily: "Daily",
  })
  const [loading, setLoading] = useState(true)

  // Load dynamic categories and statistics
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        console.log("🔍 Loading categories and stats...")

        // Fetch dynamic categories with better error handling
        const categoriesResponse = await fetch("/api/categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!categoriesResponse.ok) {
          throw new Error(`HTTP error! status: ${categoriesResponse.status}`)
        }

        const categoriesData = await categoriesResponse.json()
        console.log("📊 Categories response:", categoriesData)

        if (categoriesData.success && categoriesData.categories && Array.isArray(categoriesData.categories)) {
          const formattedCategories = categoriesData.categories.map((cat: any) => ({
            name: cat.name || "Unknown",
            icon: iconMap[cat.icon] || <Heart className="w-8 h-8" />,
            description: cat.description || `Spiritual affirmations about ${cat.name?.toLowerCase() || "faith"}`,
            count: cat.count || 0,
            gradient: cat.gradient || "from-blue-500/20 to-purple-600/20",
            borderColor: cat.borderColor || "border-blue-500/30 hover:border-blue-400/50",
            preview: cat.preview || "Spiritual guidance and affirmations...",
            last_updated: cat.last_updated || new Date().toISOString(),
          }))

          setCategories(formattedCategories)
          setStats({
            totalAffirmations: categoriesData.total_affirmations || 0,
            totalCategories: categoriesData.total_categories || formattedCategories.length,
            isDaily: "Daily",
          })

          console.log(`✅ Loaded ${formattedCategories.length} dynamic categories`)
        } else {
          console.warn("⚠️ Invalid categories data structure:", categoriesData)
          setCategories([])
          setStats({
            totalAffirmations: 0,
            totalCategories: 0,
            isDaily: "Daily",
          })
        }
      } catch (error) {
        console.error("❌ Failed to load categories:", error)
        setCategories([])
        setStats({
          totalAffirmations: 0,
          totalCategories: 0,
          isDaily: "Daily",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (selectedCategory) {
    return <ConfessionViewer category={selectedCategory} onBack={() => setSelectedCategory(null)} />
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-purple-800/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.15),transparent_50%)]" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-3/4 w-24 h-24 bg-indigo-500/12 rounded-full blur-xl animate-pulse delay-500" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center pt-16 pb-12 px-6">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-xl font-bold">OG</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
              OG_Confessions
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-blue-200/80 max-w-3xl mx-auto leading-relaxed">
            Keep saying it, Don't stop talking it
          </p>

          <div className="flex items-center justify-center gap-8 mt-8 text-blue-300/60">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalAffirmations}</div>
              <div className="text-sm">Total Affirmations</div>
            </div>
            <div className="w-px h-12 bg-blue-500/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalCategories}</div>
              <div className="text-sm">Categories</div>
            </div>
            <div className="w-px h-12 bg-blue-500/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.isDaily}</div>
              <div className="text-sm">Updates</div>
            </div>
          </div>
        </div>

        {/* Categories Grids */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <span className="text-2xl font-bold">OG</span>
              </div>
              <p className="text-blue-200/60">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">OG</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                No Categories Available
              </h2>
              <p className="text-blue-200/60 mb-6">
                No affirmations have been synced yet. Categories will appear automatically when content is added.
              </p>
              <Button onClick={() => window.open("/admin", "_blank")} className="bg-blue-500 hover:bg-blue-600">
                Open Admin Dashboard
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <Card
                  key={category.name}
                  className={cn(
                    "group relative overflow-hidden border-2 bg-gradient-to-br cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl",
                    category.gradient,
                    category.borderColor,
                    "bg-black/40 backdrop-blur-sm",
                  )}
                  onClick={() => setSelectedCategory(category.name)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards",
                  }}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                  <div className="p-8 relative z-10">
                    {/* Icon and badge */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                        {category.icon}
                      </div>
                      <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                        {category.count}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
                        {category.name}
                      </h3>

                      <p className="text-blue-200/70 leading-relaxed">{category.description}</p>

                      {/* Preview */}
                      <div className="p-4 rounded-xl bg-black/30 border border-white/10 backdrop-blur-sm">
                        <p className="text-sm text-blue-100/80 italic line-clamp-2">"{category.preview}"</p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-between mt-8">
                      <span className="text-blue-300/60 text-sm">
                        {category.last_updated
                          ? `Updated ${new Date(category.last_updated).toLocaleDateString()}`
                          : "Latest updates daily"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group-hover:bg-white/10 group-hover:text-white transition-all"
                      >
                        Explore
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pb-16 px-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-blue-300/60 mb-6">
              All affirmations are sourced from various platforms including Telegram CEYC daily affirmations. New
              spiritual guidance added daily.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-blue-400/50">
              <span>Powered by CEYC Daily Affirmations</span>
              <div className="w-1 h-1 bg-blue-500 rounded-full" />
              <span>Categories update automatically</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default HomePage
