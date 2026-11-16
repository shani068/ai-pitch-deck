import type { CSSProperties, JSX } from 'react'
import './Icon.css'
import {
  ArrowRightIcon,
  CheckTickCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  EnvelopeIcon,
  FileIcon,
  LockCloseIcon,
  MultipleCrossCancelIcon,
  PlusIcon,
  UserIcon,
} from '@/src/components/icons'

// This project's copy of the kit draws its glyphs with Pikaicons (the project's one icon set,
// see AGENTS.md) instead of lucide-react, so a row of icons shares one family and stroke. Only the
// names the project has generated are available; add more with `vp dlx pikaicons add`.
const PIKA = {
  arrow: ArrowRightIcon,
  check: CheckTickCircleIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-right': ChevronRightIcon,
  clock: ClockIcon,
  close: MultipleCrossCancelIcon,
  file: FileIcon,
  lock: LockCloseIcon,
  mail: EnvelopeIcon,
  plus: PlusIcon,
  user: UserIcon,
} as const satisfies Record<string, (props: JSX.IntrinsicElements['svg']) => JSX.Element>

export type IconName = keyof typeof PIKA

/**
 * A small icon in currentColor. `stroke` is in screen px (Pikaicons are drawn on a 24px grid at a
 * 2px stroke), so every glyph in a row shares one weight at any size.
 */
export function Icon({ name, size = 16, stroke = 1.5, className, style }: { name: IconName; size?: number; stroke?: number; className?: string; style?: CSSProperties }) {
  const Glyph = PIKA[name]
  // Pikaicons set strokeWidth on their paths, so scale it with a CSS variable the stylesheet reads.
  const weight = (stroke * 24) / size
  return (
    <Glyph
      width={size}
      height={size}
      aria-hidden
      className={`ss-icon${className ? ` ${className}` : ''}`}
      style={{ ['--ss-icon-stroke' as string]: weight, ...style }}
    />
  )
}
