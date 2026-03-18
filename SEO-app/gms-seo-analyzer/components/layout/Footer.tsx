export default function Footer() {
    return (
        <footer className="w-full border-t border-electric/10 bg-navy-700/50 mt-auto">
            <div className="max-w-[1440px] mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-slate-400">
                            © {new Date().getFullYear()} <span className="text-white font-medium">Growth Marketing Studios</span>. All rights reserved.
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Powered by DataForSEO API & OpenAI GPT-4o
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://growthmarketingstudios.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-400 hover:text-electric-400 transition-colors"
                        >
                            Visit Our Website
                        </a>
                        <a
                            href="https://growthmarketingstudios.com/contact"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-400 hover:text-electric-400 transition-colors"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
