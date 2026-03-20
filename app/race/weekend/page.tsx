'use client'

import { useState } from 'react'
import { RaceWeekendProvider } from '@/lib/context/RaceWeekendContext'
import FPPage from '@/app/race/fp/page'
import QualifyingPage from '@/app/race/qualifying/page'
import RaceSimPage from '@/app/race/race/page'

type Phase = 'fp' | 'qualifying' | 'race'

function WeekendInner() {
  const [phase, setPhase] = useState<Phase>('fp')

  return (
    <>
      {phase === 'fp' && (
        <FPPage onNext={() => setPhase('qualifying')} />
      )}
      {phase === 'qualifying' && (
        <QualifyingPage
          onNext={() => setPhase('race')}
          onBack={() => setPhase('fp')}
        />
      )}
      {phase === 'race' && (
        <RaceSimPage onBack={() => setPhase('qualifying')} />
      )}
    </>
  )
}

export default function WeekendPage() {
  return (
    <RaceWeekendProvider>
      <WeekendInner />
    </RaceWeekendProvider>
  )
}