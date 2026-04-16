import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { resourceService } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

const AdminResourcesPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAllResources();
  }, []);

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
        fetchAllResources();
      } catch (err) {
        console.error('Failed to delete resource:', err);
        setError('Failed to delete resource');
      }
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getTypeBadgeColor = (type) => {
    const colors = {
      LECTURE_HALL: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      LAB: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      MEETING_ROOM: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      PROJECTOR: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
      CAMERA: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
      EQUIPMENT: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-300 border-gray-500/20';
  };

  const getStatusBadgeColor = (status) => {
    return status === 'ACTIVE' 
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
      : 'bg-red-500/10 text-red-300 border-red-500/20';
  };

  return (
    <AdminLayout activeSection="facilities">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200 tracking-tight mb-2">
              Facilities & Assets
            </h1>
            <p className="text-purple-200/60 text-lg">Manage and track all campus resources</p>
          </div>
          <Link
            to="/admin/resources/add"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all hover:scale-105 w-fit"
          >
            <Plus className="w-5 h-5" />
            Add Resource
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {error}
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          {/* Search Bar */}
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

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wider">Resource Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all [&_option]:bg-slate-900 [&_option]:text-white"
              >
                <option value="">All Types</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="PROJECTOR">Projector</option>
                <option value="CAMERA">Camera</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wider">Status</label>
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

            {/* Clear Filters Button */}
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

          {/* Results Count */}
          <div className="text-xs text-white/50 font-medium">
            Showing {filteredResources.length} of {resources.length} resources
          </div>
        </div>

        {/* Resources List Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* List */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
                      <tr key={resource.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="py-4 pl-4">
                          <div className="font-medium text-white">{resource.name}</div>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${getTypeBadgeColor(resource.type)}`}>
                            {resource.type}
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
                          <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              title="Edit"
                              onClick={() => handleEdit(resource.id)}
                              className="p-2 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 rounded-xl transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-white/10"></div>
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
    </AdminLayout>
  );
};

export default AdminResourcesPage;
