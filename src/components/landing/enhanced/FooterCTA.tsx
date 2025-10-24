'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle, FileText, Award } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function FooterCTA() {
  const trustBadges = [
    { icon: <Shield className="w-6 h-6" />, text: "SOC 2" },
    { icon: <CheckCircle className="w-6 h-6" />, text: "HIPAA Compliant" },
    { icon: <FileText className="w-6 h-6" />, text: "FDA 21 CFR Part 11" },
    { icon: <Award className="w-6 h-6" />, text: "ISO 27001" }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-vital-blue-600 via-vital-purple-500 to-vital-blue-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12"></div>
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Innovation?
          </h2>
          
          <p className="text-xl text-white/90 mb-8">
            Join 50+ healthcare companies already accelerating with VITAL Expert
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-vital-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
            >
              Start 14-Day Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-vital-blue-600 px-8 py-6 text-lg font-semibold"
            >
              Schedule Expert Demo
            </Button>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                {badge.icon}
                <span className="text-sm font-semibold">{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
