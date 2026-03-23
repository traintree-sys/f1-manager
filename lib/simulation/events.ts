import { ACTIVE_AERO_EFFECT } from './qualifying'

export type EventType =
  | 'safety_car'
  | 'vsc'
  | 'weather_change'
  | 'accident'
  | 'retire'
  | 'battle'
  | 'pit_window'
  | 'parts_damage'
  | 'penalty_5sec'
  | 'penalty_10sec'
  | 'drive_through'
  | 'pit_lane_speeding'
  | 'illegal_defense'
  | 'penalty_points'

export type PenaltyType =
  | '5초 페널티'
  | '10초 페널티'
  | '드라이브스루'
  | '10초 스톱앤고'
  | '그리드 강등'
  | '실격'
  | '견책'
  | '피트레인 속도위반'

export interface PenaltyRecord {
  type: PenaltyType
  reason: string
  penaltyPoints: number
  timeAdded?: number
  gridDrop?: number
}

export interface RaceEvent {
  type: EventType
  lap: number
  description: string
  affectedDrivers?: string[]
  options?: EventOption[]
  autoResolve?: boolean
  penalty?: PenaltyRecord
  circuitName?: string
}

export interface EventOption {
  id: string
  label: string
  description: string
  risk: 'low' | 'medium' | 'high'
}

export const SAFETY_CAR_OPTIONS: EventOption[] = [
  { id: 'pit_now', label: '즉시 피트인', description: '세이프티카 기회를 활용해 타이어 교체. 피트 손실 최소화.', risk: 'low' },
  { id: 'stay_out', label: '트랙 잔류', description: '포지션 유지. 단, 타이어 불리. 레이스 후반 속도 저하 위험.', risk: 'medium' },
  { id: 'wait_see', label: '상황 지켜보기', description: 'VSC로 전환될 경우를 대비해 대기. 타이밍 리스크 있음.', risk: 'medium' },
]

export const VSC_OPTIONS: EventOption[] = [
  { id: 'pit_now', label: '즉시 피트인', description: 'VSC 중 피트인. 속도 제한으로 피트 손실 줄어듦.', risk: 'low' },
  { id: 'stay_out', label: '트랙 잔류', description: '포지션 유지. VSC 해제 후 타이어 격차 발생 가능.', risk: 'medium' },
]

export const WEATHER_CHANGE_OPTIONS: EventOption[] = [
  { id: 'pit_inter', label: '인터미디어트로 교체', description: '즉시 피트인해 웨더 타이어로 교체. 안전하지만 시간 손실.', risk: 'low' },
  { id: 'stay_slick', label: '슬릭 타이어 유지', description: '노면이 더 젖기 전까지 버팀. 고위험 고수익.', risk: 'high' },
  { id: 'wait_see', label: '상황 지켜보기', description: '1~2랩 더 지켜보고 결정. 중간 리스크.', risk: 'medium' },
]

// 2026 액티브 에어로 배틀 옵션 (DRS 폐지)
export function getActiveBattleOptions(circuitName: string): EventOption[] {
  const aeroEffect = ACTIVE_AERO_EFFECT[circuitName] || 0.6
  const effectLabel = aeroEffect >= 0.8 ? '(효과 높음)' : aeroEffect >= 0.5 ? '(효과 보통)' : '(효과 낮음)'

  return [
    {
      id: 'active_aero_attack',
      label: `⚡ 액티브 에어로 공격 ${effectLabel}`,
      description: `저항 감소 모드로 전환해 추월 시도. 이 서킷에서 액티브 에어로 효과: ${Math.round(aeroEffect * 100)}%`,
      risk: aeroEffect >= 0.7 ? 'medium' : 'high',
    },
    {
      id: 'aggressive',
      label: '🔥 강공 추월',
      description: '브레이킹 포인트까지 최대한 늦게 제동. 고위험 고수익.',
      risk: 'high',
    },
    {
      id: 'patient',
      label: '⏳ 기회 노리기',
      description: '상대 실수나 타이어 격차를 기다림. 안전하지만 시간 소요.',
      risk: 'low',
    },
    {
      id: 'defend',
      label: '🛡️ 포지션 방어',
      description: '내 라인을 지키며 방어. 뒷차의 액티브 에어로를 차단.',
      risk: 'low',
    },
  ]
}

