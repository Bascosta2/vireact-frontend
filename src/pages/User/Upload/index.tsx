import { useNavigate, useLocation } from 'react-router-dom';
import UserPage from '@/components/Layout/UserPage';
import UploadPage from '@/pages/User/Dashboard/UploadPage';

function Upload() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        navigate('/dashboard');
    };

    return (
        <UserPage mainClassName="pt-8 md:pt-10 px-6 md:px-8">
            <UploadPage key={location.key} onBack={handleBack} />
        </UserPage>
    );
}

export default Upload;
