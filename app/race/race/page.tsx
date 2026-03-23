'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/supabase'
import { useRaceWeekend } from '@/lib/context/RaceWeekendContext'
import { getPlayerResult } from '@/lib/simulation/race'
import type { RaceState } from '@/lib/simulation/race'
import { getTyreCompoundColor } from '@/lib/simulation/strategy'
import type { DriverTyreState } from '@/lib/simulation/strategy'
import type { TyreCompound } from '@/lib/simulation/qualifying'

import { useRaceInit } from './hooks/useRaceInit'
import { useRaceLights } from './hooks/useRaceLights'
import { useRaceActions } from './hooks/useRaceActions'

import RaceIntro from './components/RaceIntro'
import RaceStrategyPage from './components/RaceStrategy'
import RaceLights from './components/RaceLights'
import RaceTrack from './components/RaceTrack'
import RaceResult from './components/RaceResult'
import TyreSelectModal from './components/TyreSelectModal'

type RacePhase = 'intro' | 'strategy' | 'lights' | 'start_result' | 'racing' | 'result'

interface Props { onBack: () => void }

export default function RaceSimPage({ onBack }: Props) {
  const router = useRouter()
  const { selectedRace, raceState1, raceState2 } = useRaceWeekend()
  const [racePhase, setRacePhase] = useState<RacePhase>('intro')
  const [tyre1, setTyre1] = useState<DriverTyreState | null>(null)
  const [tyre2, setTyre2] = useState<DriverTyreState | null>(null)
  const [startSnapshot1, setStartSnapshot1] = useState<RaceState | null>(null)
  const [startSnapshot2, setStartSnapshot2] = useState<RaceState | null>(null)
  const [startLogs, setStartLogs] = useState<string[]>([])

  // 전략 선택에서 결정한 타이어를 여기서 관리
  const [raceTyre1, setRaceTyre1] = useState<TyreCompound>('미디엄')
  const [raceTyre2, setRaceTyre2] = useState<TyreCompound>('미디엄')

  const init = useRaceInit()

  const currentRace = selectedRace || JSON.parse(localStorage.getItem('selectedRace') || '{}')
  const totalLaps = raceState1?.totalLaps || 55

  const actions = useRaceActions({
    myDrivers: init.myDrivers,
    allDrivers: init.allDrivers,
    teamStats: init.teamStats,
    mergedTimeline: init.mergedTimeline,
    tyre1, tyre2, setTyre1, setTyre2,
    currentLap: raceState1?.currentLap || 0,
    totalLaps,
    circuitName: currentRace?.circuit_name || '',
    onFinished: () => setRacePhase('result'),
  })

  const currentLap = actions.currentMergedEvent?.event.lap || (raceState1?.currentLap || 0)
  const lapsToNext = actions.currentMergedEvent
    ? actions.currentMergedEvent.event.lap - currentLap
    : null

  const { lights, lightsOut } = useRaceLights({
    racePhase,
    myDrivers: init.myDrivers,
    allDrivers: init.allDrivers,
    driver1StartTyre: raceTyre1,
    driver2StartTyre: raceTyre2,
    adjustedGrid: init.adjustedGrid,
    mergedTimeline: init.mergedTimeline,
    onDone: ({ started1, started2, t1, t2, startLogs: logs }) => {
      setTyre1(t1)
      setTyre2(t2)
      setStartSnapshot1(started1)
      setStartSnapshot2(started2)
      setStartLogs(logs)
      setRacePhase('start_result')
    },
  })

  const handleStartResultConfirm = () => {
    if (init.mergedTimeline.length > 0) {
      actions.initTimeline(init.mergedTimeline[0], startLogs)
    }
    setRacePhase('racing')
  }

  const handleFinishRace = async () => {
    if (!raceState1 || !raceState2 || !init.save) return
    const result1 = init.myDrivers[0] ? getPlayerResult(raceState1, init.myDrivers[0].id) : null
    const result2 = init.myDrivers[1] ? getPlayerResult(raceState2, init.myDrivers[1].id) : null
    const totalPoints = (result1?.points || 0) + (result2?.points || 0)
    const totalDamage = raceState1.totalPartsDamage + raceState2.totalPartsDamage

    await supabase.from('saves').update({
      points: (init.save.points || 0) + totalPoints,
      current_race: (init.save.current_race || 1) + 1,
      budget: init.save.budget - totalDamage,
      total_expense: (init.save.total_expense || 0) + totalDamage,
    }).eq('id', init.save.id)

    await supabase.from('races').update({ status: 'completed' }).eq('id', currentRace.id)
    router.push('/race')
  }

  if (init.loading || !init.ready) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  const selectedWeather = JSON.parse(localStorage.getItem('selectedWeather') || '{}')

  if (racePhase === 'intro') return (
    <RaceIntro
      currentRace={currentRace}
      weather={selectedWeather}
      teamColor={init.teamColor}
      save={init.save}
      totalLaps={totalLaps}
      adjustedGrid={init.adjustedGrid}
      gridPenalties={init.gridPenalties}
      myDrivers={init.myDrivers}
      onNext={() => setRacePhase('strategy')}
    />
  )

  if (racePhase === 'strategy') return (
    <RaceStrategyPage
      currentRace={currentRace}
      teamColor={init.teamColor}
      strategies={init.strategies}
      driver1Strategy={init.driver1Strategy}
      driver2Strategy={init.driver2Strategy}
      driver1StartTyre={raceTyre1}
      driver2StartTyre={raceTyre2}
      myDrivers={init.myDrivers}
      onSelectStrategy={(strat) => {
        init.setDriver1Strategy(strat)
        init.setDriver2Strategy(strat)
        setRaceTyre1(strat.stints[0] as TyreCompound)
        setRaceTyre2(strat.stints[0] as TyreCompound)
      }}
      onSelectDriver1Tyre={setRaceTyre1}
      onSelectDriver2Tyre={setRaceTyre2}
      onBack={() => setRacePhase('intro')}
      onNext={() => setRacePhase('lights')}
    />
  )

  if (racePhase === 'lights') return (
    <RaceLights
      lights={lights}
      lightsOut={lightsOut}
      circuitName={currentRace?.circuit_name}
    />
  )

  if (racePhase === 'start_result' && startSnapshot1) return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-1" style={{ color: init.teamColor }}>🚦 스타트 완료!</h1>
        <p className="text-gray-400 mb-6">{currentRace?.circuit_name} · 랩 1</p>

        {/* 해설 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
          <p className="font-bold text-sm mb-3" style={{ color: init.teamColor }}>📻 중계</p>
          <div className="flex flex-col gap-2">
            {startLogs.map((log, i) => (
              <p key={i} className="text-gray-300 text-sm">{log}</p>
            ))}
          </div>
        </div>

        {/* 우리팀 스타트 결과 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {init.myDrivers.map((d, i) => {
            const rs = i === 0 ? startSnapshot1 : startSnapshot2
            const pos = rs?.driverPositions.find(p => p.driverId === d.id)
            const gridPos = init.adjustedGrid.findIndex(r => r.driverId === d.id) + 1
            const posDiff = gridPos - (pos?.finishPosition || gridPos)
            // page.tsx에서 관리하는 raceTyre1, raceTyre2 사용
            const tyre = i === 0 ? raceTyre1 : raceTyre2
            return (
              <div key={d.id} className="bg-gray-900 rounded-xl p-5 border"
                style={{ borderColor: init.teamColor }}>
                <p className="text-gray-400 text-sm mb-1">{d.name}</p>
                <p className="text-3xl font-bold mb-2" style={{ color: init.teamColor }}>
                  P{pos?.finishPosition || '-'}
                </p>
                <p className="text-xs mb-3">
                  <span className="text-gray-500">그리드 P{gridPos} → </span>
                  <span className={posDiff > 0 ? 'text-green-400' : posDiff < 0 ? 'text-red-400' : 'text-gray-400'}>
                    P{pos?.finishPosition} {posDiff > 0 ? `▲${posDiff}` : posDiff < 0 ? `▼${Math.abs(posDiff)}` : '→'}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTyreCompoundColor(tyre) }} />
                  <span className="text-xs" style={{ color: getTyreCompoundColor(tyre) }}>{tyre}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 스타트 후 전체 순위 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
          <p className="font-bold mb-3 text-sm">스타트 후 순위</p>
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {[...startSnapshot1.driverPositions]
              .sort((a, b) => a.finishPosition - b.finishPosition)
              .map((d) => {
                const isMyDriver = init.myDrivers.some(md => md.id === d.driverId)
                const gridPos = init.adjustedGrid.findIndex(r => r.driverId === d.driverId) + 1
                const posDiff = gridPos - d.finishPosition
                // 플레이어 드라이버면 raceTyre 사용, AI면 driverPositions의 tyre 사용
                const displayTyre = d.driverId === init.myDrivers[0]?.id
                  ? raceTyre1
                  : d.driverId === init.myDrivers[1]?.id
                  ? raceTyre2
                  : d.tyre
                return (
                  <div key={d.driverId}
                    className={`flex justify-between items-center py-1.5 px-3 rounded-lg ${isMyDriver ? 'bg-gray-800' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-5 text-xs">P{d.finishPosition}</span>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.teamColor }} />
                      <span className={`text-xs ${isMyDriver ? 'font-bold text-white' : 'text-gray-400'}`}>
                        {d.driverName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${posDiff > 0 ? 'text-green-400' : posDiff < 0 ? 'text-red-400' : 'text-gray-600'}`}>
                        {posDiff > 0 ? `▲${posDiff}` : posDiff < 0 ? `▼${Math.abs(posDiff)}` : '→'}
                      </span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getTyreCompoundColor(displayTyre) }} />
                      <span className="text-gray-600 text-xs">{displayTyre}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        <button
          onClick={handleStartResultConfirm}
          className="w-full py-4 rounded-xl font-bold text-black text-lg"
          style={{ backgroundColor: init.teamColor }}
        >
          레이스 계속 →
        </button>
      </div>
    </main>
  )

  if (racePhase === 'result' && raceState1 && raceState2) return (
    <RaceResult
      raceState1={raceState1}
      raceState2={raceState2}
      myDrivers={init.myDrivers}
      adjustedGrid={init.adjustedGrid}
      teamColor={init.teamColor}
      circuitName={currentRace?.circuit_name}
      eventLog={actions.eventLog}
      onFinish={handleFinishRace}
    />
  )

  if (racePhase === 'racing' && raceState1 && raceState2) return (
    <>
      {actions.showTyreSelect && (
        <TyreSelectModal
          driverName={init.myDrivers[actions.pitDriverNum - 1]?.name || ''}
          circuitName={currentRace?.circuit_name}
          teamColor={init.teamColor}
          onSelect={actions.handleTyreSelected}
        />
      )}
      <RaceTrack
        currentRace={currentRace}
        weather={selectedWeather}
        teamColor={init.teamColor}
        myDrivers={init.myDrivers}
        raceState1={raceState1}
        raceState2={raceState2}
        tyre1={tyre1}
        tyre2={tyre2}
        currentMergedEvent={actions.currentMergedEvent}
        currentLap={currentLap}
        totalLaps={totalLaps}
        lapsToNext={lapsToNext}
        raceFinished1={actions.raceFinished1}
        raceFinished2={actions.raceFinished2}
        eventLog={actions.eventLog}
        onEventOption={actions.handleEventOption}
        onNextSegment={actions.handleNextSegment}
      />
    </>
  )

  return null
}