// lib/content-processor.ts

export interface ProcessedAffirmation {
  text: string
  category: "Faith" | "Strength" | "Wisdom" | "Gratitude" | "Purpose"
  tags: string[]
  bible_verse?: string
  is_affirmation: boolean
}

/**
 * Clean message text by removing problematic characters and formatting
 */
export function cleanText(text: string): string {
  if (!text) return ""

  return (
    text
      // Fix common encoding issues
      .replace(/ð—/g, "")
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€/g, '"')
      .replace(/â€¦/g, "...")
      // Remove excessive hashtags and formatting
      .replace(/#[A-Z\s]+/g, "")
      // Clean up multiple spaces and newlines
      .replace(/\s+/g, " ")
      // Remove common Telegram formatting
      .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
      .replace(/__(.*?)__/g, "$1") // Italic
      .replace(/`(.*?)`/g, "$1") // Code
      // Trim whitespace
      .trim()
  )
}

/**
 * UPDATED: Much more permissive - accept almost all content from the channel
 */
export function isAffirmationText(text: string): boolean {
  if (!text || text.length < 5) return false

  const lowerText = text.toLowerCase()

  // Exclude only obvious spam/non-content
  const excludePatterns = [
    "http://",
    "https://",
    "www.",
    "click here",
    "subscribe now",
    "follow us",
    "join our",
    "download app",
  ]

  const hasExcludePatterns = excludePatterns.some((pattern) => lowerText.includes(pattern))

  // If it's from your confession channel and not spam, it's probably valid content
  return !hasExcludePatterns
}

/**
 * Categorize text into one of the 5 spiritual categories
 */
export function categorizeText(text: string): "Faith" | "Strength" | "Wisdom" | "Gratitude" | "Purpose" {
  const lowerText = text.toLowerCase()

  // Enhanced category keywords
  const categories = {
    Faith: [
      "god",
      "jesus",
      "christ",
      "lord",
      "faith",
      "believe",
      "prayer",
      "pray",
      "bible",
      "scripture",
      "holy",
      "divine",
      "blessed",
      "blessing",
      "grace",
      "mercy",
      "salvation",
      "heaven",
      "spirit",
      "trust in god",
      "almighty",
      "confess",
      "confession",
      "declare",
      "affirm",
    ],
    Strength: [
      "strong",
      "strength",
      "courage",
      "power",
      "overcome",
      "endure",
      "persevere",
      "brave",
      "fearless",
      "mighty",
      "resilient",
      "tough",
      "warrior",
      "fighter",
      "conquer",
      "victory",
      "triumph",
      "bold",
      "empowered",
      "unstoppable",
    ],
    Wisdom: [
      "wise",
      "wisdom",
      "knowledge",
      "understand",
      "insight",
      "discernment",
      "learn",
      "guidance",
      "truth",
      "enlighten",
      "clarity",
      "perception",
      "intelligence",
      "prudent",
      "thoughtful",
      "mindful",
      "aware",
      "understanding",
      "revelation",
    ],
    Gratitude: [
      "thank",
      "grateful",
      "appreciate",
      "thankful",
      "blessing",
      "blessed",
      "praise",
      "honor",
      "cherish",
      "value",
      "treasure",
      "abundance",
      "gift",
      "favor",
      "grace",
      "fortunate",
      "lucky",
      "appreciate",
      "glory",
    ],
    Purpose: [
      "destiny",
      "calling",
      "mission",
      "purpose",
      "plan",
      "future",
      "dream",
      "vision",
      "goal",
      "path",
      "journey",
      "direction",
      "meaning",
      "significance",
      "impact",
      "legacy",
      "potential",
      "flourish",
      "prosper",
      "success",
      "rich",
      "wealth",
      "financial",
    ],
  }

  // Calculate scores for each category
  const scores = Object.entries(categories).map(([category, keywords]) => {
    const score = keywords.reduce((total, keyword) => {
      const matches = (lowerText.match(new RegExp(keyword, "g")) || []).length
      return total + matches
    }, 0)
    return { category, score }
  })

  // Find category with highest score
  const bestMatch = scores.reduce((best, current) => (current.score > best.score ? current : best))

  // Special handling for financial confessions
  if (
    lowerText.includes("financial") ||
    lowerText.includes("money") ||
    lowerText.includes("rich") ||
    lowerText.includes("wealth")
  ) {
    return "Purpose"
  }

  // Default to Faith if no clear winner
  return (bestMatch.score > 0 ? bestMatch.category : "Faith") as
    | "Faith"
    | "Strength"
    | "Wisdom"
    | "Gratitude"
    | "Purpose"
}

/**
 * Extract relevant tags from text
 */
export function extractTags(text: string): string[] {
  const lowerText = text.toLowerCase()

  const tagKeywords = [
    "faith",
    "hope",
    "love",
    "peace",
    "joy",
    "strength",
    "wisdom",
    "grace",
    "mercy",
    "forgiveness",
    "prayer",
    "blessing",
    "trust",
    "courage",
    "perseverance",
    "guidance",
    "purpose",
    "calling",
    "gratitude",
    "thankful",
    "praise",
    "worship",
    "devotion",
    "inspiration",
    "motivation",
    "encouragement",
    "comfort",
    "healing",
    "prosperity",
    "wealth",
    "financial",
    "rich",
    "abundance",
    "victory",
    "triumph",
    "success",
    "flourish",
    "empowered",
    "blessed",
    "favor",
  ]

  const foundTags = tagKeywords.filter((tag) => lowerText.includes(tag))

  // Limit to 8 most relevant tags (increased from 5)
  return foundTags.slice(0, 8)
}

/**
 * Extract Bible verse references from text
 */
export function extractBibleVerse(text: string): string | undefined {
  // Enhanced regex for Bible verse patterns
  const versePatterns = [
    // Standard format: "John 3:16", "1 Corinthians 13:4-7"
    /\b(\d?\s?[A-Za-z]+\s?\d+:\d+(?:-\d+)?)\b/g,
    // With book abbreviations: "Jn 3:16", "1 Cor 13:4"
    /\b([A-Za-z]{2,3}\s?\d+:\d+(?:-\d+)?)\b/g,
    // Parenthetical format: "(John 3:16)"
    /$$([A-Za-z\s\d:,-]+)$$/g,
  ]

  for (const pattern of versePatterns) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      // Return the first valid-looking verse reference
      const verse = matches[0].replace(/[()]/g, "").trim()
      if (verse.includes(":")) {
        return verse
      }
    }
  }

  return undefined
}

/**
 * Process raw text into a structured affirmation
 * UPDATED: Much more permissive - saves almost everything from the channel
 */
export function processAffirmation(text: string): ProcessedAffirmation {
  const cleanedText = cleanText(text)

  // CHANGED: Always return true for affirmations from your channel
  // We trust that content from your confession channel is valid
  const isAffirmation = isAffirmationText(cleanedText)

  const category = categorizeText(cleanedText)
  const tags = extractTags(cleanedText)
  const bibleVerse = extractBibleVerse(cleanedText)

  return {
    text: cleanedText,
    category,
    tags,
    bible_verse: bibleVerse,
    is_affirmation: true, // FORCE TRUE - save everything from your channel
  }
}
