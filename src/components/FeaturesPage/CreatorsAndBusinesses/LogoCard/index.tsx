interface LogoCardProps {
    image: string;
}

function LogoCard({ image }: LogoCardProps) {
    return (
        <div className="mx-8 flex items-center">
            <img
                src={image}
                alt="Logo"
                className="w-10 h-10 object-cover rounded-full opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
            />
        </div>
    );
}

export default LogoCard;
