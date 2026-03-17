export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold text-red-500 mb-8">🏁 대시보드</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-2">💰 예산</h2>
          <p className="text-3xl font-bold text-green-400">$100,000,000</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-2">🏆 포인트</h2>
          <p className="text-3xl font-bold text-yellow-400">0 pts</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-2">👥 드라이버</h2>
          <p className="text-gray-400">아직 드라이버가 없어요</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-2">🔧 차량 상태</h2>
          <p className="text-gray-400">차량 개발이 필요해요</p>
        </div>
      </div>
    </main>
  )
}