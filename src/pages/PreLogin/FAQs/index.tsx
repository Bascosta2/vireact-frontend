import FAQComponent from '@/components/FAQComponent'
import PreLoginPage from '@/components/Layout/PreLoginPage'
import { faqs } from '@/pages/PreLogin/FAQs/faq-items'
import SectionHeader from '@/components/SectionHeader'
import { IoSparkles } from 'react-icons/io5'
import { Link } from 'react-router-dom'

function FAQs() {
    return (
        <PreLoginPage>
            <SectionHeader
                badge="All You Need To Know"
                title="Frequently Asked Questions"
                icon={<IoSparkles className="w-4 h-4 text-gray-400" />}
                className="pt-12"
            />
            <FAQComponent
                faqs={faqs} />

            <div className='flex items-center justify-center gap-2 mb-12 pt-8'>
                <p className='text-center text-gray-400'>Have more questions?</p>
                <Link to="/get-in-touch" className='text-secondary hover:underline'>
                    Get in touch
                </Link>
            </div>


        </PreLoginPage>
    )
}

export default FAQs