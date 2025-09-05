/**
 * Platform Detection Utility
 * Auto-detects the deployment platform and provides platform-specific configurations
 */

export interface PlatformInfo {
  name: string
  detected: boolean
  url?: string | undefined
  environment: Record<string, string | undefined>
  features: {
    autoScale: boolean
    persistentStorage: boolean
    customDomains: boolean
    environmentSecrets: boolean
  }
}

/**
 * Detect the current deployment platform
 */
export function detectPlatform(): PlatformInfo {
  const { env } = process

  // Koyeb detection
  if (env.KOYEB_APP_NAME || env.KOYEB_SERVICE_NAME) {
    return {
      name: 'Koyeb',
      detected: true,
      url: env.KOYEB_PUBLIC_DOMAIN ? `https://${env.KOYEB_PUBLIC_DOMAIN}` : undefined,
      environment: {
        appName: env.KOYEB_APP_NAME,
        serviceName: env.KOYEB_SERVICE_NAME,
        region: env.KOYEB_REGION,
        publicDomain: env.KOYEB_PUBLIC_DOMAIN,
      },
      features: {
        autoScale: true,
        persistentStorage: false,
        customDomains: true,
        environmentSecrets: true,
      },
    }
  }

  // Railway detection
  if (env.RAILWAY_STATIC_URL || env.RAILWAY_PROJECT_ID) {
    return {
      name: 'Railway',
      detected: true,
      url: env.RAILWAY_STATIC_URL,
      environment: {
        projectId: env.RAILWAY_PROJECT_ID,
        environmentId: env.RAILWAY_ENVIRONMENT_ID,
        serviceId: env.RAILWAY_SERVICE_ID,
        staticUrl: env.RAILWAY_STATIC_URL,
      },
      features: {
        autoScale: true,
        persistentStorage: true,
        customDomains: true,
        environmentSecrets: true,
      },
    }
  }

  // Vercel detection
  if (env.VERCEL || env.VERCEL_URL) {
    return {
      name: 'Vercel',
      detected: true,
      url: env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined,
      environment: {
        url: env.VERCEL_URL,
        env: env.VERCEL_ENV,
        region: env.VERCEL_REGION,
        projectId: env.VERCEL_PROJECT_ID,
      },
      features: {
        autoScale: true,
        persistentStorage: false,
        customDomains: true,
        environmentSecrets: true,
      },
    }
  }

  // Heroku detection
  if (env.DYNO || env.HEROKU_APP_NAME) {
    return {
      name: 'Heroku',
      detected: true,
      url: env.HEROKU_APP_NAME ? `https://${env.HEROKU_APP_NAME}.herokuapp.com` : undefined,
      environment: {
        appName: env.HEROKU_APP_NAME,
        dyno: env.DYNO,
        region: env.HEROKU_REGION,
        slug: env.HEROKU_SLUG_COMMIT,
      },
      features: {
        autoScale: true,
        persistentStorage: false,
        customDomains: true,
        environmentSecrets: true,
      },
    }
  }

  // Render detection
  if (env.RENDER || env.RENDER_SERVICE_ID) {
    return {
      name: 'Render',
      detected: true,
      url: env.RENDER_EXTERNAL_URL,
      environment: {
        serviceId: env.RENDER_SERVICE_ID,
        serviceName: env.RENDER_SERVICE_NAME,
        externalUrl: env.RENDER_EXTERNAL_URL,
      },
      features: {
        autoScale: true,
        persistentStorage: true,
        customDomains: true,
        environmentSecrets: true,
      },
    }
  }

  // Fly.io detection
  if (env.FLY_APP_NAME || env.FLY_REGION) {
    return {
      name: 'Fly.io',
      detected: true,
      url: env.FLY_APP_NAME ? `https://${env.FLY_APP_NAME}.fly.dev` : undefined,
      environment: {
        appName: env.FLY_APP_NAME,
        region: env.FLY_REGION,
        allocId: env.FLY_ALLOC_ID,
      },
      features: {
        autoScale: true,
        persistentStorage: true,
        customDomains: true,
        environmentSecrets: true,
      },
    }
  }

  // Generic/Local detection
  return {
    name: 'Local/Generic',
    detected: false,
    environment: {},
    features: {
      autoScale: false,
      persistentStorage: true,
      customDomains: false,
      environmentSecrets: false,
    },
  }
}

/**
 * Get platform-appropriate CORS origins
 */
export function getPlatformCorsOrigins(): string[] {
  const platform = detectPlatform()
  const origins: string[] = []

  // Add platform-detected URL
  if (platform.url) {
    origins.push(platform.url)
  }

  // Add common development origins for local development
  if (!platform.detected || process.env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    )
  }

  // Add manually configured origins
  if (process.env.CORS_ORIGINS) {
    const manualOrigins = process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    origins.push(...manualOrigins)
  }

  // Remove duplicates
  return [...new Set(origins)]
}

/**
 * Get platform-appropriate base URL
 */
export function getPlatformBaseUrl(): string | undefined {
  const platform = detectPlatform()

  // Use manually configured URL first
  if (process.env.APP_URL) {
    return process.env.APP_URL
  }

  // Use platform-detected URL
  return platform.url
}

/**
 * Log platform information for debugging
 */
export function logPlatformInfo(): void {
  const platform = detectPlatform()

  console.log(`🏗️  Platform: ${platform.name}`)
  console.log(`🔍 Detected: ${platform.detected ? 'Yes' : 'No'}`)

  if (platform.url) {
    console.log(`🌐 URL: ${platform.url}`)
  }

  if (Object.keys(platform.environment).length > 0) {
    console.log(`📋 Environment:`)
    Object.entries(platform.environment).forEach(([key, value]) => {
      if (value) {
        console.log(`   ${key}: ${value}`)
      }
    })
  }

  console.log(`✨ Features:`)
  Object.entries(platform.features).forEach(([key, value]) => {
    console.log(`   ${key}: ${value ? '✅' : '❌'}`)
  })
}
