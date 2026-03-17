import { supabase } from '@/lib/db/supabase'

export default async function RacePage() {
  const { data: races } = await supabase
    .from('races')
    .select('*')
    .eq('season', 2026)
    .order('race_date', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold text-red-500 mb-8">🏁 2026 레이스 일정</h1>
      <div className="flex flex-col gap-3">
        {races?.map((race, index) => (
          <div
            key={race.id}
            className={`rounded-xl p-5 border flex items-center justify-between
              ${race.status === 'completed' || race.status === 'cancelled'
                ? 'bg-gray-800 border-gray-700 opacity-60'
                : 'bg-gray-900 border-gray-800'
              }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-600 w-8">{index + 1}</span>
              <div>
                <p className="text-lg font-bold">{race.circuit_name}</p>
                <p className="text-gray-400 text-sm">{race.race_date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {race.sprint && (
                <span className="bg-yellow-500 text-yellow-950 text-xs font-bold px-2 py-1 rounded-full">
                  스프린트
                </span>
              )}
              <span className={`text-xs font-bold px-3 py-1 rounded-full
                ${race.status === 'completed'
                  ? 'bg-gray-700 text-gray-400'
                  : race.status === 'cancelled'
                  ? 'bg-red-900 text-red-400'
                  : 'bg-red-500 text-white'
                }`}>
                {race.status === 'completed' ? '완료' : race.status === 'cancelled' ? '취소' : '예정'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}