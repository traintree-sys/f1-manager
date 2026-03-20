'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/supabase'
import { useRaceWeekend } from '@/lib/context/RaceWeekendContext'
import {
  initRaceState, resolveRaceEvent,
  finishRace, getPlayerResult, doStart,
  mergeEvents
} from '@/lib/simulation/race'
import type { MergedEvent } from '@/lib/simulation/race'
import {
  generateStrategies, initDriverTyreState, updateTyreWear, applyPitStop, DriverTyreState
} from '@/lib/simulation/strategy'
import type { RaceStrategy } from '@/lib/simulation/strategy'
import type { TyreCompound } from '@/lib/simulation/qualifying'
import {
  getCommentary, getStartCommentary, getSegmentCommentary,
  getEventCommentary, getOptionResultCommentary
} from '@/lib/simulation/commentary'

import RaceIntro from './components/RaceIntro'
import RaceStrategyPage from './components/RaceStrategy'
import RaceLights from './components/RaceLights'
import RaceTrack from './components/RaceTrack'
import RaceResult from './components/RaceResult'
import TyreSelectModal from './components/TyreSelectModal'

type RacePhase = 'intro' | 'strategy' | 'lights' | 'racing' | 'result'

interface Props {
  onBack: () => void
}

export default function RaceSimPage({ onBack }: Props) {
  const router = useRouter()
  const {
    selectedRace, weather,
    qResults,
    driver1Tyre, driver2Tyre,
    raceState1, setRaceState1,
    raceState2, setRaceState2,
  } = useRaceWeekend()

  const [teamColor, setTeamColor] = useState('#ff0000')
  const [save, setSave] = useState<any>(null)
  const [myDrivers, setMyDrivers] = useState<any[]>([])
  const [allDrivers, setAllDrivers] = useState<any[]>([])
  const [cars, setCars] = useState<any[]>([])
  const [powerUnits, setPowerUnits] = useState<any[]>([])
  const [teamStats, setTeamStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [racePhase, setRacePhase] = useState<RacePhase>('intro')

  const [strategies, setStrategies] = useState<RaceStrategy[]>([])
  const [driver1Strategy, setDriver1Strategy] = useState<RaceStrategy | null>(null)
  const [driver2Strategy, setDriver2Strategy] = useState<RaceStrategy | null>(null)
  const [driver1StartTyre, setDriver1StartTyre] = useState<TyreCompound>('미디엄')
  const [driver2StartTyre, setDriver2StartTyre] = useState<TyreCompound>('미디엄')

  const [tyre1, setTyre1] = useState<DriverTyreState | null>(null)
  const [tyre2, setTyre2] = useState<DriverTyreState | null>(null)

  const [showTyreSelect, setShowTyreSelect] = useState(false)
  const [pitDriverNum, setPitDriverNum] = useState<1 | 2>(1)
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null)

  const [lights, setLights] = useState(0)
  const [lightsOut, setLightsOut] = useState(false)

  const [mergedTimeline, setMergedTimeline] = useState<MergedEvent[]>([])
  const [timelineIndex, setTimelineIndex] = useState(0)
  const [currentMergedEvent, setCurrentMergedEvent] = useState<MergedEvent | null>(null)
  const [eventLog, setEventLog] = useState<string[]>([])
  const [raceFinished1, setRaceFinished1] = useState(false)
  const [raceFinished2, setRaceFinished2] = useState(false)

  const [adjustedGrid, setAdjustedGrid] = useState(qResults)
  const [gridPenalties, setGridPenalties] = useState<string[]>([])

  useEffect(() => {
    const color = localStorage.getItem('selectedTeamColor') || '#ff0000'
    setTeamColor(color)
  }, [])

  useEffect(() => {
    if (selectedRace) setReady(true)
    else {
      const raceData = localStorage.getItem('selectedRace')
      if (!raceData) router.push('/race')
      else setReady(true)
    }
  }, [selectedRace, router])

  useEffect(() => {
    if (!ready) return
    const fetchData = async () => {
      const slot = localStorage.getItem('selectedSlot')
      if (!slot) { router.push('/'); return }

      const { data: saveData } = await supabase
        .from('saves').select('*').eq('slot', slot).single()
      if (!saveData) return
      setSave(saveData)

      const { data: driverData } = await supabase
        .from('drivers').select('*, teams(name, color)').not('team_id', 'is', null)
      setAllDrivers(driverData || [])

      const { data: carData } = await supabase.from('cars').select('*')
      setCars(carData || [])

      const { data: puData } = await supabase.from('power_units').select('*')
      setPowerUnits(puData || [])

      const { data: statsData } = await supabase
        .from('team_stats').select('*').eq('team_id', saveData.team_id).single()
      setTeamStats(statsData)

      const { data: myDriverData } = await supabase
        .from('drivers').select('*').eq('team_id', saveData.team_id)
      setMyDrivers(myDriverData || [])

      setLoading(false)
    }
    fetchData()
  }, [ready, router])

  useEffect(() => {
    if (!loading && myDrivers.length > 0 && !raceState1 && qResults.length > 0 && weather) {
      const currentRace = selectedRace || JSON.parse(localStorage.getItem('selectedRace') || '{}')
      const currentWeather = weather || JSON.parse(localStorage.getItem('selectedWeather') || '{}')

      const penalties: string[] = []
      let grid = [...qResults]
      myDrivers.forEach(d => {
        const car = cars.find(c => c.team_id === d.team_id)
        const reliability = car?.actual_reliability || 80
        const penaltyProb = Math.max(0.02, 0.15 - (reliability - 70) * 0.004)
        if (Math.random() < penaltyProb) {
          const gridDrop = 5
          const currentPos = grid.findIndex(r => r.driverId === d.id)
          if (currentPos !== -1) {
            const newPos = Math.min(grid.length - 1, currentPos + gridDrop)
            const removed = grid.splice(currentPos, 1)[0]
            grid.splice(newPos, 0, removed)
            penalties.push(`⚙️ ${d.name} — 기어박스 교체로 그리드 ${gridDrop}칸 강등 (P${currentPos + 1} → P${newPos + 1})`)
          }
        }
      })
      grid = grid.map((r, i) => ({ ...r, position: i + 1 }))
      setAdjustedGrid(grid)
      setGridPenalties(penalties)

      const strats = generateStrategies(
        currentRace.circuit_name,
        currentRace.circuit_name,
        currentWeather.current
      )
      setStrategies(strats)
      if (strats.length > 0) {
        setDriver1Strategy(strats[0])
        setDriver2Strategy(strats[0])
        setDriver1StartTyre(strats[0].stints[0] as TyreCompound)
        setDriver2StartTyre(strats[0].stints[0] as TyreCompound)
      }

      const state1 = initRaceState(
        currentRace.circuit_name, grid, currentWeather,
        myDrivers[0]?.id, driver1Tyre,
        allDrivers, cars, powerUnits, 0
      )
      const state2 = initRaceState(
        currentRace.circuit_name, grid, currentWeather,
        myDrivers[1]?.id, driver2Tyre,
        allDrivers, cars, powerUnits, 0
      )
      setRaceState1(state1)
      setRaceState2(state2)

      const merged = mergeEvents(
        state1.events, state2.events,
        myDrivers[0]?.name || '드라이버 1',
        myDrivers[1]?.name || '드라이버 2'
      )
      setMergedTimeline(merged)
    }
  }, [loading, myDrivers])

  useEffect(() => {
    if (raceFinished1 && raceFinished2) setRacePhase('result')
  }, [raceFinished1, raceFinished2])

  useEffect(() => {
    if (racePhase !== 'lights') return
    let count = 0
    const interval = setInterval(() => {
      count++
      setLights(count)
      if (count >= 5) {
        clearInterval(interval)
        setTimeout(() => {
          setLightsOut(true)
          setTimeout(() => {
            if (!raceState1 || !raceState2) return
            const started1 = doStart(raceState1, allDrivers, [myDrivers[0]?.id, myDrivers[1]?.id])
            const started2 = doStart(raceState2, allDrivers, [myDrivers[0]?.id, myDrivers[1]?.id])
            setTyre1(initDriverTyreState(myDrivers[0]?.id, driver1StartTyre))
            setTyre2(initDriverTyreState(myDrivers[1]?.id, driver2StartTyre))
            setRaceState1(started1)
            setRaceState2(started2)

            // 스타트 해설
            const startLogs: string[] = []
            startLogs.push(`📻 ${getCommentary('start_formation')}`)
            startLogs.push(`📻 ${getCommentary('start_lights')}`)

            myDrivers.forEach((d, i) => {
              const rs = i === 0 ? started1 : started2
              const startPos = qResults.findIndex(r => r.driverId === d.id) + 1
              const endPos = rs.driverPositions.find(p => p.driverId === d.id)?.finishPosition || startPos
              const lines = getStartCommentary(d.name, startPos, endPos)
              lines.forEach(l => startLogs.push(`📻 ${l}`))
            })

            setEventLog(startLogs)
            setRacePhase('racing')
            if (mergedTimeline.length > 0) setCurrentMergedEvent(mergedTimeline[0])
          }, 1500)
        }, 1000)
      }
    }, 800)
    return () => clearInterval(interval)
  }, [racePhase])

  const handleEventOption = (optionId: string) => {
    if (!currentMergedEvent || !raceState1 || !raceState2) return
    const driverNum = currentMergedEvent.driverNum
    const isPitEvent = optionId.startsWith('pit_') && optionId !== 'pit_repair' && optionId !== 'stay_out'

    if (isPitEvent) {
      setPitDriverNum(driverNum)
      setPendingOptionId(optionId)
      setShowTyreSelect(true)
      return
    }
    applyEventOption(optionId, driverNum)
  }

  const applyEventOption = (optionId: string, driverNum: 1 | 2, newTyre?: TyreCompound) => {
    if (!currentMergedEvent || !raceState1 || !raceState2) return
    const raceState = driverNum === 1 ? raceState1 : raceState2
    const setRaceState = driverNum === 1 ? setRaceState1 : setRaceState2
    const driver = myDrivers[driverNum - 1]
    if (!driver) return

    const resolved = resolveRaceEvent(raceState, optionId, driver.id, driver, teamStats)

    if (newTyre) {
      const currentTyreState = driverNum === 1 ? tyre1 : tyre2
      const setTyre = driverNum === 1 ? setTyre1 : setTyre2
      if (currentTyreState) setTyre(applyPitStop(currentTyreState, newTyre))
      const newPositions = resolved.driverPositions.map(d =>
        d.driverId === driver.id ? { ...d, tyre: newTyre } : d
      )
      setRaceState({ ...resolved, driverPositions: newPositions })
    } else {
      setRaceState(resolved)
    }

    if (!newTyre) {
      const currentRace = selectedRace || JSON.parse(localStorage.getItem('selectedRace') || '{}')
      const currentTyreState = driverNum === 1 ? tyre1 : tyre2
      const setTyre = driverNum === 1 ? setTyre1 : setTyre2
      const dStats = allDrivers.find(d => d.id === driver.id)
      if (currentTyreState) {
        setTyre(updateTyreWear(currentTyreState, 10, currentRace.circuit_name, dStats?.actual_tyre_management || 75))
      }
    }

    // 해설 로그
    const newPos = resolved.driverPositions.find(d => d.driverId === driver.id)?.finishPosition || 0
    const oldPos = raceState.driverPositions.find(d => d.driverId === driver.id)?.finishPosition || 0
    const success = newPos < oldPos
    const commentary = getOptionResultCommentary(optionId, success, driver.name, newPos, newTyre)
    setEventLog(prev => [`📻 ${commentary}`, ...prev])

    const nextIndex = timelineIndex + 1
    setTimelineIndex(nextIndex)

    if (nextIndex >= mergedTimeline.length) {
      const resolvedWithTyre = newTyre
        ? { ...resolved, driverPositions: resolved.driverPositions.map(d => d.driverId === driver.id ? { ...d, tyre: newTyre } : d) }
        : resolved
      setRaceState1(finishRace(driverNum === 1 ? resolvedWithTyre : raceState1))
      setRaceState2(finishRace(driverNum === 2 ? resolvedWithTyre : raceState2))
      setRaceFinished1(true)
      setRaceFinished2(true)
      setCurrentMergedEvent(null)
    } else {
      setCurrentMergedEvent(mergedTimeline[nextIndex])
    }
  }

  const handleTyreSelected = (newTyre: TyreCompound) => {
    setShowTyreSelect(false)
    if (pendingOptionId) {
      applyEventOption(pendingOptionId, pitDriverNum, newTyre)
      setPendingOptionId(null)
    }
  }

  const handleNextSegment = () => {
    if (!raceState1 || !raceState2) return
    const currentRace = selectedRace || JSON.parse(localStorage.getItem('selectedRace') || '{}')

    if (tyre1) {
      const d = allDrivers.find(d => d.id === myDrivers[0]?.id)
      setTyre1(updateTyreWear(tyre1, 10, currentRace.circuit_name, d?.actual_tyre_management || 75))
    }
    if (tyre2) {
      const d = allDrivers.find(d => d.id === myDrivers[1]?.id)
      setTyre2(updateTyreWear(tyre2, 10, currentRace.circuit_name, d?.actual_tyre_management || 75))
    }

    // 구간 해설
    const commentary = getSegmentCommentary(currentLap, totalLaps)
    setEventLog(prev => [`📻 ${commentary}`, ...prev])

    const nextIndex = timelineIndex + 1
    setTimelineIndex(nextIndex)

    if (nextIndex >= mergedTimeline.length) {
      setRaceState1(finishRace(raceState1))
      setRaceState2(finishRace(raceState2))
      setRaceFinished1(true)
      setRaceFinished2(true)
      setCurrentMergedEvent(null)
    } else {
      setCurrentMergedEvent(mergedTimeline[nextIndex])
    }
  }

  const handleFinishRace = async () => {
    if (!raceState1 || !raceState2 || !save) return
    const result1 = myDrivers[0] ? getPlayerResult(raceState1, myDrivers[0].id) : null
    const result2 = myDrivers[1] ? getPlayerResult(raceState2, myDrivers[1].id) : null
    const totalPoints = (result1?.points || 0) + (result2?.points || 0)
    const totalDamage = raceState1.totalPartsDamage + raceState2.totalPartsDamage
    const currentRace = selectedRace || JSON.parse(localStorage.getItem('selectedRace') || '{}')

    await supabase.from('saves').update({
      points: (save.points || 0) + totalPoints,
      current_race: (save.current_race || 1) + 1,
      budget: save.budget - totalDamage,
      total_expense: (save.total_expense || 0) + totalDamage,
    }).eq('id', save.id)

    await supabase.from('races').update({ status: 'completed' }).eq('id', currentRace.id)
    router.push('/race')
  }

  if (!ready || loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  const currentRace = selectedRace || JSON.parse(localStorage.getItem('selectedRace') || '{}')
  const totalLaps = raceState1?.totalLaps || 55
  const currentLap = currentMergedEvent?.event.lap || (raceState1?.currentLap || 0)
  const nextEventLap = currentMergedEvent?.event.lap || null
  const lapsToNext = nextEventLap ? nextEventLap - currentLap : null

  if (racePhase === 'intro') return (
    <RaceIntro
      currentRace={currentRace}
      weather={weather}
      teamColor={teamColor}
      save={save}
      totalLaps={totalLaps}
      adjustedGrid={adjustedGrid}
      gridPenalties={gridPenalties}
      myDrivers={myDrivers}
      onNext={() => setRacePhase('strategy')}
    />
  )

  if (racePhase === 'strategy') return (
    <RaceStrategyPage
      currentRace={currentRace}
      teamColor={teamColor}
      strategies={strategies}
      driver1Strategy={driver1Strategy}
      driver2Strategy={driver2Strategy}
      driver1StartTyre={driver1StartTyre}
      driver2StartTyre={driver2StartTyre}
      myDrivers={myDrivers}
      onSelectStrategy={(strat) => {
        setDriver1Strategy(strat)
        setDriver2Strategy(strat)
        setDriver1StartTyre(strat.stints[0] as TyreCompound)
        setDriver2StartTyre(strat.stints[0] as TyreCompound)
      }}
      onSelectDriver1Tyre={setDriver1StartTyre}
      onSelectDriver2Tyre={setDriver2StartTyre}
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

  if (racePhase === 'result' && raceState1 && raceState2) return (
    <RaceResult
      raceState1={raceState1}
      raceState2={raceState2}
      myDrivers={myDrivers}
      adjustedGrid={adjustedGrid}
      teamColor={teamColor}
      circuitName={currentRace?.circuit_name}
      eventLog={eventLog}
      onFinish={handleFinishRace}
    />
  )

  if (racePhase === 'racing' && raceState1 && raceState2) return (
    <>
      {showTyreSelect && (
        <TyreSelectModal
          driverName={myDrivers[pitDriverNum - 1]?.name || ''}
          circuitName={currentRace?.circuit_name}
          teamColor={teamColor}
          onSelect={handleTyreSelected}
        />
      )}
      <RaceTrack
        currentRace={currentRace}
        weather={weather}
        teamColor={teamColor}
        myDrivers={myDrivers}
        raceState1={raceState1}
        raceState2={raceState2}
        tyre1={tyre1}
        tyre2={tyre2}
        currentMergedEvent={currentMergedEvent}
        currentLap={currentLap}
        totalLaps={totalLaps}
        lapsToNext={lapsToNext}
        raceFinished1={raceFinished1}
        raceFinished2={raceFinished2}
        eventLog={eventLog}
        onEventOption={handleEventOption}
        onNextSegment={handleNextSegment}
      />
    </>
  )

  return null
}