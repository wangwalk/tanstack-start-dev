/**
 * Renders a JSON-LD <script> tag for structured data.
 * Use inside route `head()` scripts array instead of this component
 * when possible — this is for cases where data is only available at render time.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ---------------------------------------------------------------------------
// Schema builders — pure functions that return typed JSON-LD objects
// ---------------------------------------------------------------------------

export type BreadcrumbItem = { name: string; href: string }

export function breadcrumbSchema(items: BreadcrumbItem[], siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  }
}

export function websiteSchema(siteUrl: string, siteName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: siteName,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/tools/search?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function softwareApplicationSchema(tool: {
  name: string
  url: string
  description: string | null
  screenshotUrl: string | null
  logoUrl: string | null
  pricingType: string
  categories: Array<{ name: string }>
}) {
  const category = tool.categories[0]?.name ?? 'WebApplication'
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    url: tool.url,
    description: tool.description ?? undefined,
    applicationCategory: category,
    operatingSystem: 'Web',
    ...(tool.screenshotUrl || tool.logoUrl
      ? { image: tool.screenshotUrl ?? tool.logoUrl }
      : {}),
    offers: {
      '@type': 'Offer',
      price: tool.pricingType === 'free' || tool.pricingType === 'open_source' ? '0' : undefined,
      priceCurrency: 'USD',
      availability: 'https://schema.org/OnlineOnly',
    },
  }
}

export function collectionPageSchema(opts: {
  name: string
  description: string
  url: string
  tools: Array<{ name: string; slug: string; description: string | null }>
  siteUrl: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: opts.tools.slice(0, 20).map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.name,
        url: `${opts.siteUrl}/tools/${t.slug}`,
        description: t.description ?? undefined,
      })),
    },
  }
}
