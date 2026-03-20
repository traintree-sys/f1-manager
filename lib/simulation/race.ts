import { WeatherState, CIRCUITS } from './weather'
import { DriverQualifyingResult, TyreCompound } from './qualifying'
import { RaceEvent, generateRaceEvents, resolveEventOption } from './events'
import { getPoints } from './prize'

export interface DriverRaceResult {
  driverId: string
  driverName: string
  teamName: string
  teamColor: string
  startPosition: number
  finishPosition: number
  points: number
  fastestLap: boolean
  retired: boolean
  retiredLap?: number
  penaltySeconds: number
  licensePointsAdded: number
  partsDamageCost: number
  tyre: TyreCompound
  pitStops: number
}

export interface RaceState {
  circuitName: string
  totalLaps: number
  currentLap: number
  weather: WeatherState
  driverPositions: DriverRaceResult[]
  events: RaceEvent[]
  currentEvent: RaceEvent | null
  eventIndex: number
  finished: boolean
  totalPartsDamage: number
  totalPenaltySeconds: number
  totalLicensePoints: number
  startDone: boolean
  startLog: string[]
}

export interface MergedEvent {
  event: RaceEvent
  driverNum: 1 | 2
  driverName: string
}

export function mergeEvents(
  events1: RaceEvent[],
  events2: RaceEvent[],
  driverName1: string,
  driverName2: string
): MergedEvent[] {
  const merged: MergedEvent[] = [
    ...events1.map(e => ({ event: e, driverNum: 1 as const, driverName: driverName1 })),
    ...events2.map(e => ({ event: e, driverNum: 2 as const, driverName: driverName2 })),
  ]
  return merged.sort((a, b) => a.event.lap - b.event.lap)
}

export function simulateStart(
  positions: DriverRaceResult[],
  driverStats: any[],
  playerDriverIds: string[]
): { newPositions: DriverRaceResult[], startLog: string[] } {
  const logs: string[] = []
  const newPositions = [...positions]

  const startScores = newPositions.map(d => {
    const stats = driverStats.find(s => s.id === d.driverId)
    const startsAbility = stats?.actual_starts || stats?.starts || 70
    const reactionBonus = (startsAbility - 70) * 0.3
    const random = (Math.random() - 0.5) * 20
    return {
      driverId: d.driverId,
      score: startsAbility + reactionBonus + random,
      startPos: d.startPosition,
    }
  })

  startScores.sort((a, b) => {
    const posWeight = (22 - a.startPos) * 2
    const posWeightB = (22 - b.startPos) * 2
    return (b.score + posWeightB) - (a.score + posWeight)
  })

  startScores.forEach((s, i) => {
    const idx = newPositions.findIndex(d => d.driverId === s.driverId)
    if (idx !== -1) {
      const oldPos = newPositions[idx].finishPosition
      newPositions[idx] = { ...newPositions[idx], finishPosition: i + 1 }
      const change = oldPos - (i + 1)
      if (playerDriverIds.includes(s.driverId) && change !== 0) {
        const name = newPositions[idx].driverName
        if (change > 0) logs.push(`🚀 ${name} 좋은 스타트! ${change}개 포지션 상승 → P${i + 1}`)
        else logs.push(`⬇️ ${name} 스타트에서 ${Math.abs(change)}개 포지션 하락 → P${i + 1}`)
      }
    }
  })

  if (Math.random() < 0.05) {
    logs.push('💥 스타트 직후 충돌 사고 발생! 세이프티카 출동')
  } else if (Math.random() < 0.1) {
    logs.push('⚠️ 스타트에서 여러 드라이버가 접촉했습니다')
  } else {
    logs.push('✅ 큰 사고 없이 스타트가 완료됐습니다')
  }

  return { newPositions, startLog: logs }
}

export function initRaceState(
  circuitName: string,
  qualifyingResults: DriverQualifyingResult[],
  weather: WeatherState,
  playerDriverId: string,
  playerTyre: TyreCompound,
  driverStats: any[],
  carStats: any[],
  puStats: any[],
  licensePoints: number = 0
): RaceState {
  const circuit = CIRCUITS[circuitName]
  const totalLaps = circuit?.laps || 55

  const driverPositions: DriverRaceResult[] = qualifyingResults.map((qr, index) => ({
    driverId: qr.driverId,
    driverName: qr.driverName,
    teamName: qr.teamName,
    teamColor: qr.teamColor,
    startPosition: index + 1,
    finishPosition: index + 1,
    points: 0,
    fastestLap: false,
    retired: false,
    penaltySeconds: 0,
    licensePointsAdded: 0,
    partsDamageCost: 0,
    tyre: qr.driverId === playerDriverId ? playerTyre : qr.tyre,
    pitStops: 0,
  }))

  const playerDriver = driverStats.find(d => d.id === playerDriverId)
  const playerCar = carStats.find(c => c.team_id === playerDriver?.team_id)

  const events = generateRaceEvents(
    totalLaps,
    weather,
    playerDriver?.actual_error_avoidance || 75,
    playerCar?.actual_reliability || 75,
    circuitName,
    playerDriver?.actual_composure || 75,
    playerDriver?.actual_error_avoidance || 75,
    licensePoints
  )

  return {
    circuitName,
    totalLaps,
    currentLap: 0,
    weather,
    driverPositions,
    events,
    currentEvent: null,
    eventIndex: 0,
    finished: false,
    totalPartsDamage: 0,
    totalPenaltySeconds: 0,
    totalLicensePoints: licensePoints,
    startDone: false,
    startLog: [],
  }
}

