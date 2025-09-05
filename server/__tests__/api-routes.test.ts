import { Elysia } from 'elysia'
// vitest globals are available - no import needed

// Simple API route tests focusing on basic functionality
describe('API Routes - Basic Functionality', () => {
  let mockFetch: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock fetch for GitHub API tests
    mockFetch = vi.fn()
    global.fetch = mockFetch

    // Mock environment variables
    process.env.GITHUB_TOKEN = 'mock-token'

    // Mock uptime
    vi.spyOn(process, 'uptime').mockReturnValue(123.45)
  })

  test('should create basic health endpoint', async () => {
    const app = new Elysia().get('/api/health', () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }))

    const response = await app.handle(new Request('http://localhost/api/health'))

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      uptime: 123.45,
    })
    // Type guard for data with timestamp
    const isDataWithTimestamp = (data: unknown): data is { timestamp: string } => {
      return (
        typeof data === 'object' &&
        data !== null &&
        'timestamp' in data &&
        typeof (data as any).timestamp === 'string'
      )
    }

    expect(isDataWithTimestamp(data)).toBe(true)
    if (isDataWithTimestamp(data)) {
      expect(new Date(data.timestamp)).toBeInstanceOf(Date)
    }
  })

  test('should create basic profile endpoint', async () => {
    const app = new Elysia().get('/api/profile', () => ({
      name: 'Tulio Cunha',
      title: 'Full-stack Developer',
      location: 'Remote',
      status: 'Available for projects',
    }))

    const response = await app.handle(new Request('http://localhost/api/profile'))

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toEqual({
      name: 'Tulio Cunha',
      title: 'Full-stack Developer',
      location: 'Remote',
      status: 'Available for projects',
    })
  })

  test('should handle POST request with JSON body', async () => {
    const app = new Elysia().post('/api/terminal/log', ({ body }: { body: any }) => {
      const { command } = body
      if (command) {
        // Log command
      }
      return { logged: true }
    })

    const requestBody = {
      command: 'help',
      timestamp: '2024-01-01T00:00:00Z',
    }

    const response = await app.handle(
      new Request('http://localhost/api/terminal/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
    )

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toEqual({ logged: true })
  })

  test('should handle GitHub API mock', async () => {
    const mockCommits = [
      {
        sha: 'abc123',
        commit: {
          message: 'Add new feature',
          author: { name: 'Tulio Cunha', date: '2024-01-01T00:00:00Z' },
        },
        html_url: 'https://github.com/tuliocunha/repo/commit/abc123',
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockCommits),
    })

    const app = new Elysia().get(
      '/api/github/:owner/:repo/commits',
      async ({ params, query }: any) => {
        const { owner, repo } = params
        const limit = Math.min(Number(query.limit ?? 10), 50)

        const headers: Record<string, string> = {
          Accept: 'application/vnd.github+json',
        }
        if (process.env.GITHUB_TOKEN) {
          headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
        }

        try {
          const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${String(limit)}`,
            { headers }
          )
          if (!res.ok) throw new Error(`GitHub error ${String(res.status)}`)
          const data = await res.json()

          // Type guard for GitHub commit data
          const isCommitArray = (
            data: unknown
          ): data is Array<{
            sha: string
            commit: { message: string; author: { name: string; date: string } }
            html_url: string
          }> => {
            return (
              Array.isArray(data) &&
              data.every(
                item =>
                  typeof item === 'object' &&
                  item !== null &&
                  'sha' in item &&
                  'commit' in item &&
                  'html_url' in item
              )
            )
          }

          if (!isCommitArray(data)) {
            throw new Error('Invalid GitHub API response format')
          }

          return data.map(c => ({
            sha: c.sha,
            message: c.commit.message,
            author: c.commit.author.name,
            date: c.commit.author.date,
            url: c.html_url,
          }))
        } catch (e: any) {
          return { error: 'Failed to fetch commits', message: e.message }
        }
      }
    )

    const response = await app.handle(
      new Request('http://localhost/api/github/tuliocunha/repo/commits?limit=1')
    )

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toEqual([
      {
        sha: 'abc123',
        message: 'Add new feature',
        author: 'Tulio Cunha',
        date: '2024-01-01T00:00:00Z',
        url: 'https://github.com/tuliocunha/repo/commit/abc123',
      },
    ])

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/tuliocunha/repo/commits?per_page=1',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: 'Bearer mock-token',
        },
      }
    )
  })

  test('should handle GitHub API errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    })

    const app = new Elysia().get('/api/github/:owner/:repo/commits', async ({ params }: any) => {
      const { owner, repo } = params

      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`)
        if (!res.ok) throw new Error(`GitHub error ${String(res.status)}`)
        return await res.json()
      } catch (e: any) {
        return { error: 'Failed to fetch commits', message: e.message }
      }
    })

    const response = await app.handle(
      new Request('http://localhost/api/github/tuliocunha/nonexistent/commits')
    )

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toEqual({
      error: 'Failed to fetch commits',
      message: 'GitHub error 404',
    })
  })

  test('should handle limit parameter correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    })

    const app = new Elysia().get(
      '/api/github/:owner/:repo/commits',
      async ({ params, query }: any) => {
        const { owner, repo } = params
        const limit = Math.min(Number(query.limit ?? 10), 50)

        await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${String(limit)}`
        )

        return []
      }
    )

    // Test with limit over maximum
    await app.handle(new Request('http://localhost/api/github/tuliocunha/repo/commits?limit=100'))

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/tuliocunha/repo/commits?per_page=50'
    )
  })

  test('should work without GitHub token', async () => {
    delete process.env.GITHUB_TOKEN

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    })

    const app = new Elysia().get('/api/github/:owner/:repo/commits', async ({ params }: any) => {
      const { owner, repo } = params

      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
      }
      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
      }

      await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`, { headers })

      return []
    })

    await app.handle(new Request('http://localhost/api/github/tuliocunha/repo/commits'))

    expect(mockFetch).toHaveBeenCalledWith(expect.any(String), {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    })
  })

  test('should validate request structure', async () => {
    const app = new Elysia().post('/api/test', ({ body }: { body: any }) => {
      if (!body || typeof body !== 'object') {
        throw new Error('Invalid request body')
      }
      return { success: true }
    })

    // Valid request
    const validResponse = await app.handle(
      new Request('http://localhost/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      })
    )

    expect(validResponse.status).toBe(200)
    const validData = await validResponse.json()
    expect(validData).toEqual({ success: true })

    // Invalid request should be handled by Elysia's error handling
    const invalidResponse = await app.handle(
      new Request('http://localhost/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      })
    )

    expect(invalidResponse.status).toBe(400)
  })
})
