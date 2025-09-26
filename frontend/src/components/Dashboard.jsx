import React, {useEffect, useState} from 'react'
import { api, setAuthToken } from '../api'
import StockCard from './StockCard'
export default function Dashboard({token}){
  setAuthToken(token)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  async function load(){
    setLoading(true)
    const r = await api.get('/stocks/top5')
    setList(r.data.stocks)
    setLoading(false)
  }
  useEffect(()=>{ load() }, [])
  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Top 5 Stocks — Next 7–30 days</h1>
        <button onClick={load} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {loading ? <div>Loading...</div> : list.map(s=> <StockCard key={s.symbol} stock={s} />)}
      </div>
    </div>
  )
}
