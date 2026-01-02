import { NavLink } from "react-router-dom";
import type { FooterSection as FooterSectionType} from "@/types/footer";



export const FooterSection: React.FC<{ section: FooterSectionType }> = ({ section }) => (
    <div className="flex flex-col gap-5">
        <h3 className="text-4xl font-normal leading-tight text-white font-heading uppercase">
            {section.title}
        </h3>
        <nav>
            <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                    <li key={link.href}>
                        <NavLink
                            to={link.href}
                            className="text-base font-semibold leading-relaxed text-gray-400 hover:text-white transition-colors duration-200"
                        >
                            {link.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    </div>
);
