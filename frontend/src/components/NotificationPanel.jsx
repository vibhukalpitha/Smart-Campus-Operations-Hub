import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../services/api';

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getAll();
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Polling every 30 seconds for new notifications
        const intervalId = setInterval(fetchNotifications, 30000);
        
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        
        return () => {
            clearInterval(intervalId);
            document.removeEventListener("mousedown", handleClickOutside);
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

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={panelRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-2 text-white hover:text-blue-200 transition-colors focus:outline-none"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
                    <div className="py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center px-4">
                        <span className="font-semibold text-gray-700">Notifications</span>
                        <span className="text-xs text-gray-500">{unreadCount} unread</span>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 flex space-x-3 text-xs">
                                        {!notification.read && (
                                            <button 
                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                        <button 
                                            onClick={(e) => handleDelete(notification.id, e)}
                                            className="text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
