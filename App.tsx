
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MAINTENANCE_DATA, RED_TAG_DATA, SAFETY_ADVICES } from './constants';

const App: React.FC = () => {
  const [realTimeDate, setRealTimeDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [isManualMode, setIsManualMode] = useState(false);
  const dateStripRef = useRef<HTMLDivElement>(null);
  const activeDateRef = useRef<HTMLButtonElement>(null);
  
  // Today's schedule refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  // Next schedule preview refs
  const nextScrollContainerRef = useRef<HTMLDivElement>(null);
  const nextScrollContentRef = useRef<HTMLDivElement>(null);

  // Update real time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTimeDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync selectedDate with realTimeDate if not in manual mode
  useEffect(() => {
    if (!isManualMode) {
      const today = realTimeDate.getDate();
      if (selectedDate !== today) {
        setSelectedDate(today);
      }
    }
  }, [realTimeDate, isManualMode]);

  // Handle manual date reset after 10 seconds of inactivity
  useEffect(() => {
    let resetTimer: number | undefined;
    if (isManualMode) {
      resetTimer = window.setTimeout(() => {
        setIsManualMode(false);
        setSelectedDate(new Date().getDate());
      }, 10000);
    }
    return () => {
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [isManualMode, selectedDate]); // Resets timer on every manual date change

  // Ensure current/selected date is visible in the top strip
  useEffect(() => {
    if (activeDateRef.current && dateStripRef.current) {
      activeDateRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [selectedDate]);

  const activitiesForSelectedDate = useMemo(() => {
    return MAINTENANCE_DATA.filter(item => item.date === selectedDate);
  }, [selectedDate]);

  const tomorrowDate = selectedDate === 31 ? 1 : selectedDate + 1;
  const activitiesForTomorrow = useMemo(() => {
    return MAINTENANCE_DATA.filter(item => item.date === tomorrowDate);
  }, [tomorrowDate]);

  const showScrollMain = activitiesForSelectedDate.length >= 3;
  const showScrollNext = activitiesForTomorrow.length >= 2;

  // Handle today's scroll
  useEffect(() => {
    if (scrollContainerRef.current && scrollContentRef.current) {
      const contentH = scrollContentRef.current.scrollHeight;
      const contentSetHeight = showScrollMain ? contentH / 2 : contentH;
      if (showScrollMain) {
        const duration = Math.max(10, contentSetHeight / 35); 
        scrollContentRef.current.style.setProperty('--scroll-duration', `${duration}s`);
        scrollContentRef.current.classList.add('animate-vertical-scroll-down');
      } else {
        scrollContentRef.current.classList.remove('animate-vertical-scroll-down');
        scrollContentRef.current.style.transform = 'none';
      }
    }
  }, [activitiesForSelectedDate, showScrollMain]);

  // Handle next schedule preview scroll
  useEffect(() => {
    if (nextScrollContainerRef.current && nextScrollContentRef.current) {
      const contentH = nextScrollContentRef.current.scrollHeight;
      const contentSetHeight = showScrollNext ? contentH / 2 : contentH;
      if (showScrollNext) {
        const duration = Math.max(8, contentSetHeight / 25); 
        nextScrollContentRef.current.style.setProperty('--scroll-duration', `${duration}s`);
        nextScrollContentRef.current.classList.add('animate-vertical-scroll-down');
      } else {
        nextScrollContentRef.current.classList.remove('animate-vertical-scroll-down');
        nextScrollContentRef.current.style.transform = 'none';
      }
    }
  }, [activitiesForTomorrow, showScrollNext]);

  const handleDateClick = (day: number) => {
    setSelectedDate(day);
    setIsManualMode(true);
  };

  const shiftLeft = () => {
    const prev = selectedDate === 1 ? 31 : selectedDate - 1;
    handleDateClick(prev);
  };

  const shiftRight = () => {
    const next = selectedDate === 31 ? 1 : selectedDate + 1;
    handleDateClick(next);
  };

  const getDayStatus = (day: number) => {
    const statusMap: Record<number, string> = {
      1: "DAY OFF", 2: "DAY OFF", 3: "DAY OFF", 4: "DAY OFF",
      5: "NO SCHEDULE", 6: "NO SCHEDULE", 7: "NO SCHEDULE",
      9: "NO SCHEDULE", 10: "DAY OFF", 11: "DAY OFF",
      16: "DAY OFF", 17: "DAY OFF", 18: "DAY OFF",
      23: "NO SCHEDULE", 24: "DAY OFF", 25: "DAY OFF",
      30: "DAY OFF", 31: "DAY OFF"
    };
    return statusMap[day] || "";
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 bg-white border-b border-blue-100 shadow-sm z-20 h-24">
        {/* Left: Title & Date */}
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-black uppercase tracking-tighter shimmer-text leading-none">
            MAINTENANCE IBARA LIOHO
          </h1>
          <p className="text-sm font-bold text-blue-600 mt-1 uppercase tracking-wider">
            {realTimeDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Center: Date Strip with Navigation Arrows */}
        <div className="flex items-center gap-1 mx-4">
          <button 
            onClick={shiftLeft}
            className="w-8 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 active:scale-90"
            title="Previous Day"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div 
            ref={dateStripRef}
            className="flex gap-1 overflow-x-auto max-w-sm p-2 bg-slate-100 rounded-xl shadow-inner no-scrollbar mx-1"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                ref={selectedDate === day ? activeDateRef : null}
                onClick={() => handleDateClick(day)}
                className={`
                  flex-shrink-0 w-10 h-10 rounded-lg font-bold transition-all duration-300 flex flex-col items-center justify-center
                  ${selectedDate === day 
                    ? 'bg-blue-600 text-white scale-110 shadow-lg ring-2 ring-blue-300' 
                    : 'bg-white text-slate-400 hover:bg-blue-200 hover:text-blue-700 shadow-sm'}
                  ${day === realTimeDate.getDate() ? 'ring-2 ring-offset-1 ring-blue-500 ring-dashed' : ''}
                `}
              >
                <span className="text-[8px] font-normal uppercase leading-none mb-0.5">Tgl</span>
                <span className="text-sm leading-none">{day}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={shiftRight}
            className="w-8 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 active:scale-90"
            title="Next Day"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Right: Clock */}
        <div className="flex-shrink-0 text-right">
          <div className="font-mono text-4xl font-black text-blue-600 leading-none tracking-tighter">
            {realTimeDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 pr-1">
            Real Time Monitoring
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 flex gap-4 p-4 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        
        {/* Left Section: Today's Schedule */}
        <div className="w-[45%] flex flex-col">
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col overflow-hidden relative">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-black text-blue-900 border-l-4 border-blue-600 pl-3 uppercase">
                {selectedDate === realTimeDate.getDate() ? "JADWAL HARI INI" : `JADWAL TGL ${selectedDate}`}
              </h2>
              {isManualMode && (
                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse uppercase">
                  Manual View
                </span>
              )}
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-hidden relative bg-slate-50/50 rounded-xl p-2">
              {activitiesForSelectedDate.length > 0 ? (
                <div ref={scrollContentRef} className="flex flex-col gap-3">
                  {(showScrollMain ? [...activitiesForSelectedDate, ...activitiesForSelectedDate] : activitiesForSelectedDate).map((act, idx) => (
                    <div key={idx} className="bg-white border border-blue-50 p-4 rounded-xl flex flex-col gap-2 shadow-sm border-l-4 border-l-blue-500">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{act.line || "GENERAL"}</span>
                        <span className="text-[10px] font-bold text-slate-400 italic">⏳ {act.duration}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-800 leading-tight uppercase">{act.activity}</h3>
                      <div className="grid grid-cols-2 gap-2 mt-1 border-t border-slate-50 pt-2">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Machine</p>
                          <p className="text-sm font-bold text-slate-700">{act.machine}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">PIC</p>
                          <p className="text-sm font-bold text-slate-700">{act.pic}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <p className="text-3xl font-black text-slate-200 uppercase tracking-widest -rotate-6">
                    {getDayStatus(selectedDate) || "NO SCHEDULE"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Split Preview & Red Tag */}
        <div className="w-[55%] flex flex-col gap-4">
          
          {/* Next Schedule Preview with Auto Scroll */}
          <div className="h-44 bg-white rounded-2xl shadow-lg border border-blue-100 p-4 flex flex-col overflow-hidden">
            <h2 className="text-sm font-black text-blue-800 border-l-2 border-blue-500 pl-2 uppercase mb-3 flex justify-between items-center">
              <span>Next Schedule (Tgl {tomorrowDate})</span>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-tighter">Preview Besok</span>
            </h2>
            <div ref={nextScrollContainerRef} className="flex-1 overflow-hidden relative">
              {activitiesForTomorrow.length > 0 ? (
                <div ref={nextScrollContentRef} className="flex flex-col gap-2">
                  {(showScrollNext ? [...activitiesForTomorrow, ...activitiesForTomorrow] : activitiesForTomorrow).map((act, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex gap-3 items-center">
                      <div className="bg-blue-600 w-1 h-8 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-800 uppercase leading-none mb-1 truncate">{act.activity}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase truncate">{act.machine}</p>
                      </div>
                      <div className="text-right flex-shrink-0 max-w-[150px]">
                        <p className="text-[9px] font-black text-blue-600 uppercase break-words leading-tight">{act.pic}</p>
                        <p className="text-[8px] text-slate-400 italic leading-none mt-1">{act.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase italic">
                  No Activities Scheduled for Tomorrow
                </div>
              )}
            </div>
          </div>

          {/* Red Tag Dashboard */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-blue-100 p-5 flex flex-col overflow-hidden">
            <h2 className="text-md font-black text-red-600 border-l-2 border-red-500 pl-2 uppercase mb-2">
              Resume Red Tag 2025
            </h2>

            {/* Red Tag Stats Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-100 mb-2 no-scrollbar">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 text-[8px] font-black text-slate-400 uppercase">
                  <tr>
                    {RED_TAG_DATA.map(d => <th key={d.month} className="p-1 border-b">{d.month}</th>)}
                  </tr>
                </thead>
                <tbody className="text-[9px] font-black">
                  <tr className="bg-white">
                    {RED_TAG_DATA.map((d, i) => <td key={i} className="p-1 border-b text-blue-600">{d.masuk}</td>)}
                  </tr>
                  <tr className="bg-green-50/20">
                    {RED_TAG_DATA.map((d, i) => <td key={i} className="p-1 border-b text-green-600">{d.selesai}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Red Tag Graph */}
            <div className="flex-1 min-h-0 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RED_TAG_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ fontSize: '8px', border: 'none', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="totalMasuk" name="Masuk" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="totalSelesai" name="Selesai" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Row */}
            <div className="flex gap-2">
               <div className="flex-1 bg-red-50 p-2 rounded-lg text-center border border-red-100">
                 <p className="text-[7px] font-black text-red-400 uppercase">Sisa</p>
                 <p className="text-md font-black text-red-600">{RED_TAG_DATA[RED_TAG_DATA.length - 1].sisa}</p>
               </div>
               <div className="flex-[2] bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                 <p className="text-[7px] font-black text-blue-400 uppercase">Achievement</p>
                 <p className="text-md font-black text-blue-700">{RED_TAG_DATA[RED_TAG_DATA.length - 1].percentage}</p>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Safety Advice */}
      <footer className="h-10 bg-sky-100 flex items-center overflow-hidden border-t border-teal-200 relative">
        <div className="flex-shrink-0 bg-teal-500 text-white px-3 h-full flex items-center font-black text-[10px] uppercase italic z-10 shadow-lg">
          6 Hal Keselamatan
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {SAFETY_ADVICES.concat(SAFETY_ADVICES).map((advice, idx) => (
              <span key={idx} className="inline-block text-teal-800 font-bold text-sm mx-10 uppercase tracking-wide">
                ⚠️ {advice.text}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
