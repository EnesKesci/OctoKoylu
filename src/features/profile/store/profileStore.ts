import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Profile {
  displayName: string
  avatarUrl?: string
}

export interface ProfileState {
  displayName: string
  avatarUrl?: string
  setProfile: (profile: Profile) => void
  clearProfile: () => void
}

// Selector helper: derive whether a profile exists from displayName
export const selectHasProfile = (s: ProfileState) => s.displayName.trim().length > 0

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      displayName: '',
      avatarUrl: undefined,
      setProfile: (profile: Profile) => {
        const trimmed = profile.displayName.trim()
        set(() => ({ displayName: trimmed, avatarUrl: profile.avatarUrl?.trim() || undefined }))
      },
      clearProfile: () => set(() => ({ displayName: '', avatarUrl: undefined })),
    }),
    {
      name: 'octokoylu-profile',
    },
  ),
)
