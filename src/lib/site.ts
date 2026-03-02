/**
 * Compatibility re-exports from the central site config.
 *
 * Existing imports (`import { SITE_TITLE } from '#/lib/site'`) continue to
 * work unchanged. New code should import directly from `#/config/site`.
 */
import { siteConfig } from '#/config/site'

export const SITE_TITLE = siteConfig.name
export const SITE_DESCRIPTION = siteConfig.description
export const SITE_URL = siteConfig.url

/** @deprecated — use `siteConfig.features.newsletter` instead */
export const NEWSLETTER_AUTO_SUBSCRIBE = false
