import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService, resourceService } from '../../services/api';
import { uploadToCloudinary } from '../../utils/cloudinary';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
    Save, 
    ArrowLeft, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    Edit3,
    Activity, 
    Shield, 
    Wrench, 
    Monitor, 
    Zap, 
    Plus,
    Upload,
    X,
    MapPin,
    Building2,
    Image as ImageIcon
} from 'lucide-react';

const EditTicketPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        description: '',
        category: '',
        customCategory: '',
        priority: 'MEDIUM',
        contactDetails: '',
        resourceId: '',
        location: ''
    });
    
    const [isGeneralLocation, setIsGeneralLocation] = useState(false);
    const [resources, setResources] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const categories = [
        { id: 'Maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
        { id: 'IT Support', label: 'IT Support', icon: <Monitor className="w-4 h-4" /> },
        { id: 'Security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
        { id: 'Electrical', label: 'Electrical', icon: <Zap className="w-4 h-4" /> },
        { id: 'Other', label: 'Other', icon: <Plus className="w-4 h-4" /> }
    ];

    const priorities = [
        { value: 'LOW', label: 'Low', color: 'text-emerald-400 bg-emerald-400/10' },
        { value: 'MEDIUM', label: 'Medium', color: 'text-amber-400 bg-amber-400/10' },
        { value: 'HIGH', label: 'High', color: 'text-rose-400 bg-rose-400/10' }
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch resources
                const resResources = await resourceService.getAll();
                setResources(resResources.data.content || []);

                // Fetch ticket details
                const resTicket = await ticketService.getTicketById(id);
                const ticket = resTicket.data.data;

                // Ownership check
                if (ticket.createdBy !== parsedUser.id && parsedUser.role !== 'ADMIN') {
                    setError("You do not have permission to edit this ticket.");
                    setLoading(false);
                    return;
                }

                // Populate form
                const isOtherCategory = !['Maintenance', 'IT Support', 'Security', 'Electrical'].includes(ticket.category);
                
                setFormData({
                    description: ticket.description,
                    category: isOtherCategory ? 'Other' : ticket.category,
                    customCategory: isOtherCategory ? ticket.category : '',
                    priority: ticket.priority,
                    contactDetails: ticket.contactDetails || '',
                    resourceId: ticket.resourceId || '',
                    location: ticket.location || ''
                });

                if (!ticket.resourceId && ticket.location) {
                    setIsGeneralLocation(true);
                }

                // Fetch existing images
                const resImages = await ticketService.getImages(id);
                setExistingImages(resImages.data.data || []);

            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Failed to load ticket details. It may have been deleted.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingImages.length + selectedFiles.length + files.length;
        
        if (totalImages > 3) {
            setError("Maximum of 3 images allowed per ticket.");
            return;
        }

        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setError(null);
    };

    const removeNewImage = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const finalCategory = formData.category === 'Other' ? formData.customCategory : formData.category;

        try {
            const ticketData = {
                description: formData.description,
                category: finalCategory,
                priority: formData.priority,
                contactDetails: formData.contactDetails,
                resourceId: isGeneralLocation ? null : formData.resourceId,
                location: isGeneralLocation ? formData.location : resources.find(r => r.id.toString() === formData.resourceId.toString())?.location
            };

            await ticketService.updateTicket(id, ticketData);

            // Upload new images if any
            if (selectedFiles.length > 0) {
                for (let i = 0; i < selectedFiles.length; i++) {
                    const imageUrl = await uploadToCloudinary(selectedFiles[i]);
                    await ticketService.addImageUrl(id, imageUrl);
                    setUploadProgress(((i + 1) / selectedFiles.length) * 100);
                }
            }

            setSuccess(true);
            setTimeout(() => {
                navigate(`/tickets/${id}`);
            }, 2000);

        } catch (err) {
            console.error("Failed to update ticket:", err);
            setError(err.response?.data?.message || "Failed to update ticket. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-indigo-300/60 font-medium animate-pulse">Loading ticket editor...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col font-sans relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <Header />
            <main className="flex-1 overflow-y-auto z-10 flex flex-col">
                <div className="p-4 md:p-8 flex-1 flex items-center justify-center">
                    <div className="max-w-2xl w-full mt-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-indigo-300 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Cancel Changes</span>
                    </button>

                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"></div>
                        
                        <div className="p-8 md:p-12">
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <Edit3 className="text-amber-400 w-7 h-7" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-white">Edit Support Ticket</h1>
                                    <p className="text-indigo-300/60 font-medium">Update the details of your request</p>
                                </div>
                            </div>

                            {success ? (
                                <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 relative">
                                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                                        <CheckCircle2 className="text-emerald-400 w-12 h-12 relative z-10" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Changes Saved!</h2>
                                    <p className="text-indigo-200/60 max-w-sm">Redirecting back to ticket details...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-indigo-200/70 ml-1 uppercase tracking-wider">
                                            Description <span className="text-rose-500 ml-1">*</span>
                                        </label>
                                        <textarea
                                            required
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-indigo-200/70 ml-1 uppercase tracking-wider">
                                            Category <span className="text-rose-500 ml-1">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                                                        formData.category === cat.id
                                                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                                            : 'bg-white/5 border-white/5 text-indigo-300/50 hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className="mb-2">{cat.icon}</div>
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {formData.category === 'Other' && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                            <input
                                                required
                                                type="text"
                                                name="customCategory"
                                                value={formData.customCategory}
                                                onChange={handleChange}
                                                placeholder="Specify other category..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-3xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-semibold text-indigo-200/70 ml-1 uppercase tracking-wider flex items-center">
                                                {isGeneralLocation ? <MapPin className="w-4 h-4 mr-2" /> : <Building2 className="w-4 h-4 mr-2" />}
                                                Issue Location <span className="text-rose-500 ml-1">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsGeneralLocation(!isGeneralLocation)}
                                                className="text-[10px] font-bold uppercase tracking-widest text-indigo-400"
                                            >
                                                {isGeneralLocation ? "Switch to Resource" : "Switch to General"}
                                            </button>
                                        </div>

                                        {isGeneralLocation ? (
                                            <input
                                                required
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                            />
                                        ) : (
                                            <select
                                                required
                                                name="resourceId"
                                                value={formData.resourceId}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all [&_option]:bg-[#0d1225]"
                                            >
                                                <option value="">Select a resource...</option>
                                                {resources.map(res => (
                                                    <option key={res.id} value={res.id}>
                                                        {res.name} ({res.location})
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-indigo-200/70 ml-1 uppercase tracking-wider">
                                                Priority Level
                                            </label>
                                            <div className="flex space-x-2">
                                                {priorities.map((p) => (
                                                    <button
                                                        key={p.value}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                                                        className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all uppercase tracking-widest ${
                                                            formData.priority === p.value
                                                                ? `${p.color} border-current ring-1 ring-current`
                                                                : 'bg-white/5 border-white/5 text-white/30'
                                                        }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-indigo-200/70 ml-1 uppercase tracking-wider">
                                                Contact Detail
                                            </label>
                                            <input
                                                type="text"
                                                name="contactDetails"
                                                value={formData.contactDetails}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Existing Images */}
                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold text-indigo-200/70 uppercase tracking-wider flex items-center">
                                            <ImageIcon className="w-4 h-4 mr-2" /> Current Images
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {existingImages.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                                                    <img src={img.imageUrl} alt="existing" className="w-full h-full object-cover opacity-50" />
                                                </div>
                                            ))}
                                            
                                            {previews.map((preview, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                                                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImage(idx)}
                                                        className="absolute top-2 right-2 p-1.5 bg-rose-500/80 text-white rounded-full"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            {existingImages.length + selectedFiles.length < 3 && (
                                                <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                                                    <Upload className="w-6 h-6 text-indigo-300/30 mb-2" />
                                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3">
                                            <AlertCircle className="text-rose-400 w-5 h-5 shrink-0 mt-0.5" />
                                            <p className="text-sm text-rose-200/80 font-medium">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`w-full py-5 rounded-2xl flex items-center justify-center space-x-3 font-bold transition-all ${
                                            submitting 
                                                ? 'bg-indigo-600/50 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-xl shadow-amber-500/20'
                                        }`}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span className="tracking-widest uppercase text-sm">Saving Changes...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                <span className="tracking-widest uppercase text-sm">Update Ticket</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
                </div>

                <div className="shrink-0 mt-auto pt-12 w-full max-w-4xl mx-auto px-4 md:px-8 pb-8">
                    <Footer />
                </div>
            </main>
        </div>
    );
};

export default EditTicketPage;
