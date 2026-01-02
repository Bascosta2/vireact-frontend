export interface FooterLink {
    label: string;
    href: string;
}

export interface FooterSection {
    title: string;
    links: FooterLink[];
}

export interface FooterProps {
    className?: string;
}

export interface SocialIcon {
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    label: string;
}