export const PIT_WINDOW_OPTIONS: EventOption[] = [
  { id: 'pit_soft', label: '소프트로 교체', description: '빠른 타이어로 레이스 후반 공격. 타이어 수명 짧음.', risk: 'medium' },
  { id: 'pit_medium', label: '미디엄으로 교체', description: '균형잡힌 선택. 속도와 수명 모두 적당.', risk: 'low' },
  { id: 'pit_hard', label: '하드로 교체', description: '긴 스틴트 노림. 속도는 느리지만 마지막까지 버팀.', risk: 'low' },
  { id: 'stay_out', label: '계속 달리기', description: '현재 타이어 유지. 원스톱 전략 또는 언더컷 방어.', risk: 'high' },
]

export const PENALTY_OPTIONS: EventOption[] = [
  { id: 'accept', label: '패널티 수락', description: '패널티를 즉시 수락합니다. 다음 피트인 시 서빙, 피트인 없으면 레이스 종료 후 시간 추가.', risk: 'low' },
  { id: 'appeal', label: '항의 검토', description: '팀이 항의를 검토합니다. 성공 확률 낮음 (약 10%).', risk: 'high' },
]

export function calculateGridPenalties(
  myDrivers: any[],
  cars: any[],
  grid: any[]
): { grid: any[], penalties: string[] } {
  const penalties: string[] = []
  let newGrid = [...grid]

  myDrivers.forEach(d => {
    const car = cars.find(c => c.team_id === d.team_id)
    const reliability = car?.actual_reliability || 80

    const gearboxProb = Math.max(0.02, 0.12 - (reliability - 70) * 0.004)
    if (Math.random() < gearboxProb) {
      const gridDrop = 5
      const currentPos = newGrid.findIndex((r: any) => r.driverId === d.id)
      if (currentPos !== -1) {
        const newPos = Math.min(newGrid.length - 1, currentPos + gridDrop)
        const removed = newGrid.splice(currentPos, 1)[0]
        newGrid.splice(newPos, 0, removed)
        penalties.push(`⚙️ ${d.name} — 기어박스 교체로 그리드 ${gridDrop}칸 강등 (P${currentPos + 1} → P${newPos + 1})`)
      }
    }

    const puProb = Math.max(0.01, 0.08 - (reliability - 70) * 0.003)
    if (Math.random() < puProb) {
      const gridDrop = 10
      const currentPos = newGrid.findIndex((r: any) => r.driverId === d.id)
      if (currentPos !== -1) {
        const newPos = Math.min(newGrid.length - 1, currentPos + gridDrop)
        const removed = newGrid.splice(currentPos, 1)[0]
        newGrid.splice(newPos, 0, removed)
        penalties.push(`🔋 ${d.name} — PU 교체로 그리드 ${gridDrop}칸 강등 (P${currentPos + 1} → P${newPos + 1})`)
      }
    }
  })

  newGrid = newGrid.map((r: any, i: number) => ({ ...r, position: i + 1 }))
  return { grid: newGrid, penalties }
}

