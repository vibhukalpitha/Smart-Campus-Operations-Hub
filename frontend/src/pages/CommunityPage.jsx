import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { userService } from '../services/api';
import { Users, Search, MessageSquare, Award, Star, ArrowRight, ShieldCheck, Zap, BookOpen } from 'lucide-react';

const CommunityPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await userService.getAllUsers();
                setUsers(response.data);
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const syntheticUsers = [
        { id: 's1', firstName: 'Alexander', lastName: 'Wright', role: 'ADMIN', email: 'admin.wright@edunexus.edu', customPic: 'https://i.pravatar.cc/150?u=alexander' },
        { id: 's2', firstName: 'Dr. Emily', lastName: 'Carter', role: 'LECTURER', email: 'emily.carter@edunexus.edu', customPic: 'https://i.pravatar.cc/150?u=emily' },
        { id: 's3', firstName: 'Prof. Michael', lastName: 'Dawson', role: 'LECTURER', email: 'm.dawson@edunexus.edu', customPic: 'https://i.pravatar.cc/150?u=michael' },
        { id: 's4', firstName: 'Marcus', lastName: 'Chen', role: 'TECHNICIAN', email: 'marcus.tch@edunexus.edu', customPic: 'https://i.pravatar.cc/150?u=marcus' },
        { id: 's5', firstName: 'Sophia', lastName: 'Martinez', role: 'TECHNICIAN', email: 'sophia.m@edunexus.edu', customPic: 'https://i.pravatar.cc/150?u=sophia' }
    ];

    const displayUsers = [...syntheticUsers, ...users];

    const admins = displayUsers.filter(u => u.role === 'ADMIN');
    const lecturers = displayUsers.filter(u => u.role === 'LECTURER');
    const technicians = displayUsers.filter(u => u.role === 'TECHNICIAN');

    const filteredUsers = (list) => {
        if (!searchQuery) return list;
        return list.filter(u => 
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };


    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col font-sans">
            <Header />
            
            <main className="flex-1 container mx-auto px-4 py-12 relative">
                <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-4 tracking-tight">
                                EduNexus Community
                            </h2>
                            <p className="text-blue-200/60 max-w-xl text-lg">
                                Meet our dedicated team of administrators, educators, and technical experts.
                            </p>
                        </div>
                        
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40 group-focus-within:text-blue-400 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search our team..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-16">
                        {/* Admins */}
                        {filteredUsers(admins).length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-purple-500/20 rounded-2xl">
                                        <ShieldCheck className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">System Administrators</h3>
                                        <p className="text-xs text-purple-300/60 font-semibold uppercase tracking-widest mt-1">Platform Governance</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredUsers(admins).map((user) => (
                                        <UserCard key={user.id} user={user} color="purple" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Lecturers */}
                        {filteredUsers(lecturers).length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                        <BookOpen className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Academic Faculty</h3>
                                        <p className="text-xs text-emerald-300/60 font-semibold uppercase tracking-widest mt-1">Resource Instructors</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredUsers(lecturers).map((user) => (
                                        <UserCard key={user.id} user={user} color="emerald" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Technicians */}
                        {filteredUsers(technicians).length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-orange-500/20 rounded-2xl">
                                        <Zap className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Technical Support</h3>
                                        <p className="text-xs text-orange-300/60 font-semibold uppercase tracking-widest mt-1">Maintenance & Assets</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredUsers(technicians).map((user) => (
                                        <UserCard key={user.id} user={user} color="orange" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center py-24 opacity-50">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-sm font-bold tracking-widest uppercase">Connecting to Community...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const UserCard = ({ user, color }) => {
    const colorClasses = {
        purple: "border-purple-500/20 group-hover:border-purple-500/50 group-hover:bg-purple-500/5",
        emerald: "border-emerald-500/20 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5",
        orange: "border-orange-500/20 group-hover:border-orange-500/50 group-hover:bg-orange-500/5",
    };

    const textClasses = {
        purple: "text-purple-400",
        emerald: "text-emerald-400",
        orange: "text-orange-400",
    };

    return (
        <div className={`bg-white/5 border rounded-3xl p-6 transition-all duration-300 group ${colorClasses[color]}`}>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white/5 group-hover:ring-offset-2 group-hover:ring-offset-[#0a0f1c] transition-all bg-gradient-to-br from-white/10 to-transparent">
                    {user.customPic ? (
                        <img src={user.customPic} alt="" className="w-full h-full object-cover" />
                    ) : user.profilePicture ? (
                        <img src={`http://localhost:8080/uploads/profile-pictures/${user.profilePicture}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold opacity-30">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-white text-lg leading-tight">{user.firstName} {user.lastName}</h4>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${textClasses[color]}`}>{user.role}</p>
                </div>
            </div>

            
            <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-white/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" /> {user.email}
                </div>
            </div>

            <button className={`w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold transition-all group-hover:bg-white group-hover:text-black`}>
                View Profile
            </button>
        </div>
    );
};

export default CommunityPage;
