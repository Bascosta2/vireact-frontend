import { useState, useEffect } from "react";

interface UseTypingEffectOptions {
    options: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    transitionDelay?: number;
}

export function useTypingEffect({
    options,
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseDuration = 2000,
    transitionDelay = 500
}: UseTypingEffectOptions) {
    const [typingText, setTypingText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        const currentOption = options[currentIndex];

        if (isTyping) {
            if (typingText.length < currentOption.length) {
                const timer = setTimeout(() => {
                    setTypingText(currentOption.slice(0, typingText.length + 1));
                }, typingSpeed);
                return () => clearTimeout(timer);
            } else {
                // Finished typing, wait then start deleting
                const timer = setTimeout(() => {
                    setIsTyping(false);
                }, pauseDuration);
                return () => clearTimeout(timer);
            }
        } else {
            if (typingText.length > 0) {
                const timer = setTimeout(() => {
                    setTypingText(typingText.slice(0, -1));
                }, deletingSpeed);
                return () => clearTimeout(timer);
            } else {
                // Finished deleting, move to next option
                const timer = setTimeout(() => {
                    setCurrentIndex((prev) => (prev + 1) % options.length);
                    setIsTyping(true);
                }, transitionDelay);
                return () => clearTimeout(timer);
            }
        }
    }, [typingText, currentIndex, isTyping, options, typingSpeed, deletingSpeed, pauseDuration, transitionDelay]);

    return typingText;
}