export function generateRaceEvents(
  totalLaps: number,
  weather: { current: string; forecast: string },
  driverReliability: number,
  carReliability: number,
  circuitName: string,
  driverComposure: number = 75,
  driverErrorAvoidance: number = 75,
  licensePoints: number = 0
): RaceEvent[] {
  const events: RaceEvent[] = []

  // 피트 윈도우
  events.push({
    type: 'pit_window',
    lap: Math.floor(totalLaps * 0.33),
    description: `랩 ${Math.floor(totalLaps * 0.33)}: 피트스톱 윈도우가 열렸습니다. 타이어 상태를 확인하세요.`,
    options: PIT_WINDOW_OPTIONS,
    circuitName,
  })
  events.push({
    type: 'pit_window',
    lap: Math.floor(totalLaps * 0.66),
    description: `랩 ${Math.floor(totalLaps * 0.66)}: 두 번째 피트스톱 윈도우입니다.`,
    options: PIT_WINDOW_OPTIONS,
    circuitName,
  })

  // 세이프티카
  if (Math.random() < 0.20) {
    const scLap = Math.floor(Math.random() * (totalLaps * 0.6) + totalLaps * 0.2)
    events.push({
      type: 'safety_car',
      lap: scLap,
      description: `랩 ${scLap}: 사고로 인해 세이프티카가 출동했습니다!`,
      options: SAFETY_CAR_OPTIONS,
      circuitName,
    })
  }

  // VSC
  if (Math.random() < 0.15) {
    const vscLap = Math.floor(Math.random() * (totalLaps * 0.5) + totalLaps * 0.25)
    events.push({
      type: 'vsc',
      lap: vscLap,
      description: `랩 ${vscLap}: 버추얼 세이프티카(VSC)가 발동됐습니다.`,
      options: VSC_OPTIONS,
      circuitName,
    })
  }

  // 날씨 변화
  const weatherChangeProb = weather.forecast === 'wet' ? 0.60 : weather.forecast === 'mixed' ? 0.35 : 0.05
  if (Math.random() < weatherChangeProb) {
    const weatherLap = Math.floor(Math.random() * (totalLaps * 0.5) + totalLaps * 0.2)
    events.push({
      type: 'weather_change',
      lap: weatherLap,
      description: `랩 ${weatherLap}: 날씨가 변하기 시작합니다! 빗방울이 떨어지고 있습니다.`,
      options: WEATHER_CHANGE_OPTIONS,
      circuitName,
    })
  }

  // 배틀 이벤트 — 2026 액티브 에어로 적용
  const battleCount = Math.floor(Math.random() * 2) + 2
  const battleLaps = new Set<number>()
  while (battleLaps.size < battleCount) {
    battleLaps.add(Math.floor(Math.random() * (totalLaps - 10) + 5))
  }
  battleLaps.forEach(lap => {
    const aeroEffect = ACTIVE_AERO_EFFECT[circuitName] || 0.6
    const effectDesc = aeroEffect >= 0.8 ? '고속 구간에서 액티브 에어로가 큰 효과를 발휘합니다!' :
      aeroEffect >= 0.5 ? '액티브 에어로를 활용한 추월 기회입니다.' :
      '시가지 서킷에서 액티브 에어로 효과가 제한적입니다.'
    events.push({
      type: 'battle',
      lap,
      description: `랩 ${lap}: 근접 배틀 상황! ${effectDesc}`,
      options: getActiveBattleOptions(circuitName),
      circuitName,
    })
  })

  // 리타이어
  const retireProb = Math.max(0.05, 0.20 - (carReliability - 70) * 0.004)
  if (Math.random() < retireProb) {
    const retireLap = Math.floor(Math.random() * (totalLaps - 5) + 5)
    const retireReasons = [
      '엔진 오일 압력 저하',
      '유압 시스템 결함',
      '서스펜션 파손',
      '브레이크 고장',
      '전기 시스템 결함',
      // 2026 전기모터 비중 증가로 전기 결함 추가
      'MGU-K 과열',
      '배터리 시스템 오류',
      '전기모터 고장',
    ]
    const reason = retireReasons[Math.floor(Math.random() * retireReasons.length)]
    events.push({
      type: 'retire',
      lap: retireLap,
      description: `랩 ${retireLap}: ${reason}이 발생했습니다! 레이스 지속이 어려운 상황입니다.`,
      options: [
        { id: 'retire', label: '리타이어', description: '안전하게 차량을 세우고 레이스를 마칩니다.', risk: 'low' },
        { id: 'push_through', label: '강행 지속', description: '위험을 감수하고 계속 달립니다. 완전 고장 위험.', risk: 'high' },
      ],
      circuitName,
    })
  }

  // 부품 손상
  const damageProb = Math.max(0.05, 0.18 - (driverErrorAvoidance - 70) * 0.003)
  if (Math.random() < damageProb) {
    const damageLap = Math.floor(Math.random() * (totalLaps - 5) + 3)
    events.push({
      type: 'parts_damage',
      lap: damageLap,
      description: `랩 ${damageLap}: 접촉사고로 프론트 윙이 손상됐습니다!`,
      options: [
        { id: 'pit_repair', label: '피트인 수리', description: '즉시 피트인해 프론트 윙을 교체합니다. 시간 손실 발생.', risk: 'low' },
        { id: 'push_damage', label: '손상된 채로 지속', description: '포지션 유지하며 계속 달립니다. 성능 저하 위험.', risk: 'high' },
      ],
      circuitName,
    })
  }

  // 5초 페널티
  const penalty5Prob = Math.max(0.05, 0.15 - (driverErrorAvoidance - 70) * 0.004)
  if (Math.random() < penalty5Prob) {
    const penaltyLap = Math.floor(Math.random() * (totalLaps - 5) + 3)
    const reasons = ['트랙 리밋 위반으로 이득', '충돌 유발', '위험한 주행', '옐로우 플래그 무시']
    const reason = reasons[Math.floor(Math.random() * reasons.length)]
    events.push({
      type: 'penalty_5sec',
      lap: penaltyLap,
      description: `랩 ${penaltyLap}: 스튜어드 조사 결과 5초 페널티가 부과됐습니다. 사유: ${reason}`,
      options: PENALTY_OPTIONS,
      penalty: { type: '5초 페널티', reason, penaltyPoints: 1, timeAdded: 5 },
      circuitName,
    })
  }

  // 10초 페널티
  const penalty10Prob = Math.max(0.03, 0.10 - (driverComposure - 70) * 0.003)
  if (Math.random() < penalty10Prob) {
    const penaltyLap = Math.floor(Math.random() * (totalLaps - 5) + 5)
    const reasons = ['트랙 이탈 후 이득 획득', '위험한 주행', '반복적 트랙 리밋 위반']
    const reason = reasons[Math.floor(Math.random() * reasons.length)]
    events.push({
      type: 'penalty_10sec',
      lap: penaltyLap,
      description: `랩 ${penaltyLap}: 10초 페널티가 부과됐습니다. 사유: ${reason}`,
      options: PENALTY_OPTIONS,
      penalty: { type: '10초 페널티', reason, penaltyPoints: 2, timeAdded: 10 },
      circuitName,
    })
  }

  // 드라이브스루
  if (licensePoints >= 3) {
    const dtLap = Math.floor(Math.random() * (totalLaps * 0.3) + 5)
    events.push({
      type: 'drive_through',
      lap: dtLap,
      description: `랩 ${dtLap}: 누적 페널티로 드라이브스루 페널티가 자동 발동됐습니다!`,
      autoResolve: true,
      penalty: { type: '드라이브스루', reason: '페널티 3회 누적', penaltyPoints: 0, timeAdded: 20 },
      circuitName,
    })
  }

  // 피트레인 속도 위반
  if (Math.random() < 0.04) {
    const pitLap = Math.floor(Math.random() * (totalLaps - 10) + 5)
    events.push({
      type: 'pit_lane_speeding',
      lap: pitLap,
      description: `랩 ${pitLap}: 피트레인 속도 위반이 감지됐습니다! 5초 페널티.`,
      autoResolve: true,
      penalty: { type: '피트레인 속도위반', reason: '피트레인 속도 위반', penaltyPoints: 1, timeAdded: 5 },
      circuitName,
    })
  }

  // 불법 방어
  const illegalDefenseProb = Math.max(0.03, 0.10 - (driverComposure - 70) * 0.003)
  if (Math.random() < illegalDefenseProb) {
    const defenseLap = Math.floor(Math.random() * (totalLaps - 10) + 10)
    events.push({
      type: 'illegal_defense',
      lap: defenseLap,
      description: `랩 ${defenseLap}: 불법 방어(다중 라인 변경)로 스튜어드 조사를 받고 있습니다!`,
      options: PENALTY_OPTIONS,
      penalty: { type: '5초 페널티', reason: '불법 방어', penaltyPoints: 1, timeAdded: 5 },
      circuitName,
    })
  }

  // 슈퍼라이선스 경고
  if (licensePoints >= 10) {
    events.push({
      type: 'penalty_points',
      lap: 0,
      description: `⚠️ 슈퍼라이선스 포인트가 ${licensePoints}점입니다. 12점 누적 시 다음 레이스 출전정지!`,
      autoResolve: true,
      penalty: { type: '견책', reason: '슈퍼라이선스 포인트 누적 경고', penaltyPoints: 0 },
      circuitName,
    })
  }

  return events.sort((a, b) => a.lap - b.lap)
}

