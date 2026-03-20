'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/supabase'

interface Team {
  id: string
  name: string
  budget: number
  color: string
}

interface Save {
  id: string
  slot: number
  team_name: string
  team_color: string
  current_race: number
  points: number
  updated_at: string
}

interface Props {
  teams: Team[]
  saves: Save[]
}

const WORKS_TEAMS = ['Mercedes-AMG', 'Scuderia Ferrari HP', 'Oracle Red Bull Racing', 'Aston Martin Aramco', 'Audi Revolut']

const PU_INCOME: Record<string, number> = {
  'Mercedes-AMG': 45000000,
  'Scuderia Ferrari HP': 30000000,
  'Oracle Red Bull Racing': 15000000,
  'Aston Martin Aramco': 0,
  'Audi Revolut': 0,
}

const SPONSOR_ANNUAL: Record<string, number> = {
  'McLaren Mastercard': 180000000,
  'Mercedes-AMG': 170000000,
  'Oracle Red Bull Racing': 175000000,
  'Scuderia Ferrari HP': 185000000,
  'Atlassian Williams': 90000000,
  'Visa Cash App Racing Bulls': 85000000,
  'Aston Martin Aramco': 120000000,
  'TGR Haas': 75000000,
  'Audi Revolut': 100000000,
  'BWT Alpine': 95000000,
  'Cadillac': 80000000,
}

const CAP_STAFF: Record<string, number> = {
  'McLaren Mastercard': 45000000,
  'Mercedes-AMG': 48000000,
  'Oracle Red Bull Racing': 50000000,
  'Scuderia Ferrari HP': 47000000,
  'Atlassian Williams': 30000000,
  'Visa Cash App Racing Bulls': 28000000,
  'Aston Martin Aramco': 35000000,
  'TGR Haas': 25000000,
  'Audi Revolut': 32000000,
  'BWT Alpine': 33000000,
  'Cadillac': 27000000,
}

const CAP_TRACK: Record<string, number> = {
  'McLaren Mastercard': 55000000,
  'Mercedes-AMG': 55000000,
  'Oracle Red Bull Racing': 55000000,
  'Scuderia Ferrari HP': 55000000,
  'Aston Martin Aramco': 40000000,
  'Audi Revolut': 40000000,
  'BWT Alpine': 40000000,
  'Atlassian Williams': 30000000,
  'Visa Cash App Racing Bulls': 30000000,
  'TGR Haas': 30000000,
  'Cadillac': 30000000,
}

const CAP_PARTS: Record<string, number> = {
  'McLaren Mastercard': 20000000,
  'Mercedes-AMG': 20000000,
  'Oracle Red Bull Racing': 20000000,
  'Scuderia Ferrari HP': 20000000,
  'Aston Martin Aramco': 17000000,
  'Audi Revolut': 17000000,
  'BWT Alpine': 17000000,
  'Atlassian Williams': 15000000,
  'Visa Cash App Racing Bulls': 15000000,
  'TGR Haas': 15000000,
  'Cadillac': 15000000,
}

export default function TeamSelectClient({ teams, saves }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'slot' | 'team'>('slot')
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSlotClick = (slot: number, hasSave: boolean) => {
    if (hasSave) {
      const save = saves.find(s => s.slot === slot)
      if (save) {
        localStorage.setItem('selectedSlot', String(slot))
        localStorage.setItem('selectedTeamName', save.team_name)
        localStorage.setItem('selectedTeamColor', save.team_color || '#ff0000')
        router.push('/dashboard')
      }
    } else {
      setSelectedSlot(slot)
      setStep('team')
    }
  }

  const handleTeamSelect = async (team: Team) => {
    if (!selectedSlot) return
    setLoading(true)

    const isWorks = WORKS_TEAMS.includes(team.name)
    const staffCost = CAP_STAFF[team.name] || 25000000
    const trackCost = CAP_TRACK[team.name] || 30000000
    const partsCost = CAP_PARTS[team.name] || 15000000

    await supabase.from('saves').upsert({
      slot: selectedSlot,
      team_id: team.id,
      team_name: team.name,
      team_color: team.color,
      budget: team.budget,
      season: 2026,
      current_race: 1,
      points: 0,
      updated_at: new Date().toISOString(),
      budget_cap: 215000000,
      sponsor_annual: SPONSOR_ANNUAL[team.name] || 80000000,
      is_works_team: isWorks,
      pu_income: PU_INCOME[team.name] || 0,
      pu_expense: isWorks ? 0 : 15000000,
      pu_dev_cost: isWorks ? 130000000 : 0,
      cap_staff_cost: staffCost,
      cap_track_cost: trackCost,
      cap_parts_cost: partsCost,
      cap_spent: staffCost + trackCost + partsCost,
      total_income: 0,
      total_expense: 0,
      prize_income: 0,
      sponsor_income: 0,
      cap_vehicle_dev: 0,
      constructor_rank: 0,
      season_finished: false,
    }, { onConflict: 'slot' })

    localStorage.setItem('selectedSlot', String(selectedSlot))
    localStorage.setItem('selectedTeamName', team.name)
    localStorage.setItem('selectedTeamId', team.id)
    localStorage.setItem('selectedTeamColor', team.color)
    setLoading(false)
    router.push('/dashboard')
  }

  const handleDeleteSave = async (e: React.MouseEvent, slot: number) => {
    e.stopPropagation()
    await supabase.from('saves').delete().eq('slot', slot)
    router.refresh()
  }

  if (step === 'team') {
    return (
      <div className="w-full max-w-4xl">
        <button onClick={() => setStep('slot')} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
          ← 슬롯 선택으로 돌아가기
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">슬롯 {selectedSlot} — 팀 선택</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => handleTeamSelect(team)}
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 rounded-xl p-5 text-left transition border-2"
              style={{ borderColor: team.color }}
            >
              <div className="w-8 h-8 rounded-full mb-3" style={{ backgroundColor: team.color }} />
              <p className="font-bold text-lg mb-1" style={{ color: team.color }}>{team.name}</p>
              <p className="text-gray-400 text-sm">예산: ${(team.budget / 1000000).toFixed(0)}M</p>
              <p className="text-gray-500 text-xs mt-1">
                {WORKS_TEAMS.includes(team.name) ? '🔧 워크스팀' : '🛒 커스터머팀'}
              </p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">세이브 슬롯 선택</h2>
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((slot) => {
          const save = saves.find(s => s.slot === slot)
          return (
            <div
              key={slot}
              onClick={() => handleSlotClick(slot, !!save)}
              className="bg-gray-900 hover:bg-gray-800 rounded-xl p-6 cursor-pointer transition flex justify-between items-center border-2"
              style={{ borderColor: save?.team_color || '#374151' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: save?.team_color || '#374151' }}
                />
                <div>
                  <p className="text-gray-500 text-sm mb-1">슬롯 {slot}</p>
                  {save ? (
                    <>
                      <p className="font-bold text-lg" style={{ color: save.team_color }}>
                        {save.team_name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        레이스 {save.current_race} / 포인트 {save.points}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">— 빈 슬롯 —</p>
                  )}
                </div>
              </div>
              {save ? (
                <button
                  onClick={(e) => handleDeleteSave(e, slot)}
                  className="text-red-500 hover:text-red-400 text-sm px-3 py-1 border border-red-800 rounded-lg"
                >
                  삭제
                </button>
              ) : (
                <span className="text-gray-600 text-sm">새 게임 →</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}