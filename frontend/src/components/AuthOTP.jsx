import React, {useState} from 'react'
import { api, setAuthToken } from '../api'

export default function AuthOTP({onAuthenticated}){
  const [id, setId] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(0)
  const [devOtp, setDevOtp] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function requestOtp(){
    if (!id.trim()) {
      setError('Please enter your email or mobile number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const r = await api.post('/auth/request-otp', { identifier: id.trim() })
      setDevOtp(r.data.dev_otp)
      setStep(1)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function verify(){
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const r = await api.post('/auth/verify-otp', { identifier: id.trim(), otp: otp.trim() })
      const token = r.data.access_token
      setAuthToken(token)
      onAuthenticated(token)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to StockScout
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AI-powered stock analysis platform
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {step === 0 ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                  Email or Mobile Number
                </label>
                <div className="mt-1">
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder="Enter your email or mobile number"
                    value={id}
                    onChange={e => setId(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    onKeyPress={e => e.key === 'Enter' && requestOtp()}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  We'll send you a verification code
                </p>
              </div>

              <div>
                <button
                  onClick={requestOtp}
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-lg tracking-widest"
                    maxLength="6"
                    onKeyPress={e => e.key === 'Enter' && verify()}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Code sent to {id}
                </p>
              </div>

              {devOtp && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Development Mode:</strong> Use code <span className="font-mono font-bold">{devOtp}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {setStep(0); setOtp(''); setError('');}}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  onClick={verify}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
