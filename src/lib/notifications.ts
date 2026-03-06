type NotificationEvent =
  | { type: 'payment_success'; user: string; plan: string; amount: number }
  | { type: 'payment_failed'; user: string; plan: string }
  | { type: 'subscription_canceled'; user: string; plan: string }
  | { type: 'user_registered'; user: string }
  | { type: 'credits_distributed'; count: number; totalCredits: number }

interface DiscordEmbed {
  title: string
  color: number
  fields: { name: string; value: string; inline?: boolean }[]
  timestamp: string
}

function buildEmbed(event: NotificationEvent): DiscordEmbed {
  const timestamp = new Date().toISOString()

  switch (event.type) {
    case 'payment_success':
      return {
        title: '💰 新支付成功',
        color: 0x57f287, // green
        fields: [
          { name: '用户', value: event.user, inline: true },
          { name: '方案', value: event.plan, inline: true },
          {
            name: '金额',
            value: `$${(event.amount / 100).toFixed(2)}`,
            inline: true,
          },
        ],
        timestamp,
      }
    case 'payment_failed':
      return {
        title: '❌ 付款失败',
        color: 0xed4245, // red
        fields: [
          { name: '用户', value: event.user, inline: true },
          { name: '方案', value: event.plan, inline: true },
        ],
        timestamp,
      }
    case 'subscription_canceled':
      return {
        title: '🚪 订阅取消',
        color: 0xfee75c, // yellow
        fields: [
          { name: '用户', value: event.user, inline: true },
          { name: '方案', value: event.plan, inline: true },
        ],
        timestamp,
      }
    case 'user_registered':
      return {
        title: '🎉 新用户注册',
        color: 0x5865f2, // blurple
        fields: [{ name: '用户', value: event.user, inline: true }],
        timestamp,
      }
    case 'credits_distributed':
      return {
        title: '🎁 Credits 月度发放完成',
        color: 0xeb459e, // pink
        fields: [
          { name: '发放人数', value: String(event.count), inline: true },
          {
            name: '总 Credits',
            value: String(event.totalCredits),
            inline: true,
          },
        ],
        timestamp,
      }
  }
}

export async function notify(event: NotificationEvent): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return

  const embed = buildEmbed(event)

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })
  } catch (err) {
    console.error('[notifications] Discord webhook failed:', err)
  }
}
