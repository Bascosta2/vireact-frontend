import { useNavigate } from 'react-router-dom';
import { track } from '@/lib/analytics';
import { primaryCtaPath } from '@/funnel/cta';

interface UploadCTAInterface {
    uploadButtonText?: string;
    onUploadClick?: () => void;
    /** Reported as cta_clicked.location. */
    location?: string;
}

function UploadCTA({ uploadButtonText = "Upload Here", onUploadClick, location = 'upload_cta' }: UploadCTAInterface) {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        track('cta_clicked', { location });
        if (onUploadClick) {
            onUploadClick();
        } else {
            navigate(primaryCtaPath());
        }
    };

    return (
        <div className="flex justify-center w-full mb-6">
            <button
                type="button"
                className="btn-secondary px-8 py-4 text-lg border-none !rounded-full"
                onClick={handleButtonClick}
            >
                {uploadButtonText}
            </button>
        </div>
    )
}

export default UploadCTA
