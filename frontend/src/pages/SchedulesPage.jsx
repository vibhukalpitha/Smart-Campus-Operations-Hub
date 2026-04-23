import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar as CalendarIcon, Clock, Filter, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

const SchedulesPage = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col font-sans">
            <Header />
            
            <main className="flex-1 container mx-auto px-4 py-16 relative">
                <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/10 pb-12">
                        <div>
                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 mb-4 tracking-tight">
                                Campus Schedules
                            </h2>
                            <p className="text-blue-200/60 max-w-xl text-lg">
                                Real-time availability tracking for lecture sessions, events, and your private bookings.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all">
                                <Filter className="w-4 h-4 text-blue-400" /> Filter
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                                <CalendarIcon className="w-4 h-4" /> My Agenda
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl">
                        {/* Calendar Header */}
                        <div className="p-8 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <h3 className="text-2xl font-bold">April 2026</h3>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-white/5 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-white/40" /></button>
                                    <button className="p-2 hover:bg-white/5 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-white/40" /></button>
                                </div>
                            </div>
                            
                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md">Week</button>
                                <button className="px-4 py-2 hover:bg-white/5 rounded-lg text-xs font-bold text-white/40 transition-all">Month</button>
                                <button className="px-4 py-2 hover:bg-white/5 rounded-lg text-xs font-bold text-white/40 transition-all">Day</button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="p-8 overflow-x-auto">
                            <div className="min-w-[800px]">
                                <div className="grid grid-cols-8 gap-4 mb-8">
                                    <div className="text-transparent">Time</div>
                                    {days.map(day => (
                                        <div key={day} className="text-center">
                                            <p className="text-[10px] text-indigo-300/50 uppercase tracking-widest font-black mb-1">{day}</p>
                                            <p className="text-xl font-bold">22</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    {hours.map(hour => (
                                        <div key={hour} className="grid grid-cols-8 gap-4 items-center group">
                                            <div className="text-xs font-bold text-white/20 group-hover:text-white/60 transition-colors uppercase py-6">{hour}</div>
                                            {days.map((_, i) => (
                                                <div key={i} className="h-full min-h-[80px] bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all relative">
                                                    {i === 2 && hour === '10:00' && (
                                                        <div className="absolute inset-2 bg-indigo-500/20 border border-indigo-500/50 rounded-xl p-3 animate-in fade-in zoom-in duration-500">
                                                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-tighter truncate">Theory Lecture</p>
                                                            <div className="flex items-center gap-1 text-[9px] text-white/60 mt-1">
                                                                <LayoutGrid className="w-2 h-2" /> Hall A
                                                            </div>
                                                        </div>
                                                    )}
                                                    {i === 4 && hour === '14:00' && (
                                                        <div className="absolute inset-2 bg-blue-500/20 border border-blue-500/50 rounded-xl p-3 animate-in fade-in zoom-in duration-500">
                                                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-tighter truncate">Lab Session</p>
                                                            <div className="flex items-center gap-1 text-[9px] text-white/60 mt-1">
                                                                <Clock className="w-2 h-2" /> 2 Hours
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SchedulesPage;
