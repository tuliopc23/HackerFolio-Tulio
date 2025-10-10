import { Container } from '@cloudflare/containers'

// Cloudflare Workers Containers class controlling the Docker image lifecycle
export class HackerFolioContainer extends Container {
  // The Bun/Elysia app listens on 3001 by default (see README and server/app.ts)
  override defaultPort = 3001
  // Automatically stop the instance when idle to save cost
  override sleepAfter = '10m'
}

interface Env {
  HACKERFOLIO_CONTAINER: DurableObjectNamespace<HackerFolioContainer>
}

const worker = {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    try {
      // Use a single named container instance for the whole app
      const instance = env.HACKERFOLIO_CONTAINER.getByName('default')
      // Forward the incoming request directly to the container's HTTP server
      return await instance.fetch(request)
    } catch (err) {
      // Basic fallback error response; logs can be viewed via `wrangler tail`
      const message = err instanceof Error ? err.message : String(err)
      return new Response(`Container proxy error: ${message}`, { status: 502 })
    }
  },
}

export default worker
