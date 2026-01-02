import { useState } from "react"
import FAQItem from "@/components/FAQComponent/FAQItem"
import type { FAQComponentProps } from "@/types/faq"

function FAQComponent({ faqs }: FAQComponentProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }
    
  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto py-12
    glassmorphism shadow-lg overflow-hidden rounded-2xl"
>
    <div className="space-y-4 px-8">
        {faqs.map((faq, index) => (
        <FAQItem
            key={index}
            faq={faq}
            index={index}
            openFAQ={openFAQ}
            toggleFAQ={toggleFAQ}
        />
        ))}
    </div>
</div>
  )
}

export default FAQComponent