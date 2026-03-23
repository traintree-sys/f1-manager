import { useState } from 'react'
import { useRaceWeekend } from '@/lib/context/RaceWeekendContext'
import { resolveRaceEvent, finishRace } from '@/lib/simulation/race'
import type { MergedEvent } from '@/lib/simulation/race'
import { updateTyreWear, applyPitStop } from '@/lib/simulation/strategy'
import type { DriverTyreState } from '@/lib/simulation/strategy'
import type { TyreCompound } from '@/lib/simulation/qualifying'
import { getOptionResultCommentary, getSegmentCommentary } from '@/lib/simulation/commentary'

interface Props {
  myDrivers: any[]
  allDrivers: any[]
  teamStats: any
  mergedTimeline: MergedEvent[]
  tyre1: DriverTyreState | null
  tyre2: DriverTyreState | null
  setTyre1: (t: DriverTyreState) => void
  setTyre2: (t: DriverTyreState) => void
  currentLap: number
  totalLaps: number
  circuitName: string
  onFinished: () => void
}

export function useRaceActions({
  myDrivers, allDrivers, teamStats,
  mergedTimeline,
  tyre1, tyre2, setTyre1, setTyre2,
  currentLap, totalLaps, circuitName,
  onFinished,
}: Props) {
  const { raceState1, setRaceState1, raceState2, setRaceState2 } = useRaceWeekend()

  const [timelineIndex, setTimelineIndex] = useState(0)
  const [currentMergedEvent, setCurrentMergedEvent] = useState<MergedEvent | null>(null)
  const [eventLog, setEventLog] = useState<string[]>([])
  const [raceFinished1, setRaceFinished1] = useState(false)
  const [raceFinished2, setRaceFinished2] = useState(false)
  const [showTyreSelect, setShowTyreSelect] = useState(false)
  const [pitDriverNum, setPitDriverNum] = useState<1 | 2>(1)
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null)

  const advanceTimeline = (nextIndex: number, resolvedState1: any, resolvedState2: any) => {
    if (nextIndex >= mergedTimeline.length) {
      setRaceState1(finishRace(resolvedState1))
      setRaceState2(finishRace(resolvedState2))
      setRaceFinished1(true)
      setRaceFinished2(true)
      setCurrentMergedEvent(null)
      onFinished()
    } else {
      setCurrentMergedEvent(mergedTimeline[nextIndex])
    }
    setTimelineIndex(nextIndex)
  }

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
      setRaceState({ ...resolved, driverPositions: resolved.driverPositions.map(d => d.driverId === driver.id ? { ...d, tyre: newTyre } : d) })
    } else {
      setRaceState(resolved)
      const currentTyreState = driverNum === 1 ? tyre1 : tyre2
      const setTyre = driverNum === 1 ? setTyre1 : setTyre2
      const dStats = allDrivers.find(d => d.id === driver.id)
      if (currentTyreState) setTyre(updateTyreWear(currentTyreState, 10, circuitName, dStats?.actual_tyre_management || 75))
    }

    const newPos = resolved.driverPositions.find(d => d.driverId === driver.id)?.finishPosition || 0
    const oldPos = raceState.driverPositions.find(d => d.driverId === driver.id)?.finishPosition || 0
    const commentary = getOptionResultCommentary(optionId, newPos < oldPos, driver.name, newPos, newTyre)
    setEventLog(prev => [`📻 ${commentary}`, ...prev])

    const resolvedWithTyre = newTyre
      ? { ...resolved, driverPositions: resolved.driverPositions.map(d => d.driverId === driver.id ? { ...d, tyre: newTyre } : d) }
      : resolved

    advanceTimeline(
      timelineIndex + 1,
      driverNum === 1 ? resolvedWithTyre : raceState1,
      driverNum === 2 ? resolvedWithTyre : raceState2,
    )
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

    if (tyre1) {
      const d = allDrivers.find(d => d.id === myDrivers[0]?.id)
      setTyre1(updateTyreWear(tyre1, 10, circuitName, d?.actual_tyre_management || 75))
    }
    if (tyre2) {
      const d = allDrivers.find(d => d.id === myDrivers[1]?.id)
      setTyre2(updateTyreWear(tyre2, 10, circuitName, d?.actual_tyre_management || 75))
    }

    const commentary = getSegmentCommentary(currentLap, totalLaps)
    setEventLog(prev => [`📻 ${commentary}`, ...prev])
    advanceTimeline(timelineIndex + 1, raceState1, raceState2)
  }

  const initTimeline = (firstEvent: MergedEvent, logs: string[]) => {
    setCurrentMergedEvent(firstEvent)
    setEventLog(logs)
    setTimelineIndex(0)
    setRaceFinished1(false)
    setRaceFinished2(false)
  }

  return {
    timelineIndex,
    currentMergedEvent, setCurrentMergedEvent,
    eventLog, setEventLog,
    raceFinished1, raceFinished2,
    showTyreSelect, pitDriverNum,
    handleEventOption, handleTyreSelected, handleNextSegment,
    initTimeline,
  }
}