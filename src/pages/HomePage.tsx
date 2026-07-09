import { Navigate, Link } from 'react-router-dom'
import { useProfileStore, selectHasProfile } from '../features/profile/store/profileStore'

export default function HomePage() {
  const displayName = useProfileStore((s) => s.displayName)
  const hasProfile = useProfileStore(selectHasProfile)

  if (!hasProfile) {
    return <Navigate to="/profile" replace />
  }

  return (
    <main>
      <h1 className="text-2xl font-semibold">Hoş geldiniz, {displayName}</h1>
      <p className="mt-2 text-slate-300">Hazırsanız bir oda oluşturabilirsiniz.</p>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          to="/rooms/create"
          className="inline-flex justify-center px-4 py-2 rounded-md bg-green-600 text-white"
        >
          Oda Oluştur
        </Link>

        <Link
          to="/profile"
          className="inline-flex justify-center px-4 py-2 rounded-md bg-slate-700 text-slate-100"
        >
          Profili Düzenle
        </Link>
      </div>
    </main>
  )
}
