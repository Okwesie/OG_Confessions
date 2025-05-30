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
  private botToken = process.env.TELEGRAM_BOT_TOKEN!
  private channelId = process.env.TELEGRAM_CHANNEL_ID!

  constructor() {
    if (!this.botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN is required")
    }
    if (!this.channelId) {
      throw new Error("TELEGRAM_CHANNEL_ID is required")
    }
  }

  /**
   * Fetch the latest messages from the Telegram channel
   */
  async getChannelMessages(limit = 100): Promise<TelegramMessage[]> {
    try {
      // Get updates from Telegram Bot API
      const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?limit=${limit}&allowed_updates=["message","channel_post"]`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: TelegramResponse = await response.json()

      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description || "Unknown error"}`)
      }

      // Process both regular messages and channel posts
      const messages: TelegramMessage[] = []

      for (const update of data.result) {
        const message = update.message || update.channel_post

        if (!message || !message.text) continue

        // Check if message is from our target channel
        const isFromTargetChannel = this.isFromTargetChannel(message.chat)

        if (isFromTargetChannel) {
          messages.push({
            message_id: message.message_id,
            text: message.text,
            date: message.date,
            from: message.from?.username || message.from?.first_name || "channel",
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
   * Alternative method: Get channel history directly (requires channel to be public or bot to be admin)
   */
  async getChannelHistory(limit = 100): Promise<TelegramMessage[]> {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/getChatHistory`

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.channelId,
          limit: limit,
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        // Fallback to getUpdates if getChatHistory fails
        console.log("getChatHistory failed, falling back to getUpdates")
        return this.getChannelMessages(limit)
      }

      return data.result.map((msg: any) => ({
        message_id: msg.message_id,
        text: msg.text || "",
        date: msg.date,
        from: msg.from?.username || "channel",
      }))
    } catch (error) {
      console.log("getChatHistory not available, using getUpdates")
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
