// lib/content-processor.ts

export interface ProcessedAffirmation {
  text: string
  category: "Faith" | "Strength" | "Wisdom" | "Gratitude" | "Purpose"
  tags: string[]
  bible_verse?: string
  is_affirmation: boolean
}

/**
 * Clean message text by removing emojis, extra whitespace, and formatting
 */
export function cleanText(text: string): string {
  if (!text) return ""

  return (
    text
      // Remove emojis (basic Unicode ranges)
      .replace(
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
        "",
      )
      // Remove extra whitespace and newlines
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
 * Check if text appears to be an affirmation (motivational/inspirational)
 */
export function isAffirmationText(text: string): boolean {
  if (!text || text.length < 10 || text.length > 500) return false

  const lowerText = text.toLowerCase()

  // Positive affirmation indicators
  const affirmationKeywords = [
    "i am",
    "i can",
    "i will",
    "i have",
    "i choose",
    "my",
    "today i",
    "god",
    "lord",
    "blessed",
    "strength",
    "faith",
    "believe",
    "trust",
    "grateful",
    "thankful",
    "wisdom",
    "purpose",
    "calling",
    "destiny",
    "hope",
    "love",
    "peace",
    "joy",
    "courage",
    "power",
  ]

  // Check if text contains affirmation patterns
  const hasAffirmationKeywords = affirmationKeywords.some((keyword) => lowerText.includes(keyword))

  // Exclude obvious non-affirmations
  const excludePatterns = [
    "http",
    "www.",
    "@",
    "#",
    "click here",
    "subscribe",
    "follow",
    "like and share",
    "good morning",
    "good night",
    "happy birthday",
  ]

  const hasExcludePatterns = excludePatterns.some((pattern) => lowerText.includes(pattern))

  return hasAffirmationKeywords && !hasExcludePatterns
}

/**
 * Categorize text into one of the 5 spiritual categories
 */
export function categorizeText(text: string): "Faith" | "Strength" | "Wisdom" | "Gratitude" | "Purpose" {
  const lowerText = text.toLowerCase()

  // Category keywords with weights
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
  ]

  const foundTags = tagKeywords.filter((tag) => lowerText.includes(tag))

  // Limit to 5 most relevant tags
  return foundTags.slice(0, 5)
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
 */
export function processAffirmation(text: string): ProcessedAffirmation {
  const cleanedText = cleanText(text)
  const isAffirmation = isAffirmationText(cleanedText)
  const category = categorizeText(cleanedText)
  const tags = extractTags(cleanedText)
  const bibleVerse = extractBibleVerse(cleanedText)

  return {
    text: cleanedText,
    category,
    tags,
    bible_verse: bibleVerse,
    is_affirmation: isAffirmation,
  }
}
