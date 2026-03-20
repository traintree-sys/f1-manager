import { getTyreCompoundColor, getTyreLife } from '@/lib/simulation/strategy'
import type { TyreCompound } from '@/lib/simulation/qualifying'

interface Props {
  driverName: string
  circuitName: string
  teamColor: string
  onSelect: (tyre: TyreCompound) => void
}

export default function TyreSelectModal({ driverName, circuitName, teamColor, onSelect }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 border-2 w-80" style={{ borderColor: teamColor }}>
        <p className="font-bold text-lg mb-2">🔧 피트스톱</p>
        <p className="text-gray-400 text-sm mb-5">
          {driverName} — 장착할 타이어를 선택하세요
        </p>
        <div className="flex flex-col gap-3">
          {(['소프트', '미디엄', '하드'] as TyreCompound[]).map(tyre => (
            <button
              key={tyre}
              onClick={() => onSelect(tyre)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border transition hover:bg-gray-800"
              style={{ borderColor: getTyreCompoundColor(tyre) }}
            >
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: getTyreCompoundColor(tyre) }} />
              <div className="text-left">
                <p className="font-bold" style={{ color: getTyreCompoundColor(tyre) }}>{tyre}</p>
                <p className="text-gray-500 text-xs">예상 수명: {getTyreLife(tyre, circuitName)}랩</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}