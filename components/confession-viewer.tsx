"use client"

import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Heart,
  Share2,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  RefreshCw,
  List,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Gauge,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Confession {
  id: string
  text: string
  category: string
  timestamp: string
  bible_verse?: string
  tags?: string[]
  isFavorited?: boolean
}

interface ConfessionSection {
  text: string
  words: string[]
  estimatedReadTime: number // in seconds
}

const categoryColors: Record<string, string> = {
  Faith: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Strength: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Wisdom: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Gratitude: "bg-green-500/20 text-green-300 border-green-500/30",
  Purpose: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Hope: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Love: "bg-red-500/20 text-red-300 border-red-500/30",
  Peace: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  Joy: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Healing: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Prosperity: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Protection: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  Guidance: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Forgiveness: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  Victory: "bg-orange-500/20 text-orange-300 border-orange-500/30",
}

const playbackSpeeds = {
  "0.5": { label: "0.5x", multiplier: 0.5, description: "Very slow" },
  "0.75": { label: "0.75x", multiplier: 0.75, description: "Slow" },
  "1": { label: "1x", multiplier: 1, description: "Normal" },
  "1.25": { label: "1.25x", multiplier: 1.25, description: "Slightly fast" },
  "1.5": { label: "1.5x", multiplier: 1.5, description: "Fast" },
  "2": { label: "2x", multiplier: 2, description: "Very fast" },
}

const baseWordsPerSecond = 2.5 // Base reading speed

interface ConfessionViewerProps {
  category: string
  onBack: () => void
}

