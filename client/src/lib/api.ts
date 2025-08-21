// client/src/lib/api.ts

export interface CommandAction {
  type: 'open_url';
  url: string;
}

export interface ServerCommandResult {
  output: string;
  error?: boolean;
  action?: CommandAction;
}

export interface ApiProject {
  id: number;
  name: string;
  description?: string;
  tech_stack?: string[];
  github_url?: string;
  live_url?: string;
  appstore_url?: string;
  status?: string;
  image?: string;
  stats?: {
    performance?: string;
    accessibility?: string;
  };
  created_at?: string;
  updated_at?: string;
}

function getBaseUrl() {
  if (typeof window === 'undefined') {
    const fromEnv = process.env.SSR_BASE_URL
    if (fromEnv) return fromEnv
    const port = process.env.PORT || '3001'
    return `http://127.0.0.1:${port}`
  }
  return ''
}

export async function fetchProjects(): Promise<ApiProject[]> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json() as Promise<ApiProject[]>;
}

export async function fetchCommands(): Promise<Array<{ command: string; description?: string; category?: string }>> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/commands`);
  if (!res.ok) throw new Error('Failed to fetch commands');
  return res.json() as Promise<Array<{ command: string; description?: string; category?: string }>>;
}


export async function executeCommand(command: string, args: string[] = []): Promise<ServerCommandResult>{
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/commands/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, args })
  });
  if (!res.ok) throw new Error('Command failed');
  return res.json() as Promise<ServerCommandResult>;
}

export async function fetchContent(section: string): Promise<{ section: string; content: any }>{
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/content/${encodeURIComponent(section)}`);
  if (!res.ok) throw new Error('Failed to fetch content');
  return res.json() as Promise<{ section: string; content: any }>;
}
