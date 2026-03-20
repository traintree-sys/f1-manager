import { WeatherState } from './weather'

export type TyreCompound = '소프트' | '미디엄' | '하드' | '인터미디어트' | '풀웨트'
export type QualifyingStrategy = '공격적' | '균형' | '보수적'

export interface DriverQualifyingResult {
  driverId: string
  driverName: string
  teamName: string
  teamColor: string
  finalTime?: number
  position: number
  tyre: TyreCompound
  strategy: QualifyingStrategy
  eliminated: boolean
  eliminatedIn?: 'Q1' | 'Q2'
  hadMistake: boolean
}

export interface QualifyingState {
  session: 'Q1' | 'Q2' | 'Q3' | 'finished'
  results: DriverQualifyingResult[]
  playerTyre: TyreCompound
  playerStrategy: QualifyingStrategy
  weather: WeatherState
  playerPosition: number
}

export const BASE_LAP_TIMES: Record<string, number> = {
  '호주 그랑프리 (멜버른)': 80.235,
  '중국 그랑프리 (상하이)': 93.768,
  '일본 그랑프리 (스즈카)': 90.983,
  '마이애미 그랑프리': 88.342,
  '캐나다 그랑프리 (몬트리올)': 72.341,
  '모나코 그랑프리': 71.908,
  '스페인 그랑프리 (바르셀로나)': 78.149,
  '오스트리아 그랑프리 (레드불링)': 64.984,
  '영국 그랑프리 (실버스톤)': 87.097,
  '벨기에 그랑프리 (스파)': 103.558,
  '헝가리 그랑프리 (부다페스트)': 76.627,
  '네덜란드 그랑프리 (잔드보르트)': 71.447,
  '이탈리아 그랑프리 (몬자)': 80.134,
  '마드리드 그랑프리': 85.200,
  '아제르바이잔 그랑프리 (바쿠)': 102.394,
  '싱가포르 그랑프리': 99.217,
  '미국 그랑프리 (오스틴)': 95.387,
  '멕시코시티 그랑프리': 78.741,
  '상파울루 그랑프리': 71.168,
  '라스베이거스 그랑프리': 93.421,
  '카타르 그랑프리': 84.319,
  '아부다비 그랑프리 (야스마리나)': 84.701,
}

// 서킷 특성 (AI 전략 선택에 사용)
export const CIRCUIT_CHARACTERISTICS: Record<string, 'high_speed' | 'street' | 'technical' | 'balanced'> = {
  '호주 그랑프리 (멜버른)': 'street',
  '중국 그랑프리 (상하이)': 'balanced',
  '일본 그랑프리 (스즈카)': 'technical',
  '마이애미 그랑프리': 'street',
  '캐나다 그랑프리 (몬트리올)': 'street',
  '모나코 그랑프리': 'street',
  '스페인 그랑프리 (바르셀로나)': 'technical',
  '오스트리아 그랑프리 (레드불링)': 'high_speed',
  '영국 그랑프리 (실버스톤)': 'high_speed',
  '벨기에 그랑프리 (스파)': 'high_speed',
  '헝가리 그랑프리 (부다페스트)': 'technical',
  '네덜란드 그랑프리 (잔드보르트)': 'technical',
  '이탈리아 그랑프리 (몬자)': 'high_speed',
  '마드리드 그랑프리': 'balanced',
  '아제르바이잔 그랑프리 (바쿠)': 'street',
  '싱가포르 그랑프리': 'street',
  '미국 그랑프리 (오스틴)': 'balanced',
  '멕시코시티 그랑프리': 'balanced',
  '상파울루 그랑프리': 'balanced',
  '라스베이거스 그랑프리': 'street',
  '카타르 그랑프리': 'high_speed',
  '아부다비 그랑프리 (야스마리나)': 'balanced',
}

export const TYRE_TIME_DELTA: Record<TyreCompound, number> = {
  '소프트': 0,
  '미디엄': 0.4,
  '하드': 0.9,
  '인터미디어트': 2.5,
  '풀웨트': 5.0,
}

export const STRATEGY_DELTA: Record<QualifyingStrategy, number> = {
  '공격적': -0.3,
  '균형': 0,
  '보수적': 0.5,
}

export const STRATEGY_MISTAKE_CHANCE: Record<QualifyingStrategy, number> = {
  '공격적': 15,
  '균형': 5,
  '보수적': 2,
}

// AI 전략 자동 선택
export function selectAIStrategy(
  circuitName: string,
  weather: WeatherState,
  driverPace: number
): QualifyingStrategy {
  const characteristic = CIRCUIT_CHARACTERISTICS[circuitName] || 'balanced'

  // 우천시 보수적
  if (weather.current === 'wet') return '보수적'
  if (weather.current === 'mixed') return Math.random() < 0.5 ? '보수적' : '균형'

  // 서킷 특성 + 드라이버 페이스 기반
  if (characteristic === 'street') {
    // 시가지: 실수 위험 높음 → 보수적 선호
    if (driverPace >= 90) return Math.random() < 0.4 ? '공격적' : '균형'
    return Math.random() < 0.3 ? '균형' : '보수적'
  } else if (characteristic === 'high_speed') {
    // 고속: 공격적 유리
    if (driverPace >= 90) return Math.random() < 0.6 ? '공격적' : '균형'
    return Math.random() < 0.4 ? '공격적' : '균형'
  } else if (characteristic === 'technical') {
    // 기술적: 균형 선호
    if (driverPace >= 90) return Math.random() < 0.4 ? '공격적' : '균형'
    return Math.random() < 0.6 ? '균형' : '보수적'
  }

  // balanced
  if (driverPace >= 92) return Math.random() < 0.5 ? '공격적' : '균형'
  if (driverPace >= 85) return '균형'
  return Math.random() < 0.4 ? '균형' : '보수적'
}

