import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import { GuestProtectedRoute, AuthProtectedRoute } from './ProtectedRoute'
import Dashboard from '../pages/Dashboard'
import RiwayatSetoran from '../pages/RiwayatSetoran'

export default function Router() {
    return (
        <Routes>
            <Route element={<GuestProtectedRoute />}>
                <Route path="/masuk" element={<Login />} />
            </Route>

            <Route element={<AuthProtectedRoute />}>
                <Route path="/beranda" element={<Dashboard />} />
                <Route path="/riwayat-setoran" element={<RiwayatSetoran />} />
            </Route>
        </Routes>
    )
}
