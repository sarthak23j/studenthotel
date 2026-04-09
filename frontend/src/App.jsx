import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'

import Dashboard from './pages/admin/Dashboard'
import Rooms from './pages/admin/Rooms'
import Requests from './pages/admin/Requests'

import Home from './pages/student/Home'
import Browse from './pages/student/Browse'
import MyRequest from './pages/student/MyRequest'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path='/login' element={<Login />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute role='admin' />}>
            <Route path='/admin/dashboard' element={<Dashboard />} />
            <Route path='/admin/rooms'     element={<Rooms />} />
            <Route path='/admin/requests'  element={<Requests />} />
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute role='student' />}>
            <Route path='/student/home'      element={<Home />} />
            <Route path='/student/browse'    element={<Browse />} />
            <Route path='/student/myrequest' element={<MyRequest />} />
          </Route>

          {/* Fallback */}
          <Route path='*' element={<Navigate to='/login' replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}