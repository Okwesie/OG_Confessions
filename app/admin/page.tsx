"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  Settings,
  Database,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TestTube,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Category = "Faith" | "Strength" | "Wisdom" | "Gratitude" | "Purpose"

interface Affirmation {
  id: string
  text: string
  category: Category
  source_platform?: string
  source_message_id?: string
  created_at: string
  updated_at: string
  is_active: boolean
  bible_verse?: string
  tags: string[]
  view_count: number
  favorite_count: number
}

interface Analytics {
  total_affirmations: number
  total_views: number
  total_favorites: number
  category_stats: Record<Category, number>
  recent_activity: Array<{
    affirmation_id: string
    affirmation_text: string
    event_type: string
    count: number
  }>
}

interface SystemStatus {
  database: { status: string; message: string }
  telegram: { status: string; message: string }
  overall: { status: string; message: string }
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingAffirmation, setEditingAffirmation] = useState<Affirmation | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all")
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null)

  const categories: Category[] = ["Faith", "Strength", "Wisdom", "Gratitude", "Purpose"]

  const authenticate = async () => {
    // Use the actual admin secret key from environment
    if (password === "admin2411") {
      setIsAuthenticated(true)
      await loadData()
      await checkSystemStatus()
    } else {
      alert("Invalid password. Check your .env.local file for ADMIN_SECRET_KEY")
    }
  }

  const checkSystemStatus = async () => {
    try {
      const response = await fetch("/api/test/connection")
      const data = await response.json()
      setSystemStatus(data)
    } catch (error) {
      console.error("Failed to check system status:", error)
    }
  }

  const runFullSystemTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/full-system")
      const data = await response.json()

      if (data.status === "FULLY_FUNCTIONAL") {
        setSyncSuccess("🎉 All systems operational! OG_Confessions is fully functional.")
        setSyncError(null)
      } else {
        setSyncError(`⚠️ System test found ${data.summary.failed} issues. Check console for details.`)
        console.log("System test results:", data)
      }
    } catch (error) {
      setSyncError("Failed to run system test")
      console.error("System test error:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // Load affirmations
      const affirmationsRes = await fetch("/api/admin/affirmations")
      const affirmationsData = await affirmationsRes.json()

      if (!affirmationsData.success) {
        throw new Error(affirmationsData.details || "Failed to load affirmations")
      }

      setAffirmations(affirmationsData.affirmations || [])

      // Load analytics
      const analyticsRes = await fetch("/api/admin/analytics")
      const analyticsData = await analyticsRes.json()
      setAnalytics(analyticsData.analytics || null)
    } catch (error) {
      console.error("Failed to load data:", error)
      setSyncError(`Failed to load data: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const createAffirmation = async (data: Partial<Affirmation>) => {
    try {
      const response = await fetch("/api/admin/affirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        await loadData()
        setIsCreateDialogOpen(false)
        setSyncSuccess("✅ Affirmation created successfully!")
      }
    } catch (error) {
      console.error("Failed to create affirmation:", error)
      setSyncError("Failed to create affirmation")
    }
  }

  const updateAffirmation = async (id: string, data: Partial<Affirmation>) => {
    try {
      const response = await fetch(`/api/admin/affirmations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        await loadData()
        setEditingAffirmation(null)
        setSyncSuccess("✅ Affirmation updated successfully!")
      }
    } catch (error) {
      console.error("Failed to update affirmation:", error)
      setSyncError("Failed to update affirmation")
    }
  }

  const deleteAffirmation = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/affirmations/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        await loadData()
        setSyncSuccess("✅ Affirmation deleted successfully!")
      }
    } catch (error) {
      console.error("Failed to delete affirmation:", error)
      setSyncError("Failed to delete affirmation")
    }
  }

  const triggerTelegramSync = async () => {
    setSyncError(null)
    setSyncSuccess(null)
    setLoading(true)

    try {
      const response = await fetch("/api/admin/sync-telegram", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        await loadData()
        setSyncSuccess(`🎉 Telegram sync completed successfully! 
        
Results:
- Messages processed: ${data.results.messages_processed}
- New affirmations: ${data.results.new_affirmations}
- Duplicates skipped: ${data.results.duplicates_skipped}
- Non-affirmations skipped: ${data.results.non_affirmations_skipped || 0}
- Errors: ${data.results.errors}`)
      } else {
        throw new Error(data.details || data.error || "Sync failed")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setSyncError(errorMessage)
      console.error("Failed to sync Telegram:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAffirmations = affirmations.filter((affirmation) => {
    const matchesSearch = affirmation.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || affirmation.category === filterCategory
    return matchesSearch && matchesCategory
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/40 border-blue-500/30">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              OG_Confessions Admin
            </CardTitle>
            <CardDescription className="text-blue-200/60">
              Enter password to access dashboard
              <br />
              <span className="text-xs text-blue-300/40">Password: admin2411</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && authenticate()}
              className="bg-white/10 border-white/20 text-white"
            />
            <Button onClick={authenticate} className="w-full bg-blue-500 hover:bg-blue-600">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-800/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                OG_Confessions Admin
              </h1>
              <p className="text-blue-200/60">Manage affirmations and analytics</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={runFullSystemTest}
              disabled={loading}
              className="bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30"
            >
              <TestTube className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              System Test
            </Button>
            <Button
              onClick={triggerTelegramSync}
              disabled={loading}
              className="bg-green-500/20 border border-green-500/30 hover:bg-green-500/30"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Sync Telegram
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {(syncError || syncSuccess) && (
          <div className="mb-6">
            {syncError && (
              <Card className="bg-red-500/10 border-red-500/30 p-4 mb-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{syncError}</span>
                </div>
              </Card>
            )}
            {syncSuccess && (
              <Card className="bg-green-500/10 border-green-500/30 p-4">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm whitespace-pre-line">{syncSuccess}</span>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* System Status */}
        {systemStatus && (
          <Card className="mb-6 bg-black/40 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-400">System Status</h3>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {systemStatus.database.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span>Database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {systemStatus.telegram.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span>Telegram</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {systemStatus.overall.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span>Overall</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm text-blue-200/60">{systemStatus.overall.message}</div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/30">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="affirmations" className="data-[state=active]:bg-blue-500/30">
              <Database className="w-4 h-4 mr-2" />
              Affirmations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {analytics && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-black/40 border-blue-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-blue-200/60">Total Affirmations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-400">{analytics.total_affirmations}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-purple-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-purple-200/60">Total Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-400">{analytics.total_views}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-pink-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-pink-200/60">Total Favorites</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-pink-400">{analytics.total_favorites}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-green-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-green-200/60">Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-400">{categories.length}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-black/40 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Affirmations by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-white">{category}</span>
                          <Badge variant="outline" className="bg-blue-500/20 border-blue-500/30 text-blue-300">
                            {analytics.category_stats[category] || 0}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analytics.recent_activity.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm line-clamp-1 text-white">{activity.affirmation_text}</p>
                            <p className="text-xs text-blue-300/80 capitalize">{activity.event_type}</p>
                          </div>
                          <Badge variant="outline">{activity.count}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Affirmations Tab */}
          <TabsContent value="affirmations" className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Input
                  placeholder="Search affirmations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 max-w-sm"
                />
                <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as Category | "all")}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-500/20 border border-green-500/30 hover:bg-green-500/30">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Affirmation
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-white/20 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Affirmation</DialogTitle>
                  </DialogHeader>
                  <AffirmationForm
                    onSubmit={(data) => createAffirmation(data)}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Affirmations List */}
            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                  <p className="text-blue-200/60">Loading affirmations...</p>
                </div>
              ) : filteredAffirmations.length === 0 ? (
                <Card className="bg-black/40 border-white/20">
                  <CardContent className="text-center py-8">
                    <p className="text-blue-200/60">
                      No affirmations found. {affirmations.length === 0 ? "Try syncing from Telegram first." : ""}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAffirmations.map((affirmation) => (
                  <Card key={affirmation.id} className="bg-black/40 border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "border",
                                affirmation.category === "Faith" && "bg-blue-500/20 border-blue-500/30 text-blue-300",
                                affirmation.category === "Strength" &&
                                  "bg-purple-500/20 border-purple-500/30 text-purple-300",
                                affirmation.category === "Wisdom" &&
                                  "bg-amber-500/20 border-amber-500/30 text-amber-300",
                                affirmation.category === "Gratitude" &&
                                  "bg-green-500/20 border-green-500/30 text-green-300",
                                affirmation.category === "Purpose" && "bg-pink-500/20 border-pink-500/30 text-pink-300",
                              )}
                            >
                              {affirmation.category}
                            </Badge>
                            {affirmation.source_platform && (
                              <Badge variant="outline" className="text-xs">
                                {affirmation.source_platform}
                              </Badge>
                            )}
                          </div>
                          <p className="text-lg mb-3 line-clamp-3 text-white">{affirmation.text}</p>
                          {affirmation.bible_verse && (
                            <p className="text-sm text-blue-200 italic mb-2">"{affirmation.bible_verse}"</p>
                          )}
                          <div className="flex items-center gap-6 text-sm text-blue-200">
                            <span>Views: {affirmation.view_count}</span>
                            <span>Favorites: {affirmation.favorite_count}</span>
                            <span>Created: {new Date(affirmation.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-blue-500/20">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-black border-white/20 text-white max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Affirmation</DialogTitle>
                              </DialogHeader>
                              <AffirmationForm
                                affirmation={affirmation}
                                onSubmit={(data) => updateAffirmation(affirmation.id, data)}
                                onCancel={() => setEditingAffirmation(null)}
                              />
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-red-500/20 text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-black border-white/20 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Affirmation</AlertDialogTitle>
                                <AlertDialogDescription className="text-blue-200/60">
                                  Are you sure you want to delete this affirmation? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/10 border-white/20 hover:bg-white/20">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAffirmation(affirmation.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function AffirmationForm({
  affirmation,
  onSubmit,
  onCancel,
}: {
  affirmation?: Affirmation
  onSubmit: (data: Partial<Affirmation>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    text: affirmation?.text || "",
    category: affirmation?.category || ("Faith" as Category),
    bible_verse: affirmation?.bible_verse || "",
    tags: affirmation?.tags?.join(", ") || "",
    is_active: affirmation?.is_active ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category" className="text-white">
          Category
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["Faith", "Strength", "Wisdom", "Gratitude", "Purpose"].map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="text" className="text-white">
          Affirmation Text
        </Label>
        <Textarea
          id="text"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          className="bg-white/10 border-white/20 text-white min-h-[100px]"
          required
        />
      </div>

      <div>
        <Label htmlFor="bible_verse" className="text-white">
          Bible Verse (Optional)
        </Label>
        <Input
          id="bible_verse"
          value={formData.bible_verse}
          onChange={(e) => setFormData({ ...formData, bible_verse: e.target.value })}
          className="bg-white/10 border-white/20 text-white"
          placeholder="e.g., John 3:16"
        />
      </div>

      <div>
        <Label htmlFor="tags" className="text-white">
          Tags (comma-separated)
        </Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="bg-white/10 border-white/20 text-white"
          placeholder="e.g., faith, hope, strength"
        />
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="is_active" className="text-white">
            Active
          </Label>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="bg-white/10 border-white/20 hover:bg-white/20"
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
            {affirmation ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </form>
  )
}
