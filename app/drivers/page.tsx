'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db/supabase'
import { useRouter } from 'next/navigation'

export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<any[]>([])
  const [save, setSave] = useState<any>(null)
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

      const { data: driverData } = await supabase
        .from('drivers').select('*').eq('team_id', saveData.team_id)
      setDrivers(driverData || [])
      setLoading(false)
    }

    fetchData()
  }, [router])

  if (loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{ color: teamColor }}>👥 드라이버</h1>
        <p className="text-gray-400 mb-8">{save?.team_name}</p>

        <div className="flex flex-col gap-6">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800"
              style={{ borderLeftColor: teamColor, borderLeftWidth: 4 }}>

              {/* 드라이버 헤더 */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{driver.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    연봉: <span className="text-green-400">${(driver.salary / 1000000).toFixed(1)}M</span>
                  </p>
                </div>
                {/* 이번 시즌 성적 */}
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">포인트</p>
                    <p className="text-yellow-400 font-bold text-xl">0</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">최고 순위</p>
                    <p className="text-white font-bold text-xl">-</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">완주</p>
                    <p className="text-white font-bold text-xl">0</p>
                  </div>
                </div>
              </div>

              {/* 능력치 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: teamColor }}>⚡ Pace</p>
                  {[
                    { label: 'Qualifying', base: driver.qualifying_pace, actual: driver.actual_qualifying_pace },
                    { label: 'Race', base: driver.race_pace, actual: driver.actual_race_pace },
                    { label: 'Wet', base: driver.wet_driving, actual: driver.actual_wet_driving },
                  ].map((stat) => (
                    <div key={stat.label} className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-xs">{stat.label}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white text-xs font-bold">{stat.actual}</span>
                          {stat.actual > stat.base
                            ? <span className="text-green-400 text-xs">▲{stat.actual - stat.base}</span>
                            : stat.actual < stat.base
                            ? <span className="text-red-400 text-xs">▼{stat.base - stat.actual}</span>
                            : null}
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${stat.actual}%`, backgroundColor: teamColor }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: teamColor }}>🔄 Consistency</p>
                  {[
                    { label: 'Stamina', base: driver.stamina, actual: driver.actual_stamina },
                    { label: 'Tyre Mgmt', base: driver.tyre_management, actual: driver.actual_tyre_management },
                    { label: 'Error Avoid', base: driver.error_avoidance, actual: driver.actual_error_avoidance },
                  ].map((stat) => (
                    <div key={stat.label} className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-xs">{stat.label}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white text-xs font-bold">{stat.actual}</span>
                          {stat.actual > stat.base
                            ? <span className="text-green-400 text-xs">▲{stat.actual - stat.base}</span>
                            : stat.actual < stat.base
                            ? <span className="text-red-400 text-xs">▼{stat.base - stat.actual}</span>
                            : null}
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${stat.actual}%`, backgroundColor: teamColor }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: teamColor }}>🏁 Racecraft</p>
                  {[
                    { label: 'Overtaking', base: driver.overtaking, actual: driver.actual_overtaking },
                    { label: 'Defending', base: driver.defending, actual: driver.actual_defending },
                    { label: 'Starts', base: driver.starts, actual: driver.actual_starts },
                  ].map((stat) => (
                    <div key={stat.label} className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-xs">{stat.label}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white text-xs font-bold">{stat.actual}</span>
                          {stat.actual > stat.base
                            ? <span className="text-green-400 text-xs">▲{stat.actual - stat.base}</span>
                            : stat.actual < stat.base
                            ? <span className="text-red-400 text-xs">▼{stat.base - stat.actual}</span>
                            : null}
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${stat.actual}%`, backgroundColor: teamColor }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: teamColor }}>🧠 Experience</p>
                  {[
                    { label: 'Awareness', base: driver.awareness, actual: driver.actual_awareness },
                    { label: 'Composure', base: driver.composure, actual: driver.actual_composure },
                    { label: 'Tech FB', base: driver.technical_feedback, actual: driver.actual_technical_feedback },
                  ].map((stat) => (
                    <div key={stat.label} className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-xs">{stat.label}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white text-xs font-bold">{stat.actual}</span>
                          {stat.actual > stat.base
                            ? <span className="text-green-400 text-xs">▲{stat.actual - stat.base}</span>
                            : stat.actual < stat.base
                            ? <span className="text-red-400 text-xs">▼{stat.base - stat.actual}</span>
                            : null}
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${stat.actual}%`, backgroundColor: teamColor }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}