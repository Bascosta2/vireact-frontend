import { NavLink } from "react-router-dom";
import type { SocialIcon as SocialIconType } from "@/types/footer";

export const SocialIcon: React.FC<SocialIconType> = ({ icon: Icon, href, label }) => (
    <NavLink
        to={href}
        className="flex items-center justify-center w-6 h-6 text-white hover:text-gray-300 transition-colors duration-200"
        aria-label={label}
    >
        <Icon className="w-6 h-6" />
    </NavLink>
);