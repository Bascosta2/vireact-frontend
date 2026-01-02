import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom"
import Fallback from "@/components/Fallback";



const Dashboard = lazy(() => import('@/pages/Admin/Dashboard'));


function AdminRoutes() {

    return (
        <Suspense fallback={<Fallback />}>
            <Routes>
                <Route path='*' element={<Navigate to="/" />} />
                <Route path='/' element={<Dashboard />} />
            </Routes>
        </Suspense>
    )
}

export default AdminRoutes