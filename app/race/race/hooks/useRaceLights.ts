import { useEffect, useState } from 'react'
import { useRaceWeekend } from '@/lib/context/RaceWeekendContext'
import { doStart } from '@/lib/simulation/race'
import type { RaceState } from '@/lib/simulation/race'
import { initDriverTyreState } from '@/lib/simulation/strategy'
import type { DriverTyreState } from '@/lib/simulation/strategy'
import type { TyreCompound } from '@/lib/simulation/qualifying'
import { getCommentary, getStartCommentary } from '@/lib/simulation/commentary'

interface Props {
  racePhase: string
  myDrivers: any[]
  allDrivers: any[]
  driver1StartTyre: TyreCompound
  driver2StartTyre: TyreCompound
  adjustedGrid: any[]
  mergedTimeline: any[]
  onDone: (params: {
    started1: RaceState
    started2: RaceState
    t1: DriverTyreState
    t2: DriverTyreState
    startLogs: string[]
  }) => void
}

export function useRaceLights({
  racePhase, myDrivers, allDrivers,
  driver1StartTyre, driver2StartTyre,
  adjustedGrid, mergedTimeline, onDone
}: Props) {
  const { raceState1, setRaceState1, raceState2, setRaceState2 } = useRaceWeekend()
  const [lights, setLights] = useState(0)
  const [lightsOut, setLightsOut] = useState(false)

  useEffect(() => {
    if (racePhase !== 'lights') return
    setLights(0)
    setLightsOut(false)

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

            const started1Raw = doStart(raceState1, allDrivers, [myDrivers[0]?.id, myDrivers[1]?.id])
            const started2Raw = doStart(raceState2, allDrivers, [myDrivers[0]?.id, myDrivers[1]?.id])

            const t1 = initDriverTyreState(myDrivers[0]?.id, driver1StartTyre)
            const t2 = initDriverTyreState(myDrivers[1]?.id, driver2StartTyre)

            // 전체 driverPositions에서 플레이어 타이어만 교체
            const started1: RaceState = {
              ...started1Raw,
              driverPositions: started1Raw.driverPositions.map(d => {
                if (d.driverId === myDrivers[0]?.id) return { ...d, tyre: driver1StartTyre }
                return d
              })
            }

            const started2: RaceState = {
              ...started2Raw,
              driverPositions: started2Raw.driverPositions.map(d => {
                if (d.driverId === myDrivers[1]?.id) return { ...d, tyre: driver2StartTyre }
                return d
              })
            }

            setRaceState1(started1)
            setRaceState2(started2)

            // 스타트 해설
            const logs: string[] = []
            logs.push(`📻 ${getCommentary('start_go')}`)
            myDrivers.forEach((d, i) => {
              const rs = i === 0 ? started1 : started2
              const startPos = adjustedGrid.findIndex((r: any) => r.driverId === d.id) + 1
              const endPos = rs.driverPositions.find((p: any) => p.driverId === d.id)?.finishPosition || startPos
              getStartCommentary(d.name, startPos, endPos).forEach(l => logs.push(`📻 ${l}`))
            })

            onDone({ started1, started2, t1, t2, startLogs: logs })
          }, 1500)
        }, 1000)
      }
    }, 800)
    return () => clearInterval(interval)
  }, [racePhase])

  return { lights, lightsOut }
}