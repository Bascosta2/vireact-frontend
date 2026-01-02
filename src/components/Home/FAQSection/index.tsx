import HomeSection from '@/components/HomeSection';
import { faqs } from '@/components/Home/FAQSection/faq-items';
import FAQComponent from '@/components/FAQComponent';

function FAQSection() {

    return (
        <HomeSection
            className="overflow-hidden"
            background="transparent"
            padding="small"
            overflow="hidden"
            sectionHeader={{
                badge: "FAQ's",
                title: "All You Need to Know"
            }}
        >
            {/* Main content card */}
            <FAQComponent
                faqs={faqs}
            />
        </HomeSection>
    );
}

export default FAQSection;