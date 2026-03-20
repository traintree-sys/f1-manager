'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { DriverQualifyingResult, TyreCompound, QualifyingStrategy } from '@/lib/simulation/qualifying'
import type { RaceState } from '@/lib/simulation/race'

interface RaceWeekendContextType {
  selectedRace: any
  setSelectedRace: (race: any) => void
  weather: any
  setWeather: (weather: any) => void
  fpSetup: 'aero' | 'mechanical' | 'balance'
  setFpSetup: (setup: 'aero' | 'mechanical' | 'balance') => void
  fpDone: boolean
  setFpDone: (done: boolean) => void
  qResults: DriverQualifyingResult[]
  setQResults: (results: DriverQualifyingResult[]) => void
  driver1Tyre: TyreCompound
  setDriver1Tyre: (tyre: TyreCompound) => void
  driver1Strategy: QualifyingStrategy
  setDriver1Strategy: (strategy: QualifyingStrategy) => void
  driver2Tyre: TyreCompound
  setDriver2Tyre: (tyre: TyreCompound) => void
  driver2Strategy: QualifyingStrategy
  setDriver2Strategy: (strategy: QualifyingStrategy) => void
  qDone: boolean
  setQDone: (done: boolean) => void
  raceState1: RaceState | null
  setRaceState1: (state: RaceState | null) => void
  raceState2: RaceState | null
  setRaceState2: (state: RaceState | null) => void
  driver1Finished: boolean
  setDriver1Finished: (done: boolean) => void
  driver2Finished: boolean
  setDriver2Finished: (done: boolean) => void
  eventLog1: string[]
  setEventLog1: (logs: string[] | ((prev: string[]) => string[])) => void
  eventLog2: string[]
  setEventLog2: (logs: string[] | ((prev: string[]) => string[])) => void
  resetWeekend: () => void
}

const RaceWeekendContext = createContext<RaceWeekendContextType | null>(null)

export function RaceWeekendProvider({ children }: { children: ReactNode }) {
  const [selectedRace, setSelectedRace] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)
  const [fpSetup, setFpSetup] = useState<'aero' | 'mechanical' | 'balance'>('balance')
  const [fpDone, setFpDone] = useState(false)
  const [qResults, setQResults] = useState<DriverQualifyingResult[]>([])
  const [driver1Tyre, setDriver1Tyre] = useState<TyreCompound>('소프트')
  const [driver1Strategy, setDriver1Strategy] = useState<QualifyingStrategy>('균형')
  const [driver2Tyre, setDriver2Tyre] = useState<TyreCompound>('소프트')
  const [driver2Strategy, setDriver2Strategy] = useState<QualifyingStrategy>('균형')
  const [qDone, setQDone] = useState(false)
  const [raceState1, setRaceState1] = useState<RaceState | null>(null)
  const [raceState2, setRaceState2] = useState<RaceState | null>(null)
  const [driver1Finished, setDriver1Finished] = useState(false)
  const [driver2Finished, setDriver2Finished] = useState(false)
  const [eventLog1, setEventLog1] = useState<string[]>([])
  const [eventLog2, setEventLog2] = useState<string[]>([])

  // localStorage에서 레이스/날씨 데이터 읽기
  useEffect(() => {
    const raceData = localStorage.getItem('selectedRace')
    const weatherData = localStorage.getItem('selectedWeather')
    if (raceData) setSelectedRace(JSON.parse(raceData))
    if (weatherData) setWeather(JSON.parse(weatherData))
  }, [])

  const resetWeekend = () => {
    setFpDone(false)
    setQResults([])
    setDriver1Tyre('소프트')
    setDriver1Strategy('균형')
    setDriver2Tyre('소프트')
    setDriver2Strategy('균형')
    setQDone(false)
    setRaceState1(null)
    setRaceState2(null)
    setDriver1Finished(false)
    setDriver2Finished(false)
    setEventLog1([])
    setEventLog2([])
  }

  return (
    <RaceWeekendContext.Provider value={{
      selectedRace, setSelectedRace,
      weather, setWeather,
      fpSetup, setFpSetup,
      fpDone, setFpDone,
      qResults, setQResults,
      driver1Tyre, setDriver1Tyre,
      driver1Strategy, setDriver1Strategy,
      driver2Tyre, setDriver2Tyre,
      driver2Strategy, setDriver2Strategy,
      qDone, setQDone,
      raceState1, setRaceState1,
      raceState2, setRaceState2,
      driver1Finished, setDriver1Finished,
      driver2Finished, setDriver2Finished,
      eventLog1, setEventLog1,
      eventLog2, setEventLog2,
      resetWeekend,
    }}>
      {children}
    </RaceWeekendContext.Provider>
  )
}

export function useRaceWeekend() {
  const context = useContext(RaceWeekendContext)
  if (!context) throw new Error('useRaceWeekend must be used within RaceWeekendProvider')
  return context
}