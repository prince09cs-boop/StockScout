import React, {useState} from 'react'
import DashboardDetailed from './components/Dashboard'
import AuthOTP from './components/AuthOTP'
export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  return (
    <div className="min-h-screen bg-gray-50">
      {!token ? <AuthOTP onAuthenticated={(t)=>{localStorage.setItem('token', t); setToken(t)}}/> : <DashboardDetailed token={token} />}
    </div>
  )
}
