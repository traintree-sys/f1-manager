'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CIRCUITS } from '@/lib/simulation/weather'
import { CIRCUIT_CHARACTERISTICS } from '@/lib/simulation/qualifying'

export default function Dashboard() {
  const router = useRouter()
  const [save, setSave] = useState<any>(null)
  const [myDrivers, setMyDrivers] = useState<any[]>([])
  const [nextRace, setNextRace] = useState<any>(null)
  const [teamColor, setTeamColor] = useState('#ff0000')
  const [loading, setLoading] = useState(true)
  const [driverStandings, setDriverStandings] = useState<any[]>([])
  const [constructorStandings, setConstructorStandings] = useState<any[]>([])
  const [myTeamId, setMyTeamId] = useState<string | null>(null)
  const [myDriverIds, setMyDriverIds] = useState<string[]>([])

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
      setMyTeamId(saveData.team_id)

      const { data: driverData } = await supabase
        .from('drivers').select('*').eq('team_id', saveData.team_id)
      setMyDrivers(driverData || [])
      setMyDriverIds(driverData?.map((d: any) => d.id) || [])

      const { data: nextRaceData } = await supabase
        .from('races').select('*')
        .eq('season', 2026).eq('status', 'upcoming')
        .order('race_date', { ascending: true }).limit(1)
      setNextRace(nextRaceData?.[0] || null)

      const { data: raceResults } = await supabase
        .from('race_results')
        .select('driver_id, points, position, fastest_lap, drivers(name, team_id, teams(name, color))')

      const driverMap: Record<string, any> = {}
      raceResults?.forEach((r: any) => {
        const id = r.driver_id
        if (!driverMap[id]) {
          driverMap[id] = {
            id,
            name: r.drivers?.name || '?',
            teamName: r.drivers?.teams?.name || '?',
            teamColor: r.drivers?.teams?.color || '#fff',
            teamId: r.drivers?.team_id,
            points: 0, wins: 0,
          }
        }
        driverMap[id].points += r.points || 0
        if (r.position === 1) driverMap[id].wins += 1
      })

      const driverList = Object.values(driverMap)
        .sort((a, b) => b.points - a.points || b.wins - a.wins)
      setDriverStandings(driverList)

      const constructorMap: Record<string, any> = {}
      driverList.forEach((d: any) => {
        if (!d.teamId) return
        if (!constructorMap[d.teamId]) {
          constructorMap[d.teamId] = {
            id: d.teamId, name: d.teamName, color: d.teamColor,
            points: 0, wins: 0,
          }
        }
        constructorMap[d.teamId].points += d.points
        constructorMap[d.teamId].wins += d.wins
      })
      setConstructorStandings(
        Object.values(constructorMap).sort((a, b) => b.points - a.points || b.wins - a.wins)
      )

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

  const nextCircuit = nextRace ? CIRCUITS[nextRace.circuit_name] : null
  const nextCircuitType = nextRace ? CIRCUIT_CHARACTERISTICS[nextRace.circuit_name] : null
  const myConstructorRank = constructorStandings.findIndex(t => t.id === myTeamId) + 1
  const completedRaces = (save?.current_race || 1) - 1
  const myDriverPoints = driverStandings.filter(d => myDriverIds.includes(d.id))

  const circuitTypeKo: Record<string, string> = {
    street: '시가지',
    high_speed: '고속',
    technical: '기술적',
    balanced: '균형',
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* 팀 헤더 */}
        <div className="rounded-xl p-6 mb-6 border-l-4"
          style={{ borderColor: teamColor, backgroundColor: `${teamColor}10` }}>
          <p className="text-gray-400 text-sm mb-1">2026 시즌</p>
          <h1 className="text-4xl font-bold mb-4" style={{ color: teamColor }}>{save?.team_name}</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">예산</p>
              <p className="text-green-400 font-bold text-lg">${(save?.budget / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">컨스트럭터 포인트</p>
              <p className="text-yellow-400 font-bold text-lg">{save?.points} pts</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">컨스트럭터 순위</p>
              <p className="font-bold text-lg" style={{ color: teamColor }}>
                {myConstructorRank > 0 ? `P${myConstructorRank}` : '-'}
              </p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">완료 레이스</p>
              <p className="text-white font-bold text-lg">{completedRaces} / 22</p>
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
                <p className="text-gray-400 text-sm mb-4">{nextRace.race_date}</p>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold" style={{ color: teamColor }}>
                    D-{daysUntilRace}
                  </span>
                  {nextRace.sprint && (
                    <span className="bg-yellow-500 text-yellow-950 text-xs font-bold px-2 py-1 rounded-full">
                      스프린트
                    </span>
                  )}
                </div>
                {nextCircuit && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-gray-500 text-xs mb-1">총 랩수</p>
                      <p className="font-bold text-sm">{nextCircuit.laps}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-gray-500 text-xs mb-1">서킷 타입</p>
                      <p className="font-bold text-xs">
                        {nextCircuitType ? circuitTypeKo[nextCircuitType] || nextCircuitType : '균형'}
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-gray-500 text-xs mb-1">랩 거리</p>
                      <p className="font-bold text-sm">{nextCircuit.lapDistance}km</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">시즌 종료</p>
            )}
          </div>

          {/* 우리팀 드라이버 */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">👥 우리 팀 드라이버</p>
            {myDrivers.map((driver) => {
              const standing = myDriverPoints.find(d => d.id === driver.id)
              const rank = driverStandings.findIndex(d => d.id === driver.id) + 1
              return (
                <div key={driver.id}
                  className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="font-bold">{driver.name}</p>
                    <p className="text-gray-500 text-xs">
                      드라이버 순위: {rank > 0 ? `P${rank}` : '-'}
                    </p>
                  </div>
                  <p className="text-yellow-400 font-bold text-lg">
                    {standing?.points || 0} pts
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* 드라이버 챔피언십 TOP 5 */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-500 text-xs uppercase tracking-widest">👥 드라이버 챔피언십</p>
              <Link href="/standings" className="text-xs text-gray-500 hover:text-white">전체보기 →</Link>
            </div>
            {driverStandings.length === 0 ? (
              <p className="text-gray-600 text-sm">아직 레이스 결과가 없어요</p>
            ) : (
              driverStandings.slice(0, 5).map((d, i) => {
                const isMyDriver = myDriverIds.includes(d.id)
                return (
                  <div key={d.id}
                    className={`flex items-center py-2 border-b border-gray-800 last:border-0
                      ${isMyDriver ? 'bg-gray-800 -mx-2 px-2 rounded-lg' : ''}`}>
                    <span className={`w-6 text-sm font-bold mr-3
                      ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {i + 1}
                    </span>
                    <div className="w-1 h-6 rounded-full mr-3" style={{ backgroundColor: d.teamColor }} />
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${isMyDriver ? 'text-white' : 'text-gray-300'}`}>
                        {d.name}
                        {isMyDriver && <span className="text-xs ml-1" style={{ color: teamColor }}>◀</span>}
                      </p>
                      <p className="text-gray-600 text-xs">{d.teamName}</p>
                    </div>
                    <p className="text-yellow-400 font-bold text-sm">{d.points}</p>
                  </div>
                )
              })
            )}
          </div>

          {/* 컨스트럭터 챔피언십 TOP 5 */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-500 text-xs uppercase tracking-widest">🏎️ 컨스트럭터 챔피언십</p>
              <Link href="/standings" className="text-xs text-gray-500 hover:text-white">전체보기 →</Link>
            </div>
            {constructorStandings.length === 0 ? (
              <p className="text-gray-600 text-sm">아직 레이스 결과가 없어요</p>
            ) : (
              constructorStandings.slice(0, 5).map((t, i) => {
                const isMyTeam = t.id === myTeamId
                return (
                  <div key={t.id}
                    className={`flex items-center py-2 border-b border-gray-800 last:border-0
                      ${isMyTeam ? 'bg-gray-800 -mx-2 px-2 rounded-lg' : ''}`}>
                    <span className={`w-6 text-sm font-bold mr-3
                      ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {i + 1}
                    </span>
                    <div className="w-1 h-6 rounded-full mr-3" style={{ backgroundColor: t.color }} />
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${isMyTeam ? 'text-white' : 'text-gray-300'}`}>
                        {t.name}
                        {isMyTeam && <span className="text-xs ml-1" style={{ color: teamColor }}>◀</span>}
                      </p>
                      <p className="text-gray-600 text-xs">우승 {t.wins}회</p>
                    </div>
                    <p className="text-yellow-400 font-bold text-sm">{t.points}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
              className="bg-gray-900 hover:bg-gray-800 rounded-xl p-4 border border-gray-800 hover:border-gray-600 transition text-center"
            >
              <p className="font-bold text-sm mb-1">{menu.label}</p>
              <p className="text-gray-500 text-xs">{menu.desc}</p>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}