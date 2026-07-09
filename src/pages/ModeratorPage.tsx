import { useParams } from 'react-router-dom'

export default function ModeratorPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  return (
    <main>
      <h1 className="text-2xl font-semibold">Moderator</h1>
      <p className="mt-2 text-slate-300">Moderator view for room: {roomCode ?? 'unknown'}</p>
    </main>
  )
}
