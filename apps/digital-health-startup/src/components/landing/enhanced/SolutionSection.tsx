'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

import { Button } from '@vital/ui'

export default function SolutionSection() {
  const solutions = [
    {
      icon: "🎯",
      title: "Ask Expert",
      price: "$2,000/month",
      description: "Instant AI Expert Consultations",
      features: [
        "136+ specialized healthcare AI agents",
        "Regulatory, clinical, quality, and reimbursement expertise", 
        "Real-time answers with source citations",
        "Unlimited team members"
      ],
      cta: "Explore Ask Expert →",
      gradient: "from-vital-teal-500 to-vital-teal-600",
      bgColor: "bg-vital-teal-50",
      textColor: "text-vital-teal-600"
    },
    {
      icon: "👥",
      title: "Ask Panel", 
      price: "$10,000/month",
      description: "Virtual Advisory Boards On-Demand",
      features: [
        "Multi-expert collaborative intelligence",
        "Consensus building and debate simulation",
        "Strategic decision support",
        "Complex problem solving"
      ],
      cta: "Explore Ask Panel →",
      gradient: "from-vital-purple-500 to-vital-purple-600",
      bgColor: "bg-vital-purple-50",
      textColor: "text-vital-purple-600",
      popular: true
    },
    {
      icon: "🔄",
      title: "JTBD & Workflows",
      price: "$15,000/month", 
      description: "Automated Healthcare Workflows",
      features: [
        "500+ pre-built regulatory workflows",
        "FDA submission automation",
        "Clinical trial protocol generation",
        "Reimbursement strategy workflows"
      ],
      cta: "Explore Workflows →",
      gradient: "from-vital-amber-500 to-vital-amber-600",
      bgColor: "bg-vital-amber-50",
      textColor: "text-vital-amber-600"
    },
    {
      icon: "🏗️",
      title: "Solution Builder",
      price: "$50,000+/month",
      description: "Custom AI Solutions for Your Organization", 
      features: [
        "Tailored AI agent development",
        "Custom workflow automation",
        "Enterprise integration",
        "Dedicated support team"
      ],
      cta: "Contact Sales →",
      gradient: "from-vital-pink-500 to-vital-pink-600",
      bgColor: "bg-vital-pink-50",
      textColor: "text-vital-pink-600"
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The VITAL Expert Platform: Your Infinite Healthcare Intelligence Team
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {solution.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-vital-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                solution.popular 
                  ? 'border-vital-purple-200 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              } bg-white`}>
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${solution.bgColor} flex items-center justify-center text-2xl`}>
                    {solution.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {solution.title}
                  </h3>
                  <p className={`text-2xl font-bold ${solution.textColor} mb-2`}>
                    {solution.price}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {solution.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {solution.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full group-hover:scale-105 transition-transform ${solution.bgColor} ${solution.textColor} hover:opacity-90`}
                >
                  {solution.cta}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