export function resolveEventOption(
  event: RaceEvent,
  optionId: string,
  driverStats: any,
  teamStats: any,
): {
  positionChange: number
  timeChange: number
  description: string
  partsDamageCost: number
  penaltyPointsAdded: number
} {
  let positionChange = 0
  let timeChange = 0
  let description = ''
  let partsDamageCost = 0
  let penaltyPointsAdded = 0

  const aeroEffect = ACTIVE_AERO_EFFECT[event.circuitName || ''] || 0.6

  switch (event.type) {
    case 'safety_car':
      if (optionId === 'pit_now') {
        positionChange = -2; timeChange = -5
        description = '세이프티카 중 피트인 성공! 새 타이어로 레이스 후반 유리해졌습니다.'
      } else if (optionId === 'stay_out') {
        positionChange = 2; timeChange = 3
        description = '트랙 잔류. 포지션은 유지했지만 타이어가 불리합니다.'
      } else {
        timeChange = 1
        description = '상황을 지켜보다 타이밍을 놓쳤습니다.'
      }
      break

    case 'vsc':
      if (optionId === 'pit_now') {
        positionChange = -1; timeChange = -3
        description = 'VSC 중 효율적인 피트인 성공!'
      } else {
        positionChange = 1; timeChange = 2
        description = 'VSC 해제 후 타이어 격차가 발생했습니다.'
      }
      break

    case 'weather_change':
      if (optionId === 'pit_inter') {
        positionChange = -1; timeChange = -8
        description = '인터미디어트로 교체 성공!'
      } else if (optionId === 'stay_slick') {
        if (Math.random() < 0.35) {
          positionChange = 3; timeChange = -5
          description = '슬릭 타이어 도박 성공! 큰 포지션 이득!'
        } else {
          positionChange = -5; timeChange = 15
          description = '슬릭 타이어 도박 실패. 크게 순위가 떨어졌습니다.'
        }
      } else {
        positionChange = -1; timeChange = -2
        description = '적절한 타이밍에 교체했습니다.'
      }
      break

    case 'battle': {
      const overtaking = driverStats?.actual_overtaking || 75
      const defending = driverStats?.actual_defending || 75
      const awareness = teamStats?.data_analysis || 5

      if (optionId === 'active_aero_attack') {
        // 액티브 에어로 효과 + 드라이버 추월 능력 기반
        const baseSuccess = 40 + (overtaking - 70) * 1.5
        const aeroBonus = aeroEffect * 30 // 최대 30% 보너스
        const successChance = baseSuccess + aeroBonus
        if (Math.random() * 100 < successChance) {
          positionChange = 1
          description = `⚡ 액티브 에어로 활성화! 저항 감소 모드로 추월 성공!`
        } else {
          description = `⚡ 액티브 에어로를 활성화했지만 상대방이 막아냈습니다.`
        }
      } else if (optionId === 'aggressive') {
        const successChance = (overtaking - 70) * 2 + 35
        if (Math.random() * 100 < successChance) {
          positionChange = 1
          description = '강공 추월 성공! 완벽한 브레이킹!'
        } else {
          positionChange = -1; timeChange = 3; partsDamageCost = 500000
          penaltyPointsAdded = 1
          description = '강공 추월 실패. 접촉으로 5초 페널티.'
        }
      } else if (optionId === 'patient') {
        const waitSuccess = (awareness - 3) * 10 + 25
        if (Math.random() * 100 < waitSuccess) {
          positionChange = 1
          description = '상대 실수를 노려 추월 성공!'
        } else {
          description = '기회를 노렸지만 이번엔 추월 못했습니다.'
        }
      } else {
        // defend
        const defendSuccess = (defending - 70) * 2 + 50
        if (Math.random() * 100 < defendSuccess) {
          description = `🛡️ 방어 성공! 상대방의 액티브 에어로를 차단했습니다.`
        } else {
          positionChange = -1
          description = '방어 실패. 포지션을 내줬습니다.'
        }
      }
      break
    }

    case 'pit_window':
      if (optionId === 'pit_soft') {
        positionChange = -2; timeChange = -8
        if (Math.random() < 0.05) {
          timeChange += 5; penaltyPointsAdded = 1
          description = '소프트 타이어로 교체! ⚠️ 언세이프 릴리스 — 5초 페널티.'
        } else {
          description = '소프트 타이어로 교체!'
        }
      } else if (optionId === 'pit_medium') {
        positionChange = -1; timeChange = -4
        if (Math.random() < 0.05) {
          timeChange += 5; penaltyPointsAdded = 1
          description = '미디엄 타이어로 교체. ⚠️ 언세이프 릴리스 — 5초 페널티.'
        } else {
          description = '미디엄 타이어로 교체.'
        }
      } else if (optionId === 'pit_hard') {
        timeChange = -2
        if (Math.random() < 0.05) {
          timeChange += 5; penaltyPointsAdded = 1
          description = '하드 타이어로 교체. ⚠️ 언세이프 릴리스 — 5초 페널티.'
        } else {
          description = '하드 타이어로 교체. 긴 스틴트를 노립니다.'
        }
      } else {
        positionChange = 2; timeChange = 5
        description = '피트인 없이 계속 달립니다.'
      }
      break

    case 'retire':
      if (optionId === 'retire') {
        positionChange = -50
        description = '리타이어를 선언했습니다.'
      } else {
        if (Math.random() < 0.25) {
          description = '기적적으로 결승선을 통과했습니다!'
        } else {
          positionChange = -50; partsDamageCost = 2000000
          description = '결국 완전 고장. 리타이어.'
        }
      }
      break

    case 'parts_damage':
      if (optionId === 'pit_repair') {
        positionChange = -3; timeChange = 25; partsDamageCost = 200000
        description = '피트인해 프론트 윙을 교체했습니다.'
      } else {
        positionChange = -1; timeChange = 8; partsDamageCost = 500000
        description = '손상된 채로 계속. 추가 손상 발생.'
      }
      break

    case 'penalty_5sec':
    case 'illegal_defense':
      if (optionId === 'accept') {
        timeChange = 5; penaltyPointsAdded = event.penalty?.penaltyPoints || 1
        description = `5초 페널티 수락. 다음 피트인 시 서빙, 피트인 없으면 레이스 종료 후 적용. (+${penaltyPointsAdded} 라이선스 포인트)`
      } else {
        if (Math.random() < 0.10) {
          description = '항의 성공! 페널티 취소.'
        } else {
          timeChange = 5; penaltyPointsAdded = event.penalty?.penaltyPoints || 1
          description = `항의 기각. 5초 페널티 유지. (+${penaltyPointsAdded} 라이선스 포인트)`
        }
      }
      break

    case 'penalty_10sec':
      if (optionId === 'accept') {
        timeChange = 10; penaltyPointsAdded = event.penalty?.penaltyPoints || 2
        description = `10초 페널티 수락. 다음 피트인 시 서빙. (+${penaltyPointsAdded} 라이선스 포인트)`
      } else {
        if (Math.random() < 0.08) {
          description = '항의 성공! 페널티 취소.'
        } else {
          timeChange = 10; penaltyPointsAdded = event.penalty?.penaltyPoints || 2
          description = `항의 기각. 10초 페널티 유지. (+${penaltyPointsAdded} 라이선스 포인트)`
        }
      }
      break

    case 'drive_through':
    case 'pit_lane_speeding':
      timeChange = event.penalty?.timeAdded || 20
      penaltyPointsAdded = event.penalty?.penaltyPoints || 1
      description = event.type === 'drive_through'
        ? `드라이브스루 페널티 서빙. +${timeChange}초.`
        : `피트레인 속도위반 ${timeChange}초 페널티. (+${penaltyPointsAdded} 라이선스 포인트)`
      break
  }

  return { positionChange, timeChange, description, partsDamageCost, penaltyPointsAdded }
}