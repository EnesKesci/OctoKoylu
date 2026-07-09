import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileForm from '../features/profile/components/ProfileForm'

export default function ProfilePage() {
  const navigate = useNavigate()
  const onSave = useCallback(() => {
    navigate('/', { replace: true })
  }, [navigate])

  return (
    <main>
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="mt-2 text-slate-300">Set up your profile</p>
      <div className="mt-4">
        <ProfileForm onSave={onSave} />
      </div>
    </main>
  )
}
