import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService, userService } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
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
    Trash2,
    X,
    Image as ImageIcon,
    ZoomIn,
    ZoomOut,
    MapPin
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
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolutionNoteText, setResolutionNoteText] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReasonText, setRejectionReasonText] = useState('');
    
    // Assignment states
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.role === 'ADMIN') {
                fetchTechnicians();
            }
        }
        fetchTicketDetails();
        fetchComments();
        fetchImages();
    }, [id]);

    const fetchTechnicians = async () => {
        try {
            const response = await userService.getAllUsers();
            const techList = response.data.filter(u => u.role === 'TECHNICIAN');
            setTechnicians(techList);
        } catch (err) {
            console.error("Failed to fetch technicians:", err);
        }
    };

    const fetchTicketDetails = async () => {
        setLoading(true);
        try {
            const response = await ticketService.getTicketById(id);
            const fetchedTicket = response.data.data;
            
            setTicket(fetchedTicket);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch ticket details:", err);
            setError("Could not retrieve ticket information. It may have been deleted.");
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

    const handleCommentEdit = async (commentId, newContent) => {
        try {
            await ticketService.updateComment(commentId, { content: newContent });
            fetchComments(); // Refresh comments
        } catch (err) {
            console.error("Failed to edit comment:", err);
            alert("Failed to edit comment. You may not have permission.");
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await ticketService.deleteComment(commentId);
            fetchComments(); // Refresh comments
        } catch (err) {
            console.error("Failed to delete comment:", err);
            alert("Failed to delete comment. You may not have permission.");
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

    const handleCloseTicket = async () => {
        if (!isOwner || ticket.status !== 'RESOLVED') return;
        if (!window.confirm("Are you sure you want to officially close this ticket?")) return;

        setUpdating(true);
        try {
            await ticketService.closeTicket(id);
            alert("Ticket successfully closed.");
            await fetchTicketDetails();
        } catch (err) {
            console.error("Failed to close ticket:", err);
            alert(err.response?.data?.message || "Failed to close ticket.");
        } finally {
            setUpdating(false);
        }
    };

    const handleResolveSubmit = async () => {
        if (!resolutionNoteText.trim()) {
            alert("Resolution note is required.");
            return;
        }
        setUpdating(true);
        try {
            await ticketService.resolveTicket(id, resolutionNoteText);
            setShowResolveModal(false);
            setResolutionNoteText('');
            alert("Ticket resolved successfully!");
            await fetchTicketDetails();
        } catch (err) {
            console.error("Failed to resolve ticket:", err);
            alert(err.response?.data?.message || "Failed to resolve ticket.");
        } finally {
            setUpdating(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReasonText.trim()) {
            alert("Rejection reason is required.");
            return;
        }
        setUpdating(true);
        try {
            await ticketService.rejectTicket(id, rejectionReasonText);
            setShowRejectModal(false);
            setRejectionReasonText('');
            alert("Ticket rejected successfully.");
            await fetchTicketDetails();
        } catch (err) {
            console.error("Failed to reject ticket:", err);
            alert(err.response?.data?.message || "Failed to reject ticket.");
        } finally {
            setUpdating(false);
        }
    };

    const handleAssignTechnician = async () => {
        if (!selectedTechnician) return;
        
        const confirms = window.confirm("Are you sure you want to officially assign this technician? If the ticket is currently OPEN, it will automatically switch to IN_PROGRESS.");
        if (!confirms) return;

        setIsAssigning(true);
        try {
            await ticketService.assignTechnician(id, selectedTechnician);
            alert("Technician assigned successfully!");
            fetchTicketDetails(); // Refresh ticket
            setSelectedTechnician('');
        } catch (err) {
            console.error("Failed to assign technician:", err);
            alert(err.response?.data?.message || "Failed to assign technician.");
        } finally {
            setIsAssigning(false);
        }
    };

    const isAdmin = user?.role === 'ADMIN';
    const isOwner = ticket && String(user?.id) === String(ticket.createdBy);
    const isAssignedTech = ticket && user?.role === 'TECHNICIAN' && String(ticket.assignedTo) === String(user?.id);
    const isViewer = ticket && !isAdmin && !isOwner && !isAssignedTech;
    const canManage = isAdmin || isAssignedTech;

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
            case 'REJECTED': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'OPEN': return <AlertCircle className="w-4 h-4" />;
            case 'IN_PROGRESS': return <Settings className="w-4 h-4" />;
            case 'RESOLVED': return <CheckCircle2 className="w-4 h-4" />;
            case 'CLOSED': return <CheckCircle2 className="w-4 h-4" />;
            case 'REJECTED': return <X className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
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

            <Header />

            <main className="flex-1 overflow-y-auto z-10 flex flex-col">
                <div className="p-4 md:p-8 flex-1 flex flex-col max-w-6xl mx-auto w-full space-y-8">
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
                                            <h1 className="text-3xl font-bold tracking-tight text-white leading-tight flex items-center flex-wrap gap-3">
                                                {ticket.description}
                                                {isViewer && (
                                                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest flex items-center">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        View Only Mode
                                                    </span>
                                                )}
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

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6 py-8 border-y border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest flex items-center">
                                                <Tag className="w-3 h-3 mr-1" /> Category
                                            </p>
                                            <p className="font-semibold text-white">{ticket.category}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest flex items-center">
                                                <MapPin className="w-3 h-3 mr-1" /> Location/Resource
                                            </p>
                                            <p className="font-semibold text-white">{ticket.location || (ticket.resourceId ? `Resource ID: ${ticket.resourceId}` : 'Not Specified')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" /> Logged On
                                            </p>
                                            <p className="font-semibold text-white">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest flex items-center">
                                                <Phone className="w-3 h-3 mr-1" /> Contact
                                            </p>
                                            <p className="font-semibold text-white truncate">{isViewer ? <span className="text-indigo-300/40 italic">Hidden for privacy</span> : (ticket.contactDetails || 'None Provided')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest flex items-center">
                                                <Shield className="w-3 h-3 mr-1" /> Assigned Tech
                                            </p>
                                            <p className="font-semibold text-white">{ticket.assignedTo ? `Tech ID: ${ticket.assignedTo}` : 'Unassigned'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest flex items-center">
                                                <User className="w-3 h-3 mr-1" /> Created By
                                            </p>
                                            <p className="font-semibold text-white">{isViewer ? <span className="text-indigo-300/40 italic">Hidden for privacy</span> : (ticket.createdBy ? `User ID: ${ticket.createdBy}` : 'Anonymous')}</p>
                                        </div>
                                    </div>

                                    {/* Action Panel */}
                                    {!isViewer && (canManage || isOwner) && (
                                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 space-y-4">
                                            <div className="flex items-center space-x-2 text-indigo-300 mb-2">
                                                <Settings className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Management Controls</span>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {/* Start Progress Action */}
                                                {canManage && (
                                                    <button 
                                                        disabled={updating || ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'}
                                                        onClick={() => handleStatusUpdate('IN_PROGRESS')}
                                                        className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                                            ticket.status === 'IN_PROGRESS'
                                                                ? 'bg-indigo-600/50 text-white cursor-not-allowed'
                                                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                                        }`}
                                                    >
                                                        {updating && ticket.status !== 'IN_PROGRESS' ? 'Updating...' : 'Start Progress'}
                                                    </button>
                                                )}

                                                {/* Technician ONLY Resolve Action */}
                                                {user?.role === 'TECHNICIAN' && String(ticket.assignedTo) === String(user.id) && (
                                                    <button 
                                                        disabled={updating || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' || ticket.status === 'REJECTED'}
                                                        onClick={() => setShowResolveModal(true)}
                                                        className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                                            ['RESOLVED', 'CLOSED', 'REJECTED'].includes(ticket.status)
                                                                ? 'bg-emerald-600/50 text-white cursor-not-allowed hidden'
                                                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                                                        }`}
                                                    >
                                                        Mark as Resolved
                                                    </button>
                                                )}

                                                {/* Admin ONLY Reject Action */}
                                                {isAdmin && (['OPEN', 'IN_PROGRESS'].includes(ticket.status)) && (
                                                    <button 
                                                        disabled={updating}
                                                        onClick={() => setShowRejectModal(true)}
                                                        className="bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                                    >
                                                        Reject Ticket
                                                    </button>
                                                )}
                                                
                                                {/* Owner Actions */}
                                                {isOwner && (
                                                    <>
                                                        {ticket.status === 'RESOLVED' && (
                                                            <button 
                                                                disabled={updating}
                                                                onClick={handleCloseTicket}
                                                                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center"
                                                            >
                                                                {updating ? 'Closing...' : 'Close Ticket'}
                                                            </button>
                                                        )}
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
                            {/* Rejection Note Display */}
                            {ticket.rejectionNote && (
                                <div className="bg-rose-500/5 backdrop-blur-2xl border border-rose-500/20 rounded-[2.5rem] p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between text-rose-400 mb-6">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mr-4">
                                                <X className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">Rejection Reason</h3>
                                                <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Declined by Administrator</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#0a0f1c]/40 rounded-3xl p-6 border border-white/5">
                                        <p className="text-white/80 leading-relaxed italic">
                                            "{ticket.rejectionNote}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Resolution Notes Display */}
                            {ticket.resolutionNote && (
                                <div className="bg-emerald-500/5 backdrop-blur-2xl border border-emerald-500/20 rounded-[2.5rem] p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between text-emerald-400 mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Resolution Notes</h3>
                                        </div>
                                        {ticket.resolvedAt && (
                                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                                                {new Date(ticket.resolvedAt).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-[#0a0f1c]/50 rounded-2xl p-6 text-emerald-100/80 leading-relaxed text-sm whitespace-pre-wrap border border-white/5">
                                        {ticket.resolutionNote}
                                    </div>
                                </div>
                            )}

                            {/* Discussion Area */}
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12">
                                <CommentSection 
                                    ticketId={id} 
                                    comments={comments} 
                                    onAddComment={handleCommentSubmit} 
                                    currentUser={user}
                                    onEditComment={handleCommentEdit}
                                    onDeleteComment={handleCommentDelete}
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

                            {/* Assign Technician (ADMIN ONLY) */}
                            {user?.role === 'ADMIN' && ticket && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                        <User className="w-5 h-5 mr-3 text-emerald-400" />
                                        Assign Technician
                                    </h3>
                                    <div className="space-y-4">
                                        {ticket.assignedTo && (
                                            <div className="text-sm text-indigo-300 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 mb-4 animate-in fade-in zoom-in duration-300">
                                                <span className="font-bold text-emerald-400 block mb-1">Currently Assigned To:</span>
                                                Technician ID: {ticket.assignedTo}
                                            </div>
                                        )}
                                        <select 
                                            value={selectedTechnician}
                                            onChange={(e) => setSelectedTechnician(e.target.value)}
                                            className="w-full bg-[#0a0f1c] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Select a technician...</option>
                                            {technicians.map(tech => (
                                                <option key={tech.id} value={tech.id}>
                                                    {tech.firstName} {tech.lastName} ({tech.email})
                                                </option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={handleAssignTechnician}
                                            disabled={!selectedTechnician || isAssigning}
                                            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white shadow-lg shadow-emerald-500/20 px-6 py-4 rounded-2xl font-bold tracking-widest uppercase transition-all flex justify-center items-center"
                                        >
                                            {isAssigning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Assignment'}
                                        </button>
                                    </div>
                                </div>
                            )}

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
                
                {/* Footer Section inside main scroller */}
                <div className="shrink-0 mt-auto pt-12 w-full max-w-4xl mx-auto px-4 md:px-8">
                    <Footer />
                </div>
            </main>

            {/* Premium Lightbox Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
                    onClick={() => {
                        setSelectedImage(null);
                        setZoomLevel(1);
                    }}
                >
                    <div className="absolute inset-0 bg-[#0a0f1c]/95 backdrop-blur-2xl"></div>
                    
                    {/* Controls */}
                    <div className="absolute top-6 right-6 flex items-center space-x-4 z-50">
                        <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20 flex items-center" onClick={e => e.stopPropagation()}>
                            <button 
                                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                                className="p-2 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-all"
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-5 h-5" />
                            </button>
                            <div className="px-3 text-xs font-bold font-mono text-white/50 w-16 text-center">
                                {Math.round(zoomLevel * 100)}%
                            </div>
                            <button 
                                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                                className="p-2 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-all"
                                title="Zoom In"
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                                setZoomLevel(1);
                            }}
                            className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-rose-500/50 hover:text-white border border-white/20 text-white/80 transition-all group"
                        >
                            <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <div 
                        className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div 
                            className="w-full h-full flex items-center justify-center overflow-auto cursor-move custom-scrollbar"
                            style={{ padding: '40px' }}
                        >
                            <img 
                                src={selectedImage} 
                                alt="Evidence Detail" 
                                className="max-w-none transition-transform duration-300 ease-out rounded-xl shadow-2xl origin-center"
                                style={{ 
                                    transform: `scale(${zoomLevel})`,
                                    maxHeight: zoomLevel <= 1 ? '85vh' : 'none',
                                    maxWidth: zoomLevel <= 1 ? '100%' : 'none'
                                }}
                            />
                        </div>
                        <div className="absolute bottom-8 flex items-center space-x-3 bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl">
                            <ImageIcon className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white/90">Detailed Evidence View</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Resolve Ticket Modal */}
            {showResolveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0a0f1c]/90 backdrop-blur-xl" onClick={() => setShowResolveModal(false)}></div>
                    <div className="relative bg-[#0d1225] border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400 mr-3" />
                                Resolve Ticket
                            </h3>
                            <button onClick={() => setShowResolveModal(false)} className="p-2 bg-white/5 hover:bg-rose-500/80 hover:text-white rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-indigo-300/60 uppercase tracking-widest">
                                Resolution Notes <span className="text-rose-500">*</span>
                            </label>
                            <textarea 
                                value={resolutionNoteText}
                                onChange={(e) => setResolutionNoteText(e.target.value)}
                                placeholder="Describe the steps taken to resolve this issue..."
                                rows="5"
                                className="w-full bg-[#0a0f1c] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                            ></textarea>
                            
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mt-4">
                                <p className="text-xs text-emerald-400/80 leading-relaxed font-bold">
                                    Submitting this will explicitly set the ticket state to RESOLVED and notify the creator. Ensure the steps are detailed and correct.
                                </p>
                            </div>

                            <button 
                                onClick={handleResolveSubmit}
                                disabled={updating || !resolutionNoteText.trim()}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/20 px-6 py-4 rounded-2xl font-bold tracking-widest uppercase transition-all flex justify-center items-center mt-6"
                            >
                                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Resolution'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Reject Ticket Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0a0f1c]/90 backdrop-blur-xl" onClick={() => setShowRejectModal(false)}></div>
                    <div className="relative bg-[#0d1225] border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center">
                                <X className="w-6 h-6 text-rose-400 mr-3" />
                                Reject Ticket
                            </h3>
                            <button onClick={() => setShowRejectModal(false)} className="p-2 bg-white/5 hover:bg-rose-500/80 hover:text-white rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-indigo-300/60 uppercase tracking-widest">
                                Rejection Reason <span className="text-rose-500">*</span>
                            </label>
                            <textarea 
                                value={rejectionReasonText}
                                onChange={(e) => setRejectionReasonText(e.target.value)}
                                placeholder="Explain why this ticket is being rejected..."
                                rows="5"
                                className="w-full bg-[#0a0f1c] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all resize-none"
                            ></textarea>
                            
                            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl mt-4">
                                <p className="text-xs text-rose-400/80 leading-relaxed font-bold">
                                    Rejecting this ticket will set its status to REJECTED. This action is visible to the ticket creator.
                                </p>
                            </div>

                            <button 
                                onClick={handleRejectSubmit}
                                disabled={updating || !rejectionReasonText.trim()}
                                className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-lg shadow-rose-600/20 px-6 py-4 rounded-2xl font-bold tracking-widest uppercase transition-all flex justify-center items-center mt-6"
                            >
                                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketDetailsPage;
