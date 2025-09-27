import React, { useEffect, useState } from "react";

export default function DashboardDetailed({ token }) {
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('sectors');

  useEffect(() => {
    if (token) fetchSectorPerformance();
  }, [token]);

  async function fetchSectorPerformance() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/sectors/performance?months=3`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      setSectors(j.sectors || []);
    } catch (e) {
      setError("Failed to fetch sectors: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function selectSector(sector) {
    setSelectedSector(sector);
    setView('stocks');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/stocks/top5?sector=${sector}&window=7`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      setStocks(j.stocks || []);
    } catch (e) {
      setError("Failed to fetch stocks: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function openDetails(symbol) {
    setSelected(symbol);
    setDetails(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/stocks/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      setDetails(j);
    } catch (e) {
      setError("Failed to fetch details: " + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-2xl font-bold text-gray-900">StockScout</h1>
                  <p className="text-sm text-gray-500">AI-Powered Stock Analysis</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => {setView('sectors'); setSelectedSector(null);}}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'sectors' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Market Overview
              </button>
            </nav>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchSectorPerformance()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {view === 'sectors' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Market Sector Analysis</h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Discover the best performing sectors and find winning stocks
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg text-gray-600">Loading market data...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sectors.map((sector, index) => (
                  <div 
                    key={sector.sector} 
                    className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                    onClick={() => selectSector(sector.sector)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            index === 0 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            index === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                            index === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                            'bg-gradient-to-r from-gray-400 to-gray-600'
                          }`}>
                            <span className="text-white font-bold text-lg">
                              {sector.sector.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900">{sector.sector}</h3>
                            <p className="text-sm text-gray-500">Click to analyze stocks</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">3-Month Performance</span>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sector.performance >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {sector.performance >= 0 ? '↗' : '↘'} {Math.abs(sector.performance).toFixed(1)}%
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                sector.performance >= 0 ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ 
                                width: `${Math.min(Math.abs(sector.performance) * 2, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {index === 0 && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                            🏆 Top Performer
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'stocks' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button 
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => {setView('sectors'); setSelectedSector(null); setStocks([]);}}
                >
                  ← Back to Sectors
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Top Stocks in {selectedSector}</h2>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg text-gray-600">Analyzing stocks...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stocks.map((stock, index) => (
                  <div key={stock.symbol} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{stock.symbol}</h3>
                          <p className="text-sm text-gray-500">{stock.company}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{(stock.probability*100).toFixed(1)}%</div>
                          <p className="text-sm text-gray-500">₹{stock.last_price.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <MetricBar label="Technical" value={stock.breakdown.tech} />
                        <MetricBar label="Flow" value={stock.breakdown.flow} />
                        <MetricBar label="Sentiment" value={stock.breakdown.sentiment} />
                        <MetricBar label="Options" value={stock.breakdown.options} />
                      </div>

                      <div className="flex space-x-2">
                        <button
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          onClick={() => openDetails(stock.symbol)}
                        >
                          View Details
                        </button>
                        <a
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                          href={`https://finance.yahoo.com/quote/${stock.symbol.replace('.NS','')}`} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          Yahoo
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Stock Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selected}</h2>
                  <p className="text-gray-500">Detailed Analysis</p>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {setSelected(null); setDetails(null);}}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {details ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Probability Score</h3>
                      <div className="text-4xl font-bold text-blue-600">{(details.probability*100).toFixed(1)}%</div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Technical Metrics</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {details.metrics.map((metric) => (
                          <div key={metric.name} className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">{metric.name}</div>
                            <div className="text-sm font-semibold">
                              {typeof metric.value === 'number' ? metric.value.toFixed(3) : String(metric.value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Price Chart (30 days)</h3>
                      <MiniSpark data={details.price_history?.map(r=>r[3]) || []} />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
                      <div className="space-y-2">
                        <a className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors" href={`https://finance.yahoo.com/quote/${selected.replace('.NS','')}`} target="_blank" rel="noreferrer">
                          📊 Yahoo Finance
                        </a>
                        <a className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors" href={`https://www.nseindia.com/get-quotes/equity?symbol=${selected.replace('.NS','')}`} target="_blank" rel="noreferrer">
                          📈 NSE Quote
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3">Loading details...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBar({ label, value }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-600">{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500" 
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniSpark({ data }) {
  if (!data || data.length === 0) return <div className="text-sm text-gray-500">No history</div>;
  
  const w = 400, h = 80, pad = 6;
  const min = Math.min(...data), max = Math.max(...data);
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
        <polyline 
          points={points} 
          fill="none" 
          stroke="#3B82F6" 
          strokeWidth="2" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
        />
      </svg>
    </div>
  );
}
