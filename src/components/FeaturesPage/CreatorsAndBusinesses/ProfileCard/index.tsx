interface ProfileCardProps {
    name: string;
    image: string;
    followers: string;
}

function ProfileCard({ name, image, followers }: ProfileCardProps) {
    return (
        <div className="flex flex-col items-center mx-6">
            {/* Profile Image */}
            <div className="w-16 h-16 rounded-full overflow-hidden mb-3 relative">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Name */}
            <h4 className="text-sm font-medium text-white mb-1">{name}</h4>
            
            {/* Follower Count */}
            <p className="text-xs text-gray-400">{followers}</p>
        </div>
    );
}

export default ProfileCard;