// AI 타이어 선택
export function selectAITyre(
  weather: WeatherState,
  session: 'Q1' | 'Q2' | 'Q3'
): TyreCompound {
  if (weather.current === 'wet') return Math.random() < 0.7 ? '인터미디어트' : '풀웨트'
  if (weather.current === 'mixed') return '인터미디어트'
  // 드라이: 거의 소프트
  if (session === 'Q3') return '소프트'
  return Math.random() < 0.85 ? '소프트' : '미디엄'
}

export function calculateQualifyingTime(
  baseTime: number,
  driverStats: any,
  carStats: any,
  puStats: any,
  tyre: TyreCompound,
  strategy: QualifyingStrategy,
  weather: WeatherState,
): number {
  const driverBonus = ((driverStats.actual_qualifying_pace || driverStats.qualifying_pace || 70) - 80) * 0.015
  const carBonus = (
    ((carStats.actual_aerodynamics || 80) - 80) * 0.008 +
    ((carStats.actual_chassis || 80) - 80) * 0.006
  )
  const puBonus = ((puStats?.actual_power || 80) - 80) * 0.005
  const tyreDelta = TYRE_TIME_DELTA[tyre]
  const strategyDelta = STRATEGY_DELTA[strategy]
  const mistakeChance = STRATEGY_MISTAKE_CHANCE[strategy]
  const hasMistake = Math.random() * 100 < mistakeChance
  const mistakeDelta = hasMistake ? Math.random() * 2 + 0.5 : 0
  const wetPenalty = weather.current === 'wet'
    ? (10 - ((driverStats.actual_wet_driving || driverStats.wet_driving || 70) - 70) * 0.1)
    : weather.current === 'mixed' ? 3 : 0
  const random = (Math.random() - 0.5) * 0.6

  return Math.max(
    baseTime * 0.95,
    baseTime - driverBonus - carBonus - puBonus + tyreDelta + strategyDelta + mistakeDelta + wetPenalty + random
  )
}

export function formatLapTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3).padStart(6, '0')
  return `${mins}:${secs}`
}

export function runQualifyingSession(
  session: 'Q1' | 'Q2' | 'Q3',
  drivers: any[],
  cars: any[],
  powerUnits: any[],
  circuitName: string,
  weather: WeatherState,
  playerDriverId: string,
  playerTyre: TyreCompound,
  playerStrategy: QualifyingStrategy,
  previousResults?: DriverQualifyingResult[]
): DriverQualifyingResult[] {
  const baseTime = BASE_LAP_TIMES[circuitName] || 85

  // 탈락자 제외
  let activeDrivers = drivers
  if (previousResults) {
    const eliminated = previousResults
      .filter(r => r.eliminated)
      .map(r => r.driverId)
    activeDrivers = drivers.filter(d => !eliminated.includes(d.id))
  }

  const results: DriverQualifyingResult[] = activeDrivers.map(driver => {
    const car = cars.find(c => c.team_id === driver.team_id)
    const pu = powerUnits.find(p => p.id === car?.power_unit_id)
    const isPlayer = driver.id === playerDriverId
    const driverPace = driver.actual_qualifying_pace || driver.qualifying_pace || 70

    const tyre = isPlayer ? playerTyre : selectAITyre(weather, session)
    const strategy = isPlayer ? playerStrategy : selectAIStrategy(circuitName, weather, driverPace)

    const mistakeChance = STRATEGY_MISTAKE_CHANCE[strategy]
    const hadMistake = !isPlayer && Math.random() * 100 < mistakeChance

    const time = calculateQualifyingTime(
      baseTime, driver, car || {}, pu || {},
      tyre, strategy, weather
    )

    return {
      driverId: driver.id,
      driverName: driver.name,
      teamName: driver.teams?.name || '',
      teamColor: driver.teams?.color || '#ffffff',
      finalTime: hadMistake ? time + Math.random() * 2 + 0.5 : time,
      position: 0,
      tyre,
      strategy,
      eliminated: false,
      hadMistake,
    }
  })

  // 순위 정렬
  results.sort((a, b) => (a.finalTime || 0) - (b.finalTime || 0))
  results.forEach((r, i) => r.position = i + 1)

  // Q1: 하위 6명 탈락 (22→16)
  // Q2: 하위 6명 탈락 (16→10)
  if (session === 'Q1') {
    results.slice(16).forEach(r => {
      r.eliminated = true
      r.eliminatedIn = 'Q1'
    })
  } else if (session === 'Q2') {
    results.slice(10).forEach(r => {
      r.eliminated = true
      r.eliminatedIn = 'Q2'
    })
  }

  // 이전 결과 병합
  if (previousResults) {
    const eliminatedPrev = previousResults.filter(r => r.eliminated)
    return [...results, ...eliminatedPrev].sort((a, b) => {
      if (a.eliminated && !b.eliminated) return 1
      if (!a.eliminated && b.eliminated) return -1
      return (a.finalTime || 999) - (b.finalTime || 999)
    })
  }

  return results
}