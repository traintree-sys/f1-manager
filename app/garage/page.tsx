'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db/supabase'
import { useRouter } from 'next/navigation'

function getSuccessRate(value: number, upgradeEfficiencyLv: number) {
  let base = 0
  if (value < 80) base = 70
  else if (value < 85) base = 50
  else if (value < 90) base = 35
  else if (value < 95) base = 20
  else base = 8
  return Math.min(95, base + upgradeEfficiencyLv * 1)
}

function getUpgradeCost(value: number, devSpeedLv: number) {
  let base = 0
  if (value < 80) base = 5000000
  else if (value < 85) base = 15000000
  else if (value < 90) base = 30000000
  else if (value < 95) base = 60000000
  else base = 120000000
  const discount = devSpeedLv * 0.01
  return Math.floor(base * (1 - discount))
}

function getUpgradeAmount(value: number, windTunnelLv: number) {
  const bonus = Math.floor(windTunnelLv * 0.1)
  if (value < 80) return Math.floor(Math.random() * 3) + 3 + bonus
  else if (value < 85) return Math.floor(Math.random() * 3) + 2 + bonus
  else if (value < 90) return Math.floor(Math.random() * 2) + 2 + bonus
  else if (value < 95) return Math.floor(Math.random() * 2) + 1 + bonus
  else return 1 + bonus
}

export default function GaragePage() {
  const router = useRouter()
  const [car, setCar] = useState<any>(null)
  const [pu, setPu] = useState<any>(null)
  const [teamStats, setTeamStats] = useState<any>(null)
  const [save, setSave] = useState<any>(null)
  const [teamColor, setTeamColor] = useState('#ff0000')
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [result, setResult] = useState<{ stat: string, success: boolean, change: number } | null>(null)

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

      const { data: carData } = await supabase
        .from('cars').select('*').eq('team_id', saveData.team_id).single()
      setCar(carData)

      if (carData?.power_unit_id) {
        const { data: puData } = await supabase
          .from('power_units').select('*').eq('id', carData.power_unit_id).single()
        setPu(puData)
      }

      const { data: statsData } = await supabase
        .from('team_stats').select('*').eq('team_id', saveData.team_id).single()
      setTeamStats(statsData)

      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleUpgrade = async (statKey: string) => {
    if (!car || !teamStats || !save) return
    const currentValue = car[statKey]
    if (currentValue >= 99) return

    const cost = getUpgradeCost(currentValue, teamStats.dev_speed)
    if (save.budget < cost) { alert('예산이 부족해요!'); return }

    setUpgrading(statKey)
    setResult(null)

    const successRate = getSuccessRate(currentValue, teamStats.upgrade_efficiency)
    const isSuccess = Math.random() * 100 < successRate

    let newValue = currentValue
    let change = 0

    if (isSuccess) {
      change = getUpgradeAmount(currentValue, teamStats.wind_tunnel)
      newValue = Math.min(99, currentValue + change)
    } else {
      const dropChance = Math.random() * 100
      if (dropChance < 30) {
        change = -1
        newValue = Math.max(70, currentValue - 1)
      }
    }

    await supabase.from('cars').update({ [statKey]: newValue }).eq('id', car.id)
    await supabase.from('saves').update({ budget: save.budget - cost }).eq('id', save.id)

    setCar({ ...car, [statKey]: newValue })
    setSave({ ...save, budget: save.budget - cost })
    setResult({ stat: statKey, success: isSuccess, change })
    setUpgrading(null)
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  const CAR_STATS = [
    { key: 'actual_aerodynamics', label: '에어로' },
    { key: 'actual_chassis', label: '섀시' },
    { key: 'actual_reliability', label: '신뢰성' },
    { key: 'actual_tyre_management', label: '타이어 관리' },
  ]

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{ color: teamColor }}>🔧 차고</h1>
        <p className="text-gray-400 mb-8">
          예산: <span className="text-green-400 font-bold">${(save?.budget / 1000000).toFixed(1)}M</span>
        </p>

        {/* 업그레이드 결과 */}
        {result && (
          <div className={`rounded-xl p-4 mb-6 border ${result.success ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
            {result.success
              ? <p className="text-green-400 font-bold">✅ 업그레이드 성공! +{result.change} 상승</p>
              : result.change < 0
              ? <p className="text-red-400 font-bold">❌ 업그레이드 실패! -1 하락</p>
              : <p className="text-yellow-400 font-bold">⚠️ 업그레이드 실패. 현상 유지</p>
            }
          </div>
        )}

        {/* 차량 업그레이드 */}
        <h2 className="text-xl font-bold mb-4" style={{ color: teamColor }}>🏎️ 차량 업그레이드</h2>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CAR_STATS.map((stat) => {
              const value = car?.[stat.key] || 0
              const cost = getUpgradeCost(value, teamStats?.dev_speed || 1)
              const successRate = getSuccessRate(value, teamStats?.upgrade_efficiency || 1)
              const canAfford = save?.budget >= cost
              return (
                <div key={stat.key} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-bold">{stat.label}</span>
                    <span className="text-white font-bold text-lg">{value}</span>
                  </div>
                  <div className="bg-gray-800 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${value}%`, backgroundColor: teamColor }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      성공률 <span style={{ color: teamColor }}>{successRate}%</span>
                    </div>
                    <button
                      onClick={() => handleUpgrade(stat.key)}
                      disabled={!canAfford || upgrading === stat.key || value >= 99}
                      className="text-xs px-3 py-1.5 rounded-lg border transition"
                      style={canAfford && value < 99
                        ? { borderColor: teamColor, color: teamColor }
                        : { borderColor: '#374151', color: '#6b7280' }
                      }
                    >
                      {upgrading === stat.key ? '...' : value >= 99 ? 'MAX' : `$${(cost / 1000000).toFixed(0)}M`}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* PU 스탯 */}
        {pu && (
          <>
            <h2 className="text-xl font-bold mb-4" style={{ color: teamColor }}>🔋 파워유닛 — {pu.manufacturer}</h2>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: '출력', value: pu.actual_power },
                  { label: '배포', value: pu.actual_deployment },
                  { label: '신뢰성', value: pu.actual_reliability },
                  { label: '내구성', value: pu.actual_durability },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm w-16">{stat.label}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${stat.value}%`, backgroundColor: teamColor }} />
                    </div>
                    <span className="text-white text-sm font-bold w-6">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}