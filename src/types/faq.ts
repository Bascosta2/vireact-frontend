export type FAQItemType = {
    question: string;
    answer: string;
}

export interface FAQComponentProps {
    faqs: FAQItemType[]
  }