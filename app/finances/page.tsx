'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db/supabase'
import { useRouter } from 'next/navigation'

export default function FinancesPage() {
  const router = useRouter()
  const [save, setSave] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [teamColor, setTeamColor] = useState('#ff0000')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const slot = localStorage.getItem('selectedSlot')
    const color = localStorage.getItem('selectedTeamColor') || '#ff0000'
    setTeamColor(color)
    if (!slot) { router.push('/'); return }

    const fetchData = async () => {
      const { data: saveData } = await supabase
        .from('saves').select('*').eq('slot', slot).single()
      if (!saveData) { router.push('/'); return }
      setSave(saveData)

      const { data: logData } = await supabase
        .from('finance_logs').select('*')
        .eq('save_id', saveData.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setLogs(logData || [])

      const { data: driverData } = await supabase
        .from('drivers').select('name, salary')
        .eq('team_id', saveData.team_id)
      setDrivers(driverData || [])

      setLoading(false)
    }
    fetchData()
  }, [router])

  if (loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  const totalSalary = drivers.reduce((sum, d) => sum + d.salary, 0)
  const capUsedPct = Math.min(100, (save?.cap_spent / save?.budget_cap) * 100)
  const totalIncome = (save?.sponsor_annual || 0) + (save?.prize_income || 0) + (save?.pu_income || 0)
  const totalExpense = totalSalary + (save?.total_expense || 0) + (save?.pu_expense || 0) + (save?.pu_dev_cost || 0)
  const projectedBalance = save?.budget + totalIncome - totalExpense

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{ color: teamColor }}>💰 재정</h1>
        <p className="text-gray-400 mb-8">{save?.team_name} · 2026 시즌</p>

        {/* 예산 현황 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">현재 예산</p>
            <p className="text-3xl font-bold text-green-400">${(save?.budget / 1000000).toFixed(1)}M</p>
            <p className="text-gray-500 text-xs mt-1">업그레이드 가용 예산</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">연간 스폰서 수입</p>
            <p className="text-3xl font-bold text-blue-400">${((save?.sponsor_annual || 0) / 1000000).toFixed(0)}M</p>
            <p className="text-gray-500 text-xs mt-1">레이스당 +${((save?.sponsor_annual || 0) / 22 / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">드라이버 연봉 합계</p>
            <p className="text-3xl font-bold text-red-400">-${(totalSalary / 1000000).toFixed(1)}M</p>
            <div className="mt-1">
              {drivers.map(d => (
                <p key={d.name} className="text-gray-500 text-xs">{d.name}: ${(d.salary / 1000000).toFixed(1)}M</p>
              ))}
            </div>
          </div>
        </div>

        {/* 예산 상한선 섹션 */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
          <div className="flex justify-between items-center mb-4">
            <p className="font-bold text-lg">🏁 예산 상한선 (Budget Cap)</p>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${capUsedPct >= 100 ? 'bg-red-900 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
              {capUsedPct >= 100 ? '⚠️ 상한 초과!' : `${capUsedPct.toFixed(1)}% 사용`}
            </span>
          </div>
          <div className="bg-gray-800 rounded-full h-3 mb-2">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${Math.min(100, capUsedPct)}%`,
                backgroundColor: capUsedPct >= 100 ? '#ef4444' : capUsedPct >= 80 ? '#f59e0b' : teamColor
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-4">
            <span>사용: ${((save?.cap_spent || 0) / 1000000).toFixed(1)}M</span>
            <span>상한: ${(save?.budget_cap / 1000000).toFixed(0)}M</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: '차량 개발', value: save?.cap_vehicle_dev, color: teamColor },
              { label: '스태프 인건비', value: save?.cap_staff_cost, color: '#60a5fa' },
              { label: '트랙 활동', value: save?.cap_track_cost, color: '#34d399' },
              { label: '부품/소모품', value: save?.cap_parts_cost, color: '#f59e0b' },
            ].map((item) => (
              <div key={item.label} className="bg-gray-800 rounded-xl p-4">
                <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                <p className="text-white font-bold">${((item.value || 0) / 1000000).toFixed(1)}M</p>
              </div>
            ))}
          </div>

          {/* 상한선 안내 */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-yellow-400 text-xs font-bold mb-1">⚠️ 예산 상한선 규정 안내</p>
            <p className="text-gray-400 text-xs leading-5">
              예산 상한선은 $215M이며, 시즌 종료 후 <span className="text-white">미사용 금액은 이월되지 않습니다.</span> 상한선을 초과할 경우 FIA로부터 페널티를 받을 수 있습니다.
              드라이버 연봉, PU 개발비, 마케팅 비용은 상한선 <span className="text-white">제외 항목</span>입니다.
            </p>
          </div>
        </div>

        {/* 수입/지출 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* 수입 */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-green-400 font-bold text-lg mb-4">📈 수입</p>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">스폰서 수입</span>
              <span className="text-green-400">+${((save?.sponsor_annual || 0) / 1000000).toFixed(0)}M</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">레이스 상금</span>
              <span className="text-green-400">+${((save?.prize_income || 0) / 1000000).toFixed(1)}M</span>
            </div>
            {save?.is_works_team && (
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">PU 공급 수익</span>
                <span className="text-green-400">+${((save?.pu_income || 0) / 1000000).toFixed(0)}M</span>
              </div>
            )}
            <div className="flex justify-between py-2 mt-2">
              <span className="text-white font-bold">총 수입</span>
              <span className="text-green-400 font-bold">+${(totalIncome / 1000000).toFixed(1)}M</span>
            </div>
          </div>

          {/* 지출 */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-red-400 font-bold text-lg mb-4">📉 지출</p>
            {drivers.map((driver) => (
              <div key={driver.name} className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400 text-sm">{driver.name} 연봉</span>
                <span className="text-red-400">-${(driver.salary / 1000000).toFixed(1)}M</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">업그레이드 비용</span>
              <span className="text-red-400">-${((save?.total_expense || 0) / 1000000).toFixed(1)}M</span>
            </div>
            {save?.is_works_team ? (
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">PU 연구개발비</span>
                <span className="text-red-400">-${((save?.pu_dev_cost || 0) / 1000000).toFixed(0)}M</span>
              </div>
            ) : (
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">PU 구매비</span>
                <span className="text-red-400">-${((save?.pu_expense || 0) / 1000000).toFixed(0)}M</span>
              </div>
            )}
            <div className="flex justify-between py-2 mt-2">
              <span className="text-white font-bold">총 지출</span>
              <span className="text-red-400 font-bold">-${(totalExpense / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>

        {/* 시즌 예산 예측 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-8">
          <p className="font-bold text-lg mb-4">📊 시즌 예산 예측</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-500 text-xs mb-1">예상 수입</p>
              <p className="text-green-400 font-bold text-xl">+${(totalIncome / 1000000).toFixed(0)}M</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">예상 지출</p>
              <p className="text-red-400 font-bold text-xl">-${(totalExpense / 1000000).toFixed(0)}M</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">예상 잔액</p>
              <p className={`font-bold text-xl ${projectedBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(projectedBalance / 1000000).toFixed(0)}M
              </p>
            </div>
          </div>
        </div>

        {/* 수입/지출 로그 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="font-bold text-lg mb-4">📋 내역 로그</p>
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">아직 내역이 없어요</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex justify-between items-center py-3 border-b border-gray-800">
                <div>
                  <p className="text-white text-sm">{log.description}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {log.category} · {new Date(log.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <span className={`font-bold ${log.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {log.type === 'income' ? '+' : '-'}${(log.amount / 1000000).toFixed(1)}M
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  )
}