'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [save, setSave] = useState<any>(null)
  const [drivers, setDrivers] = useState<any[]>([])
  const [car, setCar] = useState<any>(null)
  const [pu, setPu] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [teamColor, setTeamColor] = useState('#ff0000')

  useEffect(() => {
    const slot = localStorage.getItem('selectedSlot')
    const color = localStorage.getItem('selectedTeamColor') || '#ff0000'
    setTeamColor(color)

    if (!slot) {
      router.push('/')
      return
    }

    const fetchData = async () => {
      const { data: saveData } = await supabase
        .from('saves')
        .select('*, teams(*)')
        .eq('slot', slot)
        .single()

      if (!saveData) {
        router.push('/')
        return
      }

      setSave(saveData)

      const { data: driverData } = await supabase
        .from('drivers')
        .select('*')
        .eq('team_id', saveData.team_id)

      setDrivers(driverData || [])

      const { data: carData } = await supabase
        .from('cars')
        .select('*')
        .eq('team_id', saveData.team_id)
        .single()

      setCar(carData)

      if (carData?.power_unit_id) {
        const { data: puData } = await supabase
          .from('power_units')
          .select('*')
          .eq('id', carData.power_unit_id)
          .single()
        setPu(puData)
      }

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

        {/* 팀 헤더 */}
        <div
          className="rounded-xl p-6 mb-8 border-l-4"
          style={{ borderColor: teamColor, backgroundColor: `${teamColor}15` }}
        >
          <p className="text-gray-400 text-sm mb-1">2026 시즌</p>
          <h1 className="text-4xl font-bold" style={{ color: teamColor }}>
            {save?.team_name}
          </h1>
          <div className="flex gap-6 mt-3">
            <div>
              <p className="text-gray-400 text-sm">예산</p>
              <p className="text-green-400 font-bold">${(save?.budget / 1000000).toFixed(0)}M</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">포인트</p>
              <p className="text-yellow-400 font-bold">{save?.points} pts</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">다음 레이스</p>
              <p className="text-white font-bold">라운드 {save?.current_race}</p>
            </div>
          </div>
        </div>

        {/* 드라이버 */}
        <h2 className="text-xl font-bold mb-4" style={{ color: teamColor }}>👥 드라이버</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h3 className="text-lg font-bold mb-4">{driver.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* 페이스 */}
                <div>
                  <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: teamColor }}>⚡ Pace</p>
                  {[
                    { label: 'Qualifying', value: driver.actual_qualifying_pace },
                    { label: 'Race', value: driver.actual_race_pace },
                    { label: 'Wet', value: driver.actual_wet_driving },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2 mb-1.5">
                      <span className="text-gray-400 text-xs w-16">{stat.label}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${stat.value}%`, backgroundColor: teamColor }} />
                      </div>
                      <span className="text-white text-xs font-bold w-6">{stat.value}</span>
                    </div>
                  ))}
                </div>
                {/* 일관성 */}
                <div>
                  <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: teamColor }}>🔄 Consistency</p>
                  {[
                    { label: 'Stamina', value: driver.actual_stamina },
                    { label: 'Tyre Mgmt', value: driver.actual_tyre_management },
                    { label: 'Error Avoid', value: driver.actual_error_avoidance },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2 mb-1.5">
                      <span className="text-gray-400 text-xs w-16">{stat.label}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${stat.value}%`, backgroundColor: teamColor }} />
                      </div>
                      <span className="text-white text-xs font-bold w-6">{stat.value}</span>
                    </div>
                  ))}
                </div>
                {/* 레이스크래프트 */}
                <div>
                  <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: teamColor }}>🏁 Racecraft</p>
                  {[
                    { label: 'Overtaking', value: driver.actual_overtaking },
                    { label: 'Defending', value: driver.actual_defending },
                    { label: 'Starts', value: driver.actual_starts },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2 mb-1.5">
                      <span className="text-gray-400 text-xs w-16">{stat.label}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${stat.value}%`, backgroundColor: teamColor }} />
                      </div>
                      <span className="text-white text-xs font-bold w-6">{stat.value}</span>
                    </div>
                  ))}
                </div>
                {/* 경험 */}
                <div>
                  <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: teamColor }}>🧠 Experience</p>
                  {[
                    { label: 'Awareness', value: driver.actual_awareness },
                    { label: 'Composure', value: driver.actual_composure },
                    { label: 'Tech FB', value: driver.actual_technical_feedback },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2 mb-1.5">
                      <span className="text-gray-400 text-xs w-16">{stat.label}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${stat.value}%`, backgroundColor: teamColor }} />
                      </div>
                      <span className="text-white text-xs font-bold w-6">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 차량 */}
        {car && (
          <>
            <h2 className="text-xl font-bold mb-4" style={{ color: teamColor }}>🔧 차량</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <p className="text-gray-500 text-xs mb-3 uppercase tracking-widest">차량</p>
                {[
                  { label: '에어로', value: car.actual_aerodynamics },
                  { label: '섀시', value: car.actual_chassis },
                  { label: '신뢰성', value: car.actual_reliability },
                  { label: '타이어 관리', value: car.actual_tyre_management },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3 mb-2">
                    <span className="text-gray-400 text-sm w-16">{stat.label}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${stat.value}%`, backgroundColor: teamColor }} />
                    </div>
                    <span className="text-white text-sm font-bold w-6">{stat.value}</span>
                  </div>
                ))}
              </div>
              {pu && (
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                  <p className="text-gray-500 text-xs mb-3 uppercase tracking-widest">파워유닛 — {pu.manufacturer}</p>
                  {[
                    { label: '출력', value: pu.actual_power },
                    { label: '배포', value: pu.actual_deployment },
                    { label: '신뢰성', value: pu.actual_reliability },
                    { label: '내구성', value: pu.actual_durability },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-3 mb-2">
                      <span className="text-gray-400 text-sm w-16">{stat.label}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${stat.value}%`, backgroundColor: teamColor }} />
                      </div>
                      <span className="text-white text-sm font-bold w-6">{stat.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}