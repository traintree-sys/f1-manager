import { supabase } from '@/lib/db/supabase'

export default async function DriversPage() {
  const { data: drivers } = await supabase
    .from('drivers')
    .select('*, teams(name)')
    .order('speed', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold text-red-500 mb-8">👥 2026 드라이버</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drivers?.map((driver) => (
          <div key={driver.id} className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex justify-between items-center">
            <div>
              <p className="text-lg font-bold">{driver.name}</p>
              <p className="text-red-400 text-sm">{driver.teams?.name}</p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>속도 <span className="text-yellow-400 font-bold">{driver.speed}</span></p>
              <p>체력 <span className="text-green-400 font-bold">{driver.stamina}</span></p>
              <p>경험 <span className="text-blue-400 font-bold">{driver.experience}</span></p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}