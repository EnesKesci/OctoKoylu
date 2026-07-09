import React from 'react'
import { useParams } from 'react-router-dom'

export default function MyRolePage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  return (
    <main>
      <h1 className="text-2xl font-semibold">My Role</h1>
      <p className="mt-2 text-slate-300">Role page for room: {roomCode ?? 'unknown'}</p>
    </main>
  )
}
