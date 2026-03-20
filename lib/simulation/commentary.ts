import type { TyreCompound } from './qualifying'

export type CommentaryType =
  | 'start_formation'
  | 'start_lights'
  | 'start_go'
  | 'start_result'
  | 'pit_window'
  | 'pit_in'
  | 'safety_car'
  | 'vsc'
  | 'weather_change'
  | 'battle'
  | 'overtake_success'
  | 'overtake_fail'
  | 'defend_success'
  | 'defend_fail'
  | 'penalty'
  | 'retire'
  | 'damage'
  | 'position_gain'
  | 'position_loss'
  | 'segment_early'
  | 'segment_mid'
  | 'segment_late'
  | 'segment_final'

const COMMENTARY: Record<CommentaryType, string[]> = {
  start_formation: [
    '드라이버들이 포메이션 랩을 시작합니다. 엔진 소리가 점점 커지고 있습니다.',
    '그리드에 차량들이 자리를 잡습니다. 모든 시선이 신호등에 집중되고 있습니다.',
    '포메이션 랩 완료! 드라이버들이 그리드로 돌아오고 있습니다. 긴장감이 최고조에 달하고 있네요.',
  ],
  start_lights: [
    '첫 번째 빨간불이 켜집니다! 드라이버들 모두 집중하고 있습니다.',
    '두 번째 불이 켜졌습니다. RPM을 맞추는 엔진 소리가 들려옵니다.',
    '세 번째! 네 번째! 이제 다섯 번째 불까지 모두 켜졌습니다!',
    '다섯 개의 빨간불이 모두 켜졌습니다. 정적이 흐릅니다...',
  ],
  start_go: [
    '불이 꺼졌습니다! 레이스 스타트!!',
    '소등!! 드라이버들이 일제히 출발합니다!',
    '레이스가 시작됐습니다! 엄청난 가속이 펼쳐지고 있습니다!',
  ],
  start_result: [
    '1코너로 향하는 혼전 속에 순위가 결정되고 있습니다.',
    '스타트 직후 치열한 포지션 싸움이 벌어지고 있네요.',
    '오프닝 랩에서 몇몇 드라이버들이 순위를 바꿨습니다.',
  ],
  pit_window: [
    '피트스톱 윈도우가 열렸습니다. 전략팀들이 바쁘게 움직이고 있습니다.',
    '이제 피트인 타이밍입니다. 타이어 상태를 고려한 전략이 중요한 시점이네요.',
    '피트레인에서 몇몇 팀들이 이미 움직임을 보이고 있습니다. 언더컷 전략인가요?',
    '월이 피트인을 요청해오고 있습니다. 타이어 관리 상황을 보면서 결정해야 합니다.',
  ],
  pit_in: [
    '피트인! 크루들이 빠르게 움직입니다. 타이어 교체가 시작됩니다!',
    '피트레인으로 들어옵니다. 팀 크루들이 대기하고 있습니다!',
    '피트스톱! 새 타이어를 장착합니다. 시간이 얼마나 걸릴지 주목됩니다.',
  ],
  safety_car: [
    '세이프티카가 출동했습니다! 트랙 위에 사고가 발생했습니다.',
    '버추얼이 아닌 실제 세이프티카입니다! 모든 차량들이 속도를 줄이고 있습니다.',
    '세이프티카 출동! 이 상황이 레이스 판도를 크게 바꿀 수 있습니다.',
    '빨간 깃발은 아닙니다만, 세이프티카가 나왔습니다. 피트인 타이밍을 잘 잡아야 합니다.',
  ],
  vsc: [
    'VSC, 버추얼 세이프티카가 발동됐습니다. 전 차량 속도를 줄여야 합니다.',
    '버추얼 세이프티카! 피트인 손실이 줄어드는 절호의 기회가 될 수 있습니다.',
    'VSC 발동! 트랙 위에 위험 상황이 발생했습니다. 마샬들이 움직이고 있습니다.',
  ],
  weather_change: [
    '하늘이 어두워지고 있습니다. 빗방울이 내리기 시작하는군요!',
    '날씨가 변하고 있습니다! 인터미디어트 타이어로의 전환이 필요한 시점이 다가오고 있습니다.',
    '비가 내리기 시작했습니다! 노면이 젖어들면서 상황이 급변하고 있습니다.',
    '기상 상황이 레이스를 뒤흔들 수 있습니다. 팀들의 전략 판단이 중요한 순간입니다!',
  ],
  battle: [
    '치열한 배틀이 시작됐습니다! DRS 포인트에서 한 치의 양보도 없는 싸움이 펼쳐지고 있습니다.',
    '두 차량이 사이드 바이 사이드! 누가 앞서나갈지 긴장되는 순간입니다.',
    '근접 배틀! 브레이킹 포인트까지 기다립니다. 누가 먼저 물러설까요?',
    '코너마다 치열한 방어와 공격이 이어지고 있습니다. 정말 숨막히는 배틀이네요!',
  ],
  overtake_success: [
    '추월 성공!! 완벽한 브레이킹으로 자리를 빼앗았습니다!',
    '해냈습니다! 완벽한 타이밍에 추월을 성공시켰습니다!',
    '멋진 추월! DRS를 최대한 활용한 깔끔한 오버테이크입니다!',
    '포지션 확보! 상대방의 허를 찌르는 완벽한 기동이었습니다!',
  ],
  overtake_fail: [
    '아쉽습니다! 추월 시도가 막혔습니다. 접촉이 있었네요.',
    '추월 실패! 상대방의 방어가 완벽했습니다.',
    '너무 과감했습니다. 접촉으로 인해 시간을 잃었습니다.',
    '브레이킹이 조금 늦었습니다. 다음 기회를 노려야 할 것 같습니다.',
  ],
  defend_success: [
    '완벽한 방어입니다! 라인을 지키며 포지션을 유지했습니다.',
    '방어 성공! 코너 진입에서 절묘한 포지셔닝을 보여줬습니다.',
    '막아냈습니다! 뒷차의 모든 공격을 차단했습니다.',
  ],
  defend_fail: [
    '방어가 뚫렸습니다. 포지션을 내줄 수밖에 없었네요.',
    '아쉬운 방어. 결국 순위를 내주고 말았습니다.',
    '뒷차의 집요한 공격을 막아내지 못했습니다.',
  ],
  penalty: [
    '스튜어드가 조사를 시작했습니다. 페널티가 부과될 수 있습니다.',
    '페널티 통보! 팀 무선에 긴장감이 흐르고 있습니다.',
    '규정 위반으로 페널티가 부과됐습니다. 순위에 영향을 줄 수 있습니다.',
    '스튜어드의 결정이 나왔습니다. 페널티를 피하지 못했네요.',
  ],
  retire: [
    '머신에 문제가 생겼습니다! 피트레인으로 들어오고 있습니다.',
    '안타깝게도 리타이어가 선언됐습니다. 오늘은 여기까지입니다.',
    '기계 결함으로 레이스를 마치지 못하게 됐습니다. 정말 안타까운 상황입니다.',
  ],
  damage: [
    '충돌! 프론트 윙에 손상이 생겼습니다. 피트인이 필요한 상황입니다.',
    '접촉 사고! 파편이 튀고 있습니다. 차량 손상이 우려됩니다.',
    '사고! 머신 손상으로 페이스가 떨어질 수 있습니다.',
  ],
  position_gain: [
    '순위가 올라갔습니다! 훌륭한 레이스를 펼치고 있습니다.',
    '포지션 상승! 전략이 완벽하게 맞아떨어지고 있습니다.',
    '앞차를 제쳤습니다! 레이스 페이스가 탁월합니다.',
  ],
  position_loss: [
    '순위를 내줬습니다. 타이어 상태가 문제인 것 같습니다.',
    '포지션 하락. 여기서 만회할 수 있을지 지켜봐야겠습니다.',
    '아쉽게 자리를 빼앗겼습니다. 전략 수정이 필요해 보입니다.',
  ],
  segment_early: [
    '레이스 초반입니다. 드라이버들이 타이어 온도를 올리며 페이스를 조절하고 있습니다.',
    '오프닝 스틴트가 진행 중입니다. 팀들이 상대방의 전략을 분석하고 있습니다.',
    '레이스 초반, 모든 팀이 타이어 관리에 집중하고 있습니다.',
  ],
  segment_mid: [
    '레이스 중반에 접어들었습니다. 피트스톱 전략이 본격적으로 가동되고 있습니다.',
    '중반전! 일부 팀들은 이미 피트인을 마쳤고, 언더컷을 시도하는 팀도 보입니다.',
    '레이스 중반, 타이어 마모가 본격화되면서 순위 변동이 예상됩니다.',
  ],
  segment_late: [
    '레이스 후반입니다! 순위가 거의 굳어지고 있습니다. 남은 랩이 중요합니다.',
    '후반전, 타이어가 한계에 다가오고 있습니다. 페이스 관리가 필수적인 상황입니다.',
    '결승선이 가까워지고 있습니다. 포지션 싸움이 더욱 치열해지고 있습니다!',
  ],
  segment_final: [
    '마지막 스틴트입니다! 이제 모든 것을 쏟아부어야 할 때입니다!',
    '피날레! 드라이버들이 마지막 에너지를 짜내고 있습니다!',
    '체커 플래그가 얼마 남지 않았습니다! 마지막 순위 싸움이 시작됩니다!',
  ],
}

