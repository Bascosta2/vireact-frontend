interface TestimonialCardProps {
    achievement: string;
    subtitle: string;
    quote: string;
    avatar: string;
    name: string;
    role: string;
}

function TestimonialsCard({ testimonial }: { testimonial: TestimonialCardProps }) {
    const { achievement, subtitle, quote, avatar, name, role } = testimonial;
    return (
        <div className="flex-shrink-0 w-80 mx-3">
                <div className="bg-dark-primary bg-opacity-50 backdrop-blur-lg border border-gradient-primary rounded-2xl p-6 h-full min-h-80">
                <div className="text-center mb-6">
                    <div className="text-4xl md:text-5xl font-heading font-normal text-gradient-primary mb-2">
                        {achievement}
                    </div>
                    <div className="text-gray-300 text-sm">
                        {subtitle}
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                        "{quote}"
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img
                                src={avatar}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-left">
                            <div className="text-white font-semibold text-sm">
                                {name}
                            </div>
                            <div className="text-gray-400 text-xs">
                                {role}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TestimonialsCard;