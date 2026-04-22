import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resourceService, bookingService } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Users, Info, Calendar, Clock3, Filter, CheckCircle, XCircle, X, ArrowLeft, Clock, Send } from 'lucide-react';

const RESOURCE_TYPES = [
    'LECTURE_HALL',
    'LAB',
    'MEETING_ROOM',
    'PROJECTOR',
    'CAMERA',
    'EQUIPMENT',
    'PUBLIC_COMPUTERS',
    'SMART_BOARD',
    'CRICKET',
    'BADMINTON',
];


const ResourceListPage = () => {
    const { type: typeParam } = useParams();
    const lockedType = typeParam && RESOURCE_TYPES.includes(typeParam) ? typeParam : null;
    const isTypeLocked = Boolean(lockedType);

    const [resources, setResources] = useState([]);
    const [occupiedSlots, setOccupiedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [fullSchedule, setFullSchedule] = useState([]);
    const [fetchingSchedule, setFetchingSchedule] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const navigate = useNavigate();

    const userRole = (() => {
        const userStr = localStorage.getItem('user');
        return userStr && userStr !== "undefined" ? JSON.parse(userStr).role : null;
    })();

    // Combined filter states
    const [filters, setFilters] = useState({
        searchTerm: '',
        type: lockedType,
        minCapacity: null,
        location: null,
        status: 'ACTIVE'
    });

    const [sort, setSort] = useState('name,asc');
    const [page, setPage] = useState(0);
    const [pageSize] = useState(9);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const types = RESOURCE_TYPES;

    useEffect(() => {
        setPage(0);
        setFilters(prev => {
            if (prev.type === lockedType) {
                return prev;
            }

            return {
                ...prev,
                type: lockedType
            };
        });
    }, [lockedType]);

    useEffect(() => {
        fetchResources();
    }, [page, filters, lockedType]);

    const handleViewSchedule = async (res) => {
        setSelectedResource(res);
        setShowScheduleModal(true);
        setFetchingSchedule(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await bookingService.getOccupiedSlots(today, 7);
            const filtered = (response.data || []).filter(s => s.resourceId.toString() === res.id.toString());
            setFullSchedule(filtered);
        } catch (err) {
            console.error("Failed to fetch full schedule", err);
        } finally {
            setFetchingSchedule(false);
        }
    };

    const fetchResources = async () => {
        setLoading(true);
        setError(null);
        try {
            if (userRole === 'USER' && !['CRICKET', 'BADMINTON', 'SPORT'].includes(filters.type)) {
                const response = await bookingService.getAllLecturerSessions();
                const sessions = response.data || [];
                
                // Map each session to a card format
                const mappedResources = sessions.map((session, index) => {
                    const startDt = new Date(session.startTime);
                    const endDt = new Date(session.endTime);
                    const dateStr = startDt.toLocaleDateString();
                    
                    return {
                        _uniqueId: `${session.id}_${index}`, // For React key
                        id: session.resourceId, // For routing to /book/:id
                        name: session.purpose ? session.purpose.split('\n')[0] : 'Lecture Session',
                        type: session.resourceType || 'LECTURE_HALL',
                        status: 'ACTIVE',
                        capacity: session.expectedAttendees,
                        location: `${session.resourceName} | ${dateStr}`,
                        availableFrom: session.startTime.split('T')[1].substring(0,5),
                        availableTo: session.endTime.split('T')[1].substring(0,5),
                        availableSeats: session.availableSeats != null ? session.availableSeats : session.expectedAttendees,
                        bookedCount: session.bookedSeats != null ? session.bookedSeats : 0
                    };
                });

                let filtered = mappedResources;
                if (filters.searchTerm) {
                    const term = filters.searchTerm.toLowerCase();
                    filtered = filtered.filter(r => r.name.toLowerCase().includes(term) || r.location.toLowerCase().includes(term));
                }
                if (filters.type) {
                    filtered = filtered.filter(r => r.type === filters.type);
                }
                if (filters.minCapacity) filtered = filtered.filter(r => r.capacity >= parseInt(filters.minCapacity));
                if (filters.location) filtered = filtered.filter(r => r.location.toLowerCase().includes(filters.location.toLowerCase()));

                setTotalElements(filtered.length);
                const pagedContent = filtered.slice(page * pageSize, (page + 1) * pageSize);
                setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
                setResources(pagedContent);

            } else {
                // Original fetching logic for Admin/Lecturer/Tech
                const params = {};
                if (filters.searchTerm) params.name = filters.searchTerm;
                if (filters.type) params.type = filters.type;
                if (filters.minCapacity) params.minCapacity = parseInt(filters.minCapacity);
                if (filters.location) params.location = filters.location;
                if (filters.status) params.status = filters.status;

                const paging = { page, size: pageSize, sort };

                const response = await resourceService.searchResources(params, paging);
                const payload = response.data || response;
                const pageContent = Array.isArray(payload) ? payload : (payload.content || []);

                // Enhance with _uniqueId
                const enhancedContent = pageContent.map(r => ({ ...r, _uniqueId: r.id.toString() }));

                setResources(enhancedContent);

                if (userRole === 'LECTURER' || userRole === 'ADMIN') {
                    try {
                        const today = new Date().toISOString().split('T')[0];
                        const occResponse = await bookingService.getOccupiedSlots(today);
                        setOccupiedSlots(occResponse.data || []);
                    } catch (occErr) {
                        console.error("Failed to fetch occupied slots", occErr);
                    }
                }

                if (Array.isArray(payload)) {
                    setTotalPages(1);
                    setTotalElements(pageContent.length);
                } else {
                    setTotalPages(Math.max(1, payload.totalPages || 1));
                    setTotalElements(payload.totalElements ?? pageContent.length);
                }
            }
        } catch (err) {
            console.error("Failed to fetch resources", err);
            setError("Failed to load resources. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredResources = resources;

    const handleFilterChange = (filterName, value) => {
        setPage(0);
        setFilters(prev => ({
            ...prev,
            [filterName]: value === '' ? null : value
        }));
    };

    const resetFilters = () => {
        setFilters({
            searchTerm: '',
            type: lockedType,
            minCapacity: null,
            location: null,
            status: 'ACTIVE'
        });
        setSort('name,asc');
        setPage(0);
    };

    const activeFilterCount =
        (filters.searchTerm ? 1 : 0) +
        (filters.type && !isTypeLocked ? 1 : 0) +
        (filters.minCapacity ? 1 : 0) +
        (filters.location ? 1 : 0) +
        (filters.status && filters.status !== 'ACTIVE' ? 1 : 0);
    const formatType = (type) => type.replace(/_/g, ' ');
    const filterGridClass = isTypeLocked
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4';

    const formatTime = (timeValue) => {
        if (!timeValue) return null;

        const timeText = String(timeValue);
        const parts = timeText.split(':');
        if (parts.length < 2) return timeText;

        const hour = Number(parts[0]);
        const minute = Number(parts[1]);
        if (Number.isNaN(hour) || Number.isNaN(minute)) return timeText;

        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
    };

    const getAvailabilityText = (resource) => {
        const from = formatTime(resource.availableFrom);
        const to = formatTime(resource.availableTo);

        if (from && to) return `${from} - ${to}`;
        if (from) return `From ${from}`;
        if (to) return `Until ${to}`;
        return 'Not specified';
    };

    const getCapacityColor = (availableSeats, capacity) => {
        if (capacity == null || availableSeats == null) return 'from-gray-500 to-gray-400';
        const ratio = availableSeats / capacity;
        if (ratio <= 0) return 'from-red-500 to-rose-600';
        if (ratio <= 0.25) return 'from-orange-500 to-amber-500';
        if (ratio <= 0.5) return 'from-yellow-500 to-amber-400';
        return 'from-emerald-500 to-green-400';
    };

    const getCapacityBarWidth = (availableSeats, capacity) => {
        if (capacity == null || availableSeats == null) return '100%';
        const ratio = Math.max(0, Math.min(1, availableSeats / capacity));
        return `${ratio * 100}%`;
    };

    const isFull = (res) => res.availableSeats != null && res.availableSeats <= 0;

    return (
        <div className="min-h-screen bg-[#0a0f1c] flex flex-col font-sans">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12 relative">
                {/* Background Blobs */}
                <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-6">
                        <div>
                            {isTypeLocked && (
                                <button
                                    onClick={() => navigate('/resources/catalog')}
                                    className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-blue-200 text-xs font-semibold uppercase tracking-wider transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Back to Types
                                </button>
                            )}
                            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                                {isTypeLocked ? `${formatType(lockedType)} Resources` : 'Campus Resources'}
                            </h2>
                            <p className="text-blue-200/50 mt-2">
                                {isTypeLocked
                                    ? 'Browse and book resources in this category'
                                    : 'Browse and book facilities for your needs'}
                            </p>
                        </div>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters ({activeFilterCount})
                            </button>
                        )}
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="w-5 h-5 text-blue-400" />
                            <h3 className="font-semibold text-white">Filters</h3>
                        </div>
                        
                        <div className={filterGridClass}>
                            {/* Search */}
                            <div>
                                <label className="block text-xs font-medium text-blue-300 mb-2">Search</label>
                                <input
                                    type="text"
                                    placeholder="Resource name..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={filters.searchTerm}
                                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                />
                            </div>

                            {!isTypeLocked && (
                                <div>
                                    <label className="block text-xs font-medium text-blue-300 mb-2">Type</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer [&_option]:bg-slate-900"
                                        value={filters.type || ''}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                    >
                                        <option value="">All Types</option>
                                        {types.map(t => (
                                            <option key={t} value={t}>{formatType(t)}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Min Capacity Filter */}
                            <div>
                                <label className="block text-xs font-medium text-blue-300 mb-2">Min Capacity</label>
                                <input
                                    type="number"
                                    placeholder="e.g., 30"
                                    min="1"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={filters.minCapacity || ''}
                                    onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
                                />
                            </div>

                            {/* Location Filter */}
                            <div>
                                <label className="block text-xs font-medium text-blue-300 mb-2">Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Building A"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={filters.location || ''}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                />
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-xs font-medium text-blue-300 mb-2">Status</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer [&_option]:bg-slate-900"
                                    value={filters.status || 'ACTIVE'}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="OUT_OF_SERVICE">Out of Service</option>
                                    <option value="">All Statuses</option>
                                </select>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="block text-xs font-medium text-blue-300 mb-2">Sort</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer [&_option]:bg-slate-900"
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        setPage(0);
                                    }}
                                >
                                    <option value="name,asc">Name (A-Z)</option>
                                    <option value="name,desc">Name (Z-A)</option>
                                    <option value="capacity,desc">Capacity (High-Low)</option>
                                    <option value="capacity,asc">Capacity (Low-High)</option>
                                    <option value="createdAt,desc">Newest First</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 mb-6">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="text-center py-20">
                            <Info className="w-12 h-12 text-blue-300/50 mx-auto mb-4" />
                            <p className="text-blue-200/60">No resources found matching your filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredResources.map((res) => {
                                    const full = isFull(res);
                                    const isDisabled = res.status !== 'ACTIVE' || full;

                                    return (
                                        <div
                                            key={res._uniqueId}
                                            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2"
                                        >
                                            {/* Card Header Image Area */}
                                            <div className="h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative">
                                                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-110 transition-transform duration-700">
                                                    <Calendar className="w-20 h-20 text-white" />
                                                </div>

                                                {/* Status Badge */}
                                                <div className="absolute top-4 left-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                                        res.status === 'ACTIVE'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                        {res.status}
                                                    </span>
                                                </div>

                                                {/* Type Badge */}
                                                <div className="absolute top-4 right-4">
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                                        {res.type}
                                                    </span>
                                                </div>

                                                {/* FULL Overlay - Only for regular USERS */}
                                                {(full && userRole === 'USER') && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-4 py-2 rounded-full">
                                                            <XCircle className="w-4 h-4 text-red-400" />
                                                            <span className="text-red-300 font-bold text-sm uppercase tracking-widest">Fully Booked</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{res.name}</h3>

                                                <div className="space-y-3 mb-5">
                                                    <div className="flex items-center text-sm text-white/60">
                                                        <MapPin className="w-4 h-4 mr-2 text-blue-400/60 flex-shrink-0" />
                                                        {res.location}
                                                    </div>
                                                    {!['CRICKET', 'PROJECTOR', 'CAMERA', 'SMART_BOARD'].includes(res.type) && (
                                                        <div className="flex items-center text-sm text-white/60">
                                                            <Users className="w-4 h-4 mr-2 text-purple-400/60 flex-shrink-0" />
                                                            Total Capacity: {res.capacity} persons
                                                        </div>
                                                    )}
                                                    {!(userRole === 'LECTURER' || ['CRICKET', 'BADMINTON', 'SPORT'].includes(res.type)) && (
                                                        <div className="flex items-center text-sm text-white/60">
                                                            <Clock3 className="w-4 h-4 mr-2 text-emerald-400/60 flex-shrink-0" />
                                                            Availability: {getAvailabilityText(res)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Seat Availability Section - HIDE FOR SPORT TYPES */}
                                                {userRole !== 'LECTURER' && !['CRICKET', 'BADMINTON', 'SPORT'].includes(res.type) && (
                                                    <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/10">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Seat Availability</span>
                                                            {full ? (
                                                                <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                                                                    <XCircle className="w-3 h-3" /> Full
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    {res.availableSeats != null ? res.availableSeats : res.capacity} left
                                                                 </span>
                                                            )}
                                                        </div>

                                                        {/* Progress Bar */}
                                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${getCapacityColor(res.availableSeats, res.capacity)}`}
                                                                style={{ width: getCapacityBarWidth(res.availableSeats, res.capacity) }}
                                                            />
                                                        </div>

                                                        <div className="flex justify-between mt-1">
                                                            <span className="text-[10px] text-white/30">
                                                                {res.bookedCount != null ? res.bookedCount : 0} booked
                                                            </span>
                                                            <span className="text-[10px] text-white/30">
                                                                of {res.capacity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Occupied Slots for Lecturers/Admins */}
                                                {(userRole === 'LECTURER' || userRole === 'ADMIN') && occupiedSlots.filter(s => s.resourceId === res.id).length > 0 && (
                                                    <div className="mb-5 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
                                                        <h4 className="text-[10px] font-bold text-red-300 uppercase tracking-widest mb-3 flex items-center">
                                                            <Clock3 className="w-3 h-3 mr-1.5" /> Booked Intervals Today
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {occupiedSlots.filter(s => s.resourceId === res.id).map((slot, idx) => (
                                                                <div key={idx} className="flex items-center justify-between">
                                                                    <p className="text-xs text-white/80 font-medium">
                                                                        {slot.dayOfWeek.charAt(0) + slot.dayOfWeek.slice(1).toLowerCase()}
                                                                    </p>
                                                                    <p className="text-xs text-red-300/80 font-mono">
                                                                        {new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(slot.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/book/${res.id}`)}
                                                        disabled={res.status !== 'ACTIVE' || (userRole === 'USER' && full)}
                                                        className={`flex-1 py-3 text-white text-sm font-bold rounded-xl transition-all shadow-lg ${
                                                            (res.status !== 'ACTIVE' || (userRole === 'USER' && full))
                                                                ? 'bg-white/10 text-white/30 cursor-not-allowed shadow-none'
                                                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20 group-hover:shadow-blue-500/40'
                                                        }`}
                                                    >
                                                        {full && userRole === 'USER' ? 'No Seats Available' : res.status !== 'ACTIVE' ? 'Unavailable' : 'Book Now'}
                                                    </button>
                                                    
                                                    {userRole === 'LECTURER' && (
                                                        <button
                                                            onClick={() => handleViewSchedule(res)}
                                                            className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 rounded-xl text-blue-400 transition-all flex items-center justify-center group/btn"
                                                            title="View Full Schedule"
                                                        >
                                                            <Calendar className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                                <p className="text-sm text-blue-200/70">
                                    Page {Math.min(page + 1, Math.max(totalPages, 1))} of {Math.max(totalPages, 1)}
                                    {' '}| {totalElements} total resources
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(prev => Math.max(0, prev - 1))}
                                        disabled={page === 0}
                                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(prev => Math.min(Math.max(totalPages - 1, 0), prev + 1))}
                                        disabled={page + 1 >= totalPages}
                                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                       className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                       onClick={() => setShowScheduleModal(false)}
                    ></div>
                    
                    <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    Schedule for {selectedResource?.name}
                                </h3>
                                <p className="text-xs text-white/40 mt-1">Showing bookings for the next 7 days</p>
                            </div>
                            <button 
                               onClick={() => setShowScheduleModal(false)}
                               className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {fetchingSchedule ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-white/40 text-sm">Fetching resource schedule...</p>
                                </div>
                            ) : fullSchedule.length === 0 ? (
                                <div className="text-center py-12 px-6">
                                    <div className="w-16 h-16 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Clock3 className="w-8 h-8 text-blue-400/40" />
                                    </div>
                                    <h4 className="text-white font-semibold mb-1">No Bookings Found</h4>
                                    <p className="text-white/40 text-sm">This resource is completely free for the next 7 days.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Group by Day */}
                                    {Array.from(new Set(fullSchedule.map(s => {
                                        const dt = s.startTime;
                                        return typeof dt === 'string' ? dt.split('T')[0] : new Date(dt).toISOString().split('T')[0];
                                    }))).sort().map(dateStr => (
                                        <div key={dateStr} className="space-y-2">
                                            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest pl-2">
                                                {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {fullSchedule
                                                   .filter(s => {
                                                       const dt = s.startTime;
                                                       const sDate = typeof dt === 'string' ? dt.split('T')[0] : new Date(dt).toISOString().split('T')[0];
                                                       return sDate === dateStr;
                                                   })
                                                   .sort((a,b) => new Date(a.startTime) - new Date(b.startTime))
                                                   .map((slot, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.07] transition-colors group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                                <Clock className="w-5 h-5 text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white font-mono">
                                                                    {new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(slot.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                </p>
                                                                <p className="text-[10px] text-white/40 font-medium">{slot.userEmail}</p>
                                                            </div>
                                                        </div>
                                                        <div className="px-3 py-1 bg-red-400/10 border border-red-400/20 rounded-full">
                                                            <span className="text-[10px] font-bold text-red-400 uppercase">Occupied</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end">
                            <button
                               onClick={() => navigate(`/book/${selectedResource?.id}`)}
                               className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" /> Book Available Slot
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ResourceListPage;
