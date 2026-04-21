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
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full group-hover:bg-indigo-500/10 transition-all duration-500"></div>
            
            <div className="flex justify-between items-start mb-4">
                <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(priority)}`}>
                        {priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(status)}`}>
                        {status.replace('_', ' ')}
                    </span>
                </div>
                <p className="text-white/20 text-[10px] font-mono">#{ticketId}</p>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                {ticket.description || 'No description provided'}
            </h3>
            
            <div className="flex flex-wrap gap-2 text-white/40 text-xs mb-6">
                <span className="bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 font-medium tracking-wide">
                    {ticket.category}
                </span>
                <span className="bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 font-medium tracking-wide flex items-center max-w-[200px]" title={ticket.location || (ticket.resourceId ? `Resource ID: ${ticket.resourceId}` : 'Not Specified')}>
                    <MapPin className="w-3 h-3 mr-1 shrink-0" />
                    <span className="truncate">{ticket.location || (ticket.resourceId ? `Resource ID: ${ticket.resourceId}` : 'Not Specified')}</span>
                </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-white/40 text-[10px]">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div className="flex items-center text-indigo-400 font-bold text-xs">
                    Details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
