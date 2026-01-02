import UploadCTA from "@/components/UploadCTA";

interface CTAProps {
    ctaHeading: string;
}

function CTA({ ctaHeading }: CTAProps) {
    return (
        <div className="w-full max-w-7xl mx-auto py-16">
            <h1 className="font-bold mb-8 text-center">{ctaHeading}</h1>
            <UploadCTA 
            />
        </div>
    )
}

export default CTA;