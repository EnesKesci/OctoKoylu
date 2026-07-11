import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Profile {
  displayName: string
}

export interface ProfileState {
  displayName: string
  setProfile: (profile: Profile) => void
  clearProfile: () => void
}

// Selector helper: derive whether a profile exists from displayName
export const selectHasProfile = (s: ProfileState) => s.displayName.trim().length > 0

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      displayName: '',
      setProfile: (profile: Profile) => {
        const trimmed = profile.displayName.trim()
        set(() => ({ displayName: trimmed }))
      },
      clearProfile: () => set(() => ({ displayName: '' })),
    }),
    {
      name: 'octokoylu-profile',
      version: 1,
      partialize: (state) => ({ displayName: state.displayName }),
      migrate: (persistedState) => {
        // persistedState may be anything (unknown) from localStorage — handle safely
        try {
          if (!persistedState || typeof persistedState !== 'object') {
            return { displayName: '' }
          }

          const p = persistedState as Record<string, unknown>
          const maybeDisplayName = p.displayName

          if (typeof maybeDisplayName === 'string') {
            return { displayName: maybeDisplayName.trim() }
          }

          return { displayName: '' }
        } catch (e) {
          // In case of any unexpected runtime issue, fall back to empty displayName
          return { displayName: '' }
        }
      },
    },
  ),
)
