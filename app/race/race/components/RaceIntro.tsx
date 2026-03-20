import { getWeatherLabel } from '@/lib/simulation/weather'
import { DriverQualifyingResult } from '@/lib/simulation/qualifying'

interface Props {
  currentRace: any
  weather: any
  teamColor: string
  save: any
  totalLaps: number
  adjustedGrid: DriverQualifyingResult[]
  gridPenalties: string[]
  myDrivers: any[]
  onNext: () => void
}

export default function RaceIntro({
  currentRace, weather, teamColor, save, totalLaps,
  adjustedGrid, gridPenalties, myDrivers, onNext
}: Props) {
  const weatherCurrent = weather?.current ?? 'dry'

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-gray-500 text-sm mb-2">2026 시즌 · 라운드 {save?.current_race}</p>
        <h1 className="text-4xl font-bold mb-1" style={{ color: teamColor }}>{currentRace?.circuit_name}</h1>
        <p className="text-gray-400 mb-8">{getWeatherLabel(weatherCurrent)} · 트랙 {weather?.trackTemp}°C</p>

        {gridPenalties.length > 0 && (
          <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-700 mb-6">
            <p className="text-yellow-400 font-bold text-sm mb-2">⚙️ 레이스 전 그리드 페널티</p>
            {gridPenalties.map((p, i) => (
              <p key={i} className="text-yellow-300 text-sm">{p}</p>
            ))}
          </div>
        )}

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
          <p className="font-bold text-lg mb-4">🏁 스타팅 그리드</p>
          <div className="grid grid-cols-2 gap-2">
            {adjustedGrid.slice(0, 20).map((r, i) => {
              const isMyDriver = myDrivers.some(d => d.id === r.driverId)
              return (
                <div key={r.driverId}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg ${isMyDriver ? 'border' : ''}`}
                  style={isMyDriver ? { borderColor: teamColor, backgroundColor: `${teamColor}15` } : {}}>
                  <span className="text-gray-600 text-sm w-5 font-mono">{i + 1}</span>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.teamColor }} />
                  <span className={`text-sm ${isMyDriver ? 'font-bold' : 'text-gray-300'}`}>{r.driverName}</span>
                  {isMyDriver && <span className="text-xs ml-auto" style={{ color: teamColor }}>◀</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-8">
          <p className="font-bold mb-3">📊 레이스 정보</p>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-1">총 랩수</p>
              <p className="font-bold">{totalLaps} 랩</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">날씨</p>
              <p className="font-bold">{getWeatherLabel(weatherCurrent)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">강수 확률</p>
              <p className="font-bold">{weather?.rainProbability}%</p>
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full py-4 rounded-xl font-bold text-black text-lg"
          style={{ backgroundColor: teamColor }}
        >
          📋 전략 선택하기
        </button>
      </div>
    </main>
  )
}