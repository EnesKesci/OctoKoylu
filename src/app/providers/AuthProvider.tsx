import { createContext, useContext, useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/shared/lib/supabase'

// Minimal context value for auth state
interface AuthContextValue {
  session: Session | null
  user: User | null
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Module-scope bootstrap promise to deduplicate anonymous sign-in calls
let bootstrapPromise: Promise<Session> | null = null

async function bootstrapAuth(): Promise<Session> {
  if (bootstrapPromise) return bootstrapPromise

  bootstrapPromise = (async () => {
    try {
      // 1) Try to restore existing session
      const getResp = await supabase.auth.getSession()
      // getResp has shape { data: { session }, error? }
      // Prefer explicit checks and propagate informative errors
      if ((getResp as any).error) {
        const e = (getResp as any).error
        throw new Error(`Failed to restore Supabase session.${e?.message ? ' ' + e.message : ''}`)
      }

      const restoredSession = (getResp as any).data?.session as Session | undefined
      if (restoredSession) return restoredSession

      // 2) No session -> attempt anonymous sign-in
      const signResp = await supabase.auth.signInAnonymously()
      if ((signResp as any).error) {
        const se = (signResp as any).error
        throw new Error(`Failed to sign in anonymously.${se?.message ? ' ' + se.message : ''}`)
      }

      const newSession = (signResp as any).data?.session as Session | undefined
      if (!newSession) {
        throw new Error('Anonymous sign-in completed without a session.')
      }

      return newSession
    } catch (err) {
      // Reset bootstrapPromise so future attempts can retry
      bootstrapPromise = null
      // Normalize error to Error instance
      if (err instanceof Error) throw err
      throw new Error(String(err))
    }
  })()

  return bootstrapPromise
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Bootstrap once, deduplicated across StrictMode double runs
    void (async () => {
      // start fresh
      setIsLoading(true)
      setError(null)

      try {
        const s = await bootstrapAuth()
        if (!mounted) return
        setSession(s)
        setUser(s.user ?? null)
      } catch (err) {
        if (!mounted) return
        const message = err instanceof Error ? err.message : 'An unknown authentication error occurred.'
        setError(message)
        setSession(null)
        setUser(null)
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    })()

    // Listen to auth state changes and keep session/user in sync
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession ?? null)
      setUser(nextSession?.user ?? null)
      if (nextSession) setError(null)
    })

    return () => {
      mounted = false
      try {
        subscription.unsubscribe()
      } catch (_e) {
        // ignore unsubscribe errors during cleanup
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="p-4 text-center">
          <p className="text-base">Bağlantı kuruluyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold">Bağlantı kurulamadı.</h2>
          <p className="mt-2 text-sm text-rose-300">{error}</p>
        </div>
      </div>
    )
  }

  const value: AuthContextValue = {
    session,
    user,
    isLoading,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
