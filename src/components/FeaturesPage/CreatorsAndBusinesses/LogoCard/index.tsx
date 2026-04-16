interface LogoCardProps {
    image: string;
}

function LogoCard({ image }: LogoCardProps) {
    return (
        <div className="mx-4 flex shrink-0 items-center md:mx-8">
            <img
                src={image}
                alt="Logo"
                className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-full opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
            />
        </div>
    );
}

export default LogoCard;
