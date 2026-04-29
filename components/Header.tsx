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
            <Link href="/feed" className="text-sm font-medium text-neutral-900 transition">
              Live Feed
            </Link>
            <Link href="/topics" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition">
              Topics
            </Link>
            <Link href="/x-top-stories" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition">
              X Top Stories
            </Link>
            <Link href="/trends" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition">
              Trends
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
            <Link href="/feed" className="block text-sm font-medium text-neutral-900" onClick={() => setOpen(false)}>
              Live Feed
            </Link>
            <Link href="/topics" className="block text-sm font-medium text-neutral-600" onClick={() => setOpen(false)}>
              Topics
            </Link>
            <Link href="/x-top-stories" className="block text-sm font-medium text-neutral-600" onClick={() => setOpen(false)}>
              X Top Stories
            </Link>
            <Link href="/trends" className="block text-sm font-medium text-neutral-600" onClick={() => setOpen(false)}>
              Trends
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
