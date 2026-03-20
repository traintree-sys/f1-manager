'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/supabase'
import { useRaceWeekend } from '@/lib/context/RaceWeekendContext'
import { getWeatherLabel, getTyreForWeather } from '@/lib/simulation/weather'
import { runQualifyingSession, formatLapTime } from '@/lib/simulation/qualifying'
import type { TyreCompound, QualifyingStrategy, DriverQualifyingResult } from '@/lib/simulation/qualifying'

type QSession = 'Q1' | 'Q2' | 'Q3' | 'finished'

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function QualifyingPage({ onNext, onBack }: Props) {
  const router = useRouter()
  const {
    selectedRace, weather,
    qResults, setQResults,
    driver1Tyre, setDriver1Tyre,
    driver1Strategy, setDriver1Strategy,
    driver2Tyre, setDriver2Tyre,
    driver2Strategy, setDriver2Strategy,
    qDone, setQDone,
  } = useRaceWeekend()

  const [teamColor, setTeamColor] = useState('#ff0000')
  const [qSession, setQSession] = useState<QSession>('Q1')
  const [drivers, setDrivers] = useState<any[]>([])
  const [cars, setCars] = useState<any[]>([])
  const [powerUnits, setPowerUnits] = useState<any[]>([])
  const [myDrivers, setMyDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)

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

      const { data: driverData } = await supabase
        .from('drivers').select('*, teams(name, color)').not('team_id', 'is', null)
      setDrivers(driverData || [])

      const { data: carData } = await supabase.from('cars').select('*')
      setCars(carData || [])

      const { data: puData } = await supabase.from('power_units').select('*')
      setPowerUnits(puData || [])

      const { data: myDriverData } = await supabase
        .from('drivers').select('*').eq('team_id', saveData.team_id)
      setMyDrivers(myDriverData || [])

      setLoading(false)
    }
    fetchData()
  }, [ready, router])

  const handleRunQSession = () => {
    if (!selectedRace || myDrivers.length === 0 || qSession === 'finished') return

    const tyres = getTyreForWeather(weather?.current || 'dry')
    const tyre1 = tyres.includes(driver1Tyre) ? driver1Tyre : tyres[0] as TyreCompound
    const tyre2 = tyres.includes(driver2Tyre) ? driver2Tyre : tyres[0] as TyreCompound

    let results = runQualifyingSession(
      qSession, drivers, cars, powerUnits,
      selectedRace.circuit_name, weather,
      myDrivers[0]?.id, tyre1, driver1Strategy,
      qResults.length > 0 ? qResults : undefined
    )

    results = results.map(r => {
      if (r.driverId === myDrivers[1]?.id) {
        return { ...r, tyre: tyre2, strategy: driver2Strategy }
      }
      return r
    })

    setQResults(results)

    if (qSession === 'Q1') setQSession('Q2')
    else if (qSession === 'Q2') setQSession('Q3')
    else { setQDone(true); setQSession('finished') }
  }

  if (!ready || loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="text-gray-400 hover:text-white mb-4">← FP로</button>
        <h1 className="text-3xl font-bold mb-1" style={{ color: teamColor }}>🏁 예선</h1>
        <p className="text-xl text-white font-bold mb-1">{selectedRace?.circuit_name}</p>
        <p className="text-gray-400 mb-6">
          {getWeatherLabel(weather?.current || 'dry')} · {qSession === 'finished' ? '예선 완료' : `현재: ${qSession}`}
        </p>

        {/* 전략 선택 */}
        {!qDone && qSession !== 'finished' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
            <h2 className="text-xl font-bold mb-5">{qSession} 전략 선택</h2>

            {/* 드라이버 1 */}
            <div className="mb-6 pb-6 border-b border-gray-800">
              <p className="font-bold mb-3" style={{ color: teamColor }}>
                {myDrivers[0]?.name || '드라이버 1'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-2">타이어</p>
                  <div className="flex gap-2 flex-wrap">
                    {getTyreForWeather(weather?.current || 'dry').map(t => (
                      <button key={t} onClick={() => setDriver1Tyre(t as TyreCompound)}
                        className="px-3 py-1 rounded-lg border text-xs transition"
                        style={{
                          borderColor: driver1Tyre === t ? teamColor : '#374151',
                          color: driver1Tyre === t ? teamColor : '#9ca3af'
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-2">어택 전략</p>
                  <div className="flex gap-2">
                    {(['공격적', '균형', '보수적'] as QualifyingStrategy[]).map(s => (
                      <button key={s} onClick={() => setDriver1Strategy(s)}
                        className="px-3 py-1 rounded-lg border text-xs transition"
                        style={{
                          borderColor: driver1Strategy === s ? teamColor : '#374151',
                          color: driver1Strategy === s ? teamColor : '#9ca3af'
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 드라이버 2 */}
            {myDrivers[1] && (
              <div className="mb-6">
                <p className="font-bold mb-3" style={{ color: teamColor }}>
                  {myDrivers[1]?.name || '드라이버 2'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-2">타이어</p>
                    <div className="flex gap-2 flex-wrap">
                      {getTyreForWeather(weather?.current || 'dry').map(t => (
                        <button key={t} onClick={() => setDriver2Tyre(t as TyreCompound)}
                          className="px-3 py-1 rounded-lg border text-xs transition"
                          style={{
                            borderColor: driver2Tyre === t ? teamColor : '#374151',
                            color: driver2Tyre === t ? teamColor : '#9ca3af'
                          }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-2">어택 전략</p>
                    <div className="flex gap-2">
                      {(['공격적', '균형', '보수적'] as QualifyingStrategy[]).map(s => (
                        <button key={s} onClick={() => setDriver2Strategy(s)}
                          className="px-3 py-1 rounded-lg border text-xs transition"
                          style={{
                            borderColor: driver2Strategy === s ? teamColor : '#374151',
                            color: driver2Strategy === s ? teamColor : '#9ca3af'
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleRunQSession}
              className="w-full py-3 rounded-xl font-bold text-black"
              style={{ backgroundColor: teamColor }}
            >
              {qSession} 실행
            </button>
          </div>
        )}

        {/* 예선 결과 */}
        {qResults.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
            <p className="font-bold mb-3">예선 결과</p>
            <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
              {qResults.map((r) => {
                const isMyDriver = myDrivers.some(d => d.id === r.driverId)
                return (
                  <div key={r.driverId}
                    className={`flex justify-between items-center py-2 px-3 rounded-lg
                      ${isMyDriver ? 'bg-gray-800' : ''}
                      ${r.eliminated ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-6 text-sm">P{r.position}</span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.teamColor }} />
                      <span className={`text-sm ${isMyDriver ? 'font-bold text-white' : 'text-gray-300'}`}>
                        {r.driverName}
                      </span>
                      <span className="text-xs text-gray-600">{r.strategy}</span>
                      <span className="text-xs text-gray-600">{r.tyre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.hadMistake && <span className="text-red-400 text-xs">실수</span>}
                      {r.eliminated && <span className="text-red-400 text-xs">{r.eliminatedIn} 탈락</span>}
                      <span className="text-gray-400 text-sm font-mono">
                        {r.finalTime ? formatLapTime(r.finalTime) : '-'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {qDone && (
          <button
            onClick={onNext}
            className="w-full py-3 rounded-xl font-bold text-black"
            style={{ backgroundColor: teamColor }}
          >
            🏎️ 레이스 시작!
          </button>
        )}
      </div>
    </main>
  )
}