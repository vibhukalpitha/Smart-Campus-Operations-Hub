import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Users, Info, Calendar, Search, Filter, CheckCircle, XCircle } from 'lucide-react';

const ResourceListPage = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await resourceService.getAll();
            setResources(response.data);
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            res.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'ALL' || res.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const types = ['ALL', ...new Set(resources.map(r => r.type))];

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
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                        <div>
                            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                                Campus Resources
                            </h2>
                            <p className="text-blue-200/50 mt-2">Browse and book facilities for your needs</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search resources..."
                                    className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-64 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 transition-colors" />
                                <select
                                    className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    {types.map(t => <option key={t} value={t} className="bg-[#1e2538]">{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                            <Info className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/40 font-medium">No resources found matching your criteria</p>
                        </div>
                    ) : (
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
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ResourceListPage;
