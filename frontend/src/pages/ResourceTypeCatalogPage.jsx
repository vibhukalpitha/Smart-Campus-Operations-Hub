import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Camera,
    FlaskConical,
    Presentation,
    Users2,
    Wrench,
    Monitor,
    BookOpen,
    Trophy,
    Zap,
    ChevronDown,
    ChevronUp,
    Layers,
} from 'lucide-react';

// ── Catalog structure ─────────────────────────────────────────────────────────
const CATALOG = [
    {
        key: 'LECTURE_HALL',
        title: 'Lecture Hall',
        description: 'Large-capacity halls for lectures, seminars, and presentations.',
        icon: Building2,
        accent: 'from-blue-500 to-cyan-400',
        border: 'border-blue-500/30',
        isDirect: true,
    },
    {
        key: 'LAB',
        title: 'Lab',
        description: 'Specialized lab spaces for practical sessions and experiments.',
        icon: FlaskConical,
        accent: 'from-indigo-500 to-blue-400',
        border: 'border-indigo-500/30',
        isDirect: true,
    },
    {
        key: 'LIBRARY',
        title: 'Library',
        description: 'Library resources — meeting rooms and public computer stations.',
        icon: BookOpen,
        accent: 'from-emerald-500 to-teal-400',
        border: 'border-emerald-500/30',
        isDirect: false,
        subTypes: [
            {
                value: 'MEETING_ROOM',
                title: 'Meeting Room',
                description: 'Collaborative rooms for team meetings, briefings, and reviews.',
                icon: Users2,
                accent: 'from-emerald-500 to-cyan-400',
            },
            {
                value: 'PUBLIC_COMPUTERS',
                title: 'Public Computers',
                description: 'Computer stations available for public access within the library.',
                icon: Monitor,
                accent: 'from-teal-500 to-emerald-400',
            },
        ],
    },
    {
        key: 'EQUIPMENT',
        title: 'Equipment',
        description: 'AV and technical assets — projectors, cameras, and smart boards.',
        icon: Wrench,
        accent: 'from-violet-500 to-fuchsia-400',
        border: 'border-violet-500/30',
        isDirect: false,
        subTypes: [
            {
                value: 'PROJECTOR',
                title: 'Projector',
                description: 'Presentation equipment for classes, demos, and workshops.',
                icon: Presentation,
                accent: 'from-amber-500 to-orange-400',
            },
            {
                value: 'CAMERA',
                title: 'Camera',
                description: 'Media capture resources for events, projects, and documentation.',
                icon: Camera,
                accent: 'from-rose-500 to-red-400',
            },
            {
                value: 'SMART_BOARD',
                title: 'Smart Board',
                description: 'Interactive digital boards for modern collaborative learning.',
                icon: Monitor,
                accent: 'from-purple-500 to-indigo-400',
            },
        ],
    },
    {
        key: 'SPORT',
        title: 'Sport',
        description: 'Sports equipment and facilities — cricket, badminton, and more.',
        icon: Trophy,
        accent: 'from-orange-500 to-amber-400',
        border: 'border-orange-500/30',
        isDirect: false,
        subTypes: [
            {
                value: 'CRICKET',
                title: 'Cricket',
                description: 'Cricket equipment including bats, balls, and stumps.',
                icon: Trophy,
                accent: 'from-green-500 to-emerald-400',
            },
            {
                value: 'BADMINTON',
                title: 'Badminton',
                description: 'Badminton equipment including rackets and shuttlecocks.',
                icon: Zap,
                accent: 'from-yellow-500 to-orange-400',
            },
        ],
    },
];

// ── Sub-type card (inside an expanded category) ────────────────────────────────
const SubTypeCard = ({ subType, onSelect }) => {
    const Icon = subType.icon;
    return (
        <button
            onClick={() => onSelect(subType.value)}
            className="text-left rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-4 group"
        >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${subType.accent} flex items-center justify-center shadow-md flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{subType.title}</h4>
                <p className="text-xs text-blue-100/50 leading-snug mt-0.5 truncate">{subType.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/70 flex-shrink-0 transition-colors" />
        </button>
    );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const ResourceTypeCatalogPage = () => {
    const navigate = useNavigate();
    const [expandedKey, setExpandedKey] = useState(null);

    const openTypeResources = (type) => {
        navigate(`/resources/type/${type}`);
    };

    const toggleCategory = (key) => {
        setExpandedKey((prev) => (prev === key ? null : key));
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col font-sans">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12 relative">
                {/* Background blobs */}
                <div className="absolute top-16 right-16 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-8 left-8 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    {/* Back button */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-blue-200 text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>

                    {/* Page heading */}
                    <div className="mb-10">
                        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
                            Explore Resource Catalog
                        </h2>
                        <p className="text-blue-200/60 mt-3 max-w-2xl">
                            Select a resource type to browse available facilities and assets. Categories marked with{' '}
                            <Layers className="inline w-4 h-4 text-blue-400" /> contain multiple sub-types — click to expand.
                        </p>
                    </div>

                    {/* Category / type cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {CATALOG.map((cat) => {
                            const Icon = cat.icon;
                            const isExpanded = expandedKey === cat.key;

                            if (cat.isDirect) {
                                // ── Direct type card (Lecture Hall, Lab) ──────
                                return (
                                    <button
                                        key={cat.key}
                                        onClick={() => openTypeResources(cat.key)}
                                        className={`text-left rounded-3xl p-6 border ${cat.border} bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1`}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.accent} flex items-center justify-center shadow-lg`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-white/60" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{cat.title}</h3>
                                        <p className="text-sm leading-relaxed text-blue-100/60">{cat.description}</p>
                                    </button>
                                );
                            }

                            // ── Category card with expandable sub-types ────────
                            return (
                                <div
                                    key={cat.key}
                                    className={`rounded-3xl border ${cat.border} bg-white/5 transition-all duration-300 ${
                                        isExpanded ? 'md:col-span-2 xl:col-span-3' : 'hover:bg-white/10 hover:-translate-y-1'
                                    }`}
                                >
                                    {/* Category header — clickable to expand/collapse */}
                                    <button
                                        onClick={() => toggleCategory(cat.key)}
                                        className="w-full text-left p-6 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.accent} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-white">{cat.title}</h3>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-[10px] font-semibold uppercase tracking-wider">
                                                        <Layers className="w-3 h-3" />
                                                        {cat.subTypes.length} types
                                                    </span>
                                                </div>
                                                <p className="text-sm leading-relaxed text-blue-100/60">{cat.description}</p>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0 text-white/50">
                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    </button>

                                    {/* Expanded sub-types panel */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6">
                                            <div className="border-t border-white/10 pt-5">
                                                <p className="text-xs font-semibold text-blue-300/60 uppercase tracking-widest mb-4">
                                                    Select a type under {cat.title}
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {cat.subTypes.map((sub) => (
                                                        <SubTypeCard
                                                            key={sub.value}
                                                            subType={sub}
                                                            onSelect={openTypeResources}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ResourceTypeCatalogPage;
