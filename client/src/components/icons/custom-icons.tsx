// Custom SVG icons to replace Lucide React (40KB bundle savings)
// All icons optimized for 16x16, 20x20, 24x24 sizes with currentColor

interface IconProps {
  className?: string
  size?: number
}

export const AlertTriangle = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' />
    <path d='M12 9v4' />
    <path d='m12 17 .01 0' />
  </svg>
)

export const RefreshCw = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' />
    <path d='M21 3v5h-5' />
    <path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' />
    <path d='M8 16H3v5' />
  </svg>
)

export const Terminal = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <polyline points='4,17 10,11 4,5' />
    <line x1='12' x2='20' y1='19' y2='19' />
  </svg>
)

export const Code = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <polyline points='16,18 22,12 16,6' />
    <polyline points='8,6 2,12 8,18' />
  </svg>
)

export const Bug = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='m8 2 1.88 1.88' />
    <path d='M14.12 3.88 16 2' />
    <path d='M9 7.13v-1a3.003 3.003 0 1 1 6 0v1' />
    <path d='M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6' />
    <path d='M12 20v-9' />
    <path d='M6.53 9C4.6 8.8 3 7.1 3 5' />
    <path d='M6 13H2' />
    <path d='M3 21c0-2.1 1.7-3.9 3.8-4' />
    <path d='M20.97 5c0 2.1-1.6 3.8-3.5 4' />
    <path d='M22 13h-4' />
    <path d='M17.2 17c2.1.1 3.8 1.9 3.8 4' />
  </svg>
)

export const Home = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
    <polyline points='9,22 9,12 15,12 15,22' />
  </svg>
)

export const FolderOpen = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2' />
  </svg>
)

export const User = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
    <circle cx='12' cy='7' r='4' />
  </svg>
)

export const Mail = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <rect width='20' height='16' x='2' y='4' rx='2' />
    <path d='m22 7-10 5L2 7' />
  </svg>
)

export const Palette = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <circle cx='13.5' cy='6.5' r='.5' fill='currentColor' />
    <circle cx='17.5' cy='10.5' r='.5' fill='currentColor' />
    <circle cx='8.5' cy='7.5' r='.5' fill='currentColor' />
    <circle cx='6.5' cy='12.5' r='.5' fill='currentColor' />
    <path d='M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z' />
  </svg>
)

export const ArrowLeft = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='m12 19-7-7 7-7' />
    <path d='M19 12H5' />
  </svg>
)

export const Code2 = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='m18 16 4-4-4-4' />
    <path d='m6 8-4 4 4 4' />
    <path d='m14.5 4-5 16' />
  </svg>
)

export const ExternalLink = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M15 3h6v6' />
    <path d='M10 14 21 3' />
    <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
  </svg>
)

export const Star = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <polygon points='12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26' />
  </svg>
)

export const Download = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
    <polyline points='7,10 12,15 17,10' />
    <line x1='12' x2='12' y1='15' y2='3' />
  </svg>
)

export const MessageCircle = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M7.9 20A9 9 0 1 0 4 16.1L2 22Z' />
  </svg>
)

export const Users = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
    <circle cx='9' cy='7' r='4' />
    <path d='m22 21-2-2' />
    <path d='m16 16 2 2' />
    <circle cx='20' cy='8' r='3' />
  </svg>
)

export const AlertCircle = ({ className = '', size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <circle cx='12' cy='12' r='10' />
    <path d='m9 9 3 3 3-3' />
    <path d='M12 8v8' />
  </svg>
)
