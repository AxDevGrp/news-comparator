export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-neutral-500">
            © {new Date().getFullYear()} News Comparator. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <span>Referee, not player.</span>
            <a href="https://x.com/NewsComparator" className="hover:text-neutral-900 transition">
              X / Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
