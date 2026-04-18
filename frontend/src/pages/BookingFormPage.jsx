import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resourceService, bookingService } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, Clock, Users, FileText, ArrowLeft, Send, Wrench } from 'lucide-react';

const BookingFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    // Form state - Separate date and time for better UX
    const [bookingDate, setBookingDate] = useState('');
    const [startTimeStr, setStartTimeStr] = useState('');
    const [endTimeStr, setEndTimeStr] = useState('');
    const [purpose, setPurpose] = useState('');
    const [attendees, setAttendees] = useState(1);
    
    // Lecturer specific state
    const [user, setUser] = useState(null);
    const [bookEntireRoom, setBookEntireRoom] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    
    // Student (USER) specific state
    const [lecturerSessions, setLecturerSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== "undefined") {
            setUser(JSON.parse(userStr));
        }
    }, []);

    useEffect(() => {
        const fetchResourceAndSessions = async () => {
            try {
                const response = await resourceService.getById(id);
                setResource(response.data);
                
                // Fetch sessions if it's a regular user
                const userStr = localStorage.getItem('user');
                const parsedUser = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
                
                if (parsedUser?.role === 'USER') {
                    const sessionRes = await bookingService.getLecturerSessions(id);
                    setLecturerSessions(sessionRes.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch resource", error);
                setError("Resource not found");
            } finally {
                setLoading(false);
            }
        };
        fetchResourceAndSessions();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        let start;
        let end;

        if (user?.role === 'USER') {
            const session = lecturerSessions.find(s => s.id.toString() === selectedSessionId.toString());
            if (!session) {
                setError("Please select a valid lecture session to join.");
                setSubmitting(false);
                return;
            }
            start = session.startTime;
            end = session.endTime;
        } else {
            start = `${bookingDate}T${startTimeStr}:00`;
            end = `${bookingDate}T${endTimeStr}:00`;
        }

        let finalPurpose = purpose;
        if (selectedEquipment.length > 0) {
            finalPurpose += `\n\nRequested Additional Equipment: ${selectedEquipment.join(', ')}`;
        }
        const finalAttendees = user?.role === 'LECTURER' ? resource.capacity : parseInt(attendees);

        try {
            await bookingService.create({
                resourceId: parseInt(id),
                startTime: start,
                endTime: end,
                purpose: finalPurpose,
                expectedAttendees: finalAttendees
            });
            navigate('/my-bookings');
        } catch (err) {
            console.error("Booking failed", err);
            setError(err.response?.data?.error || "Booking failed. There might be a scheduling conflict.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
    );

    if (error && !resource) return (
        <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center text-white px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Error</h2>
            <p className="text-white/60 mb-8">{error}</p>
            <button onClick={() => navigate('/resources/catalog')} className="px-6 py-2 bg-blue-600 rounded-xl font-bold">Back to Resources</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0f1c] flex flex-col font-sans">
            <Header />
            
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <button 
                    onClick={() => navigate('/resources/catalog')}
                    className="flex items-center text-blue-300 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Resources
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Resource Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-24">
                            <h3 className="text-2xl font-bold text-white mb-6">Booking Details</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Resource</p>
                                    <p className="text-lg font-semibold text-blue-300">{resource.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Location</p>
                                    <p className="text-white/80">{resource.location}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Max Capacity</p>
                                    <p className="text-white/80">{resource.capacity} persons</p>
                                </div>
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                    <p className="text-xs text-blue-300 font-bold uppercase mb-2">Notice</p>
                                    <p className="text-xs text-blue-200/70 leading-relaxed">
                                        Your request will be sent to the administrator for review. You can track the status in your "My Bookings" page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                            {error && (
                                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {user?.role === 'USER' ? (
                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold text-white/70 flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-indigo-400" /> Available Lecture Sessions
                                        </label>
                                        {lecturerSessions.length === 0 ? (
                                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm">
                                                No upcoming lecture sessions available for this resource. You can only book seats for scheduled lectures.
                                            </div>
                                        ) : (
                                            <select
                                                required
                                                value={selectedSessionId}
                                                onChange={(e) => setSelectedSessionId(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [&_option]:bg-slate-900"
                                            >
                                                <option value="">-- Select a Session to Join --</option>
                                                {lecturerSessions.map(session => {
                                                    const startDt = new Date(session.startTime);
                                                    const endDt = new Date(session.endTime);
                                                    return (
                                                        <option key={session.id} value={session.id}>
                                                            {startDt.toLocaleDateString()} ({startDt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endDt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}) - {session.purpose?.split('\n')[0] || 'Lecture'}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Date */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-white/70 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-indigo-400" /> Date
                                            </label>
                                            <input 
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                            />
                                        </div>

                                        {/* Start Time */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-white/70 flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-indigo-400" /> Start Time
                                            </label>
                                            <input 
                                                type="time"
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                                                value={startTimeStr}
                                                onChange={(e) => setStartTimeStr(e.target.value)}
                                            />
                                        </div>

                                        {/* End Time */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-white/70 flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-indigo-400" /> End Time
                                            </label>
                                            <input 
                                                type="time"
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                                                value={endTimeStr}
                                                onChange={(e) => setEndTimeStr(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Attendees */}
                                {user?.role !== 'LECTURER' && (
                                    <div className="space-y-2 pt-2">
                                        <label className="text-sm font-semibold text-white/70 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-indigo-400" /> Seats Required
                                            </div>
                                        </label>
                                        <input 
                                            type="number"
                                            required
                                            min="1"
                                            max={resource.capacity}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            value={attendees}
                                            onChange={(e) => setAttendees(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Purpose */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-white/70 flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-indigo-400" /> Purpose of Booking
                                    </label>
                                    <textarea 
                                        required
                                        rows="4"
                                        placeholder="Describe why you need this resource..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                    ></textarea>
                                </div>

                                {/* Equipment (Lecturer Only) */}
                                {user?.role === 'LECTURER' && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-white/70 flex items-center">
                                            <Wrench className="w-4 h-4 mr-2 text-indigo-400" /> Additional Requirements
                                        </label>
                                        <div className="flex flex-wrap gap-4">
                                            {['Projector', 'Camera', 'White Board'].map((item) => (
                                                <label key={item} className="flex items-center space-x-2 cursor-pointer bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all">
                                                    <input 
                                                        type="checkbox"
                                                        className="form-checkbox w-4 h-4 text-indigo-500 rounded bg-black/20 border-white/20 focus:ring-0 focus:ring-offset-0"
                                                        checked={selectedEquipment.includes(item)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedEquipment([...selectedEquipment, item]);
                                                            } else {
                                                                setSelectedEquipment(selectedEquipment.filter(i => i !== item));
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm font-medium text-white/80">{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Send Booking Request</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BookingFormPage;
