import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MessageSquare, AlertCircle, User, ArrowRight, MapPin } from 'lucide-react';

const TicketCard = ({ ticket }) => {
    const navigate = useNavigate();

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

    const status = ticket.status || 'OPEN';
    const priority = ticket.priority || 'LOW';
    const ticketId = ticket.id ? ticket.id.toString().padStart(4, '0') : '0000';

    return (
        <div 
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            className="group relative bg-[#0a0f1c]/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/20 cursor-pointer overflow-hidden flex flex-col h-full"
        >
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-[50px] group-hover:bg-indigo-500/20 transition-all duration-500"></div>
            
            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex flex-wrap gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border shadow-sm ${getPriorityColor(priority)}`}>
                        {priority}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border shadow-sm ${getStatusColor(status)}`}>
                        {status.replace('_', ' ')}
                    </span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">ID</span>
                    <p className="text-indigo-300/80 text-[11px] font-mono font-bold">#{ticketId}</p>
                </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors relative z-10 flex-1">
                {ticket.description || 'No description provided'}
            </h3>
            
            <div className="flex flex-col gap-2.5 mb-6 relative z-10">
                <div className="flex items-center text-white/50 text-xs font-medium">
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center mr-3 border border-white/5">
                        <MessageSquare className="w-3 h-3 text-indigo-400" />
                    </div>
                    {ticket.category}
                </div>
                
                <div className="flex items-center text-white/50 text-xs font-medium" title={ticket.location || (ticket.resourceId ? `Resource ID: ${ticket.resourceId}` : 'Not Specified')}>
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center mr-3 border border-white/5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="truncate">{ticket.location || (ticket.resourceId ? `Resource ID: ${ticket.resourceId}` : 'Location Not Specified')}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-white/10 relative z-10">
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Created</span>
                    <div className="flex items-center text-white/70 font-semibold text-xs">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div className="flex items-center text-indigo-400 font-bold text-xs uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                    View <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
