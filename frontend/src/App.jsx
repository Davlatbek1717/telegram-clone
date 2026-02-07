import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Search from './pages/Search'
import Settings from './pages/Settings'
import PrivateRoute from './components/PrivateRoute'

function App() {
  const token = localStorage.getItem('token')

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/chat" replace /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/chat" replace /> : <Register />} />
        
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/chat/:chatId" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        
        <Route path="/" element={<Navigate to={token ? "/chat" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
