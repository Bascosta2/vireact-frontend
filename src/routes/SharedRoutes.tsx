import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Fallback from '@/components/Fallback';
import FunnelLayout from '@/pages/Funnel/FunnelLayout';

const QuizPage = lazy(() => import('@/pages/Funnel/Quiz'));
const ResultsPage = lazy(() => import('@/pages/Funnel/Results'));

function SharedRoutes() {
    return (
        <FunnelLayout>
            <Suspense fallback={<Fallback />}>
                <Routes>
                    <Route path='/start' element={<QuizPage />} />
                    <Route path='/start/results' element={<ResultsPage />} />
                    <Route path='*' element={<Navigate to='/start' replace />} />
                </Routes>
            </Suspense>
        </FunnelLayout>
    );
}

export default SharedRoutes;
