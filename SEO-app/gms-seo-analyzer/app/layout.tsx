import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
    title: 'Growth Marketing Studios — SEO Analyzer',
    description: 'Complete SEO analysis powered by DataForSEO and AI. Enter up to 5 domains to get a full technical SEO audit with actionable recommendations.',
    keywords: ['SEO', 'SEO analyzer', 'SEO audit', 'Growth Marketing Studios', 'DataForSEO', 'domain analysis'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body className="min-h-screen flex flex-col relative">
                {/* Video Background */}
                <div className="fixed inset-0 -z-10 overflow-hidden">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute w-full h-full object-cover"
                    >
                        <source src="/VideoA.webm" type="video/webm" />
                    </video>
                    {/* Dark overlay for readability */}
                    <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-[2px]" />
                </div>
                {children}
            </body>
        </html>
    );
}
