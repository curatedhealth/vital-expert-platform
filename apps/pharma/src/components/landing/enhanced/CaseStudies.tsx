'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { Button } from '@vital/ui/components/button'

export default function CaseStudies() {
  const caseStudies = [
    {
      title: "MedTech Startup Achieves FDA Clearance in 4 Months",
      quote: "VITAL Expert reduced our 510(k) preparation from 12 months to 4 months, saving us $2M in consulting fees.",
      author: "Sarah Chen",
      role: "CEO, NeuroVive",
      metric: "4 months to FDA",
      savings: "$2M saved"
    },
    {
      title: "Digital Health Platform Scales to 10M Users", 
      quote: "The AI advisory panels helped us navigate HIPAA compliance and scale internationally without hiring 20+ consultants.",
      author: "Michael Torres",
      role: "CTO, HealthConnect",
      metric: "10M users",
      savings: "20+ consultants avoided"
    },
    {
      title: "Pharma Company Accelerates Clinical Trials by 60%",
      quote: "Automated workflows and expert AI guidance cut our protocol development time from months to weeks.",
      author: "Dr. Lisa Anderson",
      role: "VP Clinical, PharmaCo", 
      metric: "60% faster",
      savings: "Months to weeks"
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Success Stories from Healthcare Innovators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {study.title}
                  </h3>
                  
                  <blockquote className="text-lg text-gray-700 italic mb-6 leading-relaxed">
                    "{study.quote}"
                  </blockquote>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-vital-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-vital-blue-600 font-bold text-lg">
                        {study.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{study.author}</div>
                      <div className="text-sm text-gray-600">{study.role}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-vital-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-vital-blue-600">{study.metric}</div>
                    <div className="text-xs text-vital-blue-600 font-semibold">ACHIEVEMENT</div>
                  </div>
                  <div className="text-center p-3 bg-vital-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-vital-teal-600">{study.savings}</div>
                    <div className="text-xs text-vital-teal-600 font-semibold">SAVINGS</div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-vital-blue-50 group-hover:border-vital-blue-200 transition-colors"
                >
                  Read Full Case Study
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
