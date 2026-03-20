'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db/supabase'
import { useRouter } from 'next/navigation'

const STAT_LABELS: Record<string, string> = {
  dev_speed: '개발 속도',
  upgrade_efficiency: '업그레이드 효율',
  wind_tunnel: '풍동 시설',
  reaction_speed: '반응 속도',
  precision: '정밀도',
  coordination: '협동심',
  data_analysis: '데이터 분석',
  strategy_call: '전략 판단',
  weather_analysis: '기상 분석',
  sponsor_attraction: '스폰서 유치',
  budget_management: '예산 관리',
  driver_development: '드라이버 개발',
}

const CATEGORIES = [
  { key: 'factory', label: '🏭 Factory', stats: ['dev_speed', 'upgrade_efficiency', 'wind_tunnel'] },
  { key: 'pitcrew', label: '🔧 Pit Crew', stats: ['reaction_speed', 'precision', 'coordination'] },
  { key: 'strategy', label: '📊 Strategy', stats: ['data_analysis', 'strategy_call', 'weather_analysis'] },
  { key: 'management', label: '💼 Management', stats: ['sponsor_attraction', 'budget_management', 'driver_development'] },
]

function getSuccessRate(level: number) {
  if (level <= 3) return 85
  if (level <= 6) return 65
  if (level <= 8) return 45
  if (level === 9) return 25
  return 15
}

function getUpgradeCost(level: number) {
  return level * 2000000
}

interface PopupProps {
  success: boolean
  statName: string
  change: number
  onClose: () => void
}

function Popup({ success, statName, change, onClose }: PopupProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`rounded-2xl p-8 text-center border-2 shadow-2xl pointer-events-auto
        ${success ? 'bg-gray-900 border-green-500' : 'bg-gray-900 border-red-500'}`}
        style={{ minWidth: 320 }}>
        <p className="text-5xl mb-4">{success ? '✅' : change < 0 ? '❌' : '⚠️'}</p>
        <p className="text-xl font-bold mb-2">
          {success ? '업그레이드 성공!' : change < 0 ? '업그레이드 실패!' : '업그레이드 실패'}
        </p>
        <p className="text-gray-400 mb-1">{statName}</p>
        <p className={`text-lg font-bold ${success ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
          {success ? '레벨 +1 상승' : change < 0 ? '레벨 -1 하락' : '현상 유지'}
        </p>
        <button onClick={onClose} className="mt-4 text-gray-500 text-sm hover:text-white transition">
          닫기
        </button>
      </div>
    </div>
  )
}

export default function TeamPage() {
  const router = useRouter()
  const [teamStats, setTeamStats] = useState<any>(null)
  const [save, setSave] = useState<any>(null)
  const [teamColor, setTeamColor] = useState('#ff0000')
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [popup, setPopup] = useState<{ success: boolean, statName: string, change: number } | null>(null)

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

      const { data: statsData } = await supabase
        .from('team_stats').select('*').eq('team_id', saveData.team_id).single()
      setTeamStats(statsData)
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleUpgrade = async (statKey: string) => {
    if (!teamStats || !save) return
    const currentLevel = teamStats[statKey]
    if (currentLevel >= 10) return

    const cost = getUpgradeCost(currentLevel)
    if (save.budget < cost) { alert('예산이 부족해요!'); return }

    setUpgrading(statKey)

    const successRate = getSuccessRate(currentLevel)
    const isSuccess = Math.random() * 100 < successRate

    let newLevel = currentLevel
    let change = 0

    if (isSuccess) {
      change = 1
      newLevel = currentLevel + 1
    } else {
      if (Math.random() * 100 < 30) {
        change = -1
        newLevel = Math.max(1, currentLevel - 1)
      }
    }

    await supabase.from('team_stats').update({ [statKey]: newLevel }).eq('id', teamStats.id)
    await supabase.from('saves').update({ budget: save.budget - cost }).eq('id', save.id)

    setTeamStats({ ...teamStats, [statKey]: newLevel })
    setSave({ ...save, budget: save.budget - cost })
    setPopup({ success: isSuccess, statName: STAT_LABELS[statKey], change })
    setUpgrading(null)
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      {popup && (
        <Popup
          success={popup.success}
          statName={popup.statName}
          change={popup.change}
          onClose={() => setPopup(null)}
        />
      )}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{ color: teamColor }}>🏢 팀 관리</h1>
        <p className="text-gray-400 mb-8">
          예산: <span className="text-green-400 font-bold">${(save?.budget / 1000000).toFixed(1)}M</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="font-bold text-lg mb-5">{cat.label}</p>
              {cat.stats.map((statKey) => {
                const level = teamStats?.[statKey] || 1
                const cost = getUpgradeCost(level)
                const canAfford = save?.budget >= cost
                const maxed = level >= 10
                const successRate = getSuccessRate(level)
                return (
                  <div key={statKey} className="mb-5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-gray-300 text-sm">{STAT_LABELS[statKey]}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">성공률 {maxed ? '-' : `${successRate}%`}</span>
                        <span className="text-xs font-bold" style={{ color: teamColor }}>Lv.{level} / 10</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex gap-0.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 h-2 rounded-sm"
                            style={{ backgroundColor: i < level ? teamColor : '#374151' }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => handleUpgrade(statKey)}
                        disabled={maxed || !canAfford || upgrading === statKey}
                        className="text-xs px-3 py-1.5 rounded-lg border transition min-w-16 text-center"
                        style={
                          maxed
                            ? { borderColor: '#374151', color: '#6b7280' }
                            : canAfford
                            ? { borderColor: teamColor, color: teamColor }
                            : { borderColor: '#374151', color: '#6b7280' }
                        }
                      >
                        {maxed ? 'MAX' : upgrading === statKey ? '...' : `$${(cost / 1000000).toFixed(0)}M`}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}