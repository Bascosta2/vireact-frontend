export default function PreLoginPage({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`min-h-screen pt-18 pb-8 md:pb-16 ${className}`}>
            {children}
        </div>
    )
}