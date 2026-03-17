import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-red-500 mb-4">🏎️ F1 Manager</h1>
      <p className="text-gray-400 text-xl mb-12">나만의 F1 팀을 만들어보세요</p>
      <div className="flex gap-4">
        <Link href="/dashboard" className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition">
          게임 시작
        </Link>
      </div>
    </main>
  )
}