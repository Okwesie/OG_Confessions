"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Heart, TrendingUp, Users, Briefcase, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import ConfessionViewer from "@/components/confession-viewer"

type Category = "Faith" | "Strength" | "Wisdom" | "Gratitude" | "Purpose"

interface CategoryInfo {
  name: Category
  icon: React.ReactNode
  description: string
  count: number
  gradient: string
  borderColor: string
  preview: string
}

const categories: CategoryInfo[] = [
  {
    name: "Faith",
    icon: <Heart className="w-8 h-8" />,
    description: "Affirmations to strengthen your faith and spiritual journey",
    count: 127,
    gradient: "from-blue-500/20 to-indigo-600/20",
    borderColor: "border-blue-500/30 hover:border-blue-400/50",
    preview: "My faith is my anchor in the storms of life...",
  },
  {
    name: "Strength",
    icon: <TrendingUp className="w-8 h-8" />,
    description: "Affirmations for courage and spiritual strength",
    count: 89,
    gradient: "from-purple-500/20 to-violet-600/20",
    borderColor: "border-purple-500/30 hover:border-purple-400/50",
    preview: "I am strong because God is my strength...",
  },
  {
    name: "Wisdom",
    icon: <BookOpen className="w-8 h-8" />,
    description: "Biblical wisdom and guidance for daily living",
    count: 156,
    gradient: "from-amber-500/20 to-yellow-600/20",
    borderColor: "border-amber-500/30 hover:border-amber-400/50",
    preview: "The wisdom of God guides my every decision...",
  },
  {
    name: "Gratitude",
    icon: <Users className="w-8 h-8" />,
    description: "Expressions of thankfulness and praise",
    count: 203,
    gradient: "from-green-500/20 to-emerald-600/20",
    borderColor: "border-green-500/30 hover:border-green-400/50",
    preview: "I am grateful for God's endless blessings in my life...",
  },
  {
    name: "Purpose",
    icon: <Briefcase className="w-8 h-8" />,
    description: "Discovering and living your God-given purpose",
    count: 94,
    gradient: "from-pink-500/20 to-rose-600/20",
    borderColor: "border-pink-500/30 hover:border-pink-400/50",
    preview: "I was created with divine purpose and meaning...",
  },
]

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

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
            Daily spiritual affirmations to strengthen your faith and guide your Christian journey.
          </p>

          <div className="flex items-center justify-center gap-8 mt-8 text-blue-300/60">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">669</div>
              <div className="text-sm">Total Affirmations</div>
            </div>
            <div className="w-px h-12 bg-blue-500/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">5</div>
              <div className="text-sm">Categories</div>
            </div>
            <div className="w-px h-12 bg-blue-500/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Daily</div>
              <div className="text-sm">Updates</div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
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
                    <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm">{category.count}</Badge>
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
                    <span className="text-blue-300/60 text-sm">Latest updates daily</span>
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
              <span>Updated every 24 hours</span>
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
