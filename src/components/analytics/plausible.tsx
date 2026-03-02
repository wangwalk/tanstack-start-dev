interface Props {
  domain: string
  src: string
}

export function PlausibleAnalytics({ domain, src }: Props) {
  return <script defer data-domain={domain} src={src} />
}
