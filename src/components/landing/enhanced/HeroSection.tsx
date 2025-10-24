'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import CountUp from 'react-countup'

import { Button } from '@/components/ui/button'

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-vital-blue-600 via-vital-purple-500 to-vital-blue-600 animate-gradient" />
      
      {/* Floating Particles/Agents */}
      <FloatingAgents />
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Transform Healthcare Innovation with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vital-teal-400 to-vital-pink-400">
              AI-Powered Expert Intelligence
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Replace $3M in annual consulting costs with instant access to 136+ specialized healthcare AI experts. 
            Get FDA approval 91% faster. Available 24/7.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-vital-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold group"
            >
              Start Free Trial 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-vital-blue-600 px-8 py-6 text-lg font-semibold"
            >
              Book Expert Demo
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <TrustIndicator 
              icon={<CheckCircle className="w-5 h-5" />}
              value={50}
              suffix="+"
              label="Healthcare Innovators"
            />
            <TrustIndicator 
              icon={<CheckCircle className="w-5 h-5" />}
              value={95}
              suffix="%"
              label="FDA Approval Rate"
            />
            <TrustIndicator 
              icon={<CheckCircle className="w-5 h-5" />}
              value={180}
              prefix="$"
              suffix="M+"
              label="Saved in Consulting"
            />
          </div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
}

// Trust Indicator Component
function TrustIndicator({ icon, value, prefix = '', suffix = '', label }: any) {
  return (
    <div className="flex flex-col items-center text-white">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-3xl font-bold">
          {prefix}
          <CountUp end={value} duration={2} />
          {suffix}
        </span>
      </div>
      <span className="text-sm text-white/80">{label}</span>
    </div>
  )
}

// Floating Agents Animation
function FloatingAgents() {
  return (
    <div className="absolute inset-0">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm"
          style={{
            left: `${20 + i * 15}%`,
            top: `${20 + i * 10}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
