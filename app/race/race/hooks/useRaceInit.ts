import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/supabase'
import { useRaceWeekend } from '@/lib/context/RaceWeekendContext'
import { initRaceState, mergeEvents } from '@/lib/simulation/race'
import type { MergedEvent } from '@/lib/simulation/race'
import { generateStrategies } from '@/lib/simulation/strategy'
import type { RaceStrategy } from '@/lib/simulation/strategy'
import type { TyreCompound, DriverQualifyingResult } from '@/lib/simulation/qualifying'
import { calculateGridPenalties } from '@/lib/simulation/events'
import { CIRCUITS } from '@/lib/simulation/weather'

export function useRaceInit() {
  const router = useRouter()
  const {
    selectedRace, weather, qResults,
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

  const [strategies, setStrategies] = useState<RaceStrategy[]>([])
  const [driver1Strategy, setDriver1Strategy] = useState<RaceStrategy | null>(null)
  const [driver2Strategy, setDriver2Strategy] = useState<RaceStrategy | null>(null)
  const [driver1StartTyre, setDriver1StartTyre] = useState<TyreCompound>('미디엄')
  const [driver2StartTyre, setDriver2StartTyre] = useState<TyreCompound>('미디엄')

  const [adjustedGrid, setAdjustedGrid] = useState<DriverQualifyingResult[]>(qResults)
  const [gridPenalties, setGridPenalties] = useState<string[]>([])
  const [mergedTimeline, setMergedTimeline] = useState<MergedEvent[]>([])

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

      // 그리드 패널티
      const { grid: penalizedGrid, penalties } = calculateGridPenalties(myDrivers, cars, [...qResults])
      setAdjustedGrid(penalizedGrid)
      setGridPenalties(penalties)

      // 전략 생성
      const circuit = CIRCUITS[currentRace.circuit_name]
      const totalLaps = circuit?.laps || 55
      const strats = generateStrategies(totalLaps, currentRace.circuit_name, currentWeather.current)
      setStrategies(strats)
      if (strats.length > 0) {
        setDriver1Strategy(strats[0])
        setDriver2Strategy(strats[0])
        setDriver1StartTyre(strats[0].stints[0] as TyreCompound)
        setDriver2StartTyre(strats[0].stints[0] as TyreCompound)
      }

      // AI 드라이버 타이어 기본값 보장
      const gridWithTyre = penalizedGrid.map((r: DriverQualifyingResult) => ({
        ...r,
        tyre: r.tyre || '미디엄' as TyreCompound,
      }))

      // initRaceState에 플레이어 타이어는 '미디엄' 더미로 넘김
      // 실제 스타트 타이어는 useRaceLights에서 driver1StartTyre/driver2StartTyre로 덮어씀
      const state1 = initRaceState(
        currentRace.circuit_name, gridWithTyre, currentWeather,
        myDrivers[0]?.id, '미디엄',
        allDrivers, cars, powerUnits, 0
      )
      const state2 = initRaceState(
        currentRace.circuit_name, gridWithTyre, currentWeather,
        myDrivers[1]?.id, '미디엄',
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

  return {
    teamColor, save,
    myDrivers, allDrivers, cars, powerUnits, teamStats,
    loading, ready,
    strategies,
    driver1Strategy, setDriver1Strategy,
    driver2Strategy, setDriver2Strategy,
    driver1StartTyre, setDriver1StartTyre,
    driver2StartTyre, setDriver2StartTyre,
    adjustedGrid, gridPenalties,
    mergedTimeline,
  }
}