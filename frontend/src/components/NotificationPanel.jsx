import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, Calendar, MessageSquare, X } from 'lucide-react';
import { notificationService } from '../services/api';
import { Client } from '@stomp/stompjs';

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [animateBell, setAnimateBell] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await notificationService.getAll();
                setNotifications(response.data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchNotifications();
        
        let stompClient = null;
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            stompClient = new Client({
                brokerURL: 'ws://localhost:8080/ws',
                debug: () => {}, 
                onConnect: () => {
                    stompClient.subscribe(`/topic/notifications/${user.email}`, (msg) => {
                        const newNotification = JSON.parse(msg.body);
                        setNotifications(prev => [newNotification, ...prev]);
                        setAnimateBell(true);
                        setTimeout(() => setAnimateBell(false), 2000);
                    });
                    
                    stompClient.subscribe('/topic/notifications', (msg) => {
                        const newNotification = JSON.parse(msg.body);
                        setNotifications(prev => {
                            if (prev.find(n => n.id === newNotification.id)) return prev;
                            setAnimateBell(true);
                            setTimeout(() => setAnimateBell(false), 2000);
                            return [newNotification, ...prev];
                        });
                    });
                }
            });
            stompClient.activate();
        }

        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, []);

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationService.delete(id);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'ALERT': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
            case 'MAINTENANCE': return <Calendar className="w-4 h-4 text-amber-400" />;
            case 'EVENT': return <MessageSquare className="w-4 h-4 text-emerald-400" />;
            default: return <Info className="w-4 h-4 text-indigo-400" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={panelRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group ${animateBell ? 'animate-bounce' : ''}`}
            >
                <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-indigo-400' : 'text-white/60'} group-hover:text-white transition-colors`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 -mr-1 -mt-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 text-[10px] items-center justify-center font-bold text-white leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-[#0d1225]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300 origin-top-right">
                    <div className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-white">Activity Feed</h3>
                            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">{unreadCount} New Alerts</p>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="max-h-[32rem] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="px-6 py-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                                    <Bell className="w-6 h-6 text-white/10" />
                                </div>
                                <p className="text-white/30 text-sm font-medium">All caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`group px-6 py-5 hover:bg-white/[0.02] transition-all relative ${!notification.read ? 'bg-indigo-500/[0.03]' : ''}`}
                                    >
                                        {!notification.read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                        )}
                                        <div className="flex items-start space-x-4">
                                            <div className="mt-1 flex-shrink-0">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                                                    notification.type === 'ALERT' 
                                                    ? 'bg-rose-500/10 border-rose-500/20' 
                                                    : 'bg-indigo-500/10 border-indigo-500/20'
                                                }`}>
                                                    {getIcon(notification.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-sm font-bold text-white truncate ${!notification.read ? 'pr-2' : ''}`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] font-bold text-white/20 whitespace-nowrap uppercase tracking-tighter">
                                                        {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white/50 mt-1 leading-relaxed line-clamp-2 italic">
                                                    "{notification.message}"
                                                </p>
                                                
                                                <div className="mt-3 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notification.read && (
                                                        <button 
                                                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                            className="flex items-center text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                                                        >
                                                            <Check className="w-3 h-3 mr-1" />
                                                            Mark Read
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => handleDelete(notification.id, e)}
                                                        className="flex items-center text-[10px] font-bold text-rose-500/60 hover:text-rose-400 uppercase tracking-widest"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" />
                                                        Archive
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {notifications.length > 0 && (
                        <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                            <button className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white/40 transition-colors">
                                View History Context
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