export default function ConfessionViewer({ category, onBack }: ConfessionViewerProps) {
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [currentConfessionIndex, setCurrentConfessionIndex] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)
  const [readingProgress, setReadingProgress] = useState(0)
  const [confessionSections, setConfessionSections] = useState<ConfessionSection[]>([])
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<keyof typeof playbackSpeeds>("1")
  const [showEndScreen, setShowEndScreen] = useState(false)
  const [showListView, setShowListView] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(true)

  // NEW: Ready/Go countdown states
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownText, setCountdownText] = useState("")
  const [canPause, setCanPause] = useState(false)

  // Load confessions from API
  useEffect(() => {
    const loadConfessions = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/affirmations/${category}`)
        const data = await response.json()
        if (data.success && data.affirmations) {
          setConfessions(data.affirmations)
          console.log(`Loaded ${data.affirmations.length} confessions for ${category}`)
        } else {
          console.warn("No affirmations found or API error:", data)
          setConfessions([])
        }
      } catch (error) {
        console.error("Failed to load confessions:", error)
        setConfessions([])
      } finally {
        setLoading(false)
      }
    }

    loadConfessions()
  }, [category])

  // Break down confession into sections
  const breakIntoSections = (text: string): ConfessionSection[] => {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const sections: ConfessionSection[] = []

    const maxSentencesPerSection = text.length > 300 ? 2 : text.length > 150 ? 3 : 5

    for (let i = 0; i < sentences.length; i += maxSentencesPerSection) {
      const sectionSentences = sentences.slice(i, i + maxSentencesPerSection)
      const sectionText = sectionSentences.join(". ").trim() + "."
      const words = sectionText.split(" ")
      const estimatedReadTime = words.length / (baseWordsPerSecond * playbackSpeeds[playbackSpeed].multiplier)

      sections.push({
        text: sectionText,
        words,
        estimatedReadTime,
      })
    }

    return sections.length > 0
      ? sections
      : [
          {
            text: text,
            words: text.split(" "),
            estimatedReadTime: text.split(" ").length / (baseWordsPerSecond * playbackSpeeds[playbackSpeed].multiplier),
          },
        ]
  }

  // Update sections when confession or speed changes
  useEffect(() => {
    if (confessions[currentConfessionIndex]) {
      const sections = breakIntoSections(confessions[currentConfessionIndex].text)
      setConfessionSections(sections)
      setCurrentSection(0)
      setReadingProgress(0)
      setShowEndScreen(false)
    }
  }, [currentConfessionIndex, confessions, playbackSpeed])

  // Track analytics
  const trackEvent = async (eventType: string) => {
    if (confessions[currentConfessionIndex]) {
      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            affirmation_id: confessions[currentConfessionIndex].id,
            event_type: eventType,
            user_session: "anonymous",
          }),
        })
      } catch (error) {
        console.error("Failed to track analytics:", error)
      }
    }
  }

  // NEW: Ready/Go countdown function
  const startCountdown = () => {
    setShowCountdown(true)
    setCanPause(true)

    // Show "Ready" for 1 second
    setCountdownText("Ready")

    // Use setTimeout instead of async/await for more reliable UI updates
    setTimeout(() => {
      // Check if user paused during countdown
      if (!canPause) return

      // Show "Go" for 0.5 seconds
      setCountdownText("Go")

      // After 0.5 seconds, start playing
      setTimeout(() => {
        // Check if user paused during countdown
        if (!canPause) return

        // Start playing immediately
        setShowCountdown(false)
        setIsAutoPlaying(true)
        trackEvent("view")
      }, 500)
    }, 1000)
  }

  // Auto-play functionality with speed control
  useEffect(() => {
    if (!isAutoPlaying || !confessionSections[currentSection] || showCountdown) return

    const currentSectionData = confessionSections[currentSection]
    const speed = baseWordsPerSecond * playbackSpeeds[playbackSpeed].multiplier
    const totalWords = currentSectionData.words.length
    const intervalTime = 100

    const interval = setInterval(() => {
      setReadingProgress((prev) => {
        const increment = ((speed * intervalTime) / 1000 / totalWords) * 100
        const newProgress = prev + increment

        if (newProgress >= 100) {
          if (currentSection < confessionSections.length - 1) {
            console.log(`✅ Section ${currentSection + 1} complete, auto-advancing to section ${currentSection + 2}`)
            setCurrentSection(currentSection + 1)
            setReadingProgress(0)
            return 0
          } else {
            console.log(`🎉 All sections complete for confession!`)
            setIsAutoPlaying(false)
            setShowEndScreen(true)
            trackEvent("complete")
            return 100
          }
        }
        return newProgress
      })
    }, intervalTime)

    return () => clearInterval(interval)
  }, [isAutoPlaying, currentSection, confessionSections, playbackSpeed, showCountdown])

  const currentConfession = confessions[currentConfessionIndex]
  const currentSectionData = confessionSections[currentSection]
  const words = currentSectionData?.words || []
  const wordsToShow = Math.floor((readingProgress / 100) * words.length)

  const navigateSection = (direction: "prev" | "next") => {
    if (direction === "prev" && currentSection > 0) {
      setCurrentSection(currentSection - 1)
      setReadingProgress(0)
      setIsAutoPlaying(false)
      setShowEndScreen(false)
    } else if (direction === "next" && currentSection < confessionSections.length - 1) {
      setCurrentSection(currentSection + 1)
      setReadingProgress(0)
      setIsAutoPlaying(false)
      setShowEndScreen(false)
    }
  }

  const navigateConfession = (direction: "prev" | "next") => {
    if (direction === "prev" && currentConfessionIndex > 0) {
      setCurrentConfessionIndex(currentConfessionIndex - 1)
    } else if (direction === "next" && currentConfessionIndex < confessions.length - 1) {
      setCurrentConfessionIndex(currentConfessionIndex + 1)
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

  const replaySection = () => {
    setCurrentSection(0)
    setReadingProgress(0)
    setShowEndScreen(false)
    startCountdown() // Use countdown for replay too
  }

  const selectConfession = (index: number) => {
    setCurrentConfessionIndex(index)
    setShowListView(false)
    // Start countdown when confession is selected
    startCountdown()
  }

  // Pause during countdown
  const pauseCountdown = () => {
    setCanPause(false)
    setShowCountdown(false)
    setIsAutoPlaying(false)
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
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-2xl font-bold">OG</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            No {category} Affirmations
          </h2>
          <p className="text-blue-200/60 mb-6">
            There are no {category.toLowerCase()} affirmations available at the moment. Check back later for new
            content.
          </p>
          <Button onClick={onBack} className="w-full bg-blue-500 hover:bg-blue-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Categories
          </Button>
        </div>
      </div>
    )
  }

  // List View
  if (showListView) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-800/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        </div>

        <div className="relative z-10 flex flex-col h-screen">
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
            <Badge className={cn("border", categoryColors[category] || categoryColors.Faith)}>
              {confessions.length} Available
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {confessions.map((confession, index) => {
                const sections = breakIntoSections(confession.text)
                const estimatedTime = Math.ceil(
                  sections.reduce((total, section) => total + section.estimatedReadTime, 0),
                )

                return (
                  <Card
                    key={confession.id}
                    className={cn(
                      "p-6 border-2 bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.01]",
                      categoryColors[confession.category]?.split(" ")[0] || "bg-blue-500/20",
                      categoryColors[confession.category]?.split(" ")[2] || "border-blue-500/30",
                    )}
                    onClick={() => selectConfession(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                          categoryColors[confession.category]?.split(" ")[0] || "bg-blue-500/20",
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-2 text-lg text-white mb-2">{confession.text}</p>

                        {confession.bible_verse && (
                          <p className="text-sm text-blue-200 italic mb-2">"{confession.bible_verse}"</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-blue-300/60">
                            <span>{sections.length} sections</span>
                            <span>~{estimatedTime}s read</span>
                            <span>{new Date(confession.timestamp).toLocaleDateString()}</span>
                          </div>
                          {confession.isFavorited && <Heart className="w-4 h-4 text-red-400 fill-current" />}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Reading View
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-800/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-20 right-6 z-30 bg-black/90 border border-blue-500/30 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-3 text-blue-400">Playback Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-blue-200 block mb-1">Playback Speed</label>
              <Select
                value={playbackSpeed}
                onValueChange={(value: keyof typeof playbackSpeeds) => setPlaybackSpeed(value)}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(playbackSpeeds).map(([key, speed]) => (
                    <SelectItem key={key} value={key}>
                      {speed.label} - {speed.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Ready/Go Countdown Overlay */}
      {showCountdown && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-8 animate-pulse">
              <span className="text-6xl font-bold">{countdownText === "Ready" ? "🎯" : "🚀"}</span>
            </div>
            <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              {countdownText}
            </h2>
            <p className="text-blue-200/60 mb-8">
              {countdownText === "Ready" ? "Preparing your spiritual journey..." : "Starting now..."}
            </p>
            <Button onClick={pauseCountdown} className="bg-red-500/20 border border-red-500/30 hover:bg-red-500/30">
              <Pause className="w-4 h-4 mr-2" />
              Wait, I'm not ready
            </Button>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-500/20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowListView(true)}
              className="w-10 h-10 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
            >
              <List className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">OG</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {category} #{currentConfessionIndex + 1}
              </h1>
              <p className="text-xs text-blue-300/60">
                Section {currentSection + 1} of {confessionSections.length} • {playbackSpeeds[playbackSpeed].label}{" "}
                speed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="w-10 h-10 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
            >
              <Gauge className="w-5 h-5" />
            </Button>
            <Badge className={cn("border", categoryColors[currentConfession.category] || categoryColors.Faith)}>
              {currentConfession.category}
            </Badge>
          </div>
        </div>

        {/* Navigation arrows for sections */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateSection("prev")}
            disabled={currentSection === 0}
            className="w-12 h-12 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
          >
            <ChevronUp className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateSection("next")}
            disabled={currentSection === confessionSections.length - 1}
            className="w-12 h-12 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
        </div>

        {/* Confession navigation */}
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateConfession("prev")}
            disabled={currentConfessionIndex === 0}
            className="w-12 h-12 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30"
          >
            <SkipBack className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateConfession("next")}
            disabled={currentConfessionIndex === confessions.length - 1}
            className="w-12 h-12 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-8">
          {showEndScreen ? (
            <div className="max-w-lg mx-auto text-center space-y-8 animate-fadeIn">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-3xl font-bold">OG</span>
              </div>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Confession Complete
              </h2>

              <p className="text-blue-200/60">
                You've completed all {confessionSections.length} sections of this {category.toLowerCase()} affirmation.
              </p>

              <div className="grid grid-cols-1 gap-4 pt-4">
                <Button
                  onClick={replaySection}
                  className="bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 h-16 text-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Replay This Confession
                </Button>

                {currentConfessionIndex < confessions.length - 1 && (
                  <Button
                    onClick={() => navigateConfession("next")}
                    className="bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 h-16 text-lg"
                  >
                    <SkipForward className="w-5 h-5 mr-2" />
                    Next {category} Confession
                  </Button>
                )}

                <Button
                  onClick={() => setShowListView(true)}
                  className="bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 h-16 text-lg"
                >
                  <List className="w-5 h-5 mr-2" />
                  Browse All {category}
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

              {currentConfession.bible_verse && (
                <p className="text-lg text-blue-200 italic mt-8 opacity-60">"{currentConfession.bible_verse}"</p>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-blue-500/20">
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
              disabled={showEndScreen || showCountdown}
            >
              {isAutoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
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