export function getCommentary(type: CommentaryType): string {
  const lines = COMMENTARY[type]
  return lines[Math.floor(Math.random() * lines.length)]
}

export function getStartCommentary(
  driverName: string,
  startPos: number,
  endPos: number,
): string[] {
  const lines: string[] = []
  const change = startPos - endPos

  lines.push(getCommentary('start_go'))

  if (change > 3) {
    lines.push(`${driverName}! 엄청난 스타트입니다! ${startPos}번 그리드에서 단숨에 ${endPos}위로 올라섰습니다!`)
  } else if (change > 0) {
    lines.push(`${driverName}가 좋은 스타트를 끊으며 ${endPos}위로 올라섰습니다.`)
  } else if (change === 0) {
    lines.push(`${driverName}는 ${startPos}번 그리드를 지키며 깔끔한 스타트를 보였습니다.`)
  } else if (change < -2) {
    lines.push(`아쉽습니다, ${driverName}! 스타트에서 ${Math.abs(change)}자리나 잃으며 ${endPos}위로 밀렸습니다.`)
  } else {
    lines.push(`${driverName}가 스타트에서 조금 밀리며 ${endPos}위를 기록하고 있습니다.`)
  }

  lines.push(getCommentary('start_result'))
  return lines
}

export function getSegmentCommentary(lap: number, totalLaps: number): string {
  const pct = lap / totalLaps
  if (pct < 0.33) return getCommentary('segment_early')
  if (pct < 0.66) return getCommentary('segment_mid')
  if (pct < 0.9) return getCommentary('segment_late')
  return getCommentary('segment_final')
}

