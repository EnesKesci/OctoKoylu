import { Navigate, useNavigate } from 'react-router-dom'
import { useProfileStore, selectHasProfile } from '../features/profile/store/profileStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/shared/lib/getInitials'

export default function HomePage() {
  const displayName = useProfileStore((s) => s.displayName)
  const hasProfile = useProfileStore(selectHasProfile)
  const navigate = useNavigate()

  if (!hasProfile) {
    return <Navigate to="/profile" replace />
  }

  const initials = getInitials(displayName)

  return (
    <main>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">Hoş geldiniz, {displayName}</h1>
            <p className="mt-2 text-slate-300">Hazırsanız bir oda oluşturabilirsiniz.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={() => navigate('/rooms/create')} variant="default">Oda Oluştur</Button>
          <Button onClick={() => navigate('/rooms/join')} variant="default">Odaya Katıl</Button>
          <Button onClick={() => navigate('/profile')} variant="secondary">
            Profili Düzenle
          </Button>
        </div>
      </Card>
    </main>
  )
}
