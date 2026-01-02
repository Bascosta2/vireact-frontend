import {
    // Beauty thumbnails
    beautyCandySuperstar,
    beautyNikkie,
    
    // Coach thumbnails
    coachLifeCoach,
    
    // Education thumbnails
    educationIce,
    educationScience,
    
    // Entertainment thumbnails
    entertainmentBasCosta,
    entertainmentRunningMaverick,
    entertainmentMrBeastNewspaper,
    
    // Fitness thumbnails
    fitnessHealthBerries,
    fitnessLetsSeeWhoIsStronger,
    
    // Food thumbnails
    foodCuttingChicken,
    foodShawarmaFries,
    
    // Gaming thumbnails
    gamingGirlSmileGamePlay,
    gamingGta,
    
    // Live Stream thumbnails
    liveStreamNinja,
    liveStreamIshowspeedAstonished,
    
    // Motivation thumbnails
    motivationGoggins,
    motivationChrisWilliamson,
    
    // Podcast thumbnails
    podcastHormozi,
    podcastJoeRogan,
    
    // Travel thumbnails
    travelVan,
    travel12Hours,
    
    // Vlog thumbnails
    vlogBurger,
    vlogShocked,
} from '@/assets/thumbnails/index';

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Helper function to check if array has consecutive same categories
function hasConsecutiveSameCategory(array: any[]): boolean {
    for (let i = 0; i < array.length - 1; i++) {
        if (array[i].category === array[i + 1].category) {
            return true;
        }
    }
    return false;
}

// Helper function to fix consecutive same categories by swapping
function fixConsecutiveCategories(array: any[]): any[] {
    const fixed = [...array];
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loops
    
    while (hasConsecutiveSameCategory(fixed) && attempts < maxAttempts) {
        for (let i = 0; i < fixed.length - 1; i++) {
            if (fixed[i].category === fixed[i + 1].category) {
                // Find a suitable swap candidate
                for (let j = 0; j < fixed.length; j++) {
                    if (j !== i && j !== i + 1 && 
                        (j === 0 || fixed[j - 1].category !== fixed[i].category) &&
                        (j === fixed.length - 1 || fixed[j + 1].category !== fixed[i].category)) {
                        // Swap the consecutive item with the candidate
                        [fixed[i + 1], fixed[j]] = [fixed[j], fixed[i + 1]];
                        break;
                    }
                }
            }
        }
        attempts++;
    }
    
    return fixed;
}

// Create the initial data array
const initialNicheData = [
    // Beauty & Fashion (2 thumbnails)
    {
        id: "beauty-candy-superstar",
        category: "Beauty & Fashion",
        alt: "BEAUTY CONTENT",
        thumbnail: beautyCandySuperstar
    },
    {
        id: "beauty-nikkie",
        category: "Beauty & Fashion",
        alt: "FASHION STYLE",
        thumbnail: beautyNikkie
    },
    
    // Coaching & Mentoring (1 thumbnail)
    {
        id: "coach-life-coach",
        category: "Coaching & Mentoring",
        alt: "LIFE COACHING",
        thumbnail: coachLifeCoach
    },
    
    // Education (2 thumbnails)
    {
        id: "education-ice",
        category: "Education",
        alt: "LEARNING CONTENT",
        thumbnail: educationIce
    },
    {
        id: "education-science",
        category: "Education",
        alt: "SCIENCE EDUCATION",
        thumbnail: educationScience
    },
    
    // Entertainment (3 thumbnails) - Founder special effect on basCosta
    {
        id: "entertainment-bas-costa-founder",
        category: "Entertainment",
        alt: "FOUNDER'S CONTENT",
        thumbnail: entertainmentBasCosta,
        isFounder: true
    },
    {
        id: "entertainment-running-maverick",
        category: "Entertainment",
        alt: "ENTERTAINMENT VIDEOS",
        thumbnail: entertainmentRunningMaverick
    },
    {
        id: "entertainment-mr-beast-newspaper",
        category: "Entertainment",
        alt: "VIRAL CONTENT",
        thumbnail: entertainmentMrBeastNewspaper
    },
    
    // Fitness (2 thumbnails)
    {
        id: "fitness-health-berries",
        category: "Fitness",
        alt: "HEALTH & FITNESS",
        thumbnail: fitnessHealthBerries
    },
    {
        id: "fitness-lets-see-who-is-stronger",
        category: "Fitness",
        alt: "WORKOUT VIDEOS",
        thumbnail: fitnessLetsSeeWhoIsStronger
    },
    
    // Food & Cooking (2 thumbnails)
    {
        id: "food-cutting-chicken",
        category: "Food & Cooking",
        alt: "COOKING CONTENT",
        thumbnail: foodCuttingChicken
    },
    {
        id: "food-shawarma-fries",
        category: "Food & Cooking",
        alt: "RECIPE SHARING",
        thumbnail: foodShawarmaFries
    },
    
    // Gaming (2 thumbnails)
    {
        id: "gaming-girl-smile-game-play",
        category: "Gaming",
        alt: "GAMING CONTENT",
        thumbnail: gamingGirlSmileGamePlay
    },
    {
        id: "gaming-gta",
        category: "Gaming",
        alt: "GAME STREAMS",
        thumbnail: gamingGta
    },
    
    // Live Streaming (2 thumbnails)
    {
        id: "live-stream-ninja",
        category: "Live Streaming",
        alt: "LIVE STREAMS",
        thumbnail: liveStreamNinja
    },
    {
        id: "live-stream-ishowspeed-astonished",
        category: "Live Streaming",
        alt: "STREAMING CONTENT",
        thumbnail: liveStreamIshowspeedAstonished
    },
    
    // Motivation & Inspiration (2 thumbnails)
    {
        id: "motivation-goggins",
        category: "Motivation & Inspiration",
        alt: "MOTIVATIONAL CONTENT",
        thumbnail: motivationGoggins
    },
    {
        id: "motivation-chris-williamson",
        category: "Motivation & Inspiration",
        alt: "INSPIRATIONAL VIDEOS",
        thumbnail: motivationChrisWilliamson
    },
    
    // Podcasts (2 thumbnails)
    {
        id: "podcast-hormozi",
        category: "Podcasts",
        alt: "PODCAST CONTENT",
        thumbnail: podcastHormozi
    },
    {
        id: "podcast-joe-rogan",
        category: "Podcasts",
        alt: "AUDIO CONTENT",
        thumbnail: podcastJoeRogan
    },
    
    // Travel (2 thumbnails)
    {
        id: "travel-van",
        category: "Travel",
        alt: "TRAVEL VLOGS",
        thumbnail: travelVan
    },
    {
        id: "travel-12-hours",
        category: "Travel",
        alt: "ADVENTURE CONTENT",
        thumbnail: travel12Hours
    },
    
    // Vlogging (2 thumbnails)
    {
        id: "vlog-burger",
        category: "Vlogging",
        alt: "DAILY VLOGS",
        thumbnail: vlogBurger
    },
    {
        id: "vlog-shocked",
        category: "Vlogging",
        alt: "LIFESTYLE CONTENT",
        thumbnail: vlogShocked
    }
];

// Shuffle and fix consecutive categories
const shuffledData = shuffleArray(initialNicheData);
export const nicheData = fixConsecutiveCategories(shuffledData);
