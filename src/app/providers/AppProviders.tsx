import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthProvider from './AuthProvider'
import ProfileBootstrapProvider from './ProfileBootstrapProvider'

const queryClient = new QueryClient()

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileBootstrapProvider>{children}</ProfileBootstrapProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
