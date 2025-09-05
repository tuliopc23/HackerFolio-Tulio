declare module '@elysiajs/cors' {
  import type { Elysia } from 'elysia'

  interface CorsOptions {
    origin?: string | string[] | boolean | ((origin: string | undefined) => boolean)
    credentials?: boolean
    methods?: string[]
    allowedHeaders?: string[]
    exposedHeaders?: string[]
    maxAge?: number
    preflightContinue?: boolean
    optionsSuccessStatus?: number
  }

  export function cors(options?: CorsOptions): (app: Elysia) => Elysia
}
