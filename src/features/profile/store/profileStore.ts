import create from 'zustand'
import { persist } from 'zustand/middleware'

type Profile = {
  displayName?: string
  avatarUrl?: string
}

type ProfileState = Profile & {
  setProfile: (p: Profile) => void
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      displayName: undefined,
      avatarUrl: undefined,
      setProfile: (p: Profile) => set((_) => ({ ...p })),
      clearProfile: () => set(() => ({ displayName: undefined, avatarUrl: undefined })),
    }),
    {
      name: 'octokoylu-profile',
    },
  ),
)
