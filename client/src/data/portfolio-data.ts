export const profileData = {
  name: 'Tulio Cunha',
  title: 'Full-stack Developer',
  location: 'Remote',
  status: 'Available for projects',
  stack: {
    languages: ['Swift', 'Rust', 'Go', 'TypeScript'],
    web: ['Svelte/SvelteKit', 'React', 'Next.js', 'Vite', 'Tailwind'],
    cloud: ['AWS/GCP/Azure', 'Docker', 'CI/CD'],
  },
  contact: {
    email: 'contact@tuliocunha.dev',
    github: 'https://github.com/tuliocunha',
    twitter: 'https://twitter.com/tuliocunha',
    linkedin: 'https://linkedin.com/in/tuliocunha',
  },
}

export const projectsData = [
  {
    id: '1',
    name: 'Terminal Portfolio',
    description:
      'A vintage CRT-inspired portfolio website with interactive terminal interface and tmux-style pane management.',
    role: 'Solo Developer',
    stack: ['React', 'TypeScript', 'Tailwind'],
    links: {
      demo: 'https://portfolio.tuliocunha.dev',
      github: 'https://github.com/tuliocunha/terminal-portfolio',
    },
    featured: true,
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=200&fit=crop',
    stats: {
      performance: '98%',
      accessibility: 'AAA',
    },
  },
  {
    id: '2',
    name: 'E-Commerce Platform',
    description:
      'Modern commerce solution with real-time inventory management and secure payment processing.',
    role: 'Lead Developer',
    stack: ['Next.js', 'Stripe', 'PostgreSQL'],
    links: {
      demo: 'https://ecommerce.example.com',
      github: 'https://github.com/tuliocunha/ecommerce-platform',
    },
    featured: false,
  },
  {
    id: '3',
    name: 'Rust CLI Tool',
    description: 'High-performance system monitoring utility built with modern Rust practices.',
    role: 'Creator',
    stack: ['Rust', 'Clap', 'Tokio'],
    links: {
      github: 'https://github.com/tuliocunha/rust-monitor',
    },
    featured: false,
  },
  {
    id: '4',
    name: 'Mobile Trading App',
    description: 'Real-time trading interface with advanced charts and portfolio management.',
    role: 'iOS Developer',
    stack: ['Swift', 'SwiftUI', 'Combine'],
    links: {
      appstore: 'https://apps.apple.com/app/trading-app',
    },
    featured: false,
  },
]

export const aboutContent = `
# About Me

I'm a passionate full-stack developer with expertise in modern web technologies and systems programming. I enjoy building efficient, scalable applications that solve real-world problems.

## Experience

- **Senior Full-stack Developer** at TechCorp (2022-Present)
- **Software Engineer** at StartupXYZ (2020-2022)
- **Junior Developer** at WebAgency (2018-2020)

## Skills

### Programming Languages
- **Swift**: iOS app development, server-side Swift
- **Rust**: Systems programming, CLI tools, web backends
- **Go**: Microservices, concurrent programming
- **TypeScript**: Full-stack web development

### Web Technologies
- **Frontend**: React, Svelte, Next.js, SvelteKit
- **Styling**: Tailwind CSS, Sass, CSS-in-JS
- **Build Tools**: Vite, Webpack, Rollup

### Cloud & Infrastructure
- **Cloud Platforms**: AWS, GCP, Azure
- **Containerization**: Docker, Kubernetes
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins

## Philosophy

I believe in writing clean, maintainable code and creating user experiences that are both functional and delightful. I'm constantly learning new technologies and best practices to stay at the forefront of software development.
`

export const contactContent = `
# Get In Touch

I'm always interested in discussing new opportunities, collaborating on projects, or just having a conversation about technology.

## Contact Information

- **Email**: contact@tuliocunha.dev
- **GitHub**: github.com/tuliocunha
- **Twitter**: @tuliocunha
- **LinkedIn**: linkedin.com/in/tuliocunha

## Availability

Currently available for:
- Full-time positions
- Contract work
- Consulting projects
- Open source collaboration

Feel free to reach out through any of the channels above!
`

export const resumeContent = `
# Tulio Cunha
## Full-stack Developer

### Contact
- Email: contact@tuliocunha.dev
- GitHub: github.com/tuliocunha
- LinkedIn: linkedin.com/in/tuliocunha

### Summary
Experienced full-stack developer with 6+ years of experience building scalable web applications and mobile apps. Proficient in modern web technologies, systems programming, and cloud infrastructure.

### Technical Skills
- **Languages**: Swift, Rust, Go, TypeScript, JavaScript, Python
- **Frontend**: React, Svelte, Next.js, SvelteKit, Tailwind CSS
- **Backend**: Node.js, Express, Actix-web, Gin, FastAPI
- **Databases**: PostgreSQL, MongoDB, Redis
- **Cloud**: AWS, GCP, Azure, Docker, Kubernetes
- **Tools**: Git, VS Code, Figma, Linear

### Experience

#### Senior Full-stack Developer | TechCorp | 2022 - Present
- Led development of microservices architecture serving 1M+ users
- Implemented real-time features using WebSockets and Redis
- Mentored junior developers and established coding standards

#### Software Engineer | StartupXYZ | 2020 - 2022
- Built responsive web applications using React and TypeScript
- Developed RESTful APIs with Go and PostgreSQL
- Implemented CI/CD pipelines reducing deployment time by 60%

#### Junior Developer | WebAgency | 2018 - 2020
- Created custom WordPress themes and plugins
- Developed e-commerce solutions with Shopify and WooCommerce
- Collaborated with design team to implement pixel-perfect UIs

### Education
- **Bachelor of Computer Science** | University of Technology | 2014 - 2018

### Projects
- **Terminal Portfolio**: Interactive CRT-themed portfolio website
- **Rust CLI Monitor**: High-performance system monitoring tool
- **Trading Mobile App**: Real-time trading interface for iOS
`
