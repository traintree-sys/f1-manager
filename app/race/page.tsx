'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/supabase'
import { generateWeather } from '@/lib/simulation/weather'

export default function RacePage() {
  const router = useRouter()
  const [save, setSave] = useState<any>(null)
  const [races, setRaces] = useState<any[]>([])
  const [teamColor, setTeamColor] = useState('#ff0000')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const slot = localStorage.getItem('selectedSlot')
    const color = localStorage.getItem('selectedTeamColor') || '#ff0000'
    setTeamColor(color)
    if (!slot) { router.push('/'); return }

    const fetchData = async () => {
      const { data: saveData } = await supabase
        .from('saves').select('*').eq('slot', slot).single()
      if (!saveData) { router.push('/'); return }
      setSave(saveData)

      const { data: raceData } = await supabase
        .from('races').select('*').eq('season', 2026).order('race_date')
      setRaces(raceData || [])

      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleSelectRace = (race: any) => {
    const w = generateWeather(race.circuit_name)
    localStorage.setItem('selectedRace', JSON.stringify(race))
    localStorage.setItem('selectedWeather', JSON.stringify(w))
    router.push('/race/weekend')
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{ color: teamColor }}>🏁 레이스 일정</h1>
        <p className="text-gray-400 mb-8">2026 시즌 · 라운드 {save?.current_race}</p>
        <div className="flex flex-col gap-3">
          {races.map((race, index) => (
            <div
              key={race.id}
              className={`rounded-xl p-5 border flex items-center justify-between
                ${race.status === 'completed' ? 'bg-gray-800 border-gray-700 opacity-50' :
                race.status === 'cancelled' ? 'bg-gray-800 border-gray-700 opacity-40' :
                'bg-gray-900 border-gray-800'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-600 w-8">{index + 1}</span>
                <div>
                  <p className="font-bold">{race.circuit_name}</p>
                  <p className="text-gray-400 text-sm">{race.race_date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {race.sprint && (
                  <span className="bg-yellow-500 text-yellow-950 text-xs font-bold px-2 py-1 rounded-full">
                    스프린트
                  </span>
                )}
                {race.status === 'upcoming' ? (
                  <button
                    onClick={() => handleSelectRace(race)}
                    className="text-xs px-4 py-2 rounded-lg font-bold transition"
                    style={{ backgroundColor: teamColor, color: '#000' }}
                  >
                    레이스 시작
                  </button>
                ) : (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full
                    ${race.status === 'completed' ? 'bg-gray-700 text-gray-400' : 'bg-red-900 text-red-400'}`}>
                    {race.status === 'completed' ? '완료' : '취소'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}