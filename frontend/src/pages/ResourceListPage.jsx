import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resourceService } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Users, Info, Calendar, Clock3, Filter, CheckCircle, XCircle, X, ArrowLeft } from 'lucide-react';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'PROJECTOR', 'CAMERA', 'EQUIPMENT'];

const ResourceListPage = () => {
    const { type: typeParam } = useParams();
    const lockedType = typeParam && RESOURCE_TYPES.includes(typeParam) ? typeParam : null;
    const isTypeLocked = Boolean(lockedType);

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
    }, [filters, page, sort]);

    const fetchResources = async () => {
        setLoading(true);
        setError(null);
        try {
            // Build params object with only non-null/non-empty values
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

            setResources(pageContent);

            if (Array.isArray(payload)) {
                setTotalPages(1);
                setTotalElements(pageContent.length);
            } else {
                setTotalPages(Math.max(1, payload.totalPages || 1));
                setTotalElements(payload.totalElements ?? pageContent.length);
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
                                            key={res.id}
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

                                                {/* FULL Overlay */}
                                                {full && (
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
                                                    <div className="flex items-center text-sm text-white/60">
                                                        <Users className="w-4 h-4 mr-2 text-purple-400/60 flex-shrink-0" />
                                                        Total Capacity: {res.capacity} persons
                                                    </div>
                                                    <div className="flex items-center text-sm text-white/60">
                                                        <Clock3 className="w-4 h-4 mr-2 text-emerald-400/60 flex-shrink-0" />
                                                        Availability: {getAvailabilityText(res)}
                                                    </div>
                                                </div>

                                                {/* Seat Availability Section */}
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

                                                <button
                                                    onClick={() => navigate(`/book/${res.id}`)}
                                                    disabled={isDisabled}
                                                    className={`w-full py-3 text-white text-sm font-bold rounded-xl transition-all shadow-lg ${
                                                        isDisabled
                                                            ? 'bg-white/10 text-white/30 cursor-not-allowed shadow-none'
                                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20 group-hover:shadow-blue-500/40'
                                                    }`}
                                                >
                                                    {full ? 'No Seats Available' : res.status !== 'ACTIVE' ? 'Unavailable' : 'Book This Resource'}
                                                </button>
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

            <Footer />
        </div>
    );
};

export default ResourceListPage;
