'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, DollarSign, Shield, TrendingUp, Globe } from 'lucide-react'

export default function FeaturesGrid() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "136+ Specialized AI Agents",
      description: "Each expert trained on millions of healthcare documents, regulations, and real-world cases."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "91% Faster Decisions", 
      description: "Get expert answers in seconds, not weeks. No scheduling, no waiting, no invoices."
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "95% Cost Reduction",
      description: "Replace $3M annual consulting with $180K AI platform. ROI in first month."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "HIPAA & FDA Compliant",
      description: "Enterprise-grade security with SOC 2 Type II, HIPAA compliance, and FDA 21 CFR Part 11 ready."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Continuous Learning",
      description: "AI agents update with latest regulations, guidelines, and industry best practices daily."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Tenant Architecture", 
      description: "Your data isolated and secure. Scale from startup to enterprise seamlessly."
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Why Healthcare Leaders Choose VITAL Expert
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="p-8 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-vital-blue-50 rounded-xl text-vital-blue-600 group-hover:bg-vital-blue-100 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
