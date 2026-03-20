'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db/supabase'
import { useRouter } from 'next/navigation'

export default function StandingsPage() {
  const router = useRouter()
  const [teamColor, setTeamColor] = useState('#ff0000')
  const [loading, setLoading] = useState(true)
  const [driverStandings, setDriverStandings] = useState<any[]>([])
  const [constructorStandings, setConstructorStandings] = useState<any[]>([])
  const [myDriverIds, setMyDriverIds] = useState<string[]>([])
  const [myTeamId, setMyTeamId] = useState<string | null>(null)

  useEffect(() => {
    const color = localStorage.getItem('selectedTeamColor') || '#ff0000'
    setTeamColor(color)

    const fetchData = async () => {
      const slot = localStorage.getItem('selectedSlot')
      if (!slot) { router.push('/'); return }

      const { data: saveData } = await supabase
        .from('saves').select('*').eq('slot', slot).single()
      if (!saveData) { router.push('/'); return }

      setMyTeamId(saveData.team_id)

      const { data: myDriverData } = await supabase
        .from('drivers').select('id').eq('team_id', saveData.team_id)
      setMyDriverIds(myDriverData?.map(d => d.id) || [])

      const { data: driverResults } = await supabase
        .from('race_results')
        .select('driver_id, points, position, fastest_lap, drivers(name, team_id, teams(name, color))')

      const driverMap: Record<string, any> = {}
      driverResults?.forEach(r => {
        const id = r.driver_id
        if (!driverMap[id]) {
          driverMap[id] = {
            id,
            name: (r.drivers as any)?.name || '?',
            teamName: (r.drivers as any)?.teams?.name || '?',
            teamColor: (r.drivers as any)?.teams?.color || '#ffffff',
            teamId: (r.drivers as any)?.team_id,
            points: 0, wins: 0, podiums: 0, fastestLaps: 0, races: 0,
          }
        }
        driverMap[id].points += r.points || 0
        driverMap[id].races += 1
        if (r.position === 1) driverMap[id].wins += 1
        if (r.position <= 3) driverMap[id].podiums += 1
        if (r.fastest_lap) driverMap[id].fastestLaps += 1
      })

      const driverList = Object.values(driverMap)
        .sort((a, b) => b.points - a.points || b.wins - a.wins)
      setDriverStandings(driverList)

      const constructorMap: Record<string, any> = {}
      driverList.forEach(d => {
        const tid = d.teamId
        if (!tid) return
        if (!constructorMap[tid]) {
          constructorMap[tid] = {
            id: tid, name: d.teamName, color: d.teamColor,
            points: 0, wins: 0, podiums: 0,
          }
        }
        constructorMap[tid].points += d.points
        constructorMap[tid].wins += d.wins
        constructorMap[tid].podiums += d.podiums
      })

      setConstructorStandings(
        Object.values(constructorMap).sort((a, b) => b.points - a.points || b.wins - a.wins)
      )

      setLoading(false)
    }
    fetchData()
  }, [router])

  const getRankStyle = (i: number) => {
    if (i === 0) return 'text-yellow-400'
    if (i === 1) return 'text-gray-300'
    if (i === 2) return 'text-amber-600'
    return 'text-gray-500'
  }

  const EmptyState = () => (
    <div className="p-8 text-center">
      <p className="text-gray-500">아직 레이스 결과가 없어요</p>
      <p className="text-gray-600 text-sm mt-1">레이스를 완료하면 순위가 표시됩니다</p>
    </div>
  )

  if (loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{ color: teamColor }}>🏆 순위</h1>
        <p className="text-gray-400 mb-8">2026 시즌</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 드라이버 순위 */}
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: teamColor }}>👥 드라이버</h2>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {driverStandings.length === 0 ? <EmptyState /> : (
                driverStandings.map((driver, i) => {
                  const isMyDriver = myDriverIds.includes(driver.id)
                  return (
                    <div
                      key={driver.id}
                      className="flex items-center px-4 py-3 border-b border-gray-800 last:border-0"
                      style={isMyDriver ? { backgroundColor: `${teamColor}10` } : {}}
                    >
                      <span className={`w-7 text-center font-bold mr-3 ${getRankStyle(i)}`}>{i + 1}</span>
                      <div className="w-1 h-7 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: driver.teamColor }} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${isMyDriver ? 'text-white' : 'text-gray-200'}`}>
                          {driver.name}
                          {isMyDriver && <span className="text-xs ml-1" style={{ color: teamColor }}>◀</span>}
                        </p>
                        <p className="text-gray-500 text-xs truncate">{driver.teamName}</p>
                      </div>
                      <div className="flex gap-3 text-center ml-2">
                        <div>
                          <p className="text-gray-600 text-xs">우승</p>
                          <p className="text-white text-sm font-bold">{driver.wins}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">pts</p>
                          <p className="font-bold text-sm" style={{ color: isMyDriver ? teamColor : '#f59e0b' }}>
                            {driver.points}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* 컨스트럭터 순위 */}
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: teamColor }}>🏎️ 컨스트럭터</h2>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {constructorStandings.length === 0 ? <EmptyState /> : (
                constructorStandings.map((team, i) => {
                  const isMyTeam = team.id === myTeamId
                  return (
                    <div
                      key={team.id}
                      className="flex items-center px-4 py-3 border-b border-gray-800 last:border-0"
                      style={isMyTeam ? { backgroundColor: `${teamColor}10` } : {}}
                    >
                      <span className={`w-7 text-center font-bold mr-3 ${getRankStyle(i)}`}>{i + 1}</span>
                      <div className="w-1 h-7 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: team.color }} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${isMyTeam ? 'text-white' : 'text-gray-200'}`}>
                          {team.name}
                          {isMyTeam && <span className="text-xs ml-1" style={{ color: teamColor }}>◀</span>}
                        </p>
                        <p className="text-gray-500 text-xs">우승 {team.wins}회 · 포디엄 {team.podiums}회</p>
                      </div>
                      <div className="text-center ml-2">
                        <p className="text-gray-600 text-xs">pts</p>
                        <p className="font-bold text-sm" style={{ color: isMyTeam ? teamColor : '#f59e0b' }}>
                          {team.points}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}