import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/api';
import { uploadToCloudinary } from '../../utils/cloudinary';
import CommentSection from '../../components/ticketing/CommentSection';
import ImageUpload from '../../components/ticketing/ImageUpload';
import { 
    ArrowLeft, 
    Clock, 
    Tag, 
    Shield, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    User,
    Edit3,
    Calendar,
    Phone,
    Settings,
    ChevronRight,
    Trash2
} from 'lucide-react';

const TicketDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [user, setUser] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // For Lightbox

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchTicketDetails();
        fetchComments();
        fetchImages();
    }, [id]);

    const fetchTicketDetails = async () => {
        setLoading(true);
        try {
            const response = await ticketService.getTicketById(id);
            // Wrapped in TicketingResponse
            setTicket(response.data.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch ticket details:", err);
            setError("Could not retrieve ticket information. It may have been deleted or you may not have permission to view it.");
        } finally {
            setLoading(false);
        }
    };
    const fetchComments = async () => {
        try {
            const response = await ticketService.getComments(id);
            // Wrapped in TicketingResponse
            setComments(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        }
    };
    const fetchImages = async () => {
        try {
            const response = await ticketService.getImages(id);
            // Wrapped in TicketingResponse
            setImages(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch images:", err);
        }
    };

    const handleCommentSubmit = async (content) => {
        try {
            await ticketService.addComment(id, { content });
            fetchComments(); // Refresh comments
        } catch (err) {
            console.error("Failed to add comment:", err);
        }
    };

    const handleImageUpload = async (file) => {
        try {
            const imageUrl = await uploadToCloudinary(file);
            await ticketService.addImageUrl(id, imageUrl);
            fetchImages(); // Refresh images
        } catch (err) {
            console.error("Failed to upload image:", err);
            setError("Failed to upload image. Please ensure it's a valid image format.");
            throw err; // Let component handle error state
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!isAdminOrTechnician) return;
        
        setUpdating(true);
        try {
            await ticketService.updateStatus(id, newStatus);
            await fetchTicketDetails(); // Refresh data
        } catch (err) {
            console.error("Failed to update status:", err);
            // Better error handling
            setError("You are not authorized to update the status of this ticket.");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteTicket = async () => {
        if (!isOwner) return;
        if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) return;

        try {
            await ticketService.deleteTicket(id);
            navigate('/tickets');
        } catch (err) {
            console.error("Failed to delete ticket:", err);
            alert("Failed to delete ticket. You may not have permission.");
        }
    };

    const isAdminOrTechnician = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
    const isOwner = String(user?.id) === String(ticket?.createdBy);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'LOW': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            default: return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'IN_PROGRESS': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
            case 'RESOLVED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'CLOSED': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
            default: return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
        }
    };

    if (loading && !ticket) {
        return (
            <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-indigo-300/60 font-medium animate-pulse">Retrieving ticket metadata...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
                    <AlertCircle className="text-rose-400 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-center">Ticket Not Found</h2>
                <p className="text-indigo-200/60 max-w-md text-center mb-8">{error}</p>
                <button 
                    onClick={() => navigate('/tickets')}
                    className="flex items-center space-x-2 text-indigo-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Return to Support Hub</span>
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col font-sans relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <main className="flex-1 overflow-y-auto z-10 p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header Action */}
                    <button 
                        onClick={() => navigate('/tickets')}
                        className="flex items-center space-x-2 text-indigo-300 hover:text-white transition-colors group mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">All Tickets</span>
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Ticket Summary Card */}
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden">
                                <div className="p-8 md:p-12 space-y-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2 text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
                                                <span>Ticket ID</span>
                                                <ChevronRight className="w-3 h-3" />
                                                <span className="text-indigo-400">#{ticket.id.toString().padStart(4, '0')}</span>
                                            </div>
                                            <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
                                                {ticket.description}
                                            </h1>
                                        </div>
                                        <div className="flex space-x-3">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border shrink-0 flex items-center ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border shrink-0 flex items-center ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest flex items-center">
                                                <Tag className="w-3 h-3 mr-1" /> Category
                                            </p>
                                            <p className="font-semibold text-white">{ticket.category}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" /> Logged On
                                            </p>
                                            <p className="font-semibold text-white">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest flex items-center">
                                                <User className="w-3 h-3 mr-1" /> Created By
                                            </p>
                                            <p className="font-semibold text-white">{ticket.creatorName || 'Anonymous'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest flex items-center">
                                                <Phone className="w-3 h-3 mr-1" /> Contact
                                            </p>
                                            <p className="font-semibold text-white truncate">{ticket.contactDetails || 'None Provided'}</p>
                                        </div>
                                    </div>

                                    {/* Action Panel */}
                                    {(isAdminOrTechnician || isOwner) && (
                                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 space-y-4">
                                            <div className="flex items-center space-x-2 text-indigo-300 mb-2">
                                                <Settings className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Management Controls</span>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {/* Tech/Admin Actions */}
                                                {isAdminOrTechnician && (
                                                    <>
                                                        <button 
                                                            disabled={updating || ticket.status === 'IN_PROGRESS'}
                                                            onClick={() => handleStatusUpdate('IN_PROGRESS')}
                                                            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                                                ticket.status === 'IN_PROGRESS'
                                                                    ? 'bg-indigo-600/50 text-white cursor-not-allowed'
                                                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                                            }`}
                                                        >
                                                            {updating && ticket.status !== 'IN_PROGRESS' ? 'Updating...' : 'Start Progress'}
                                                        </button>
                                                        <button 
                                                            disabled={updating || ticket.status === 'RESOLVED'}
                                                            onClick={() => handleStatusUpdate('RESOLVED')}
                                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all"
                                                        >
                                                            Mark as Resolved
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {/* Owner Actions */}
                                                {isOwner && (
                                                    <>
                                                        <button 
                                                            onClick={() => navigate(`/tickets/${id}/edit`)}
                                                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5 mr-2" />
                                                            Edit Ticket
                                                        </button>
                                                        <button 
                                                            onClick={handleDeleteTicket}
                                                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                            Delete Ticket
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Discussion Area */}
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12">
                                <CommentSection 
                                    ticketId={id} 
                                    comments={comments} 
                                    onAddComment={handleCommentSubmit} 
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Attachments Section */}
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                    <Shield className="w-5 h-5 mr-3 text-indigo-400" />
                                    Evidence Hub
                                </h3>
                                <div className="space-y-6">
                                    <ImageUpload 
                                        ticketId={id} 
                                        existingImages={images} 
                                        onUpload={handleImageUpload} 
                                        onImageClick={setSelectedImage}
                                    />
                                </div>
                            </div>

                            {/* Status Helper */}
                            <div className="bg-gradient-to-br from-blue-600/40 to-indigo-600/40 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <CheckCircle2 className="w-16 h-16 text-white" />
                                </div>
                                <h4 className="font-bold text-white mb-2 uppercase tracking-tight">Need Urgent Help?</h4>
                                <p className="text-white/60 text-sm leading-relaxed mb-4">
                                    If this situation poses an immediate danger to campus safety, please contact security directly at ext. 911.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Premium Lightbox Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="absolute inset-0 bg-[#0a0f1c]/90 backdrop-blur-xl"></div>
                    <div 
                        className="relative max-w-5xl w-full max-h-full flex flex-col items-center animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <img 
                            src={selectedImage} 
                            alt="Evidence Detail" 
                            className="w-full h-auto max-h-[80vh] object-contain rounded-3xl shadow-2xl border border-white/10"
                        />
                        <div className="mt-6 flex items-center space-x-3 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl">
                            <ImageIcon className="w-5 h-5 text-indigo-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Evidence Attachment</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketDetailsPage;
