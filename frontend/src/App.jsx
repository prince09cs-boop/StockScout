import React, {useState} from 'react'
import AuthOTP from './components/AuthOTP'
import Dashboard from './components/Dashboard'
export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  return (
    <div className="min-h-screen bg-gray-50">
      {!token ? <AuthOTP onAuthenticated={(t)=>{localStorage.setItem('token', t); setToken(t)}}/> : <Dashboard token={token} />}
    </div>
  )
}
