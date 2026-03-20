interface Props {
  lights: number
  lightsOut: boolean
  circuitName: string
}

export default function RaceLights({ lights, lightsOut, circuitName }: Props) {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <p className="text-gray-400 text-lg mb-12">{circuitName}</p>
      <div className="flex gap-4 mb-12">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-full border-4 transition-all duration-300"
            style={{
              backgroundColor: lightsOut ? '#1a1a1a' : lights >= i ? '#ff0000' : '#1a1a1a',
              borderColor: lightsOut ? '#333' : lights >= i ? '#ff4444' : '#333',
              boxShadow: !lightsOut && lights >= i ? '0 0 20px #ff0000' : 'none',
            }}
          />
        ))}
      </div>
      <p className="text-gray-400 text-xl">
        {lightsOut
          ? '🏎️ 출발!'
          : lights === 0
          ? '신호등 대기 중...'
          : lights < 5
          ? `${lights} / 5`
          : '소등 대기...'}
      </p>
    </main>
  )
}