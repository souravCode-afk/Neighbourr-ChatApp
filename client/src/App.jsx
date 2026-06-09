import './App.css'
import {Routes,Route, Navigate}from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import bgImage from './assets/bgImage.svg'
import {Toaster} from "react-hot-toast"
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import MapDashboard from './pages/MapDashboard.jsx'

function App() {
  const {authUser,loading} = useContext(AuthContext)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    )
  }
  return (
    <>
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
        <Toaster/>
        <Routes>
          <Route path='/' element={authUser ? <HomePage/> : <Navigate to="/login"/>}/>
          <Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to="/"/>}/>
          <Route path='/profile' element={authUser? <ProfilePage/> : <Navigate to="/login"/>}/>
          <Route path='/MapDashboard' element={authUser? <MapDashboard/> : <Navigate to="/login"/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App
