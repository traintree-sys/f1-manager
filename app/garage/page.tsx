import { supabase } from '@/lib/db/supabase'

export default async function GaragePage() {
  const { data: cars, error } = await supabase
    .from('cars')
    .select('*, teams(name)')

  const { data: powerUnits } = await supabase
    .from('power_units')
    .select('*')

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold text-red-500 mb-8">🔧 2026 차량 현황</h1>
      <div className="flex flex-col gap-4">
        {cars?.map((car) => {
          const pu = powerUnits?.find((p) => p.id === car.power_unit_id)
          return (
            <div key={car.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{car.teams?.name}</h2>
                <span className="text-gray-400 text-sm bg-gray-800 px-3 py-1 rounded-full">
                  🔋 {pu?.manufacturer}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-xs mb-2 uppercase tracking-widest">차량</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: '에어로', value: car.actual_aerodynamics },
                      { label: '섀시', value: car.actual_chassis },
                      { label: '신뢰성', value: car.actual_reliability },
                      { label: '타이어 관리', value: car.actual_tyre_management },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-16">{stat.label}</span>
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${stat.value}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-bold w-6">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-2 uppercase tracking-widest">파워유닛</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: '출력', value: pu?.actual_power },
                      { label: '배포', value: pu?.actual_deployment },
                      { label: '신뢰성', value: pu?.actual_reliability },
                      { label: '내구성', value: pu?.actual_durability },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-16">{stat.label}</span>
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${stat.value}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-bold w-6">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}