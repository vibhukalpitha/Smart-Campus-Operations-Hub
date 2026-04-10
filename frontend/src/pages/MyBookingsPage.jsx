import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, Clock, MapPin, XCircle, CheckCircle, Clock5, AlertCircle, Info } from 'lucide-react';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await bookingService.getAll(); // GET /api/bookings handles user vs admin in backend
            setBookings(response.data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await bookingService.cancel(id);
            // Refresh list
            fetchBookings();
        } catch (error) {
            console.error("Failed to cancel booking", error);
            alert("Error cancelling booking.");
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'CANCELLED': return 'bg-white/5 text-white/40 border-white/10';
            default: return 'bg-white/5 text-white/40 border-white/10';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            case 'REJECTED': return <XCircle className="w-5 h-5 text-red-400" />;
            case 'PENDING': return <Clock5 className="w-5 h-5 text-amber-400" />;
            case 'CANCELLED': return <AlertCircle className="w-5 h-5 text-white/40" />;
            default: return <Info className="w-5 h-5 text-white/40" />;
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] flex flex-col font-sans">
            <Header />
            
            <main className="flex-1 container mx-auto px-4 py-12 relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-bold text-white">My Bookings</h2>
                            <p className="text-white/40 mt-2">Track and manage your resource requests</p>
                        </div>
                        <button 
                            onClick={() => navigate('/resources')}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                        >
                            New Booking
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                            <Calendar className="w-16 h-16 text-white/10 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
                            <p className="text-white/40 mb-8 max-w-sm mx-auto">You haven't made any resource requests yet. Start by browsing available campus resources.</p>
                            <button onClick={() => navigate('/resources')} className="text-blue-400 font-bold hover:underline">Browse Resources</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {bookings.map((booking) => {
                                const start = formatDateTime(booking.startTime);
                                const end = formatDateTime(booking.endTime);
                                return (
                                    <div key={booking.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-32 h-1 bg-gradient-to-r ${
                                            booking.status === 'APPROVED' ? 'from-emerald-500' : 
                                            booking.status === 'REJECTED' ? 'from-red-500' : 
                                            booking.status === 'PENDING' ? 'from-amber-500' : 'from-white/20'
                                        } to-transparent opacity-50`}></div>
                                        
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                            {/* Resource Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    {getStatusIcon(booking.status)}
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyles(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <h4 className="text-2xl font-bold text-white mb-1">{booking.resourceName}</h4>
                                                <p className="text-white/60 text-sm italic line-clamp-1">"{booking.purpose}"</p>
                                            </div>

                                            {/* Time Info */}
                                            <div className="flex flex-col sm:flex-row lg:flex-row gap-8 items-start lg:items-center py-4 lg:py-0 px-0 lg:px-8 border-y lg:border-y-0 lg:border-x border-white/10">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-4">
                                                        <Calendar className="w-5 h-5 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Date</p>
                                                        <p className="text-sm text-white font-medium">{start.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-4">
                                                        <Clock className="w-5 h-5 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Time Slot</p>
                                                        <p className="text-sm text-white font-medium">{start.time} - {end.time}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-4 min-w-[150px] justify-end">
                                                {booking.status === 'PENDING' || booking.status === 'APPROVED' ? (
                                                    <button 
                                                        onClick={() => handleCancel(booking.id)}
                                                        className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold transition-all"
                                                    >
                                                        Cancel Request
                                                    </button>
                                                ) : booking.status === 'REJECTED' && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-red-300/50 uppercase font-bold tracking-widest">Reason</p>
                                                        <p className="text-xs text-red-300/80">{booking.rejectionReason || 'No reason provided'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MyBookingsPage;
