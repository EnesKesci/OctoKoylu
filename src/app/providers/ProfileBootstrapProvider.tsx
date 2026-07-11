import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { useAuth } from './AuthProvider'
import { getProfile } from '@/features/profile/api/profileApi'
import type { Profile as ApiProfile } from '@/features/profile/api/profileApi'
import { useProfileStore } from '@/features/profile/store/profileStore'

// Simple dedupe map per userId to avoid parallel identical requests
const profileBootstrapPromises = new Map<string, Promise<ApiProfile | null>>()

function bootstrapProfile(userId: string): Promise<ApiProfile | null> {
  const existing = profileBootstrapPromises.get(userId)
  if (existing) return existing

  const requestPromise = getProfile(userId)

  // store the in-flight promise so other callers can reuse it
  profileBootstrapPromises.set(userId, requestPromise)

  // ensure the entry is removed when the promise settles
  const cleanup = () => {
    if (profileBootstrapPromises.get(userId) === requestPromise) {
      profileBootstrapPromises.delete(userId)
    }
  }

  // Use then(cleanup, cleanup) to avoid creating an unhandled rejection from finally
  void requestPromise.then(cleanup, cleanup)

  return requestPromise
}

export default function ProfileBootstrapProvider({ children }: PropsWithChildren) {
  const { user, isLoading: authLoading } = useAuth()
  const setProfile = useProfileStore((s) => s.setProfile)
  const clearProfile = useProfileStore((s) => s.clearProfile)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    // If auth is still loading, wait. AuthProvider handles its own loading UI.
    if (authLoading) return

    const userId = user?.id

    // If no userId available after auth, show an error
    if (!userId) {
      setError('Authenticated user is unavailable.')
      setIsLoading(false)
      // Ensure local persisted profile is cleared to avoid stale UI
      clearProfile()
      return
    }

    setIsLoading(true)
    setError(null)

    void (async () => {
      try {
        const profile = await bootstrapProfile(userId)
        if (!mounted) return
        if (profile) {
          // Update only displayName in Zustand store as required
          setProfile({ displayName: profile.displayName })
        } else {
          // No profile on server — clear local persisted profile
          clearProfile()
        }
      } catch (err) {
        if (!mounted) return
        const message = err instanceof Error ? err.message : 'An unknown error occurred while loading profile.'
        setError(message)
        // Clear persisted profile on error to avoid stale state
        clearProfile()
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [authLoading, user?.id, setProfile, clearProfile])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="p-4 text-center">
          <p className="text-base">Profil yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold">Profil yüklenemedi.</h2>
          <p className="mt-2 text-sm text-rose-300">{error}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
