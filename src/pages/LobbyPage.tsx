import React from 'react'
import { useParams } from 'react-router-dom'

export default function LobbyPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  return (
    <main>
      <h1 className="text-2xl font-semibold">Lobby</h1>
      <p className="mt-2 text-slate-300">Room: {roomCode ?? 'unknown'}</p>
    </main>
  )
}
