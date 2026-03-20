export type Weather = 'dry' | 'wet' | 'mixed'

export interface WeatherState {
  current: Weather
  forecast: Weather
  rainProbability: number
  trackTemp: number
}

export interface CircuitInfo {
  name: string
  rainProbability: number
  baseTrackTemp: number
  laps: number
  lapDistance: number
}

export const CIRCUITS: Record<string, CircuitInfo> = {
  '호주 그랑프리 (멜버른)': { name: '멜버른', rainProbability: 20, baseTrackTemp: 32, laps: 58, lapDistance: 5.278 },
  '중국 그랑프리 (상하이)': { name: '상하이', rainProbability: 25, baseTrackTemp: 28, laps: 56, lapDistance: 5.451 },
  '일본 그랑프리 (스즈카)': { name: '스즈카', rainProbability: 40, baseTrackTemp: 26, laps: 53, lapDistance: 5.807 },
  '마이애미 그랑프리': { name: '마이애미', rainProbability: 20, baseTrackTemp: 40, laps: 57, lapDistance: 5.412 },
  '캐나다 그랑프리 (몬트리올)': { name: '몬트리올', rainProbability: 35, baseTrackTemp: 30, laps: 70, lapDistance: 4.361 },
  '모나코 그랑프리': { name: '모나코', rainProbability: 25, baseTrackTemp: 35, laps: 78, lapDistance: 3.337 },
  '스페인 그랑프리 (바르셀로나)': { name: '바르셀로나', rainProbability: 15, baseTrackTemp: 38, laps: 66, lapDistance: 4.657 },
  '오스트리아 그랑프리 (레드불링)': { name: '레드불링', rainProbability: 30, baseTrackTemp: 30, laps: 71, lapDistance: 4.318 },
  '영국 그랑프리 (실버스톤)': { name: '실버스톤', rainProbability: 60, baseTrackTemp: 25, laps: 52, lapDistance: 5.891 },
  '벨기에 그랑프리 (스파)': { name: '스파', rainProbability: 55, baseTrackTemp: 22, laps: 44, lapDistance: 7.004 },
  '헝가리 그랑프리 (부다페스트)': { name: '부다페스트', rainProbability: 30, baseTrackTemp: 40, laps: 70, lapDistance: 4.381 },
  '네덜란드 그랑프리 (잔드보르트)': { name: '잔드보르트', rainProbability: 40, baseTrackTemp: 25, laps: 72, lapDistance: 4.259 },
  '이탈리아 그랑프리 (몬자)': { name: '몬자', rainProbability: 20, baseTrackTemp: 35, laps: 53, lapDistance: 5.793 },
  '마드리드 그랑프리': { name: '마드리드', rainProbability: 10, baseTrackTemp: 40, laps: 55, lapDistance: 5.500 },
  '아제르바이잔 그랑프리 (바쿠)': { name: '바쿠', rainProbability: 10, baseTrackTemp: 38, laps: 51, lapDistance: 6.003 },
  '싱가포르 그랑프리': { name: '싱가포르', rainProbability: 40, baseTrackTemp: 35, laps: 62, lapDistance: 4.940 },
  '미국 그랑프리 (오스틴)': { name: '오스틴', rainProbability: 20, baseTrackTemp: 35, laps: 56, lapDistance: 5.513 },
  '멕시코시티 그랑프리': { name: '멕시코시티', rainProbability: 15, baseTrackTemp: 28, laps: 71, lapDistance: 4.304 },
  '상파울루 그랑프리': { name: '상파울루', rainProbability: 50, baseTrackTemp: 30, laps: 71, lapDistance: 4.309 },
  '라스베이거스 그랑프리': { name: '라스베이거스', rainProbability: 5, baseTrackTemp: 15, laps: 50, lapDistance: 6.201 },
  '카타르 그랑프리': { name: '카타르', rainProbability: 5, baseTrackTemp: 42, laps: 57, lapDistance: 5.380 },
  '아부다비 그랑프리 (야스마리나)': { name: '야스마리나', rainProbability: 5, baseTrackTemp: 38, laps: 58, lapDistance: 5.281 },
}

export function generateWeather(circuitName: string): WeatherState {
  const circuit = CIRCUITS[circuitName]
  const prob = circuit?.rainProbability || 15
  const roll = Math.random() * 100

  let current: Weather = 'dry'
  if (roll < prob * 0.4) current = 'wet'
  else if (roll < prob * 0.7) current = 'mixed'

  const forecastRoll = Math.random() * 100
  let forecast: Weather = 'dry'
  if (forecastRoll < prob * 0.5) forecast = 'wet'
  else if (forecastRoll < prob * 0.8) forecast = 'mixed'

  const baseTemp = circuit?.baseTrackTemp || 30
  const trackTemp = current === 'wet'
    ? Math.floor(baseTemp * 0.7 + Math.random() * 5)
    : Math.floor(baseTemp + Math.random() * 8 - 4)

  return { current, forecast, rainProbability: prob, trackTemp }
}

export function getWeatherLabel(weather: Weather): string {
  return { dry: '☀️ 건조', wet: '🌧️ 우천', mixed: '🌦️ 혼합' }[weather]
}

export function getTyreForWeather(weather: Weather): string[] {
  if (weather === 'wet') return ['인터미디어트', '풀웨트']
  if (weather === 'mixed') return ['인터미디어트', '소프트', '미디엄']
  return ['소프트', '미디엄', '하드']
}