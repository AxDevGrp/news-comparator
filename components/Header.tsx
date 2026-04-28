'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Scale } from 'lucide-react'

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-neutral-700" />
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              News Comparator
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition">
              Daily Pulse
            </Link>
            <Link href="/war-room/iran-war" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition">
              War Room
            </Link>
            <Link href="#about" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition">
              About
            </Link>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link href="/" className="block text-sm font-medium text-neutral-600" onClick={() => setOpen(false)}>
              Daily Pulse
            </Link>
            <Link href="/war-room/iran-war" className="block text-sm font-medium text-neutral-600" onClick={() => setOpen(false)}>
              War Room
            </Link>
            <Link href="#about" className="block text-sm font-medium text-neutral-600" onClick={() => setOpen(false)}>
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
