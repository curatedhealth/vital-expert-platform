'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "How quickly can I get started?",
      answer: "Instantly. Sign up, choose your experts, and start asking questions in under 5 minutes."
    },
    {
      question: "What makes VITAL different from ChatGPT?",
      answer: "VITAL Expert provides 136+ specialized healthcare AI agents trained on regulatory documents, clinical protocols, and industry-specific knowledge. It's HIPAA-compliant, cites sources, and designed specifically for healthcare innovation."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We're SOC 2 Type II certified, HIPAA compliant, and use enterprise-grade encryption. Your data is isolated in our multi-tenant architecture."
    },
    {
      question: "Can I integrate VITAL with my existing tools?",
      answer: "Yes. We offer APIs and integrations with popular tools like Slack, Teams, Jira, and your existing quality management systems."
    },
    {
      question: "What if I need custom AI agents for my specific needs?",
      answer: "Our Solution Builder tier provides custom AI agent development tailored to your organization's unique requirements."
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-vital-blue-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions?
          </p>
          <a 
            href="#" 
            className="text-vital-blue-600 hover:text-vital-blue-700 font-semibold underline"
          >
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  )
}
