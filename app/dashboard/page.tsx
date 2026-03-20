'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [save, setSave] = useState<any>(null)
  const [drivers, setDrivers] = useState<any[]>([])
  const [nextRace, setNextRace] = useState<any>(null)
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

      const { data: raceData } = await supabase
        .from('races').select('*')
        .eq('season', 2026)
        .eq('status', 'upcoming')
        .order('race_date', { ascending: true })
        .limit(1)
      setNextRace(raceData?.[0] || null)

      setLoading(false)
    }
    fetchData()
  }, [router])

  if (loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  const daysUntilRace = nextRace
    ? Math.ceil((new Date(nextRace.race_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* 팀 헤더 */}
        <div
          className="rounded-xl p-6 mb-8 border-l-4"
          style={{ borderColor: teamColor, backgroundColor: `${teamColor}15` }}
        >
          <p className="text-gray-400 text-sm mb-1">2026 시즌</p>
          <h1 className="text-4xl font-bold" style={{ color: teamColor }}>{save?.team_name}</h1>
          <div className="flex gap-8 mt-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">예산</p>
              <p className="text-green-400 font-bold text-lg">${(save?.budget / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">컨스트럭터 포인트</p>
              <p className="text-yellow-400 font-bold text-lg">{save?.points} pts</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">완료 레이스</p>
              <p className="text-white font-bold text-lg">{(save?.current_race || 1) - 1} / 22</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* 다음 레이스 */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">🏁 다음 레이스</p>
            {nextRace ? (
              <>
                <p className="text-xl font-bold mb-1">{nextRace.circuit_name}</p>
                <p className="text-gray-400 text-sm mb-3">{nextRace.race_date}</p>
                <div className="flex items-center gap-3">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: teamColor }}
                  >
                    D-{daysUntilRace}
                  </span>
                  {nextRace.sprint && (
                    <span className="bg-yellow-500 text-yellow-950 text-xs font-bold px-2 py-1 rounded-full">
                      스프린트
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-500">시즌 종료</p>
            )}
          </div>

          {/* 드라이버 순위 */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">👥 우리 팀 드라이버</p>
            {drivers.map((driver, i) => (
              <div key={driver.id} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm w-4">{i + 1}</span>
                  <span className="font-bold">{driver.name}</span>
                </div>
                <span className="text-yellow-400 font-bold">0 pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/drivers', label: '👥 드라이버', desc: '능력치 확인' },
            { href: '/garage', label: '🔧 차고', desc: '차량 업그레이드' },
            { href: '/team', label: '🏢 팀 관리', desc: '시설 업그레이드' },
            { href: '/finances', label: '💰 재정', desc: '예산 현황' },
            { href: '/race', label: '🏁 레이스', desc: '일정 확인' },
          ].map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="bg-gray-900 hover:bg-gray-800 rounded-xl p-4 border border-gray-800 hover:border-gray-600 transition"
            >
              <p className="font-bold mb-1">{menu.label}</p>
              <p className="text-gray-500 text-xs">{menu.desc}</p>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}