import { Routes, Route } from 'react-router-dom'
import OnBoarding from '../pages/OnBoarding'
import Auth from '../pages/Auth'
import Home from '../pages/Home'
import Scan from '../pages/Scan'
import Reward from '../pages/Reward'
import Leaderboard from '../pages/Leaderboard'
import Profile from '../pages/Profile'
import RewardHistory from '../pages/RewardHistory'
import ScanHistory from '../pages/ScanHistory'
import AchievementHistory from '../pages/AchievementHistory'
import { AuthProtectedRoute, GuestProtectedRoute } from './ProtectedRoute'
import EditProfile from '../pages/EditProfile'

export default function Router() {
    return (
        <Routes>
            <Route element={<GuestProtectedRoute />}>
                <Route path="/" element={<OnBoarding />} />
                <Route path="/masuk" element={<Auth />} />
            </Route>

            <Route element={<AuthProtectedRoute />}>
                <Route path="/beranda" element={<Home />} />
                <Route path="/reward" element={<Reward />} />
                <Route path="/scan" element={<Scan />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/reward-history" element={<RewardHistory />} />
                <Route path="/scan-history" element={<ScanHistory />} />
                <Route path="/achievement-history" element={<AchievementHistory />} />
            </Route>
        </Routes>
    )
}
