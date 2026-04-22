import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { resourceService } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import {
  Plus, Edit2, Trash2, Search, X,
  Building2, FlaskConical, BookOpen, Users2, Monitor,
  Wrench, Presentation, Camera, Trophy, Zap, ChevronRight,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Type-selection modal data
// ─────────────────────────────────────────────────────────────────────────────
const MODAL_CATEGORIES = [
  {
    key: 'academic',
    title: 'Academic',
    icon: Building2,
    gradient: 'from-blue-600 to-cyan-500',
    ring: 'ring-blue-500/30',
    bg: 'bg-blue-500/10',
    types: [
      { value: 'LECTURE_HALL', label: 'Lecture Hall', icon: Building2, color: 'text-blue-300', dot: 'bg-blue-400' },
      { value: 'LAB',          label: 'Lab',          icon: FlaskConical, color: 'text-cyan-300', dot: 'bg-cyan-400' },
    ],
  },
  {
    key: 'library',
    title: 'Library',
    icon: BookOpen,
    gradient: 'from-emerald-600 to-teal-500',
    ring: 'ring-emerald-500/30',
    bg: 'bg-emerald-500/10',
    types: [
      { value: 'MEETING_ROOM',     label: 'Meeting Room',     icon: Users2,  color: 'text-emerald-300', dot: 'bg-emerald-400' },
      { value: 'PUBLIC_COMPUTERS', label: 'Public Computers', icon: Monitor, color: 'text-teal-300',    dot: 'bg-teal-400'    },
    ],
  },
  {
    key: 'equipment',
    title: 'Academic Equipments',
    icon: Wrench,
    gradient: 'from-violet-600 to-fuchsia-500',
    ring: 'ring-violet-500/30',
    bg: 'bg-violet-500/10',
    types: [
      { value: 'PROJECTOR',  label: 'Projector',        icon: Presentation, color: 'text-amber-300',  dot: 'bg-amber-400'  },
      { value: 'CAMERA',     label: 'Camera',            icon: Camera,       color: 'text-rose-300',   dot: 'bg-rose-400'   },
      { value: 'SMART_BOARD',label: 'Smart Board',       icon: Monitor,      color: 'text-purple-300', dot: 'bg-purple-400' },
      { value: 'EQUIPMENT',  label: 'Other Equipments',  icon: Wrench,       color: 'text-indigo-300', dot: 'bg-indigo-400' },
    ],
  },
  {
    key: 'sports',
    title: 'Sports',
    icon: Trophy,
    gradient: 'from-orange-600 to-amber-500',
    ring: 'ring-orange-500/30',
    bg: 'bg-orange-500/10',
    types: [
      { value: 'CRICKET',   label: 'Cricket',   icon: Trophy, color: 'text-green-300',  dot: 'bg-green-400'  },
      { value: 'BADMINTON', label: 'Badminton', icon: Zap,    color: 'text-yellow-300', dot: 'bg-yellow-400' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Resource-type selection modal
// ─────────────────────────────────────────────────────────────────────────────
const ResourceTypeModal = ({ onClose, onSelect }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    />

    {/* Panel */}
    <div className="relative w-full max-w-3xl bg-[#0d1225] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Add New Resource</h2>
          <p className="text-sm text-white/50 mt-0.5">Select a category and resource type to continue</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Categories grid */}
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
        {MODAL_CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <div
              key={cat.key}
              className={`rounded-2xl border border-white/10 overflow-hidden ${cat.bg} ring-1 ${cat.ring}`}
            >
              {/* Category header */}
              <div className={`px-5 py-4 flex items-center gap-3 bg-gradient-to-r ${cat.gradient} bg-opacity-20`}>
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <CatIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-sm uppercase tracking-wider">{cat.title}</span>
              </div>

              {/* Type list */}
              <div className="divide-y divide-white/5">
                {cat.types.map((t) => {
                  const TypeIcon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => onSelect(t.value)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.dot}`} />
                        <TypeIcon className={`w-4 h-4 flex-shrink-0 ${t.color}`} />
                        <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                          {t.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-8 py-4 border-t border-white/10 bg-white/5 text-center">
        <p className="text-xs text-white/30">Click a resource type to open the add form</p>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
const AdminResourcesPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Re-fetch whenever the user navigates (back) to this page
  useEffect(() => {
    fetchAllResources();
  }, [location.key]);

  const fetchAllResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await resourceService.getAllResources({ page: 0, size: 1000, sort: 'name,asc' });
      const payload = response.data;
      setResources(Array.isArray(payload) ? payload : (payload.content || []));
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/resources/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.deleteResource(id);
        // Instantly remove from local state — no extra server round-trip needed
        setResources(prev => prev.filter(r => r.id !== id));
        setError(null);
      } catch (err) {
        console.error('Failed to delete resource:', err);
        const msg = err.response?.data?.error
          || err.response?.data?.message
          || err.message
          || 'Failed to delete resource';
        setError(msg);
      }
    }
  };

  const handleTypeSelected = (type) => {
    setShowTypeModal(false);
    navigate(`/admin/resources/add?type=${type}`);
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || resource.type === typeFilter;
    const matchesStatus = !statusFilter || resource.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
  };

  // Human-readable labels for the type badge
  const TYPE_LABELS = {
    LECTURE_HALL:     'Lecture Hall',
    LAB:              'Lab',
    MEETING_ROOM:     'Meeting Room',
    PROJECTOR:        'Projector',
    CAMERA:           'Camera',
    EQUIPMENT:        'Other Equipments',
    PUBLIC_COMPUTERS: 'Public Computers',
    SMART_BOARD:      'Smart Board',
    CRICKET:          'Cricket',
    BADMINTON:        'Badminton',
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      LECTURE_HALL:     'bg-blue-500/10 text-blue-300 border-blue-500/20',
      LAB:              'bg-purple-500/10 text-purple-300 border-purple-500/20',
      MEETING_ROOM:     'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      PROJECTOR:        'bg-pink-500/10 text-pink-300 border-pink-500/20',
      CAMERA:           'bg-orange-500/10 text-orange-300 border-orange-500/20',
      EQUIPMENT:        'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      PUBLIC_COMPUTERS: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
      SMART_BOARD:      'bg-violet-500/10 text-violet-300 border-violet-500/20',
      CRICKET:          'bg-green-500/10 text-green-300 border-green-500/20',
      BADMINTON:        'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-300 border-gray-500/20';
  };

  const getStatusBadgeColor = (status) =>
    status === 'ACTIVE'
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
      : 'bg-red-500/10 text-red-300 border-red-500/20';

  return (
    <AdminLayout activeSection="facilities">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200 tracking-tight mb-2">
              Facilities &amp; Assets
            </h1>
            <p className="text-purple-200/60 text-lg">Manage and track all campus resources</p>
          </div>

          {/* Add Resource → opens modal */}
          <button
            onClick={() => setShowTypeModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all hover:scale-105 w-fit"
          >
            <Plus className="w-5 h-5" />
            Add Resource
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            {error}
          </div>
        )}

        {/* Search + Filter bar */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type filter */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wider">
                Resource Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all [&_option]:bg-slate-900 [&_option]:text-white"
              >
                <option value="">All Types</option>
                <optgroup label="── Academic">
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Lab</option>
                </optgroup>
                <optgroup label="── Library">
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="PUBLIC_COMPUTERS">Public Computers</option>
                </optgroup>
                <optgroup label="── Academic Equipments">
                  <option value="PROJECTOR">Projector</option>
                  <option value="CAMERA">Camera</option>
                  <option value="SMART_BOARD">Smart Board</option>
                  <option value="EQUIPMENT">Other Equipments</option>
                </optgroup>
                <optgroup label="── Sports">
                  <option value="CRICKET">Cricket</option>
                  <option value="BADMINTON">Badminton</option>
                </optgroup>
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wider">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all [&_option]:bg-slate-900 [&_option]:text-white"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
            </div>

            {/* Clear filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-sm font-medium transition-all"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>

          <div className="text-xs text-white/50 font-medium">
            Showing {filteredResources.length} of {resources.length} resources
          </div>
        </div>

        {/* Resources table */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-purple-300">Loading resources...</p>
                </div>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-20 text-white/40 font-medium">
                <p className="text-lg">No resources found in the system.</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-20 text-white/40 font-medium">
                <p className="text-lg">No resources match your filters.</p>
                <p className="text-sm mt-2">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-widest">
                      <th className="pb-4 font-semibold pl-4">Name</th>
                      <th className="pb-4 font-semibold">Type</th>
                      <th className="pb-4 font-semibold">Capacity</th>
                      <th className="pb-4 font-semibold">Location</th>
                      <th className="pb-4 font-semibold">Status</th>
                      <th className="pb-4 font-semibold text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResources.map((resource) => (
                      <tr key={resource.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 pl-4">
                          <div className="font-medium text-white">{resource.name}</div>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${getTypeBadgeColor(resource.type)}`}>
                            {TYPE_LABELS[resource.type] || resource.type}
                          </span>
                        </td>
                        <td className="py-4 text-white/70">{resource.capacity}</td>
                        <td className="py-4 text-white/70">{resource.location}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${getStatusBadgeColor(resource.status)}`}>
                            {resource.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              title="Edit"
                              onClick={() => handleEdit(resource.id)}
                              className="p-2 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 rounded-xl transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-white/10" />
                            <button
                              title="Delete"
                              onClick={() => handleDelete(resource.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Type-selection modal */}
      {showTypeModal && (
        <ResourceTypeModal
          onClose={() => setShowTypeModal(false)}
          onSelect={handleTypeSelected}
        />
      )}
    </AdminLayout>
  );
};

export default AdminResourcesPage;
