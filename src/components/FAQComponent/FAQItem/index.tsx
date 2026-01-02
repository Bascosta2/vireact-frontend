import { FaChevronDown } from 'react-icons/fa'

function FAQItem({ faq, index, openFAQ, toggleFAQ }: { faq: any, index: number, openFAQ: number | null, toggleFAQ: (index: number) => void }) {
  return (
    <div key={index} className="bg-dark-primary bg-opacity-50 backdrop-blur-lg border-gradient-secondary rounded-2xl overflow-hidden transition-all duration-300">
    <button
        onClick={() => toggleFAQ(index)}
        className="w-full px-6 py-4 text-left flex items-center justify-between transition-all duration-300 group cursor-pointer"
    >
        <p className="text-lg text-white/50 group-hover:text-white transition-colors duration-300">
            {faq.question}
        </p>
        <FaChevronDown
            className={`w-5 h-5 text-white/50 group-hover:text-white transition-all duration-300 ${openFAQ === index ? 'rotate-180' : ''
                }`}
        />

    </button>

    <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
    >
        <div className="px-6 pb-6">
            <p className="text-gray-300 leading-relaxed">
                {faq.answer}
            </p>
        </div>
    </div>
</div>
  )
}

export default FAQItem