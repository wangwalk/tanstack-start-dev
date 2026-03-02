import type { AnalyticsConfig } from '#/lib/analytics'
import { GA4Analytics } from './ga4'
import { OpenPanelAnalytics } from './openpanel'
import { PlausibleAnalytics } from './plausible'
import { PostHogAnalytics } from './posthog'
import { UmamiAnalytics } from './umami'

interface Props {
  config: AnalyticsConfig
}

export function Analytics({ config }: Props) {
  return (
    <>
      {config.posthog && <PostHogAnalytics {...config.posthog} />}
      {config.umami && <UmamiAnalytics {...config.umami} />}
      {config.plausible && <PlausibleAnalytics {...config.plausible} />}
      {config.ga4 && <GA4Analytics {...config.ga4} />}
      {config.openpanel && <OpenPanelAnalytics {...config.openpanel} />}
    </>
  )
}
