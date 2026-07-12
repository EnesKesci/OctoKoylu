import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../../pages/HomePage'
import ProfilePage from '../../pages/ProfilePage'
import CreateRoomPage from '../../pages/CreateRoomPage'
import LobbyPage from '../../pages/LobbyPage'
import ModeratorPage from '../../pages/ModeratorPage'
import MyRolePage from '../../pages/MyRolePage'
import JoinRoomPage from '../../pages/JoinRoomPage'
import MobileAppLayout from '../../shared/components/layout/MobileAppLayout'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MobileAppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/rooms/create" element={<CreateRoomPage />} />
          <Route path="/rooms/join" element={<JoinRoomPage />} />
          <Route path="/rooms/:roomCode/lobby" element={<LobbyPage />} />
          <Route path="/rooms/:roomCode/moderator" element={<ModeratorPage />} />
          <Route path="/rooms/:roomCode/my-role" element={<MyRolePage />} />
        </Routes>
      </MobileAppLayout>
    </BrowserRouter>
  )
}
