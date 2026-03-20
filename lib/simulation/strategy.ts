import { TyreCompound } from './qualifying'

export interface TyreInfo {
  compound: TyreCompound
  maxLaps: number
  speedDelta: number
  degradation: number
}

export interface RaceStrategy {
  id: string
  name: string
  description: string
  stints: TyreCompound[]
  pitLaps: number[]
  totalTime: number
}

export interface DriverTyreState {
  driverId: string
  currentTyre: TyreCompound
  tyreAge: number
  tyreWear: number
  performance: number
}

// 서킷별 타이어 수명 (랩)
export const TYRE_LIFE: Record<TyreCompound, Record<string, number>> = {
  '소프트': {
    default: 18,
    '호주 그랑프리 (멜버른)': 20,
    '중국 그랑프리 (상하이)': 17,
    '일본 그랑프리 (스즈카)': 16,
    '마이애미 그랑프리': 19,
    '캐나다 그랑프리 (몬트리올)': 22,
    '모나코 그랑프리': 25,
    '스페인 그랑프리 (바르셀로나)': 16,
    '오스트리아 그랑프리 (레드불링)': 18,
    '영국 그랑프리 (실버스톤)': 15,
    '벨기에 그랑프리 (스파)': 14,
    '헝가리 그랑프리 (부다페스트)': 16,
    '네덜란드 그랑프리 (잔드보르트)': 17,
    '이탈리아 그랑프리 (몬자)': 16,
    '마드리드 그랑프리': 17,
    '아제르바이잔 그랑프리 (바쿠)': 22,
    '싱가포르 그랑프리': 23,
    '미국 그랑프리 (오스틴)': 18,
    '멕시코시티 그랑프리': 20,
    '상파울루 그랑프리': 19,
    '라스베이거스 그랑프리': 21,
    '카타르 그랑프리': 12,
    '아부다비 그랑프리 (야스마리나)': 18,
  },
  '미디엄': {
    default: 30,
    '호주 그랑프리 (멜버른)': 33,
    '중국 그랑프리 (상하이)': 29,
    '일본 그랑프리 (스즈카)': 27,
    '마이애미 그랑프리': 31,
    '캐나다 그랑프리 (몬트리올)': 36,
    '모나코 그랑프리': 38,
    '스페인 그랑프리 (바르셀로나)': 27,
    '오스트리아 그랑프리 (레드불링)': 30,
    '영국 그랑프리 (실버스톤)': 26,
    '벨기에 그랑프리 (스파)': 25,
    '헝가리 그랑프리 (부다페스트)': 28,
    '네덜란드 그랑프리 (잔드보르트)': 29,
    '이탈리아 그랑프리 (몬자)': 28,
    '마드리드 그랑프리': 29,
    '아제르바이잔 그랑프리 (바쿠)': 35,
    '싱가포르 그랑프리': 36,
    '미국 그랑프리 (오스틴)': 30,
    '멕시코시티 그랑프리': 33,
    '상파울루 그랑프리': 31,
    '라스베이거스 그랑프리': 34,
    '카타르 그랑프리': 22,
    '아부다비 그랑프리 (야스마리나)': 30,
  },
  '하드': {
    default: 45,
    '호주 그랑프리 (멜버른)': 48,
    '중국 그랑프리 (상하이)': 43,
    '일본 그랑프리 (스즈카)': 40,
    '마이애미 그랑프리': 46,
    '캐나다 그랑프리 (몬트리올)': 52,
    '모나코 그랑프리': 55,
    '스페인 그랑프리 (바르셀로나)': 40,
    '오스트리아 그랑프리 (레드불링)': 45,
    '영국 그랑프리 (실버스톤)': 38,
    '벨기에 그랑프리 (스파)': 38,
    '헝가리 그랑프리 (부다페스트)': 42,
    '네덜란드 그랑프리 (잔드보르트)': 43,
    '이탈리아 그랑프리 (몬자)': 42,
    '마드리드 그랑프리': 43,
    '아제르바이잔 그랑프리 (바쿠)': 52,
    '싱가포르 그랑프리': 53,
    '미국 그랑프리 (오스틴)': 46,
    '멕시코시티 그랑프리': 50,
    '상파울루 그랑프리': 47,
    '라스베이거스 그랑프리': 50,
    '카타르 그랑프리': 35,
    '아부다비 그랑프리 (야스마리나)': 46,
  },
  '인터미디어트': { default: 30 },
  '풀웨트': { default: 25 },
}

// 타이어 속도 델타 (초/랩)
export const TYRE_SPEED: Record<TyreCompound, number> = {
  '소프트': 0,
  '미디엄': 0.5,
  '하드': 1.0,
  '인터미디어트': 3.0,
  '풀웨트': 6.0,
}

export function getTyreLife(compound: TyreCompound, circuitName: string): number {
  const lives = TYRE_LIFE[compound]
  return lives[circuitName] || lives['default'] || 20
}

