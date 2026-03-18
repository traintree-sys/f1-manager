import { supabase } from '@/lib/db/supabase'
import TeamSelectClient from '@/components/TeamSelectClient'

export default async function Home() {
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('budget', { ascending: false })

  const { data: saves } = await supabase
    .from('saves')
    .select('*')
    .order('slot')

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-bold text-red-500 mb-4">🏎️ F1 Manager</h1>
      <p className="text-gray-400 text-xl mb-12">팀을 선택하고 시즌을 시작하세요</p>
      <TeamSelectClient teams={teams || []} saves={saves || []} />
    </main>
  )
}