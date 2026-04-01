import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  dark?: boolean
}

export default function Logo({ href = '/', size = 'md', className, dark }: LogoProps) {
  const s = {
    sm: { wrap: 'w-8 h-8 rounded-xl',  svg: 'w-4 h-4',  text: 'text-lg'  },
    md: { wrap: 'w-10 h-10 rounded-xl', svg: 'w-5 h-5',  text: 'text-xl'  },
    lg: { wrap: 'w-12 h-12 rounded-xl', svg: 'w-6 h-6',  text: 'text-2xl' },
  }[size]

  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2.5 no-underline shrink-0', className)}
    >
      <div
        className={cn(
          s.wrap,
          'flex items-center justify-center shrink-0',
          'bg-gradient-to-br from-wa to-wa-dark shadow-wa',
        )}
      >
        <svg className={s.svg} viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2C5.58 2 2 5.58 2 10c0 1.42.37 2.75 1.02 3.9L2 18l4.25-1.1A7.94 7.94 0 0010 18c4.42 0 8-3.58 8-8s-3.58-8-8-8z"
            fill="white"
            opacity=".95"
          />
        </svg>
      </div>
      <span
        className={cn(
          s.text,
          'font-display font-extrabold tracking-tight leading-none',
          dark ? 'text-white' : 'text-ink',
        )}
      >
        Shoppr<span className={dark ? 'text-wa' : 'text-wa-dark'}>HQ</span>
      </span>
    </Link>
  )
}
