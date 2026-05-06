export function getBaseUrl(): string {
  const configured = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL)

  if (configured && !isLocalhostInProduction(configured)) {
    return configured
  }

  const vercelHost = normalizeBaseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL)
  if (vercelHost) {
    return vercelHost
  }

  return `http://localhost:${process.env.PORT ?? '3000'}`
}

function normalizeBaseUrl(url: string | undefined): string | undefined {
  if (!url) return undefined

  const trimmed = url.trim().replace(/\/$/, '')
  if (/^https?:\/\//.test(trimmed)) return trimmed

  return `https://${trimmed}`
}

function isLocalhostInProduction(url: string): boolean {
  return process.env.NODE_ENV === 'production' && /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url)
}
