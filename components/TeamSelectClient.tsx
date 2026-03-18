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
              <div
                className="w-8 h-8 rounded-full mb-3"
                style={{ backgroundColor: team.color }}
              />
              <p className="font-bold text-lg mb-1" style={{ color: team.color }}>
                {team.name}
              </p>
              <p className="text-gray-400 text-sm">
                예산: ${(team.budget / 1000000).toFixed(0)}M
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