export function generateStrategies(
  totalLaps: number,
  circuitName: string,
  weather: string
): RaceStrategy[] {
  if (weather === 'wet') {
    return [{
      id: 'wet_inter',
      name: '인터미디어트 → 슬릭',
      description: '우천 시작, 노면 건조 시 슬릭으로 전환',
      stints: ['인터미디어트', '미디엄'],
      pitLaps: [Math.floor(totalLaps * 0.4)],
      totalTime: 0,
    }]
  }

  const softLife = getTyreLife('소프트', circuitName)
  const medLife = getTyreLife('미디엄', circuitName)
  const hardLife = getTyreLife('하드', circuitName)

  const strategies: RaceStrategy[] = []

  // 전략 1: 미디엄 → 하드 (1스톱 안정)
  const pit1a = Math.floor(totalLaps * 0.45)
  strategies.push({
    id: 'med_hard',
    name: '미디엄 → 하드',
    description: `1스톱 안정 전략. 피트 손실 최소화. 추천 피트: ${pit1a}랩`,
    stints: ['미디엄', '하드'],
    pitLaps: [pit1a],
    totalTime: 0,
  })

  // 전략 2: 소프트 → 미디엄 (1스톱 공격적)
  const pit1b = Math.min(softLife, Math.floor(totalLaps * 0.4))
  strategies.push({
    id: 'soft_med',
    name: '소프트 → 미디엄',
    description: `1스톱 공격적. 초반 빠른 페이스로 포지션 확보. 추천 피트: ${pit1b}랩`,
    stints: ['소프트', '미디엄'],
    pitLaps: [pit1b],
    totalTime: 0,
  })

  // 전략 3: 소프트 → 미디엄 → 소프트 (2스톱)
  const pit1c = Math.min(softLife, Math.floor(totalLaps * 0.3))
  const pit2c = Math.min(pit1c + Math.floor(medLife * 0.7), Math.floor(totalLaps * 0.7))
  if (pit2c < totalLaps - 5) {
    strategies.push({
      id: 'soft_med_soft',
      name: '소프트 → 미디엄 → 소프트',
      description: `2스톱 공격적. 마지막 소프트로 빠른 피니시. 추천 피트: ${pit1c}랩, ${pit2c}랩`,
      stints: ['소프트', '미디엄', '소프트'],
      pitLaps: [pit1c, pit2c],
      totalTime: 0,
    })
  }

  // 전략 4: 하드 → 소프트 (1스톱 언더컷)
  const pit1d = Math.floor(totalLaps * 0.55)
  if (hardLife >= pit1d) {
    strategies.push({
      id: 'hard_soft',
      name: '하드 → 소프트',
      description: `1스톱 언더컷. 하드로 버티다 마지막 소프트로 추월. 추천 피트: ${pit1d}랩`,
      stints: ['하드', '소프트'],
      pitLaps: [pit1d],
      totalTime: 0,
    })
  }

  // 전략 5: 미디엄 → 미디엄 (2스톱 균형)
  const pit1e = Math.floor(medLife * 0.8)
  const pit2e = pit1e * 2
  if (pit2e < totalLaps - 5) {
    strategies.push({
      id: 'med_med_hard',
      name: '미디엄 → 미디엄 → 하드',
      description: `2스톱 균형. 일정한 페이스 유지. 추천 피트: ${pit1e}랩, ${pit2e}랩`,
      stints: ['미디엄', '미디엄', '하드'],
      pitLaps: [pit1e, pit2e],
      totalTime: 0,
    })
  }

  return strategies.slice(0, 3)
}

export function initDriverTyreState(
  driverId: string,
  startTyre: TyreCompound
): DriverTyreState {
  return {
    driverId,
    currentTyre: startTyre,
    tyreAge: 0,
    tyreWear: 0,
    performance: 100,
  }
}

export function updateTyreWear(
  state: DriverTyreState,
  laps: number,
  circuitName: string,
  tyreManagement: number = 75
): DriverTyreState {
  const maxLife = getTyreLife(state.currentTyre, circuitName)
  const newAge = state.tyreAge + laps
  const managementBonus = (tyreManagement - 70) * 0.5
  const wear = Math.min(100, (newAge / (maxLife + managementBonus)) * 100)
  const performance = Math.max(60, 100 - wear * 0.4)

  return {
    ...state,
    tyreAge: newAge,
    tyreWear: wear,
    performance,
  }
}

export function applyPitStop(
  state: DriverTyreState,
  newTyre: TyreCompound
): DriverTyreState {
  return {
    ...state,
    currentTyre: newTyre,
    tyreAge: 0,
    tyreWear: 0,
    performance: 100,
  }
}

export function getTyreWearColor(wear: number): string {
  if (wear < 30) return '#22c55e'
  if (wear < 60) return '#f59e0b'
  if (wear < 80) return '#ef4444'
  return '#7f1d1d'
}

export function getTyreCompoundColor(compound: TyreCompound): string {
  const colors: Record<TyreCompound, string> = {
    '소프트': '#ef4444',
    '미디엄': '#f59e0b',
    '하드': '#e5e7eb',
    '인터미디어트': '#22c55e',
    '풀웨트': '#3b82f6',
  }
  return colors[compound] || '#9ca3af'
}