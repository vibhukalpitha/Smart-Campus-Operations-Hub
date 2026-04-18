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
    Wrench
} from 'lucide-react';

const RESOURCE_TYPE_CARDS = [
    {
        value: 'LECTURE_HALL',
        title: 'Lecture Hall',
        description: 'Large-capacity halls for lectures, seminars, and presentations.',
        icon: Building2,
        accent: 'from-blue-500 to-cyan-400',
        border: 'border-blue-500/30'
    },
    {
        value: 'LAB',
        title: 'Lab',
        description: 'Specialized lab spaces for practical sessions and experiments.',
        icon: FlaskConical,
        accent: 'from-indigo-500 to-blue-400',
        border: 'border-indigo-500/30'
    },
    {
        value: 'MEETING_ROOM',
        title: 'Meeting Room',
        description: 'Collaborative rooms for team meetings, briefings, and reviews.',
        icon: Users2,
        accent: 'from-emerald-500 to-cyan-400',
        border: 'border-emerald-500/30'
    },
    {
        value: 'PROJECTOR',
        title: 'Projector',
        description: 'Presentation equipment for classes, demos, and workshops.',
        icon: Presentation,
        accent: 'from-amber-500 to-orange-400',
        border: 'border-amber-500/30'
    },
    {
        value: 'CAMERA',
        title: 'Camera',
        description: 'Media capture resources for events, projects, and documentation.',
        icon: Camera,
        accent: 'from-rose-500 to-red-400',
        border: 'border-rose-500/30'
    },
    {
        value: 'EQUIPMENT',
        title: 'Equipment',
        description: 'General-use equipment and supporting assets across campus.',
        icon: Wrench,
        accent: 'from-violet-500 to-fuchsia-400',
        border: 'border-violet-500/30'
    }
];

const ResourceTypeCatalogPage = () => {
    const navigate = useNavigate();

    const openTypeResources = (type) => {
        navigate(`/resources/type/${type}`);
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col font-sans">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12 relative">
                <div className="absolute top-16 right-16 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-8 left-8 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-blue-200 text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>

                    <div className="mb-10">
                        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
                            Explore Resource Catalog
                        </h2>
                        <p className="text-blue-200/60 mt-3 max-w-2xl">
                            Select a resource type to browse available facilities and assets with filters on the next page.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {RESOURCE_TYPE_CARDS.map((typeCard) => {
                            const Icon = typeCard.icon;

                            return (
                                <button
                                    key={typeCard.value}
                                    onClick={() => openTypeResources(typeCard.value)}
                                    className={`text-left rounded-3xl p-6 border ${typeCard.border} bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1`}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${typeCard.accent} flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-white/60" />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2">{typeCard.title}</h3>
                                    <p className="text-sm leading-relaxed text-blue-100/60">{typeCard.description}</p>
                                </button>
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
