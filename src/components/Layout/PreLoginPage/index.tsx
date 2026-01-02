export default function PreLoginPage({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`min-h-screen bg-black pt-18 pb-16 ${className}`}>
            {children}
        </div>
    )
}