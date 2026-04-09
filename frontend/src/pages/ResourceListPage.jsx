import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import resourceService from '../services/resourceService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

const ResourceListPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    type: '',
    capacity: '',
    location: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAllResources();
  }, []);

  const fetchAllResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const params = Object.fromEntries(
      Object.entries(searchParams).filter(([_, v]) => v !== '')
    );

    try {
      if (Object.keys(params).length === 0) {
        const data = await resourceService.getAllResources();
        setResources(data);
      } else {
        const data = await resourceService.searchResources(params);
        setResources(data);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      type: '',
      capacity: '',
      location: '',
      status: '',
    });
    fetchAllResources();
  };

  const handleEdit = (id) => {
    navigate(`/admin/resources/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.deleteResource(id);
        console.log('Resource deleted successfully');
        fetchAllResources();
      } catch (err) {
        console.error('Failed to delete resource:', err);
        setError('Failed to delete resource');
      }
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStatusBadgeColor = (status) => {
    return status === 'ACTIVE' 
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      LECTURE_HALL: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      LAB: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      MEETING_ROOM: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      PROJECTOR: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      CAMERA: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      EQUIPMENT: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-200 tracking-tight mb-2">
                Facilities & Assets
              </h1>
              <p className="text-indigo-200/60 text-lg">Manage and track all campus resources</p>
            </div>
            <button
              onClick={() => navigate('/admin/resources/add')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 w-fit"
            >
              <Plus className="w-5 h-5" />
              Add Resource
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {error}
            </div>
          )}

          {/* Search & Filter Section */}
          <div className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-indigo-300 hover:text-indigo-100 transition-colors mb-4 font-semibold"
            >
              <Filter className="w-5 h-5" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>

            {showFilters && (
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">Type</label>
                    <select
                      name="type"
                      value={searchParams.type}
                      onChange={handleSearchChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all [&_option]:bg-slate-900 [&_option]:text-white [&_option]:py-2"
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

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">Min Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      value={searchParams.capacity}
                      onChange={handleSearchChange}
                      placeholder="Enter capacity"
                      min="1"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={searchParams.location}
                      onChange={handleSearchChange}
                      placeholder="Enter location"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">Status</label>
                    <select
                      name="status"
                      value={searchParams.status}
                      onChange={handleSearchChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all [&_option]:bg-slate-900 [&_option]:text-white [&_option]:py-2"
                    >
                      <option value="">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="OUT_OF_SERVICE">Out of Service</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg font-semibold transition-all hover:scale-105"
                  >
                    <Search className="w-4 h-4 inline mr-2" />
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg font-semibold transition-all"
                  >
                    Reset
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-300">Loading resources...</p>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {!loading && resources.length === 0 && (
            <div className="text-center py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <p className="text-indigo-200/60 text-lg">No resources found.</p>
            </div>
          )}

          {/* Resources Table */}
          {!loading && resources.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-300">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-300">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-300">Capacity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-300">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource) => (
                      <tr
                        key={resource.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-medium">{resource.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeBadgeColor(resource.type)}`}>
                            {resource.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white">{resource.capacity}</td>
                        <td className="px-6 py-4 text-indigo-200/80">{resource.location}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(resource.status)}`}>
                            {resource.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEdit(resource.id)}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-100 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(resource.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-100 rounded-lg transition-all"
                              title="Delete"
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
              <div className="px-6 py-4 bg-white/5 border-t border-white/10 text-sm text-indigo-200/60">
                Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
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
