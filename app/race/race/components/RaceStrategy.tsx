import type { RaceStrategy } from '@/lib/simulation/strategy'
import { getTyreCompoundColor, getTyreLife } from '@/lib/simulation/strategy'
import type { TyreCompound } from '@/lib/simulation/qualifying'

interface Props {
  currentRace: any
  teamColor: string
  strategies: RaceStrategy[]
  driver1Strategy: RaceStrategy | null
  driver2Strategy: RaceStrategy | null
  driver1StartTyre: TyreCompound
  driver2StartTyre: TyreCompound
  myDrivers: any[]
  onSelectStrategy: (strat: RaceStrategy) => void
  onSelectDriver1Tyre: (tyre: TyreCompound) => void
  onSelectDriver2Tyre: (tyre: TyreCompound) => void
  onBack: () => void
  onNext: () => void
}

export default function RaceStrategy({
  currentRace, teamColor, strategies,
  driver1Strategy, driver2Strategy,
  driver1StartTyre, driver2StartTyre,
  myDrivers,
  onSelectStrategy, onSelectDriver1Tyre, onSelectDriver2Tyre,
  onBack, onNext
}: Props) {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="text-gray-400 hover:text-white mb-4">← 인트로로</button>
        <h1 className="text-3xl font-bold mb-1" style={{ color: teamColor }}>📋 레이스 전략</h1>
        <p className="text-gray-400 mb-6">{currentRace?.circuit_name}</p>

        {/* 타이어 수명 정보 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
          <p className="font-bold mb-3">🏎️ 예상 타이어 수명</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {(['소프트', '미디엄', '하드'] as TyreCompound[]).map(compound => {
              const life = getTyreLife(compound, currentRace?.circuit_name)
              const color = getTyreCompoundColor(compound)
              return (
                <div key={compound} className="bg-gray-800 rounded-xl p-3">
                  <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: color }} />
                  <p className="font-bold text-sm">{compound}</p>
                  <p className="text-gray-400 text-xs">약 {life}랩</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 전략 추천 */}
        <p className="font-bold mb-3">추천 전략</p>
        <div className="flex flex-col gap-3 mb-6">
          {strategies.map((strat) => (
            <button
              key={strat.id}
              onClick={() => onSelectStrategy(strat)}
              className="rounded-xl p-5 border-2 text-left transition"
              style={{
                borderColor: driver1Strategy?.id === strat.id ? teamColor : '#374151',
                backgroundColor: driver1Strategy?.id === strat.id ? `${teamColor}15` : 'transparent'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <p className="font-bold">{strat.name}</p>
                <div className="flex gap-1 ml-auto items-center">
                  {strat.stints.map((tyre, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTyreCompoundColor(tyre as TyreCompound) }} />
                      <span className="text-xs text-gray-400">{tyre}</span>
                      {i < strat.stints.length - 1 && <span className="text-gray-600 text-xs mx-1">→</span>}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-400 text-sm">{strat.description}</p>
            </button>
          ))}
        </div>

        {/* 드라이버별 스타트 타이어 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-8">
          <p className="font-bold mb-4">드라이버별 스타트 타이어</p>
          {myDrivers.map((d, i) => {
            const startTyre = i === 0 ? driver1StartTyre : driver2StartTyre
            const setStartTyre = i === 0 ? onSelectDriver1Tyre : onSelectDriver2Tyre
            return (
              <div key={d.id} className="mb-4 last:mb-0">
                <p className="text-sm mb-2" style={{ color: teamColor }}>{d.name}</p>
                <div className="flex gap-2">
                  {(['소프트', '미디엄', '하드'] as TyreCompound[]).map(tyre => (
                    <button
                      key={tyre}
                      onClick={() => setStartTyre(tyre)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition"
                      style={{
                        borderColor: startTyre === tyre ? getTyreCompoundColor(tyre) : '#374151',
                        backgroundColor: startTyre === tyre ? `${getTyreCompoundColor(tyre)}20` : 'transparent',
                        color: startTyre === tyre ? getTyreCompoundColor(tyre) : '#9ca3af',
                      }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTyreCompoundColor(tyre) }} />
                      {tyre}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={onNext}
          className="w-full py-4 rounded-xl font-bold text-black text-lg"
          style={{ backgroundColor: teamColor }}
        >
          🚦 그리드로 이동
        </button>
      </div>
    </main>
  )
}