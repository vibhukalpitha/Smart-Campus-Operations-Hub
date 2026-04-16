import { useState, useEffect, useRef } from 'react';
import { bookingService } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { Check, X, Clock, User, Package, Calendar, Search, Filter, ShieldCheck, XCircle, LayoutList, CalendarDays } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const AdminBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [viewMode, setViewMode] = useState('list');
    const [reviewModal, setReviewModal] = useState({ isOpen: false, booking: null, status: null, reason: '' });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getAll();
            setBookings(response.data);

            const eventsResponse = await bookingService.getEvents();
            setCalendarEvents(eventsResponse.data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        try {
            await bookingService.updateStatus(reviewModal.booking.id, reviewModal.status, reviewModal.reason);
            setReviewModal({ isOpen: false, booking: null, status: null, reason: '' });
            fetchBookings();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Error updating booking status.");
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            b.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    };

    // Handler for Calendar Event Click
    const handleEventClick = (info) => {
        const eventId = info.event.id;
        const b = bookings.find(b => b.id.toString() === eventId.toString());
        if(b && b.status === 'PENDING') {
            setReviewModal({ isOpen: true, booking: b, status: 'APPROVED', reason: '' });
        } else if (b) {
            alert(`Booking ID: ${b.id}\nUser: ${b.userEmail}\nStatus: ${b.status}\nPurpose: ${b.purpose}`);
        }
    };

    return (
        <AdminLayout activeSection="bookings">
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Booking Management</h2>
                        <p className="text-white/40 mt-1">Review and manage institutional resource requests</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}
                            >
                                <LayoutList className="w-4 h-4" /> List
                            </button>
                            <button 
                                onClick={() => setViewMode('calendar')}
                                className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}
                            >
                                <CalendarDays className="w-4 h-4" /> Calendar
                            </button>
                        </div>

                        {viewMode === 'list' && (
                            <>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input 
                                        type="text"
                                        placeholder="Search email or resource..."
                                        className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-64 transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="relative group">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <select 
                                        className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="ALL" className="bg-[#1e2538]">All Status</option>
                                        <option value="PENDING" className="bg-[#1e2538]">Pending</option>
                                        <option value="APPROVED" className="bg-[#1e2538]">Approved</option>
                                        <option value="REJECTED" className="bg-[#1e2538]">Rejected</option>
                                        <option value="CANCELLED" className="bg-[#1e2538]">Cancelled</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : viewMode === 'list' ? (
                            filteredBookings.length === 0 ? (
                                <div className="text-center py-20 text-white/40 font-medium">
                                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    No bookings found matching your filters.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-widest">
                                                <th className="pb-4 font-semibold pl-4">Resource</th>
                                                <th className="pb-4 font-semibold">User</th>
                                                <th className="pb-4 font-semibold">Time Slot</th>
                                                <th className="pb-4 font-semibold">Status</th>
                                                <th className="pb-4 font-semibold text-right pr-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBookings.map((b) => (
                                                <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                    <td className="py-4 pl-4">
                                                        <div className="font-bold text-white flex items-center">
                                                            <Package className="w-4 h-4 mr-2 text-indigo-400/60" />
                                                            {b.resourceName}
                                                        </div>
                                                        <div className="text-[10px] text-white/40 mt-1 uppercase tracking-tight line-clamp-1">{b.purpose}</div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="text-white/80 text-sm flex items-center">
                                                            <User className="w-3.5 h-3.5 mr-2 text-blue-400" />
                                                            {b.userEmail}
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="text-white/80 text-xs font-medium space-y-1">
                                                            <div className="flex items-center">
                                                                <Calendar className="w-3 h-3 mr-1.5 text-indigo-300" />
                                                                {formatDateTime(b.startTime)}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Clock className="w-3 h-3 mr-1.5 text-indigo-300" />
                                                                {formatDateTime(b.endTime)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                            b.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                                                            b.status === 'REJECTED' ? 'bg-red-500/10 text-red-300 border-red-500/20' :
                                                            b.status === 'PENDING' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                                                            'bg-white/5 text-white/40 border-white/10'
                                                        }`}>
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right pr-4">
                                                        {b.status === 'PENDING' && (
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <button 
                                                                    onClick={() => setReviewModal({ isOpen: true, booking: b, status: 'APPROVED', reason: '' })}
                                                                    className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-all"
                                                                    title="Approve"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => setReviewModal({ isOpen: true, booking: b, status: 'REJECTED', reason: '' })}
                                                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                                                                    title="Reject"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            <div>
                                <style>{`
                                    .fc { color: white; }
                                    .fc .fc-toolbar-title { font-size: 1.5rem; font-weight: bold; }
                                    .fc .fc-button-primary { background-color: #4f46e5; border-color: #4f46e5; border-radius: 0.5rem; text-transform: capitalize; }
                                    .fc .fc-button-primary:not(:disabled):active, .fc .fc-button-primary:not(:disabled).fc-button-active {
                                        background-color: #4338ca; border-color: #4338ca;
                                    }
                                    .fc-theme-standard td, .fc-theme-standard th { border-color: rgba(255,255,255,0.1); }
                                .fc-theme-standard td, .fc-theme-standard th { border-color: rgba(255,255,255,0.1); }
                                `}</style>
                                <p className="mb-4 text-amber-400 text-sm">Click on a PENDING event to Approve or Reject it.</p>
                                <FullCalendar
                                    plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
                                    initialView="timeGridWeek"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                    }}
                                    events={calendarEvents}
                                    height="auto"
                                    slotMinTime="07:00:00"
                                    slotMaxTime="21:00:00"
                                    expandRows={true}
                                    eventClick={handleEventClick}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {reviewModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setReviewModal({ ...reviewModal, isOpen: false })}></div>
                    <div className="relative bg-[#1e2538] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
                        <div className={`h-2 w-full ${reviewModal.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {reviewModal.status === 'APPROVED' ? 'Approve Booking' : 'Reject Booking'}
                            </h3>
                            <p className="text-white/60 text-sm mb-6">
                                Reviewing request for <span className="text-white font-bold">{reviewModal.booking.resourceName}</span> by {reviewModal.booking.userEmail}.
                            </p>

                            <div className="space-y-4 mb-8">
                                <label className="text-sm font-semibold text-white/70 block">
                                    {reviewModal.status === 'APPROVED' ? 'Approval Note (Optional)' : 'Rejection Reason'}
                                </label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-32 text-sm"
                                    placeholder={reviewModal.status === 'APPROVED' ? "Any instructions for the user..." : "Explain why this request is being rejected..."}
                                    value={reviewModal.reason}
                                    onChange={(e) => setReviewModal({ ...reviewModal, reason: e.target.value })}
                                    required={reviewModal.status === 'REJECTED'}
                                ></textarea>
                            </div>

                            <div className="flex space-x-4">
                                <button 
                                    onClick={() => setReviewModal({ ...reviewModal, isOpen: false })}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdateStatus}
                                    disabled={reviewModal.status === 'REJECTED' && !reviewModal.reason}
                                    className={`flex-1 py-3 ${
                                        reviewModal.status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                                    } text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50`}
                                >
                                    {reviewModal.status === 'APPROVED' ? <ShieldCheck className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    <span>Confirm {reviewModal.status}</span>
                                </button>
                                {reviewModal.status === 'APPROVED' && (
                                    <button
                                        onClick={() => setReviewModal({ ...reviewModal, status: 'REJECTED' })}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 shadow-red-500/20 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        <span>Reject Instead</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminBookingsPage;
