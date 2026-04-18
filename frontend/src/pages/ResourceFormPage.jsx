import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resourceService } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { ArrowLeft, Save, Loader } from 'lucide-react';

const ResourceFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    location: '',
    status: 'ACTIVE',
    availableFrom: '',
    availableTo: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchResourceData();
    }
  }, [id, isEditMode]);

  const fetchResourceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await resourceService.getResourceById(id);
      const data = response.data;
      setFormData({
        name: data.name || '',
        type: data.type || '',
        capacity: data.capacity || '',
        location: data.location || '',
        status: data.status || 'ACTIVE',
        availableFrom: data.availableFrom || '',
        availableTo: data.availableTo || '',
      });
    } catch (err) {
      console.error('Failed to fetch resource:', err);
      setError('Failed to load resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!formData.name || !formData.type || !formData.capacity || !formData.location) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        type: formData.type,
        capacity: parseInt(formData.capacity),
        location: formData.location,
        status: formData.status,
        availableFrom: formData.availableFrom || null,
        availableTo: formData.availableTo || null,
      };

      if (isEditMode) {
        await resourceService.updateResource(id, submitData);
        console.log('Resource updated successfully');
      } else {
        await resourceService.createResource(submitData);
        console.log('Resource created successfully');
      }

      navigate('/admin/resources');
    } catch (err) {
      console.error('Submission error:', err);
      setError(
        err.response?.data?.error || 'An error occurred. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/resources');
  };

  return (
    <AdminLayout activeSection="facilities">
      <div className="space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200 tracking-tight">
              {isEditMode ? 'Edit Resource' : 'Add New Resource'}
            </h1>
            <p className="text-purple-200/60 mt-1">
              {isEditMode ? 'Update resource details' : 'Create a new facility or asset'}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-purple-300">Loading resource...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 flex items-start gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
              {/* Resource Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-300 mb-3">
                  Resource Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Physics Lab 101"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Type and Capacity - Side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-purple-300 mb-3">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all [&_option]:bg-slate-900 [&_option]:text-white [&_option]:py-2"
                  >
                    <option value="">Select Type</option>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="LAB">Lab</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="PROJECTOR">Projector</option>
                    <option value="CAMERA">Camera</option>
                    <option value="EQUIPMENT">Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-300 mb-3">
                    Capacity <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="e.g., 30"
                    min="1"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-300 mb-3">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Building A, Floor 2"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-300 mb-3">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all [&_option]:bg-slate-900 [&_option]:text-white [&_option]:py-2"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>


            </div>

            {/* Form Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-purple-600/50 disabled:to-pink-600/50 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all hover:scale-105 disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditMode ? 'Update Resource' : 'Create Resource'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};;

export default ResourceFormPage;
