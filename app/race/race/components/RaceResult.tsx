import { getPlayerResult } from '@/lib/simulation/race'
import type { RaceState } from '@/lib/simulation/race'
import type { DriverQualifyingResult } from '@/lib/simulation/qualifying'

interface Props {
  raceState1: RaceState
  raceState2: RaceState
  myDrivers: any[]
  adjustedGrid: DriverQualifyingResult[]
  teamColor: string
  circuitName: string
  eventLog: string[]
  onFinish: () => void
}

export default function RaceResult({
  raceState1, raceState2, myDrivers, adjustedGrid,
  teamColor, circuitName, eventLog, onFinish
}: Props) {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-1" style={{ color: teamColor }}>🏆 레이스 결과</h1>
        <p className="text-gray-400 mb-6">{circuitName}</p>

        {/* 드라이버별 결과 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {myDrivers.map((d, i) => {
            const rs = i === 0 ? raceState1 : raceState2
            const result = getPlayerResult(rs, d.id)
            if (!result) return null
            const startPos = adjustedGrid.findIndex(r => r.driverId === d.id) + 1
            const posDiff = startPos - result.finishPosition
            return (
              <div key={d.id} className="rounded-xl p-5 border-2"
                style={{ borderColor: teamColor, backgroundColor: `${teamColor}15` }}>
                <p className="text-gray-400 text-sm mb-1">{d.name}</p>
                <p className="text-4xl font-bold mb-1" style={{ color: teamColor }}>
                  {result.retired ? 'DNF' : `P${result.finishPosition}`}
                </p>
                <p className="text-xs mb-3">
                  <span className="text-gray-500">P{startPos} → </span>
                  {result.retired ? (
                    <span className="text-red-400">DNF</span>
                  ) : (
                    <span className={posDiff > 0 ? 'text-green-400' : posDiff < 0 ? 'text-red-400' : 'text-gray-400'}>
                      P{result.finishPosition} {posDiff > 0 ? `▲${posDiff}` : posDiff < 0 ? `▼${Math.abs(posDiff)}` : '→'}
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-gray-500 text-xs">포인트</p>
                    <p className="text-yellow-400 font-bold">{result.points}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">피트스톱</p>
                    <p className="text-white font-bold">{result.pitStops}회</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">부품 손상</p>
                    <p className="text-red-400 text-xs font-bold">
                      ${(rs.totalPartsDamage / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">페널티</p>
                    <p className="text-orange-400 text-xs font-bold">
                      {result.penaltySeconds > 0 ? `+${result.penaltySeconds}s` : '-'}
                    </p>
                  </div>
                </div>
                {result.fastestLap && <p className="text-purple-400 text-xs mt-2">🟣 패스티스트 랩</p>}
              </div>
            )
          })}
        </div>

        {/* 팀 합산 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
          <p className="font-bold mb-3">팀 합산</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-500 text-xs">총 포인트</p>
              <p className="text-yellow-400 font-bold text-xl">
                {(getPlayerResult(raceState1, myDrivers[0]?.id)?.points || 0) +
                 (getPlayerResult(raceState2, myDrivers[1]?.id)?.points || 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">총 부품 손상</p>
              <p className="text-red-400 font-bold">
                ${((raceState1.totalPartsDamage + raceState2.totalPartsDamage) / 1000000).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">라이선스 포인트</p>
              <p className="text-orange-400 font-bold">
                +{raceState1.totalLicensePoints + raceState2.totalLicensePoints}
              </p>
            </div>
          </div>
        </div>

        {/* TOP 10 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
          <p className="font-bold mb-3">전체 결과 TOP 10</p>
          <div className="flex flex-col gap-1">
            {[...raceState1.driverPositions]
              .sort((a, b) => a.finishPosition - b.finishPosition)
              .slice(0, 10)
              .map((d) => {
                const isMyDriver = myDrivers.some(md => md.id === d.driverId)
                return (
                  <div key={d.driverId}
                    className={`flex justify-between items-center py-2 px-3 rounded-lg ${isMyDriver ? 'bg-gray-800' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-6 text-sm">P{d.finishPosition}</span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.teamColor }} />
                      <span className={`text-sm ${isMyDriver ? 'font-bold' : 'text-gray-300'}`}>
                        {d.driverName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.fastestLap && <span className="text-purple-400 text-xs">🟣</span>}
                      <span className="text-yellow-400 text-sm font-bold">{d.points}pts</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* 레이스 로그 */}
        {eventLog.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
            <p className="font-bold mb-3 text-sm">📋 레이스 로그</p>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {eventLog.map((log, i) => (
                <p key={i} className="text-gray-400 text-xs">{log}</p>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onFinish}
          className="w-full py-3 rounded-xl font-bold text-black"
          style={{ backgroundColor: teamColor }}
        >
          레이스 완료 & 저장 →
        </button>
      </div>
    </main>
  )
}