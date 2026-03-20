'use client'

import { useRaceWeekend } from '@/lib/context/RaceWeekendContext'
import { getWeatherLabel } from '@/lib/simulation/weather'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  onNext: () => void
}

export default function FPPage({ onNext }: Props) {
  const router = useRouter()
  const { selectedRace, weather, fpSetup, setFpSetup, setFpDone } = useRaceWeekend()
  const [teamColor, setTeamColor] = useState('#ff0000')
  const [confirmed, setConfirmed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const color = localStorage.getItem('selectedTeamColor') || '#ff0000'
    setTeamColor(color)
  }, [])

  useEffect(() => {
    if (selectedRace) {
      setReady(true)
    } else {
      const raceData = localStorage.getItem('selectedRace')
      if (!raceData) router.push('/race')
      else setReady(true)
    }
  }, [selectedRace, router])

  const handleConfirm = () => {
    setFpDone(true)
    setConfirmed(true)
  }

  if (!ready || !selectedRace || !weather) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.push('/race')} className="text-gray-400 hover:text-white mb-4">
          ← 일정으로
        </button>
        <h1 className="text-3xl font-bold mb-1" style={{ color: teamColor }}>
          🔬 프리 프랙티스
        </h1>
        <p className="text-xl text-white font-bold mb-1">{selectedRace.circuit_name}</p>
        <p className="text-gray-400 mb-8">
          {getWeatherLabel(weather.current)} · 트랙 {weather.trackTemp}°C · 예보: {getWeatherLabel(weather.forecast)}
        </p>

        {/* 날씨 정보 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
          <p className="font-bold mb-3">🌤️ 날씨 정보</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-500 text-xs mb-1">현재 날씨</p>
              <p className="text-white font-bold">{getWeatherLabel(weather.current)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">레이스 예보</p>
              <p className="text-white font-bold">{getWeatherLabel(weather.forecast)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">강수 확률</p>
              <p className="text-white font-bold">{weather.rainProbability}%</p>
            </div>
          </div>
        </div>

        {/* 셋업 선택 */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
          <p className="font-bold text-lg mb-2">차량 셋업 포커스</p>
          <p className="text-gray-400 text-sm mb-5">예선과 레이스 전반에 걸쳐 영향을 줍니다. 두 드라이버 모두 적용됩니다.</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'aero', label: '🌀 공력 중심', desc: '코너링 속도 증가, 직선 속도 감소', bonus: '에어로 +2, 섀시 +1' },
              { id: 'mechanical', label: '⚙️ 기계 중심', desc: '타이어 마모 감소, 안정성 증가', bonus: '타이어 관리 +2, 신뢰성 +1' },
              { id: 'balance', label: '⚖️ 균형', desc: '전반적으로 안정적인 성능', bonus: '전 능력치 +1' },
            ].map((setup) => (
              <button
                key={setup.id}
                onClick={() => setFpSetup(setup.id as any)}
                disabled={confirmed}
                className="rounded-xl p-4 border-2 text-left transition"
                style={{
                  borderColor: fpSetup === setup.id ? teamColor : '#374151',
                  backgroundColor: fpSetup === setup.id ? `${teamColor}20` : 'transparent',
                  opacity: confirmed && fpSetup !== setup.id ? 0.4 : 1,
                }}
              >
                <p className="font-bold mb-1">{setup.label}</p>
                <p className="text-gray-400 text-xs mb-2">{setup.desc}</p>
                <p className="text-xs font-bold" style={{ color: teamColor }}>{setup.bonus}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 서킷 정보 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
          <p className="font-bold mb-3">🏎️ 서킷 정보</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: '특성', value: getCircuitCharacteristic(selectedRace.circuit_name) },
              { label: '강수 확률', value: `${weather.rainProbability}%` },
              { label: '트랙 온도', value: `${weather.trackTemp}°C` },
              { label: '추천 셋업', value: getRecommendedSetup(selectedRace.circuit_name) },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-gray-500">{item.label}</span>
                <span className="text-white font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {!confirmed ? (
          <button
            onClick={handleConfirm}
            className="w-full py-3 rounded-xl font-bold text-black"
            style={{ backgroundColor: teamColor }}
          >
            셋업 확정
          </button>
        ) : (
          <button
            onClick={onNext}
            className="w-full py-3 rounded-xl font-bold border-2"
            style={{ borderColor: teamColor, color: teamColor }}
          >
            예선으로 →
          </button>
        )}
      </div>
    </main>
  )
}

function getCircuitCharacteristic(circuitName: string): string {
  const map: Record<string, string> = {
    '호주 그랑프리 (멜버른)': '시가지',
    '중국 그랑프리 (상하이)': '균형',
    '일본 그랑프리 (스즈카)': '기술적',
    '마이애미 그랑프리': '시가지',
    '캐나다 그랑프리 (몬트리올)': '시가지',
    '모나코 그랑프리': '시가지',
    '스페인 그랑프리 (바르셀로나)': '기술적',
    '오스트리아 그랑프리 (레드불링)': '고속',
    '영국 그랑프리 (실버스톤)': '고속',
    '벨기에 그랑프리 (스파)': '고속',
    '헝가리 그랑프리 (부다페스트)': '기술적',
    '네덜란드 그랑프리 (잔드보르트)': '기술적',
    '이탈리아 그랑프리 (몬자)': '고속',
    '마드리드 그랑프리': '균형',
    '아제르바이잔 그랑프리 (바쿠)': '시가지',
    '싱가포르 그랑프리': '시가지',
    '미국 그랑프리 (오스틴)': '균형',
    '멕시코시티 그랑프리': '균형',
    '상파울루 그랑프리': '균형',
    '라스베이거스 그랑프리': '시가지',
    '카타르 그랑프리': '고속',
    '아부다비 그랑프리 (야스마리나)': '균형',
  }
  return map[circuitName] || '균형'
}

function getRecommendedSetup(circuitName: string): string {
  const char = getCircuitCharacteristic(circuitName)
  if (char === '고속') return '🌀 공력 중심'
  if (char === '시가지') return '⚙️ 기계 중심'
  return '⚖️ 균형'
}