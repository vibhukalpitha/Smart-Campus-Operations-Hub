import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-[#030610] border-t border-white/5 py-6 shrink-0 z-50">
            <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center opacity-70 hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm text-indigo-200/50">© 2026 Smart Campus Operations Hub. All rights reserved.</p>
                <div className="flex items-center space-x-6 mt-4 md:mt-0">
                    <a href="#" className="text-sm text-indigo-200/50 hover:text-indigo-300 transition-colors">Privacy Policy</a>
                    <a href="#" className="text-sm text-indigo-200/50 hover:text-indigo-300 transition-colors">Terms of Service</a>
                    <p className="text-sm text-indigo-200/50 flex items-center ml-4 border-l border-white/10 pl-4">
                        Built with <Heart className="w-4 h-4 mx-1.5 text-red-500/70 animate-pulse" /> for SLIIT
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
