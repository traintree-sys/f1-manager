import { getWeatherLabel } from '@/lib/simulation/weather'
import { getSegmentDescription } from '@/lib/simulation/race'
import { getTyreCompoundColor, getTyreWearColor, DriverTyreState } from '@/lib/simulation/strategy'
import type { RaceState } from '@/lib/simulation/race'
import type { MergedEvent } from '@/lib/simulation/race'
import { getEventCommentary } from '@/lib/simulation/commentary'

interface Props {
  currentRace: any
  weather: any
  teamColor: string
  myDrivers: any[]
  raceState1: RaceState
  raceState2: RaceState
  tyre1: DriverTyreState | null
  tyre2: DriverTyreState | null
  currentMergedEvent: MergedEvent | null
  currentLap: number
  totalLaps: number
  lapsToNext: number | null
  raceFinished1: boolean
  raceFinished2: boolean
  eventLog: string[]
  onEventOption: (optionId: string) => void
  onNextSegment: () => void
}

export default function RaceTrack({
  currentRace, weather, teamColor, myDrivers,
  raceState1, raceState2,
  tyre1, tyre2,
  currentMergedEvent, currentLap, totalLaps, lapsToNext,
  raceFinished1, raceFinished2,
  eventLog,
  onEventOption, onNextSegment,
}: Props) {
  const pos1 = raceState1.driverPositions.find(d => d.driverId === myDrivers[0]?.id)
  const pos2 = raceState2.driverPositions.find(d => d.driverId === myDrivers[1]?.id)
  const currentEventDriver = currentMergedEvent ? myDrivers[currentMergedEvent.driverNum - 1] : null
  const currentEventPlayerPos = currentMergedEvent
    ? (currentMergedEvent.driverNum === 1 ? pos1 : pos2)
    : null

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">

        {/* 헤더 */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: teamColor }}>
              🏎️ {currentRace?.circuit_name}
            </h1>
            <p className="text-gray-400 text-sm">
              {getSegmentDescription(currentLap, totalLaps, lapsToNext ? currentLap + lapsToNext : null)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs">우리팀</p>
            <p className="font-bold" style={{ color: teamColor }}>
              P{pos1?.finishPosition || '-'} · P{pos2?.finishPosition || '-'}
            </p>
          </div>
        </div>

        {/* 랩 프로그레스 */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>LAP {currentLap}</span>
            {lapsToNext && lapsToNext > 0 && (
              <span style={{ color: teamColor }}>다음 이벤트까지 약 {lapsToNext}랩</span>
            )}
            <span>{totalLaps} LAPS</span>
          </div>
          <div className="bg-gray-800 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (currentLap / totalLaps) * 100)}%`,
                backgroundColor: teamColor
              }}
            />
          </div>
        </div>

        {/* 드라이버 카드 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {myDrivers.map((d, i) => {
            const pos = i === 0 ? pos1 : pos2
            const tyreState = i === 0 ? tyre1 : tyre2
            const isEventDriver = currentMergedEvent?.driverNum === i + 1
            return (
              <div key={d.id}
                className="bg-gray-900 rounded-xl p-4 border transition-all"
                style={{
                  borderColor: isEventDriver ? teamColor : '#374151',
                  backgroundColor: isEventDriver ? `${teamColor}15` : 'transparent'
                }}>
                <p className="text-gray-400 text-xs mb-1">{d.name}</p>
                <p className="text-2xl font-bold mb-2" style={{ color: teamColor }}>
                  P{pos?.finishPosition || '-'}
                </p>
                {tyreState && (
                  <div className="mt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTyreCompoundColor(tyreState.currentTyre) }} />
                      <span className="text-xs" style={{ color: getTyreCompoundColor(tyreState.currentTyre) }}>
                        {tyreState.currentTyre}
                      </span>
                      <span className="text-gray-600 text-xs ml-auto">{tyreState.tyreAge}랩</span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${100 - tyreState.tyreWear}%`,
                          backgroundColor: getTyreWearColor(tyreState.tyreWear)
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {(pos?.pitStops || 0) > 0 && (
                    <span className="text-blue-400 text-xs">{pos?.pitStops}pit</span>
                  )}
                  {pos?.retired && <span className="text-red-400 text-xs">DNF</span>}
                  {(pos?.penaltySeconds || 0) > 0 && (
                    <span className="text-yellow-400 text-xs">+{pos?.penaltySeconds}s</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 전체 순위 */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-6">
          <p className="font-bold mb-3 text-sm">전체 순위</p>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {[...raceState1.driverPositions]
              .sort((a, b) => a.finishPosition - b.finishPosition)
              .map((d) => {
                const isMyDriver = myDrivers.some(md => md.id === d.driverId)
                return (
                  <div key={d.driverId}
                    className={`flex justify-between items-center py-1 px-2 rounded
                      ${isMyDriver ? 'bg-gray-800' : ''}
                      ${d.retired ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-5 text-xs">P{d.finishPosition}</span>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.teamColor }} />
                      <span className={`text-xs ${isMyDriver ? 'font-bold text-white' : 'text-gray-400'}`}>
                        {d.driverName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {d.retired && <span className="text-red-400 text-xs">DNF</span>}
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getTyreCompoundColor(d.tyre) }} />
                      {d.pitStops > 0 && <span className="text-blue-400 text-xs">{d.pitStops}pit</span>}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* 이벤트 */}
        {currentMergedEvent && (
          <div className="bg-gray-900 rounded-xl p-6 border-2 mb-6" style={{ borderColor: teamColor }}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: teamColor }}>
                🚨 {currentEventDriver?.name}
              </p>
              <p className="text-gray-500 text-xs">랩 {currentMergedEvent.event.lap} / {totalLaps}</p>
            </div>
            <p className="text-white font-bold text-lg mb-2">{currentMergedEvent.event.description}</p>
            <p className="text-gray-400 text-sm mb-4">
              현재 순위: <span style={{ color: teamColor }}>P{currentEventPlayerPos?.finishPosition}</span>
            </p>
            {currentMergedEvent.event.penalty && (
              <div className="bg-red-900/30 rounded-lg p-3 mb-4 border border-red-800">
                <p className="text-red-400 text-sm">
                  ⚠️ {currentMergedEvent.event.penalty.type} · +{currentMergedEvent.event.penalty.penaltyPoints} 라이선스 포인트
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              {currentMergedEvent.event.options?.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onEventOption(opt.id)}
                  className="rounded-xl p-4 border text-left transition hover:bg-gray-800"
                  style={{
                    borderColor: opt.risk === 'high' ? '#ef4444' :
                      opt.risk === 'medium' ? '#f59e0b' : '#374151'
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold">{opt.label}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full
                      ${opt.risk === 'high' ? 'bg-red-900 text-red-400' :
                      opt.risk === 'medium' ? 'bg-yellow-900 text-yellow-400' :
                      'bg-green-900 text-green-400'}`}>
                      {opt.risk === 'high' ? '고위험' : opt.risk === 'medium' ? '중위험' : '저위험'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 다음 구간 */}
        {!currentMergedEvent && !raceFinished1 && (
          <button
            onClick={onNextSegment}
            className="w-full py-4 rounded-xl font-bold text-black mb-4"
            style={{ backgroundColor: teamColor }}
          >
            {currentLap < totalLaps * 0.33
              ? `다음 구간으로 → (랩 ${currentLap})`
              : currentLap < totalLaps * 0.66
              ? `레이스 중반으로 → (랩 ${currentLap})`
              : currentLap < totalLaps * 0.9
              ? `레이스 후반으로 → (랩 ${currentLap})`
              : `피날레로 → (랩 ${currentLap})`
            }
          </button>
        )}

        {/* 스타트 로그 */}
        {raceState1?.startLog && raceState1.startLog.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
            <p className="text-gray-500 text-xs font-bold mb-2">🚦 스타트 결과</p>
            {raceState1.startLog.map((log, i) => (
              <p key={i} className="text-sm text-white">{log}</p>
            ))}
          </div>
        )}

        {/* 이벤트 로그 */}
        {eventLog.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mt-4">
            <p className="font-bold mb-2 text-sm">📋 레이스 로그</p>
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {eventLog.map((log, i) => (
                <p key={i} className="text-gray-400 text-xs">{log}</p>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}