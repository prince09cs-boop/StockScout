import React, {useState} from 'react'
import { api, setAuthToken } from '../api'
export default function AuthOTP({onAuthenticated}){
  const [id, setId] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(0)
  const [devOtp, setDevOtp] = useState(null)
  async function requestOtp(){
    const r = await api.post('/auth/request-otp', { identifier: id })
    setDevOtp(r.data.dev_otp)
    setStep(1)
  }
  async function verify(){
    const r = await api.post('/auth/verify-otp', { identifier: id, otp })
    const token = r.data.access_token
    setAuthToken(token)
    onAuthenticated(token)
  }
  return (
    <div className="max-w-md mx-auto p-6 mt-20 bg-white rounded shadow">
      {step===0 ? (
        <>
          <h2 className="text-xl font-semibold">Sign in with Email or Mobile</h2>
          <input placeholder="email or mobile" value={id} onChange={e=>setId(e.target.value)} className="mt-3 p-2 border w-full" />
          <button onClick={requestOtp} className="mt-3 p-2 bg-blue-600 text-white rounded">Request OTP</button>
        </>
      ) : (
        <>
          <h2>Enter OTP</h2>
          <input placeholder="OTP" value={otp} onChange={e=>setOtp(e.target.value)} className="mt-3 p-2 border w-full" />
          <button onClick={verify} className="mt-3 p-2 bg-green-600 text-white rounded">Verify</button>
          {devOtp && <div className="mt-2 text-sm text-gray-500">Dev OTP: {devOtp}</div>}
        </>
      )}
    </div>
  )
}
