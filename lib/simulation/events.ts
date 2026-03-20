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
  | 'gearbox_penalty'
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
}

export interface EventOption {
  id: string
  label: string
  description: string
  risk: 'low' | 'medium' | 'high'
}

// 드라이버 슈퍼라이선스 포인트 (12점 누적시 출전정지)
export interface DriverLicensePoints {
  driverId: string
  points: number
  penalties: PenaltyRecord[]
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

export const BATTLE_OPTIONS: EventOption[] = [
  { id: 'aggressive', label: '공격적 추월', description: '과감하게 추월 시도. 성공 시 포지션 획득, 실패 시 접촉 위험.', risk: 'high' },
  { id: 'patient', label: '기회 노리기', description: '뒤에서 압박하며 DRS 포인트나 실수를 기다림.', risk: 'low' },
  { id: 'defend', label: '포지션 방어', description: '내 라인을 지키며 방어. 뒷차가 추월 시도 중일 때.', risk: 'low' },
]

export const PIT_WINDOW_OPTIONS: EventOption[] = [
  { id: 'pit_soft', label: '소프트로 교체', description: '빠른 타이어로 레이스 후반 공격. 타이어 수명 짧음.', risk: 'medium' },
  { id: 'pit_medium', label: '미디엄으로 교체', description: '균형잡힌 선택. 속도와 수명 모두 적당.', risk: 'low' },
  { id: 'pit_hard', label: '하드로 교체', description: '긴 스틴트 노림. 속도는 느리지만 마지막까지 버팀.', risk: 'low' },
  { id: 'stay_out', label: '계속 달리기', description: '현재 타이어 유지. 원스톱 전략 또는 언더컷 방어.', risk: 'high' },
]

// 패널티 이벤트 옵션 (수락 or 항의)
export const PENALTY_OPTIONS: EventOption[] = [
  { id: 'accept', label: '패널티 수락', description: '패널티를 즉시 서빙합니다.', risk: 'low' },
  { id: 'appeal', label: '항의 검토', description: '팀이 항의를 검토합니다. 성공 확률 낮음.', risk: 'high' },
]

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
    description: `랩 ${Math.floor(totalLaps * 0.33)}: 피트스톱 윈도우가 열렸습니다.`,
    options: PIT_WINDOW_OPTIONS,
  })
  events.push({
    type: 'pit_window',
    lap: Math.floor(totalLaps * 0.66),
    description: `랩 ${Math.floor(totalLaps * 0.66)}: 두 번째 피트스톱 윈도우입니다.`,
    options: PIT_WINDOW_OPTIONS,
  })

  // 세이프티카 (20%)
  if (Math.random() < 0.20) {
    const scLap = Math.floor(Math.random() * (totalLaps * 0.6) + totalLaps * 0.2)
    events.push({
      type: 'safety_car',
      lap: scLap,
      description: `랩 ${scLap}: 사고로 인해 세이프티카가 출동했습니다!`,
      options: SAFETY_CAR_OPTIONS,
    })
  }

  // VSC (15%)
  if (Math.random() < 0.15) {
    const vscLap = Math.floor(Math.random() * (totalLaps * 0.5) + totalLaps * 0.25)
    events.push({
      type: 'vsc',
      lap: vscLap,
      description: `랩 ${vscLap}: 버추얼 세이프티카(VSC)가 발동됐습니다.`,
      options: VSC_OPTIONS,
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
    })
  }

  // 드라이버 배틀 (2~3회)
  const battleCount = Math.floor(Math.random() * 2) + 2
  const battleLaps = new Set<number>()
  while (battleLaps.size < battleCount) {
    battleLaps.add(Math.floor(Math.random() * (totalLaps - 10) + 5))
  }
  battleLaps.forEach(lap => {
    events.push({
      type: 'battle',
      lap,
      description: `랩 ${lap}: 근접한 드라이버와 배틀 상황이 발생했습니다!`,
      options: BATTLE_OPTIONS,
    })
  })

  // 리타이어
  const retireProb = Math.max(0.05, 0.25 - (carReliability - 70) * 0.005)
  if (Math.random() < retireProb) {
    const retireLap = Math.floor(Math.random() * (totalLaps - 5) + 5)
    events.push({
      type: 'retire',
      lap: retireLap,
      description: `랩 ${retireLap}: 기계 결함이 발생했습니다!`,
      options: [
        { id: 'retire', label: '리타이어', description: '차량을 세우고 레이스를 포기합니다.', risk: 'low' },
        { id: 'push_through', label: '강행 지속', description: '무리해서 계속 달립니다. 완전 고장 위험.', risk: 'high' },
      ],
    })
  }

  // 부품 손상
  const damageProb = Math.max(0.05, 0.20 - (driverErrorAvoidance - 70) * 0.003)
  if (Math.random() < damageProb) {
    const damageLap = Math.floor(Math.random() * (totalLaps - 5) + 3)
    events.push({
      type: 'parts_damage',
      lap: damageLap,
      description: `랩 ${damageLap}: 접촉사고로 프론트 윙이 손상됐습니다!`,
      options: [
        { id: 'pit_repair', label: '피트인 수리', description: '즉시 피트인해 부품을 교체합니다.', risk: 'low' },
        { id: 'push_damage', label: '손상된 채로 지속', description: '포지션 유지하며 계속 달립니다.', risk: 'high' },
      ],
    })
  }

  // ===== 패널티 이벤트 =====

  // 5초 페널티 (컨트롤 위반, 코너 컷 등) - error_avoidance 낮을수록 확률 높음
  const penalty5Prob = Math.max(0.05, 0.20 - (driverErrorAvoidance - 70) * 0.004)
  if (Math.random() < penalty5Prob) {
    const penaltyLap = Math.floor(Math.random() * (totalLaps - 5) + 3)
    const reasons = ['트랙 리밋 위반으로 이득', '언세이프 피트 릴리즈', '충돌 유발']
    const reason = reasons[Math.floor(Math.random() * reasons.length)]
    events.push({
      type: 'penalty_5sec',
      lap: penaltyLap,
      description: `랩 ${penaltyLap}: 스튜어드 조사 결과 5초 페널티가 부과됐습니다. 사유: ${reason}`,
      options: PENALTY_OPTIONS,
      penalty: {
        type: '5초 페널티',
        reason,
        penaltyPoints: 1,
        timeAdded: 5,
      },
    })
  }

  // 10초 페널티 (펀 컨트롤 위반 등)
  const penalty10Prob = Math.max(0.03, 0.12 - (driverComposure - 70) * 0.003)
  if (Math.random() < penalty10Prob) {
    const penaltyLap = Math.floor(Math.random() * (totalLaps - 5) + 5)
    const reasons = ['옐로우 플래그 무시', '트랙 이탈 후 이득 획득', '위험한 주행']
    const reason = reasons[Math.floor(Math.random() * reasons.length)]
    events.push({
      type: 'penalty_10sec',
      lap: penaltyLap,
      description: `랩 ${penaltyLap}: 10초 페널티가 부과됐습니다. 사유: ${reason}`,
      options: PENALTY_OPTIONS,
      penalty: {
        type: '10초 페널티',
        reason,
        penaltyPoints: 2,
        timeAdded: 10,
      },
    })
  }

  // 드라이브스루 페널티 (누적 3개 자동 발동)
  if (licensePoints >= 3) {
    const dtLap = Math.floor(Math.random() * (totalLaps * 0.3) + 5)
    events.push({
      type: 'drive_through',
      lap: dtLap,
      description: `랩 ${dtLap}: 누적 페널티로 드라이브스루 페널티가 자동 발동됐습니다!`,
      autoResolve: true,
      penalty: {
        type: '드라이브스루',
        reason: '페널티 3회 누적',
        penaltyPoints: 0,
        timeAdded: 20,
      },
    })
  }

  // 피트레인 속도 위반 (5%)
  if (Math.random() < 0.05) {
    const pitLap = Math.floor(Math.random() * (totalLaps - 10) + 5)
    events.push({
      type: 'pit_lane_speeding',
      lap: pitLap,
      description: `랩 ${pitLap}: 피트레인 속도 위반이 감지됐습니다! (제한속도 초과)`,
      autoResolve: true,
      penalty: {
        type: '5초 페널티',
        reason: '피트레인 속도 위반',
        penaltyPoints: 1,
        timeAdded: 5,
      },
    })
  }

  // 불법 방어 (다중 라인 변경) - composure 낮을수록 확률 높음
  const illegalDefensePob = Math.max(0.03, 0.12 - (driverComposure - 70) * 0.003)
  if (Math.random() < illegalDefensePob) {
    const defenseLap = Math.floor(Math.random() * (totalLaps - 10) + 10)
    events.push({
      type: 'illegal_defense',
      lap: defenseLap,
      description: `랩 ${defenseLap}: 불법 방어(다중 라인 변경)로 스튜어드 조사를 받고 있습니다!`,
      options: PENALTY_OPTIONS,
      penalty: {
        type: '5초 페널티',
        reason: '불법 방어 (다중 라인 변경)',
        penaltyPoints: 1,
        timeAdded: 5,
      },
    })
  }

  // 기어박스 페널티 (신뢰성 낮을수록 발생)
  const gearboxPenaltyProb = Math.max(0.02, 0.15 - (carReliability - 70) * 0.004)
  if (Math.random() < gearboxPenaltyProb) {
    events.push({
      type: 'gearbox_penalty',
      lap: 0,
      description: `기어박스 교체로 다음 레이스 그리드 5칸 강등 페널티가 예고됐습니다.`,
      autoResolve: true,
      penalty: {
        type: '그리드 강등',
        reason: '기어박스 제한 초과',
        penaltyPoints: 0,
        gridDrop: 5,
      },
    })
  }

  // 슈퍼라이선스 12점 누적 시 출전정지 경고
  if (licensePoints >= 10) {
    events.push({
      type: 'penalty_points',
      lap: 0,
      description: `⚠️ 슈퍼라이선스 포인트가 ${licensePoints}점입니다. 12점 누적 시 다음 레이스 출전정지!`,
      autoResolve: true,
      penalty: {
        type: '견책',
        reason: '슈퍼라이선스 포인트 누적 경고',
        penaltyPoints: 0,
      },
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
        description = '인터미디어트로 교체 성공! 안전하게 대응했습니다.'
      } else if (optionId === 'stay_slick') {
        if (Math.random() < 0.35) {
          positionChange = 3; timeChange = -5
          description = '슬릭 타이어 도박 성공! 큰 포지션 이득을 얻었습니다!'
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
      if (optionId === 'aggressive') {
        const successChance = (overtaking - 70) * 2 + 40
        if (Math.random() * 100 < successChance) {
          positionChange = 1
          description = '추월 성공! 포지션을 획득했습니다!'
        } else {
          positionChange = -1; timeChange = 3; partsDamageCost = 500000
          penaltyPointsAdded = 1
          description = '추월 시도 실패. 접촉으로 5초 페널티가 부과됐습니다.'
        }
      } else if (optionId === 'patient') {
        const waitSuccess = (awareness - 3) * 10 + 30
        if (Math.random() * 100 < waitSuccess) {
          positionChange = 1
          description = '상대의 실수를 기다려 추월에 성공했습니다!'
        } else {
          description = '기회를 노렸지만 이번엔 추월하지 못했습니다.'
        }
      } else {
        const defendSuccess = (defending - 70) * 2 + 50
        if (Math.random() * 100 < defendSuccess) {
          description = '성공적으로 포지션을 방어했습니다!'
        } else {
          positionChange = -1
          description = '방어에 실패해 포지션을 내줬습니다.'
        }
      }
      break
    }

    case 'pit_window':
      if (optionId === 'pit_soft') {
        positionChange = -2; timeChange = -8
        description = '소프트 타이어로 교체! 레이스 후반 빠른 페이스를 기대합니다.'
      } else if (optionId === 'pit_medium') {
        positionChange = -1; timeChange = -4
        description = '미디엄 타이어로 교체. 균형잡힌 전략입니다.'
      } else if (optionId === 'pit_hard') {
        timeChange = -2
        description = '하드 타이어로 교체. 긴 스틴트를 노립니다.'
      } else {
        positionChange = 2; timeChange = 5
        description = '피트인 없이 계속 달립니다. 타이어 소모에 주의하세요.'
      }
      break

    case 'retire':
      if (optionId === 'retire') {
        positionChange = -50
        description = '아쉽지만 리타이어를 선언했습니다.'
      } else {
        if (Math.random() < 0.3) {
          description = '기적적으로 결승선을 통과했습니다!'
        } else {
          positionChange = -50; partsDamageCost = 2000000
          description = '결국 완전 고장으로 리타이어. 부품 손상이 컸습니다.'
        }
      }
      break

    case 'parts_damage':
      if (optionId === 'pit_repair') {
        positionChange = -3; timeChange = 25; partsDamageCost = 200000
        description = '피트인해 프론트 윙을 교체했습니다.'
      } else {
        positionChange = -1; timeChange = 8; partsDamageCost = 500000
        description = '손상된 채로 계속 달렸습니다. 추가 손상이 발생했습니다.'
      }
      break

    case 'penalty_5sec':
    case 'illegal_defense':
      if (optionId === 'accept') {
        timeChange = 5
        penaltyPointsAdded = event.penalty?.penaltyPoints || 1
        description = `5초 페널티를 수락했습니다. (+${penaltyPointsAdded} 라이선스 포인트)`
      } else {
        // 항의 성공 확률 10%
        if (Math.random() < 0.10) {
          description = '항의 성공! 페널티가 취소됐습니다.'
        } else {
          timeChange = 5
          penaltyPointsAdded = event.penalty?.penaltyPoints || 1
          description = '항의 기각. 5초 페널티가 유지됩니다.'
        }
      }
      break

    case 'penalty_10sec':
      if (optionId === 'accept') {
        timeChange = 10
        penaltyPointsAdded = event.penalty?.penaltyPoints || 2
        description = `10초 페널티를 수락했습니다. (+${penaltyPointsAdded} 라이선스 포인트)`
      } else {
        if (Math.random() < 0.08) {
          description = '항의 성공! 페널티가 취소됐습니다.'
        } else {
          timeChange = 10
          penaltyPointsAdded = event.penalty?.penaltyPoints || 2
          description = '항의 기각. 10초 페널티가 유지됩니다.'
        }
      }
      break

    case 'drive_through':
    case 'pit_lane_speeding':
      timeChange = event.penalty?.timeAdded || 20
      penaltyPointsAdded = event.penalty?.penaltyPoints || 1
      description = event.type === 'drive_through'
        ? '드라이브스루 페널티를 서빙했습니다. 큰 시간 손실이 발생했습니다.'
        : `피트레인 속도 위반 페널티 ${timeChange}초가 부과됐습니다.`
      break

    case 'gearbox_penalty':
      description = '다음 레이스에서 그리드 5칸 강등됩니다.'
      break
  }

  return { positionChange, timeChange, description, partsDamageCost, penaltyPointsAdded }
}