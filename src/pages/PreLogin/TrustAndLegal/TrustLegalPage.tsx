import React from 'react';
import PreLoginPage from '@/components/Layout/PreLoginPage';

interface TrustLegalPageProps {
    title: string;
    children: React.ReactNode;
}

function TrustLegalPage({ title, children }: TrustLegalPageProps) {
    return (
        <PreLoginPage>
            <div className="min-h-screen bg-black text-gray-300">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12">
                        {title}
                    </h1>
                    <div className="prose prose-invert max-w-none">
                        <div className="space-y-6 sm:space-y-8 text-base sm:text-lg leading-relaxed">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </PreLoginPage>
    );
}

export default TrustLegalPage;
