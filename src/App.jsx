import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { 
  LayoutDashboard, DoorOpen, Settings, ScrollText, 
  Search, Activity, Zap, AlertTriangle, CheckCircle2, LogOut, Save, Plus, Trash2, ShieldAlert,
  Cpu, Radio, Server, Monitor, TrendingUp, FileText, Printer, Calendar
} from 'lucide-react';

const TARIF_PLN_PER_KWH = 1444.70; // Tarif resmi PLN Golongan B-2 / R-1 (Rp 1.444,70 / kWh)

const initialRuanganData = [
  { id: 1, nama: 'Ruang Rapat A', volt: 220, amp: 5.2, watt: 1144 },
  { id: 2, nama: 'Ruang Server', volt: 221, amp: 15.5, watt: 3425 },
  { id: 3, nama: 'Pantry', volt: 219, amp: 2.1, watt: 459 },
  { id: 4, nama: 'Ruang Kerja Lt. 1', volt: 220, amp: 8.4, watt: 1848 },
];

const movingAverageData = [
  { time: '08:00', watt: 1200, status: 'Normal' },
  { time: '10:00', watt: 1800, status: 'Normal' },
  { time: '12:00', watt: 3425, status: 'Anomali' },
  { time: '14:00', watt: 2200, status: 'Normal' },
  { time: '16:00', watt: 1500, status: 'Normal' },
  { time: '18:00', watt: 800, status: 'Normal' },
];

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};

