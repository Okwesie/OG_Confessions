// lib/telegram.ts
interface TelegramMessage {
  message_id: number
  text: string
  date: number
  from: string
}

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    text?: string
    date: number
    from?: {
      username?: string
      first_name?: string
    }
    chat: {
      id: number
      username?: string
      type: string
    }
  }
  channel_post?: {
    message_id: number
    text?: string
    date: number
    chat: {
      id: number
      username?: string
      type: string
    }
  }
}

interface TelegramResponse {
  ok: boolean
  result: TelegramUpdate[]
  error_code?: number
  description?: string
}

export class TelegramService {
  private botToken: string
  private channelId: string

  constructor() {
    // Check multiple environment variable sources
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || ""
    this.channelId = process.env.TELEGRAM_CHANNEL_ID || ""

    if (!this.botToken) {
      console.error("❌ TELEGRAM_BOT_TOKEN is missing. Available env vars:", {
        TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
        NODE_ENV: process.env.NODE_ENV,
      })
      throw new Error("TELEGRAM_BOT_TOKEN is required")
    }
    if (!this.channelId) {
      console.error("❌ TELEGRAM_CHANNEL_ID is missing. Available env vars:", {
        TELEGRAM_CHANNEL_ID: !!process.env.TELEGRAM_CHANNEL_ID,
        NODE_ENV: process.env.NODE_ENV,
      })
      throw new Error("TELEGRAM_CHANNEL_ID is required")
    }

    console.log("✅ Telegram service initialized with:", {
      botToken: this.botToken.substring(0, 10) + "...",
      channelId: this.channelId,
    })
  }

  /**
   * Fetch the latest messages from the Telegram channel
   * UPDATED: Get complete message content without truncation
   */
  async getChannelMessages(limit = 100): Promise<TelegramMessage[]> {
    try {
      console.log(`🔍 Fetching ${limit} messages from Telegram channel: ${this.channelId}`)

      // Get updates from Telegram Bot API
      const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?limit=${limit}&allowed_updates=["message","channel_post"]`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add timeout for production
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ HTTP error! status: ${response.status}, body: ${errorText}`)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: TelegramResponse = await response.json()

      if (!data.ok) {
        console.error(`❌ Telegram API error:`, data)
        throw new Error(`Telegram API error: ${data.description || "Unknown error"}`)
      }

      console.log(`📨 Received ${data.result.length} updates from Telegram`)

      // Process both regular messages and channel posts
      const messages: TelegramMessage[] = []

      for (const update of data.result) {
        const message = update.message || update.channel_post

        if (!message || !message.text) continue

        // Check if message is from our target channel
        const isFromTargetChannel = this.isFromTargetChannel(message.chat)

        if (isFromTargetChannel) {
          let from: string
          if (update.message && update.message.from) {
            from = update.message.from.username || update.message.from.first_name || "channel"
          } else {
            from = "channel"
          }
          messages.push({
            message_id: message.message_id,
            text: message.text, // FULL TEXT - no truncation
            date: message.date,
            from,
          })
        }
      }

      // Sort by newest first and return
      return messages.sort((a, b) => b.date - a.date)
    } catch (error) {
      console.error("Error fetching Telegram messages:", error)
      throw new Error(`Failed to fetch messages: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Alternative method: Get channel history directly using getChat
   */
  async getChannelHistory(limit = 100): Promise<TelegramMessage[]> {
    try {
      // Try to get more recent messages using a different approach
      const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=-${limit}&limit=${limit}&allowed_updates=["channel_post"]`

      const response = await fetch(url)
      const data = await response.json()

      if (!data.ok) {
        console.log("getUpdates with offset failed, falling back to regular getUpdates")
        return this.getChannelMessages(limit)
      }

      const messages: TelegramMessage[] = []

      for (const update of data.result) {
        const message = update.channel_post

        if (!message || !message.text) continue

        const isFromTargetChannel = this.isFromTargetChannel(message.chat)

        if (isFromTargetChannel) {
          messages.push({
            message_id: message.message_id,
            text: message.text, // COMPLETE TEXT
            date: message.date,
            from: "channel",
          })
        }
      }

      return messages.sort((a, b) => b.date - a.date)
    } catch (error) {
      console.log("Alternative method failed, using standard getChannelMessages")
      return this.getChannelMessages(limit)
    }
  }

  private isFromTargetChannel(chat: any): boolean {
    // Handle different channel ID formats
    const targetId = this.channelId.replace("@", "")

    return chat.username === targetId || chat.id.toString() === targetId || chat.id.toString() === this.channelId
  }

  async getBotInfo() {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/getMe`
      const response = await fetch(url)
      const data = await response.json()

      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description || "Unknown error"}`)
      }

      return data.result
    } catch (error) {
      console.error("Error getting bot info:", error)
      throw new Error(`Failed to get bot info: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getChatInfo() {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/getChat?chat_id=${this.channelId}`
      const response = await fetch(url)
      const data = await response.json()

      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description || "Unknown error"}`)
      }

      return data.result
    } catch (error) {
      console.error("Error getting chat info:", error)
      throw new Error(`Failed to get chat info: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}
