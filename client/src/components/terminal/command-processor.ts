import { profileData, projectsData, aboutContent, contactContent, resumeContent } from '@/data/portfolio-data';

export interface CommandResult {
  output: string;
  error?: boolean;
  navigate?: string;
}

// Helper function to apply syntax highlighting
function h(text: string, type: 'keyword' | 'function' | 'string' | 'variable' | 'number' | 'type' | 'comment' | 'operator' | 'property' | 'class'): string {
  return `<span class="syntax-${type}">${text}</span>`;
}

export class CommandProcessor {
  private history: string[] = [];
  private historyIndex: number = -1;

  constructor() {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('terminal-history');
    if (savedHistory) {
      this.history = JSON.parse(savedHistory);
    }
  }

  addToHistory(command: string) {
    if (command.trim() && this.history[this.history.length - 1] !== command) {
      this.history.push(command);
      localStorage.setItem('terminal-history', JSON.stringify(this.history));
    }
    this.historyIndex = this.history.length;
  }

  getHistoryCommand(direction: 'up' | 'down'): string {
    if (direction === 'up') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        return this.history[this.historyIndex];
      }
    } else {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        return this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        return '';
      }
    }
    return '';
  }

  processCommand(input: string): CommandResult {
    const trimmed = input.trim();
    if (!trimmed) return { output: '' };

    const [command, ...args] = trimmed.split(' ');
    const arg = args.join(' ');

    switch (command.toLowerCase()) {
      case 'help':
        return this.help();
      
      case 'whoami':
        return this.whoami();
      
      case 'grep':
        if (arg === 'stack') {
          return this.grepStack();
        }
        return { output: `grep: '${arg}' - try 'grep stack'`, error: true };
      
      case 'projects':
        return this.projects(arg);
      
      case 'printd':
        if (arg === 'contact') {
          return this.printdContact();
        }
        return { output: `printd: '${arg}' - try 'printd contact'`, error: true };
      
      case 'open':
        return this.open(arg);
      
      case 'theme':
        return this.theme(arg);
      
      case 'clear':
        return { output: 'CLEAR' };
      
      case 'ls':
        return this.ls();
      
      case 'cat':
        return this.cat(arg);
      
      case 'time':
        return this.time();
      
      case 'cams':
        return { output: 'ACCESS DENIED.', error: true };
      
      default:
        return { 
          output: `Command not found: ${command}\nType 'help' for available commands.`, 
          error: true 
        };
    }
  }

  private help(): CommandResult {
    return {
      output: `${h('Available Commands:', 'type')}

${h('help', 'function')}                 ${h('-', 'operator')} Show this help message
${h('whoami', 'function')}              ${h('-', 'operator')} Display user information  
${h('grep', 'function')} ${h('stack', 'string')}          ${h('-', 'operator')} Show technology stack
${h('projects', 'function')} ${h('[filter]', 'comment')}   ${h('-', 'operator')} List projects with optional filter
${h('printd', 'function')} ${h('contact', 'string')}      ${h('-', 'operator')} Display contact information
${h('open', 'function')} ${h('<route|url>', 'variable')}    ${h('-', 'operator')} Navigate to route or external URL
${h('theme', 'function')} ${h('<name>', 'variable')}        ${h('-', 'operator')} Switch theme ${h('(lumon|neon|mono)', 'comment')}
${h('clear', 'function')}               ${h('-', 'operator')} Clear terminal output
${h('ls', 'function')}                  ${h('-', 'operator')} List available content
${h('cat', 'function')} ${h('<file>', 'variable')}          ${h('-', 'operator')} Display file content
${h('time', 'function')}                ${h('-', 'operator')} Show current time

${h('Navigation:', 'type')}
${h('/projects', 'string')}           ${h('-', 'operator')} Portfolio projects
${h('/about', 'string')}              ${h('-', 'operator')} About me  
${h('/contact', 'string')}            ${h('-', 'operator')} Contact information
${h('/resume', 'string')}             ${h('-', 'operator')} Resume/CV

${h('Keyboard Shortcuts:', 'type')}
${h('Tab', 'keyword')}                 ${h('-', 'operator')} Autocomplete command
${h('↑↓', 'keyword')}                  ${h('-', 'operator')} Command history
${h('Ctrl+C', 'keyword')}              ${h('-', 'operator')} Clear current input`
    };
  }

  private whoami(): CommandResult {
    return {
      output: `${h('Name:', 'property')} ${h(profileData.name, 'string')}
${h('Role:', 'property')} ${h(profileData.title, 'type')}
${h('Location:', 'property')} ${h(profileData.location, 'string')}
${h('Status:', 'property')} ${h(profileData.status, 'keyword')}`
    };
  }

  private grepStack(): CommandResult {
    return {
      output: `${h('Languages:', 'type')} ${profileData.stack.languages.map(l => h(l, 'function')).join(', ')}
${h('Web (Full-stack):', 'type')} ${profileData.stack.web.map(w => h(w, 'keyword')).join(', ')}
${h('Cloud/Infra:', 'type')} ${profileData.stack.cloud.map(c => h(c, 'variable')).join(', ')}`
    };
  }

  private projects(filter?: string): CommandResult {
    let projects = projectsData;
    
    if (filter) {
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.description.toLowerCase().includes(filter.toLowerCase()) ||
        p.stack.some(tech => tech.toLowerCase().includes(filter.toLowerCase()))
      );
    }

    if (projects.length === 0) {
      return { output: `<span class="terminal-error">No projects found matching '${filter}'</span>` };
    }

    const output = projects.map(project => 
      `${project.featured ? h('★', 'keyword') : ''}${h(project.name, 'class')}
  ${h('Role:', 'property')} ${h(project.role, 'type')}
  ${h('Stack:', 'property')} ${project.stack.map(tech => h(tech, 'function')).join(', ')}
  ${h(project.description, 'comment')}
  ${Object.entries(project.links || {}).map(([key, url]) => `${h(key + ':', 'property')} ${h(url, 'string')}`).join('\n  ')}`
    ).join('\n\n');

    return { output };
  }

  private printdContact(): CommandResult {
    return {
      output: `${h('Contact Information:', 'type')}

${h('Email:', 'property')} ${h(profileData.contact.email, 'string')}
${h('GitHub:', 'property')} ${h(profileData.contact.github, 'string')}
${h('Twitter:', 'property')} ${h(profileData.contact.twitter, 'string')}
${h('LinkedIn:', 'property')} ${h(profileData.contact.linkedin, 'string')}

${h('Available for full-time positions, contract work, and consulting projects.', 'comment')}`
    };
  }

  private open(target: string): CommandResult {
    if (!target) {
      return { output: 'Usage: open <route|url>', error: true };
    }

    // Check if it's an internal route
    const internalRoutes = ['/projects', '/about', '/contact', '/resume'];
    if (internalRoutes.includes(target)) {
      return { output: `Navigating to ${target}...`, navigate: target };
    }

    // Check if it's a URL
    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.open(target, '_blank');
      return { output: `Opening ${target} in new tab...` };
    }

    // Check if it's a project link
    const project = projectsData.find(p => p.name.toLowerCase().includes(target.toLowerCase()));
    if (project && project.links) {
      const firstLink = Object.values(project.links)[0] as string;
      window.open(firstLink, '_blank');
      return { output: `Opening ${project.name}...` };
    }

    return { output: `Cannot open '${target}' - not found`, error: true };
  }

  private theme(themeName: string): CommandResult {
    const validThemes = ['lumon', 'neon', 'mono'];
    if (!validThemes.includes(themeName)) {
      return { 
        output: `Invalid theme '${themeName}'\nAvailable themes: ${validThemes.join(', ')}`, 
        error: true 
      };
    }

    // Theme switching will be handled by the component
    return { output: `Switching to ${themeName} theme...`, navigate: `theme:${themeName}` };
  }

  private ls(): CommandResult {
    return {
      output: `about.md
contact.md  
resume.md
projects/
  terminal-portfolio/
  ecommerce-platform/
  rust-cli-tool/
  mobile-trading-app/`
    };
  }

  private cat(filename: string): CommandResult {
    switch (filename) {
      case 'about.md':
        return { output: aboutContent };
      case 'contact.md':
        return { output: contactContent };
      case 'resume.md':
        return { output: resumeContent };
      default:
        return { output: `cat: ${filename}: No such file or directory`, error: true };
    }
  }

  private time(): CommandResult {
    const now = new Date();
    return {
      output: `${now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      })}`
    };
  }

  getAutocomplete(input: string): string[] {
    const commands = [
      'help', 'whoami', 'grep stack', 'projects', 'printd contact', 
      'open', 'theme', 'clear', 'ls', 'cat', 'time', 'cams'
    ];
    
    const routes = ['/projects', '/about', '/contact', '/resume'];
    const themes = ['lumon', 'neon', 'mono'];
    
    if (input.startsWith('open ')) {
      const partial = input.substring(5);
      return routes.filter(route => route.startsWith(partial)).map(route => `open ${route}`);
    }
    
    if (input.startsWith('theme ')) {
      const partial = input.substring(6);
      return themes.filter(theme => theme.startsWith(partial)).map(theme => `theme ${theme}`);
    }
    
    if (input.startsWith('cat ')) {
      const files = ['about.md', 'contact.md', 'resume.md'];
      const partial = input.substring(4);
      return files.filter(file => file.startsWith(partial)).map(file => `cat ${file}`);
    }
    
    return commands.filter(cmd => cmd.startsWith(input));
  }
}
