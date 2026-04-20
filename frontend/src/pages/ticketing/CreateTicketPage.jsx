import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService, resourceService } from '../../services/api';
import { uploadToCloudinary } from '../../utils/cloudinary';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
    Send, 
    ArrowLeft, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    MessageSquare, 
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

const CreateTicketPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
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
        
        // Ownership / Role Check: Only USER can create tickets
        if (parsedUser.role !== 'USER') {
            setError("Only users with the 'USER' role are permitted to create tickets. Please contact an administrator if you believe this is an error.");
            return;
        }
        
        setUser(parsedUser);
        
        // Fetch resources
        const fetchResources = async () => {
            try {
                const res = await resourceService.getAll();
                setResources(res.data.content || []);
            } catch (err) {
                console.error("Failed to fetch resources:", err);
            }
        };
        fetchResources();
    }, [navigate]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        
        if (selectedFiles.length + files.length > 3) {
            setError("Maximum of 3 images allowed per ticket.");
            return;
        }

        const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            setError("Invalid file format. Only JPG, JPEG, and PNG are allowed.");
            return;
        }

        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);

        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setError(null);
    };

    const removeImage = (index) => {
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
        setLoading(true);
        setError(null);

        const finalCategory = formData.category === 'Other' ? formData.customCategory : formData.category;

        if (!finalCategory) {
            setError("Please select or specify a category");
            setLoading(false);
            return;
        }

        try {
            const ticketData = {
                description: formData.description,
                category: finalCategory,
                priority: formData.priority,
                contactDetails: formData.contactDetails,
                resourceId: isGeneralLocation ? null : formData.resourceId,
                location: isGeneralLocation ? formData.location : resources.find(r => r.id.toString() === formData.resourceId.toString())?.location
            };

            const response = await ticketService.createTicket(ticketData);
            const ticketId = response.data.data.id;

            // Upload images to Cloudinary and save URLs in backend
            if (selectedFiles.length > 0) {
                setUploadProgress(10);
                for (let i = 0; i < selectedFiles.length; i++) {
                    const imageUrl = await uploadToCloudinary(selectedFiles[i]);
                    await ticketService.addImageUrl(ticketId, imageUrl);
                    setUploadProgress(((i + 1) / selectedFiles.length) * 100);
                }
            }

            setSuccess(true);
            setFormData({
                description: '',
                category: '',
                customCategory: '',
                priority: 'MEDIUM',
                contactDetails: '',
                resourceId: '',
                location: ''
            });
            setSelectedFiles([]);
            setPreviews([]);
            
            // Redirect after a short delay to show success state
            setTimeout(() => {
                navigate('/tickets');
            }, 3000);

        } catch (err) {
            console.error("Failed to create ticket:", err);
            setError(err.response?.data?.message || "An error occurred while creating the ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col font-sans relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse duration-10000"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse duration-7000"></div>

            <Header />

            <main className="flex-1 overflow-y-auto z-10 flex flex-col">
                <div className="p-4 md:p-8 flex-1 flex items-center justify-center">
                    <div className="max-w-2xl w-full mt-4">
                    {/* Header Action */}
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-indigo-300 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Go Back</span>
                    </button>

                    {/* Main Card */}
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                        {/* Decorative top bar */}
                        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                        
                        <div className="p-8 md:p-12">
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                    <MessageSquare className="text-indigo-400 w-7 h-7" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-white">Create Support Ticket</h1>
                                    <p className="text-indigo-300/60 font-medium">Report an issue or request a campus service</p>
                                </div>
                            </div>

                            {success ? (
                                <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 relative">
                                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                                        <CheckCircle2 className="text-emerald-400 w-12 h-12 relative z-10" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Ticket Submitted!</h2>
                                    <p className="text-indigo-200/60 max-w-sm mb-8">
                                        Your request has been logged successfully. A technician will be assigned shortly.
                                    </p>
                                    <p className="text-xs text-indigo-300/40 uppercase tracking-widest">Redirecting to Dashboard...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-indigo-200/70 ml-1 uppercase tracking-wider flex items-center">
                                            Description <span className="text-rose-500 ml-1">*</span>
                                        </label>
                                        <textarea
                                            required
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="What can we help you with? Please provide as much detail as possible."
                                            rows="4"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Category Grid */}
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
                                                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                                                            : 'bg-white/5 border-white/5 text-indigo-300/50 hover:border-white/20 hover:text-indigo-200'
                                                    }`}
                                                >
                                                    <div className="mb-2">{cat.icon}</div>
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Category (Conditional) */}
                                    {formData.category === 'Other' && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                            <input
                                                required
                                                type="text"
                                                name="customCategory"
                                                value={formData.customCategory}
                                                onChange={handleChange}
                                                placeholder="Specify other category..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                            />
                                        </div>
                                    )}

                                    {/* Resource and Location Selection */}
                                    <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-3xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-semibold text-indigo-200/70 ml-1 uppercase tracking-wider flex items-center">
                                                {isGeneralLocation ? <MapPin className="w-4 h-4 mr-2 text-indigo-400" /> : <Building2 className="w-4 h-4 mr-2 text-indigo-400" />}
                                                Issue Location <span className="text-rose-500 ml-1">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsGeneralLocation(!isGeneralLocation)}
                                                className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                                            >
                                                {isGeneralLocation ? "Switch to Resource" : "Switch to General"}
                                            </button>
                                        </div>

                                        {isGeneralLocation ? (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <input
                                                    required
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Near Cafeteria entrance, Stairway B level 2..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <select
                                                    required
                                                    name="resourceId"
                                                    value={formData.resourceId}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer font-medium [&_option]:bg-[#0d1225]"
                                                >
                                                    <option value="">Select a specific resource/room...</option>
                                                    {resources.map(res => (
                                                        <option key={res.id} value={res.id}>
                                                            {res.name} ({res.location})
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="mt-2 text-[10px] text-indigo-300/40 ml-1 uppercase tracking-wider font-bold">
                                                    Can't find the resource? Switch to general location above.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Image Uploads */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-sm font-semibold text-indigo-200/70 uppercase tracking-wider flex items-center">
                                                <ImageIcon className="w-4 h-4 mr-2 text-indigo-400" /> Evidence Attachments
                                            </label>
                                            <span className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest">
                                                {selectedFiles.length}/3 Images
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {previews.map((preview, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group animate-in zoom-in duration-300">
                                                    <img src={preview} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-2 right-2 p-1.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-full transition-colors shadow-lg"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            {selectedFiles.length < 3 && (
                                                <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-white/5 transition-all group">
                                                    <Upload className="w-6 h-6 text-indigo-300/30 mb-2 group-hover:text-indigo-400 transition-colors" />
                                                    <span className="text-[10px] font-bold text-indigo-300/30 uppercase tracking-widest text-center px-2 group-hover:text-indigo-400">
                                                        Add Photo
                                                    </span>
                                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Priority */}
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
                                                                : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white/60'
                                                        }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Contact Details */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-indigo-200/70 ml-1 uppercase tracking-wider">
                                                Contact Detail
                                            </label>
                                            <input
                                                type="text"
                                                name="contactDetails"
                                                value={formData.contactDetails}
                                                onChange={handleChange}
                                                placeholder="Phone or specific location"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    {loading && uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">
                                                <span>Uploading Evidence</span>
                                                <span>{Math.round(uploadProgress)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-500 transition-all duration-300 ease-out" 
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300">
                                            <AlertCircle className="text-rose-400 w-5 h-5 shrink-0 mt-0.5" />
                                            <p className="text-sm text-rose-200/80 leading-relaxed font-medium">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-5 rounded-2xl flex items-center justify-center space-x-3 font-bold transition-all ${
                                            loading 
                                                ? 'bg-indigo-600/50 cursor-not-allowed text-white/50' 
                                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span className="tracking-widest uppercase text-sm">Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                <span className="tracking-widest uppercase text-sm">Submit Support Ticket</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Info Footer */}
                        <div className="bg-white/5 border-t border-white/5 px-8 md:px-12 py-6 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-indigo-300/40">
                                <Activity className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">System Status: Optimal</span>
                            </div>
                            <div className="text-xs text-indigo-300/40 font-medium">
                                Tracking ID provided after submission
                            </div>
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

export default CreateTicketPage;
