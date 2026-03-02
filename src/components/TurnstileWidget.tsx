import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  siteKey: string | null
  onSuccess: (token: string) => void
  onExpire?: () => void
}

export default function TurnstileWidget({ siteKey, onSuccess, onExpire }: TurnstileWidgetProps) {
  if (!siteKey) return null

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onSuccess}
      onExpire={onExpire}
      options={{ theme: 'auto' }}
    />
  )
}
