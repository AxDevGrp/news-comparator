import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'News Comparator — See How the News is Reported',
  description: 'Meta-journalism platform. We do not report the news. We report how the news is reported across the political spectrum.',
  openGraph: {
    title: 'News Comparator',
    description: 'The truth is in the gaps between sources.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
