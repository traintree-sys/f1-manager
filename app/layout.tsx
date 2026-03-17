import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'F1 Manager',
  description: 'F1 Management Game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-950">
        <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex gap-6 items-center">
          <Link href="/" className="text-red-500 font-bold text-xl">🏎️ F1 Manager</Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">대시보드</Link>
          <Link href="/drivers" className="text-gray-400 hover:text-white transition">드라이버</Link>
          <Link href="/garage" className="text-gray-400 hover:text-white transition">차고</Link>
          <Link href="/finances" className="text-gray-400 hover:text-white transition">재정</Link>
          <Link href="/race" className="text-gray-400 hover:text-white transition">레이스</Link>
        </nav>
        {children}
      </body>
    </html>
  )
}