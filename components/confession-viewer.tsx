"use client"

import { Card } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Heart, Share2, ChevronUp, ChevronDown, ArrowLeft, RefreshCw, List, Home } from "lucide-react"
import { cn } from "@/lib/utils"

type Category = "Faith" | "Strength" | "Wisdom" | "Gratitude" | "Purpose"

interface Confession {
  id: string
  text: string
  category: Category
  timestamp: string
  isFavorited?: boolean
}

const categoryColors = {
  Faith: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Strength: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Wisdom: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Gratitude: "bg-green-500/20 text-green-300 border-green-500/30",
  Purpose: "bg-pink-500/20 text-pink-300 border-pink-500/30",
}

interface ConfessionViewerProps {
  category: Category
  onBack: () => void
}

export default function ConfessionViewer({ category, onBack }: ConfessionViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [readingProgress, setReadingProgress] = useState(0)
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [showEndScreen, setShowEndScreen] = useState(false)
  const [showListView, setShowListView] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load confessions from API
  useEffect(() => {
    const loadConfessions = async () => {
      try {
        const response = await fetch(`/api/affirmations/${category}`)
        const data = await response.json()
        if (data.success) {
          setConfessions(data.affirmations)
        }
      } catch (error) {
        console.error("Failed to load confessions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadConfessions()
  }, [category])

  // Track analytics
  const trackEvent = async (eventType: string) => {
    if (confessions[currentIndex]) {
      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            affirmation_id: confessions[currentIndex].id,
            event_type: eventType,
            user_session: "anonymous", // Generate session ID in production
          }),
        })
      } catch (error) {
        console.error("Failed to track analytics:", error)
      }
    }
  }

  // Track view when confession is loaded
  useEffect(() => {
    if (confessions[currentIndex] && readingProgress === 0) {
      trackEvent("view")
    }
  }, [currentIndex, confessions])

  const currentConfession = confessions[currentIndex]
  const words = currentConfession?.text.split(" ") || []
  const wordsToShow = Math.floor((readingProgress / 100) * words.length)

  useEffect(() => {
    if (!isAutoPlaying || !currentConfession) return

    const interval = setInterval(() => {
      setReadingProgress((prev) => {
        if (prev >= 100) {
          // Show end screen instead of automatically moving to next
          setShowEndScreen(true)
          setIsAutoPlaying(false)
          trackEvent("complete")
          return 100
        }
        return prev + 0.5 // Adjust speed here
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isAutoPlaying, currentConfession])

  const handleProgressChange = (value: number[]) => {
    setReadingProgress(value[0])
    setIsAutoPlaying(false)
    if (value[0] >= 100) {
      setShowEndScreen(true)
      trackEvent("complete")
    } else {
      setShowEndScreen(false)
    }
  }

  const toggleFavorite = () => {
    setConfessions((prev) =>
      prev.map((confession) =>
        confession.id === currentConfession.id ? { ...confession, isFavorited: !confession.isFavorited } : confession,
      ),
    )
    trackEvent(currentConfession.isFavorited ? "unfavorite" : "favorite")
  }

  const shareConfession = async () => {
    trackEvent("share")
    if (navigator.share) {
      await navigator.share({
        title: "OG_Confessions - Spiritual Affirmation",
        text: currentConfession.text,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(currentConfession.text)
    }
  }

  const navigateConfession = (direction: "up" | "down") => {
    if (direction === "up" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setReadingProgress(0)
      setIsAutoPlaying(true)
      setShowEndScreen(false)
    } else if (direction === "down" && currentIndex < confessions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setReadingProgress(0)
      setIsAutoPlaying(true)
      setShowEndScreen(false)
    }
  }

  const replayConfession = () => {
    setReadingProgress(0)
    setIsAutoPlaying(true)
    setShowEndScreen(false)
    trackEvent("replay")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-blue-200/60">Loading affirmations...</p>
        </div>
      </div>
    )
  }

  if (confessions.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-blue-200/60 mb-4">No affirmations found in this category.</p>
          <Button onClick={onBack} className="bg-blue-500 hover:bg-blue-600">
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  if (showListView) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-800/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-screen">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-500/20">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowListView(false)}
                className="w-10 h-10 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold">OG</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {category} Affirmations
              </h1>
            </div>
            <Badge className={cn("border", categoryColors[category])}>{confessions.length} Affirmations</Badge>
          </div>

          {/* List of confessions */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {confessions.map((confession, index) => (
                <Card
                  key={confession.id}
                  className={cn(
                    "p-6 border-2 bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.01]",
                    categoryColors[confession.category].split(" ")[0],
                    categoryColors[confession.category].split(" ")[2],
                  )}
                  onClick={() => {
                    setCurrentIndex(index)
                    setReadingProgress(0)
                    setIsAutoPlaying(true)
                    setShowEndScreen(false)
                    setShowListView(false)
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        categoryColors[confession.category].split(" ")[0],
                      )}
                    >
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="line-clamp-2 text-lg">{confession.text}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-blue-300/60">
                          {new Date(confession.timestamp).toLocaleDateString()}
                        </span>
                        {confession.isFavorited && <Heart className="w-4 h-4 text-red-400 fill-current" />}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-blue-500/20 flex justify-center">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-800/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-500/20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">OG</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {category} Affirmations
            </h1>
          </div>
          <Badge className={cn("border", categoryColors[currentConfession.category])}>
            {currentConfession.category}
          </Badge>
        </div>

        {/* Navigation arrows */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateConfession("up")}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
          >
            <ChevronUp className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateConfession("down")}
            disabled={currentIndex === confessions.length - 1}
            className="w-12 h-12 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
        </div>

        {/* Confession content */}
        <div className="flex-1 flex items-center justify-center p-8">
          {showEndScreen ? (
            <div className="max-w-lg mx-auto text-center space-y-8 animate-fadeIn">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-3xl font-bold">OG</span>
              </div>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Affirmation Complete
              </h2>

              <p className="text-xl text-blue-200/80">What would you like to do next?</p>

              <div className="grid grid-cols-1 gap-4 pt-4">
                <Button
                  onClick={replayConfession}
                  className="bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 h-16 text-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Replay This Affirmation
                </Button>

                <Button
                  onClick={() => setShowListView(true)}
                  className="bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 h-16 text-lg"
                >
                  <List className="w-5 h-5 mr-2" />
                  Browse All {category} Affirmations
                </Button>

                <Button onClick={onBack} className="bg-black/40 border border-white/20 hover:bg-white/10 h-16 text-lg">
                  <Home className="w-5 h-5 mr-2" />
                  Return to Home
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-2xl md:text-4xl lg:text-5xl leading-relaxed font-light tracking-wide">
                {words.slice(0, Math.max(1, wordsToShow)).map((word, index) => (
                  <span
                    key={index}
                    className={cn(
                      "transition-all duration-300",
                      index < wordsToShow - 3 ? "text-white/60" : index < wordsToShow ? "text-white" : "text-white/20",
                    )}
                  >
                    {word}{" "}
                  </span>
                ))}
                {wordsToShow < words.length && (
                  <span className="text-white/20">{words.slice(wordsToShow).join(" ")}</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4 border-t border-blue-500/20">
          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={readingProgress} className="h-2 bg-blue-900/30" onValueChange={handleProgressChange} />
            <div className="flex justify-between text-sm text-blue-300">
              <span>{Math.floor(readingProgress)}%</span>
              <span>
                {currentIndex + 1} / {confessions.length}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className={cn(
                "w-12 h-12 rounded-full border transition-all",
                currentConfession.isFavorited
                  ? "bg-red-500/20 border-red-500/30 text-red-400"
                  : "bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30",
              )}
            >
              <Heart className={cn("w-5 h-5", currentConfession.isFavorited && "fill-current")} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30"
              disabled={showEndScreen}
            >
              {isAutoPlaying ? (
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-white rounded-full" />
                  <div className="w-1 h-4 bg-white rounded-full" />
                </div>
              ) : (
                <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={shareConfession}
              className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
