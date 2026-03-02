interface Props {
  websiteId: string
  src: string
}

export function UmamiAnalytics({ websiteId, src }: Props) {
  return <script defer src={src} data-website-id={websiteId} />
}