export function doStart(
  state: RaceState,
  driverStats: any[],
  playerDriverIds: string[]
): RaceState {
  const { newPositions, startLog } = simulateStart(
    state.driverPositions,
    driverStats,
    playerDriverIds
  )

  return {
    ...state,
    driverPositions: newPositions,
    startDone: true,
    startLog,
    currentLap: 1,
  }
}

export function resolveRaceEvent(
  state: RaceState,
  optionId: string,
  playerDriverId: string,
  driverStats: any,
  teamStats: any,
): RaceState {
  if (!state.currentEvent) return state

  const result = resolveEventOption(
    state.currentEvent,
    optionId,
    driverStats,
    teamStats,
  )

  const newPositions = [...state.driverPositions]
  const playerIndex = newPositions.findIndex(d => d.driverId === playerDriverId)

  if (playerIndex !== -1) {
    const player = { ...newPositions[playerIndex] }

    if (result.positionChange !== 0) {
      const newPos = Math.max(1, Math.min(22, player.finishPosition - result.positionChange))
      const swapIndex = newPositions.findIndex(d =>
        d.driverId !== playerDriverId && d.finishPosition === newPos
      )
      if (swapIndex !== -1) {
        newPositions[swapIndex] = {
          ...newPositions[swapIndex],
          finishPosition: player.finishPosition
        }
      }
      player.finishPosition = newPos
    }

    if (result.positionChange <= -50) {
      player.retired = true
      player.retiredLap = state.currentEvent.lap
      player.finishPosition = 22
    }

    if (optionId.startsWith('pit_') && optionId !== 'pit_repair') {
      player.pitStops += 1
    }

    player.penaltySeconds += result.timeChange > 0 ? result.timeChange : 0
    player.licensePointsAdded += result.penaltyPointsAdded
    player.partsDamageCost += result.partsDamageCost

    newPositions[playerIndex] = player
  }

  if (Math.random() < 0.3) {
    const randomIdx1 = Math.floor(Math.random() * newPositions.length)
    const randomIdx2 = Math.floor(Math.random() * newPositions.length)
    if (randomIdx1 !== randomIdx2 &&
      !newPositions[randomIdx1].retired &&
      !newPositions[randomIdx2].retired &&
      newPositions[randomIdx1].driverId !== playerDriverId &&
      newPositions[randomIdx2].driverId !== playerDriverId) {
      const temp = newPositions[randomIdx1].finishPosition
      newPositions[randomIdx1] = { ...newPositions[randomIdx1], finishPosition: newPositions[randomIdx2].finishPosition }
      newPositions[randomIdx2] = { ...newPositions[randomIdx2], finishPosition: temp }
    }
  }

  return {
    ...state,
    driverPositions: newPositions,
    currentEvent: null,
    eventIndex: state.eventIndex + 1,
    currentLap: state.currentEvent.lap,
    totalPartsDamage: state.totalPartsDamage + (result.partsDamageCost || 0),
    totalPenaltySeconds: state.totalPenaltySeconds + (result.timeChange > 0 ? result.timeChange : 0),
    totalLicensePoints: state.totalLicensePoints + result.penaltyPointsAdded,
  }
}

export function advanceToNextEvent(state: RaceState): RaceState {
  const nextEvent = state.events[state.eventIndex]
  if (!nextEvent) {
    return finishRace(state)
  }
  return {
    ...state,
    currentEvent: nextEvent,
    currentLap: nextEvent.lap,
  }
}

export function finishRace(state: RaceState): RaceState {
  const retireCount = Math.floor(Math.random() * 2) + 1
  const newPositions = [...state.driverPositions]
  let retiredCount = 0

  newPositions.forEach((driver, idx) => {
    if (!driver.retired && retiredCount < retireCount && Math.random() < 0.1) {
      newPositions[idx] = { ...driver, retired: true, finishPosition: 20 + retiredCount }
      retiredCount++
    }
  })

  newPositions.sort((a, b) => {
    if (a.retired && !b.retired) return 1
    if (!a.retired && b.retired) return -1
    return a.finishPosition - b.finishPosition
  })
  newPositions.forEach((d, i) => { newPositions[i] = { ...d, finishPosition: i + 1 } })

  newPositions.forEach((driver, idx) => {
    if (!driver.retired) {
      newPositions[idx] = { ...driver, points: getPoints(driver.finishPosition) }
    }
  })

  const leader = newPositions.find(d => !d.retired && d.finishPosition === 1)
if (leader) {
  const leaderIdx = newPositions.findIndex(d => d.driverId === leader.driverId)
  newPositions[leaderIdx] = {
    ...newPositions[leaderIdx],
    fastestLap: true,
  }
}

  return {
    ...state,
    driverPositions: newPositions,
    finished: true,
    currentLap: state.totalLaps,
    currentEvent: null,
  }
}

export function getPlayerResult(state: RaceState, playerDriverId: string): DriverRaceResult | undefined {
  return state.driverPositions.find(d => d.driverId === playerDriverId)
}

export function getSegmentDescription(
  currentLap: number,
  totalLaps: number,
  nextEventLap: number | null
): string {
  const pct = Math.round((currentLap / totalLaps) * 100)
  if (currentLap === 0) return '그리드 대기 중'
  if (currentLap <= 5) return `오프닝 랩 (${currentLap}/${totalLaps})`
  if (pct < 33) return `레이스 초반 — ${currentLap}/${totalLaps}랩`
  if (pct < 66) return `레이스 중반 — ${currentLap}/${totalLaps}랩`
  if (pct < 90) return `레이스 후반 — ${currentLap}/${totalLaps}랩`
  return `파이널 스테이지 — ${currentLap}/${totalLaps}랩`
}