const getRealTimeLaporanBulanan = () => {
  const date = new Date();
  const result = [];
  const presets = [
    { kwh: 980, anomaliCount: 2, status: 'Aktif' },
    { kwh: 1420, anomaliCount: 5, status: 'Selesai' },
    { kwh: 1280, anomaliCount: 1, status: 'Selesai' },
    { kwh: 1350, anomaliCount: 3, status: 'Selesai' },
  ];

  for (let i = 0; i < 4; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const namaBulan = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const isCurrentMonth = i === 0;
    const kwh = presets[i].kwh;
    
    // Perhitungan otomatis berdasarkan tarif PLN per kWh
    const biayaHitung = kwh * TARIF_PLN_PER_KWH;

    result.push({
      bulan: isCurrentMonth ? `${namaBulan} (Berjalan)` : namaBulan,
      kwh: kwh,
      anomaliCount: presets[i].anomaliCount,
      estimasiBiaya: formatRupiah(biayaHitung),
      status: isCurrentMonth ? 'Aktif' : 'Selesai'
    });
  }
  return result;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [thresholdWatt, setThresholdWatt] = useState(3000); 
  const [inputThreshold, setInputThreshold] = useState('3000'); 
  const [saveNotification, setSaveNotification] = useState('');

  const [ruanganList] = useState(initialRuanganData);
  const dataLaporanBulanan = getRealTimeLaporanBulanan();

  const [logData, setLogData] = useState([
    { id: 1, waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), sensor: 'Sistem', pesan: 'Sistem Monitoring Energi diaktifkan', tipe: 'info' },
    { id: 2, waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), sensor: 'Peringatan Daya', pesan: 'Ruang Server melebihi ambang awal 3000W', tipe: 'warning' }
  ]);

  const [whyList, setWhyList] = useState([
    { id: 1, t: 'Mengapa terjadi lonjakan daya di Ruang Server?', j: 'AC Cadangan dan server tambahan menyala secara bersamaan.' },
    { id: 2, t: 'Mengapa AC Cadangan menyala otomatis?', j: 'Suhu ruangan terdeteksi melebihi batas 25°C.' }
  ]);
  const [isAddingWhy, setIsAddingWhy] = useState(false);
  const [newTanya, setNewTanya] = useState('');
  const [newJawab, setNewJawab] = useState('');

  const addLog = (pesan, tipe) => {
    const newLog = {
      id: Date.now(),
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sensor: 'Admin (Sistem)',
      pesan,
      tipe
    };
    setLogData(prev => [newLog, ...prev]);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError('');
      addLog('Admin berhasil login ke sistem', 'success');
    } else {
      setLoginError('Username atau Password salah!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setActiveTab('dashboard');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const parsedVal = Number(inputThreshold);
    if (!inputThreshold || isNaN(parsedVal) || parsedVal <= 0) {
      setSaveNotification('Harap masukkan angka daya yang valid!');
      setTimeout(() => setSaveNotification(''), 3000);
      return;
    }

    setThresholdWatt(parsedVal);
    addLog(`Batas peringatan daya dinamis diperbarui ke ${parsedVal} Watt`, 'warning');
    setSaveNotification(`Batas daya berhasil diperbarui ke ${parsedVal} W! Seluruh menu telah disesuaikan.`);
    setTimeout(() => setSaveNotification(''), 4000);
  };

  const handleQuickSet = (val) => {
    setInputThreshold(val.toString());
    setThresholdWatt(val);
    addLog(`Batas peringatan daya diperbarui secara cepat ke ${val} Watt`, 'warning');
    setSaveNotification(`Batas daya berhasil diperbarui ke ${val} W!`);
    setTimeout(() => setSaveNotification(''), 4000);
  };

  const handleAddWhy = (e) => {
    e.preventDefault();
    if (!newTanya || !newJawab) return;
    const newItem = { id: Date.now(), t: newTanya, j: newJawab };
    setWhyList([...whyList, newItem]);
    setNewTanya('');
    setNewJawab('');
    setIsAddingWhy(false);
    addLog('Menambahkan item analisis 5-Why baru', 'info');
  };

  const handleDeleteWhy = (id) => {
    setWhyList(whyList.filter(item => item.id !== id));
    addLog('Satu item Analisis 5-Why dihapus', 'info');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const anomalousRooms = ruanganList.filter(r => r.watt > thresholdWatt);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <Activity size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Energy Monitor</h2>
          <p className="text-sm text-center text-gray-500 mb-6">Masuk untuk mengelola sistem pemantauan daya</p>
          
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm mb-4 text-center font-medium">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                placeholder="Masukkan username" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                placeholder="Masukkan password" 
                required 
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition duration-200">
              Masuk ke Dashboard
            </button>
          </form>
          <p className="text-xs text-center text-gray-400 mt-6">Default Login: admin / admin123</p>
        </div>
      </div>
    );
  }

  const maxWattValue = Math.max(...movingAverageData.map(d => d.watt));
  const avgWattValue = Math.round(movingAverageData.reduce((acc, curr) => acc + curr.watt, 0) / movingAverageData.length);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-gray-800">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-100 flex flex-col z-20 print:hidden">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/30">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-tight">Energy Monitor</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Gedung Pintar</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'ruangan', icon: DoorOpen, label: 'Daftar Ruangan' },
            { id: 'investigasi', icon: Search, label: 'Investigasi Anomali' },
            { id: 'laporan-bulanan', icon: FileText, label: 'Laporan Bulanan' },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Konfigurasi</p>
            <button 
              onClick={() => setActiveTab('cara-kerja')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'cara-kerja' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Cpu size={19} />
              <span>Cara Kerja Alat</span>
            </button>
            <button 
              onClick={() => setActiveTab('pengaturan')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'pengaturan' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Settings size={19} />
              <span>Pengaturan Sensor</span>
            </button>
            <button 
              onClick={() => setActiveTab('log')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'log' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <ScrollText size={19} />
              <span>Log Sistem</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700">Administrator</p>
                <p className="text-[10px] text-gray-400">admin@gedung.com</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 p-1" title="Keluar">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center z-10 print:hidden">
          <div>
            <h2 className="text-xl font-bold capitalize text-gray-800">{activeTab.replace('-', ' ')}</h2>
            <p className="text-xs text-gray-400">Sistem Monitoring & Deteksi Anomali Pemakaian Daya</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Batas Sistem: {thresholdWatt} Watt
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            
            {/* TAB DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Zap size={26} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Daya Harian</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">45.2 <span className="text-base font-normal text-gray-500">kWh</span></p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${anomalousRooms.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      <AlertTriangle size={26} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ruangan Anomali (&gt;{thresholdWatt}W)</p>
                      <p className={`text-2xl font-bold mt-1 ${anomalousRooms.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {anomalousRooms.length} <span className="text-base font-normal text-gray-500">Ruangan</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={26} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status Ambang Daya</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{thresholdWatt} <span className="text-base font-normal text-gray-500">Watt</span></p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" size={20} />
                        Grafik Pemantaun Daya Gedung Real-Time
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">Membandingkan tren beban daya listrik terhadap batas maksimum aman</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-center">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Rata-Rata</span>
                        <span className="text-sm font-bold text-gray-700">{avgWattValue} W</span>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl text-center">
                        <span className="text-[10px] text-amber-600 font-bold block uppercase">Puncak Terdeteksi</span>
                        <span className="text-sm font-bold text-amber-700">{maxWattValue} W</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-4 text-xs font-medium text-gray-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block"></span>
                      <span>Daya Terukur (Watt)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-0 border-b-2 border-dashed border-red-500 inline-block"></span>
                      <span className="text-red-600 font-semibold">Garis Batas Aman ({thresholdWatt} W)</span>
                    </div>
                  </div>

                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={movingAverageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorWatt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} />
                        <YAxis stroke="#94a3b8" tickLine={false} unit=" W" />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const val = payload[0].value;
                              const isOver = val > thresholdWatt;
                              return (
                                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                                  <p className="font-bold border-b border-slate-700 pb-1">Jam {label}</p>
                                  <p className="text-blue-300">Daya Listrik: <span className="font-bold text-white text-sm">{val} Watt</span></p>
                                  <p className={`font-semibold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
                                    Status: {isOver ? '⚠️ Melebihi Batas Aman!' : '✅ Normal'}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <ReferenceLine 
                          y={thresholdWatt} 
                          stroke="#ef4444" 
                          strokeDasharray="5 5" 
                          strokeWidth={2}
                          label={{ value: `Batas ${thresholdWatt}W`, fill: '#ef4444', position: 'top', fontSize: 12, fontWeight: 'bold' }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="watt" 
                          stroke="#2563eb" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorWatt)" 
                          dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB DAFTAR RUANGAN */}
            {activeTab === 'ruangan' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-500">Menampilkan status pemakaian energi berdasarkan batas aktif <b>{thresholdWatt} W</b></p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ruanganList.map((ruang) => {
                    const isBoros = ruang.watt > thresholdWatt;
                    return (
                      <div key={ruang.id} className={`bg-white p-6 rounded-2xl shadow-sm border transition duration-200 ${isBoros ? 'border-red-300 ring-2 ring-red-500/10' : 'border-gray-100'}`}>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-lg text-gray-800">{ruang.nama}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isBoros ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isBoros ? 'Anomali / Boros' : 'Normal / Hemat'}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tegangan (Volt)</span>
                            <span className="font-semibold text-gray-700">{ruang.volt} V</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Arus (Ampere)</span>
                            <span className="font-semibold text-gray-700">{ruang.amp} A</span>
                          </div>
                          <div className="flex justify-between text-sm pt-3 border-t border-gray-100">
                            <span className="text-gray-600 font-semibold">Daya Aktif</span>
                            <span className={`font-bold text-lg ${isBoros ? 'text-red-600' : 'text-blue-600'}`}>{ruang.watt} W</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB INVESTIGASI ANOMALI */}
            {activeTab === 'investigasi' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  {anomalousRooms.length > 0 ? (
                    anomalousRooms.map(ruang => (
                      <div key={ruang.id} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-2xl shadow-sm flex items-start gap-3">
                        <ShieldAlert className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-bold text-red-800">Peringatan Anomali: Daya Melebihi Batas ({thresholdWatt} W)</h3>
                          <p className="mt-0.5 text-sm text-red-700">
                            Terdeteksi pemakaian daya sebesar <b>{ruang.watt} W</b> pada <b>{ruang.nama}</b>. Disarankan melakukan tindakan pemeriksaan.
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-2xl shadow-sm flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-emerald-800">Sistem Berjalan Aman</h3>
                        <p className="mt-0.5 text-sm text-emerald-700">
                          Tidak ada ruangan yang melebihi batas ambang pemakaian <b>{thresholdWatt} W</b> saat ini.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Analisis Akar Masalah (5-Why Method)</h3>
                      <p className="text-xs text-gray-400">Catatan investigasi akar penyebab lonjakan energi pada ruangan</p>
                    </div>
                    <button 
                      onClick={() => setIsAddingWhy(!isAddingWhy)} 
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition"
                    >
                      <Plus size={16} /> Tambah Pertanyaan
                    </button>
                  </div>

                  {isAddingWhy && (
                    <form onSubmit={handleAddWhy} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Pertanyaan (Why / Mengapa)</label>
                        <input 
                          type="text" 
                          value={newTanya} 
                          onChange={(e) => setNewTanya(e.target.value)} 
                          className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                          placeholder="Contoh: Mengapa AC menyala 24 jam?" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Jawaban / Temuan</label>
                        <input 
                          type="text" 
                          value={newJawab} 
                          onChange={(e) => setNewJawab(e.target.value)} 
                          className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                          placeholder="Contoh: Termostat mengalami kerusakan sensor" 
                          required 
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAddingWhy(false)} className="px-4 py-2 text-sm text-gray-500">Batal</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Simpan Analisis</button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3 pt-2">
                    {whyList.map((item, idx) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-800">
                            <span className="text-blue-600 mr-2">Why #{idx + 1}:</span>{item.t}
                          </p>
                          <p className="text-sm text-gray-600 pl-6 border-l-2 border-blue-200">
                            {item.j}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteWhy(item.id)} 
                          className="text-gray-400 hover:text-red-600 transition p-1"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB LAPORAN BULANAN (DENGAN KALKULASI PERSISI TARIF PLN) */}
            {activeTab === 'laporan-bulanan' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FileText className="text-blue-600" size={22} />
                      Laporan Konsumsi Energi Bulanan
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Estimasi biaya dihitung akurat berdasarkan **Tarif PLN B-2/TR (Rp 1.444,70 / kWh)**
                    </p>
                  </div>
                  <button 
                    onClick={handlePrintPDF} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition shadow-lg shadow-blue-500/20 shrink-0 print:hidden"
                  >
                    <Printer size={18} /> Cetak / Simpan PDF
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Laporan Resmi Sistem Monitoring Energi Gedung</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        Periode Audit: {dataLaporanBulanan[3].bulan.replace(' (Berjalan)', '')} - {dataLaporanBulanan[0].bulan.replace(' (Berjalan)', '')}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      Tarif PLN Rp 1.444,70/kWh
                    </span>
                  </div>

                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Periode Bulan</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Konsumsi Energi</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Jumlah Anomali</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estimasi Biaya Listrik (PLN)</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status Periode</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {dataLaporanBulanan.map((lap, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Calendar size={16} className="text-blue-600" />
                            {lap.bulan}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{lap.kwh} kWh</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-amber-600">
                            {lap.anomaliCount} Kali Lonjakan
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{lap.estimasiBiaya}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                            <span className={`px-2.5 py-1 rounded-full ${lap.status === 'Aktif' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                              {lap.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                  <h4 className="font-bold text-sm text-gray-800">Rincian Formula Perhitungan Biaya:</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Estimasi biaya di atas dihitung dengan mengalikan total pemakaian energi (kWh) dengan tarif dasar PLN non-subsidi golongan bisnis <b>B-2/TR (6.600 VA – 200 kVA)</b> sebesar <b>Rp 1.444,70 / kWh</b>.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CARA KERJA ALAT */}
            {activeTab === 'cara-kerja' && (
              <div className="space-y-6">
                <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                  <div className="max-w-2xl relative z-10 space-y-3">
                    <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-400/30">
                      Arsitektur Fisik & Sistem IoT
                    </span>
                    <h3 className="text-2xl font-bold">Bagaimana Alat Ini Bekerja di Lapangan?</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Sistem pemantauan energi ini menggabungkan perangkat keras (*hardware sensor*), pengirim data nirkabel (*gateway*), dan perangkat lunak (*web dashboard*) untuk mengukur pemakaian listrik secara presisi dan *real-time*.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Diagram Alur Pengambilan Data Listrik</h3>
                  <p className="text-xs text-gray-400 mb-6">4 Tahapan dari aliran arus listrik hingga menjadi grafik di layar monitor Anda</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                          <Zap size={22} />
                        </div>
                        <h4 className="font-bold text-sm text-gray-800">1. Sensor Listrik (CT & ZMPT)</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Sensor <b>CT (Current Transformer)</b> dijepitkan pada kabel fasa di panel untuk mengukur Arus (I), dan modul <b>ZMPT101B</b> mengukur Tegangan (V).
                        </p>
                      </div>
                      <div className="text-[10px] font-semibold text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-md text-center">
                        Pencegat Arus Tanpa Potong Kabel
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Cpu size={22} />
                        </div>
                        <h4 className="font-bold text-sm text-gray-800">2. Mikrokontroler (ESP32/PZEM)</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Mikrokontroler mengolah sinyal analog sensor menjadi variabel listrik nyata:
                          <br /><code className="text-blue-600 font-bold block mt-1">P = V x I x Cos φ</code>
                          <code className="text-emerald-600 font-bold block mt-0.5">I = P / (V x Cos φ)</code>
                        </p>
                      </div>
                      <div className="text-[10px] font-semibold text-blue-700 bg-blue-100/60 px-2.5 py-1 rounded-md text-center">
                        Kalkulasi Arus (A) & Daya (W)
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                          <Radio size={22} />
                        </div>
                        <h4 className="font-bold text-sm text-gray-800">3. Transmisi IoT (MQTT / Wi-Fi)</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Data hasil perhitungan daya (Watt) dikirim setiap 1–5 detik melalui jaringan Wi-Fi gedung / protokol MQTT ke Cloud Server.
                        </p>
                      </div>
                      <div className="text-[10px] font-semibold text-purple-700 bg-purple-100/60 px-2.5 py-1 rounded-md text-center">
                        Pengiriman Nirkabel Real-Time
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          <Monitor size={22} />
                        </div>
                        <h4 className="font-bold text-sm text-gray-800">4. Web Dashboard & Alarm</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Aplikasi Web menerima data, menampilkan grafik tren, mengumpulkan akumulasi kWh harian, serta memicu deteksi anomali.
                        </p>
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-md text-center">
                        Visualisasi & Deteksi Anomali
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <Cpu className="text-blue-600" size={20} />
                    Penjelasan Variabel Rumus Listrik Mikrokontroler
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <p className="font-bold text-gray-800 text-sm">V = Voltage / Tegangan (Volt)</p>
                      <p><b>Artinya:</b> Dorongan atau tekanan listrik dari PLN.</p>
                      <p className="text-blue-600 font-medium"><b>Contoh:</b> Standar listrik PLN di Indonesia adalah 220 Volt.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <p className="font-bold text-gray-800 text-sm">I = Intensity / Arus Listrik (Ampere)</p>
                      <p><b>Artinya:</b> Jumlah beban aliran listrik yang disedot perangkat elektronik.</p>
                      <p className="text-blue-600 font-medium"><b>Contoh:</b> AC menyala menyedot arus sekitar 3,8 Ampere.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <p className="font-bold text-gray-800 text-sm">P = Power / Daya Listrik (Watt)</p>
                      <p><b>Artinya:</b> Konsumsi kekuatan listrik nyata yang sedang terpakai.</p>
                      <p className="text-blue-600 font-medium"><b>Contoh:</b> 220V x 5A x 0,9 = 990 Watt.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <p className="font-bold text-gray-800 text-sm">Cos φ (Cos Phi) = Faktor Daya (0,1 - 1,0)</p>
                      <p><b>Artinya:</b> Efisiensi pemakaian listrik (bernilai antara 0,1 hingga 1,0).</p>
                      <p className="text-blue-600 font-medium"><b>Contoh:</b> Lampu = 1,0 (sangat efisien), Mesin AC = 0,8.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <Zap className="text-amber-500" size={20} />
                      Komponen Perangkat Keras Utama
                    </h3>
                    <ul className="space-y-3 text-xs text-gray-600">
                      <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <strong className="text-gray-800 block mb-0.5">1. CT Clamp (Non-Invasive Current Transformer)</strong>
                        Sensor berbentuk klem yang melingkari kabel utama tanpa harus mengupas isolasi kabel. Bekas induksi medan magnet diubah menjadi data Ampere.
                      </li>
                      <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <strong className="text-gray-800 block mb-0.5">2. Modul PZEM-004T</strong>
                        Modul khusus pengukur parameter listrik yang akurat menghitung Tegangan (V), Arus (A), Daya Aktif (W), dan Energi Kumulatif (kWh).
                      </li>
                      <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <strong className="text-gray-800 block mb-0.5">3. ESP32 Wi-Fi / Ethernet Module</strong>
                        Otak pemroses mikro yang membaca data dari PZEM dan mengirimkannya ke database melalui koneksi jaringan gedung.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <Server className="text-blue-500" size={20} />
                      Cara Perhitungan Anomali & Kumulatif
                    </h3>
                    <ul className="space-y-3 text-xs text-gray-600">
                      <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <strong className="text-gray-800 block mb-0.5">Deteksi Ambang Batas Diberlakukan</strong>
                        Sistem membandingkan nilai Watt riil tiap detik dari sensor dengan parameter <code className="text-blue-600 font-bold">{thresholdWatt} Watt</code> di Pengaturan.
                      </li>
                      <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <strong className="text-gray-800 block mb-0.5">Perhitungan kWh Harian (Integrasi Waktu)</strong>
                        Jika daya terukur konstan di <code className="text-blue-600 font-bold">1000 Watt (1 kW)</code> selama <code className="text-blue-600 font-bold">1 jam</code>, maka alat mencatat energi sebesar <code className="text-blue-600 font-bold">1 kWh</code>. Total 45.2 kWh di dashboard adalah hasil penjumlahan seluruh titik sensor harian.
                      </li>
                      <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <strong className="text-gray-800 block mb-0.5">Pemicu Otomatis Notifikasi</strong>
                        Saat daya terukur melewahi ambang batas, server otomatis menyimpan log anomali dan mengirim pesan alert di menu Investigasi.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB PENGATURAN SENSOR */}
            {activeTab === 'pengaturan' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Pengaturan Batas Daya Sensor (Threshold)</h3>
                  <p className="text-sm text-gray-500 mb-6">Ubah ambang batas daya maksimum di bawah ini. Anda dapat mengetik angka ribuan secara langsung tanpa terputus, atau memilih preset cepat dengan 1 kali klik.</p>

                  {saveNotification && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <span>{saveNotification}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Batas Daya Maksimum (Watt)</label>
                      <div className="flex gap-3">
                        <input 
                          type="number" 
                          value={inputThreshold} 
                          onChange={(e) => setInputThreshold(e.target.value)} 
                          className="flex-1 rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-800 text-lg" 
                          placeholder="Masukkan angka (contoh: 3000)"
                          required
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-500/20 shrink-0">
                          <Save size={18}/> Simpan
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pilih Cepat (1 Klik Langsung Aktif):</label>
                      <div className="flex flex-wrap gap-2">
                        {[1500, 2000, 3000, 4000, 5000].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleQuickSet(val)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                              thresholdWatt === val 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                                : 'bg-slate-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {val} W
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-gray-400">
                      *Batas daya aktif saat ini: <b>{thresholdWatt} Watt</b>.
                    </p>
                  </form>
                </div>
              </div>
            )}

            {/* TAB LOG SISTEM */}
            {activeTab === 'log' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">Log Aktivitas & Audit Sistem</h3>
                  <p className="text-xs text-gray-400">Riwayat aktivitas pengubahan pengaturan dan peringatan otomatis sistem</p>
                </div>
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Waktu</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Aktor / Sensor</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Aktivitas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {logData.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{log.waktu}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{log.sensor}</td>
                        <td className={`px-6 py-4 text-sm font-medium ${
                          log.tipe === 'warning' ? 'text-amber-600' : log.tipe === 'success' ? 'text-emerald-600' : 'text-blue-600'
                        }`}>
                          {log.pesan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}