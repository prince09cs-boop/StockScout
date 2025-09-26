import React from 'react'
export default function StockCard({stock}){
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between">
        <div>
          <div className="text-lg font-semibold">{stock.symbol}</div>
          <div className="text-sm text-gray-500">{stock.company}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">{(stock.probability*100).toFixed(1)}%</div>
          <div className="text-sm text-gray-500">{stock.last_price}</div>
        </div>
      </div>
      <div className="mt-3 text-sm">
        <div>Breakdown:</div>
        {Object.entries(stock.breakdown).map(([k,v])=> (
          <div key={k} className="flex justify-between"><div>{k}</div><div>{(v*100).toFixed(0)}%</div></div>
        ))}
      </div>
    </div>
  )
}