export function getEventCommentary(eventType: string, driverName: string, position: number): string {
  const posText = `현재 ${position}위`
  switch (eventType) {
    case 'safety_car': return `${getCommentary('safety_car')} ${driverName}는 ${posText}에서 이 상황을 맞이하고 있습니다.`
    case 'vsc': return `${getCommentary('vsc')} ${driverName} ${posText}.`
    case 'weather_change': return `${getCommentary('weather_change')} ${driverName} 팀의 전략적 판단이 필요한 순간입니다!`
    case 'battle': return `${getCommentary('battle')} ${driverName}가 ${posText}에서 치열한 배틀을 벌이고 있습니다!`
    case 'pit_window': return `${getCommentary('pit_window')} ${driverName}는 ${posText}에 있습니다.`
    case 'retire': return `${getCommentary('retire')} ${driverName}에게 정말 안타까운 순간입니다.`
    case 'parts_damage': return `${getCommentary('damage')} ${driverName} ${posText}.`
    case 'penalty_5sec':
    case 'penalty_10sec':
    case 'illegal_defense': return `${getCommentary('penalty')} ${driverName} ${posText}.`
    default: return `${driverName}에게 상황이 발생했습니다. ${posText}에서 대응이 필요합니다.`
  }
}

export function getOptionResultCommentary(
  optionId: string,
  success: boolean,
  driverName: string,
  newPosition: number,
  tyre?: TyreCompound
): string {
  if (optionId === 'pit_now' || optionId === 'pit_soft' || optionId === 'pit_medium' || optionId === 'pit_hard') {
    return `${getCommentary('pit_in')} ${tyre ? `${tyre} 타이어로 교체합니다.` : ''} ${driverName} 현재 ${newPosition}위.`
  }
  if (optionId === 'stay_out') {
    return `트랙에 잔류합니다. ${driverName} ${newPosition}위 유지.`
  }
  if (optionId === 'aggressive') {
    return success
      ? `${getCommentary('overtake_success')} ${driverName} ${newPosition}위로 올라섭니다!`
      : `${getCommentary('overtake_fail')} ${driverName} ${newPosition}위.`
  }
  if (optionId === 'patient') {
    return success
      ? `${getCommentary('overtake_success')} 기다림 끝에 ${driverName}가 ${newPosition}위를 차지합니다!`
      : `기회를 노렸지만 아직입니다. ${driverName} ${newPosition}위.`
  }
  if (optionId === 'defend') {
    return success
      ? `${getCommentary('defend_success')} ${driverName} ${newPosition}위 수성!`
      : `${getCommentary('defend_fail')} ${driverName} ${newPosition}위로 밀렸습니다.`
  }
  if (optionId === 'retire') {
    return `${getCommentary('retire')} ${driverName}의 레이스가 여기서 끝납니다.`
  }
  return `${driverName} ${newPosition}위.`
}