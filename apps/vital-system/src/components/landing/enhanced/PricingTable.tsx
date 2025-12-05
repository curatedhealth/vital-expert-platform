'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@vital/ui'


export default function PricingTable() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: "Starter",
      monthlyPrice: 499,
      annualPrice: 399,
      description: "Perfect for small teams getting started",
      features: [
        { name: "Expert Consultations", value: "50/month", included: true },
        { name: "Panel Discussions", value: "10/month", included: true },
        { name: "Workflow Executions", value: "25/month", included: true },
        { name: "Team Members", value: "3", included: true },
        { name: "Support", value: "Email", included: true },
        { name: "Custom AI Agents", value: "", included: false },
        { name: "Enterprise Integration", value: "", included: false }
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional", 
      monthlyPrice: 1999,
      annualPrice: 1599,
      description: "Most popular for growing organizations",
      features: [
        { name: "Expert Consultations", value: "200/month", included: true },
        { name: "Panel Discussions", value: "50/month", included: true },
        { name: "Workflow Executions", value: "100/month", included: true },
        { name: "Team Members", value: "10", included: true },
        { name: "Support", value: "Priority", included: true },
        { name: "Custom AI Agents", value: "", included: false },
        { name: "Enterprise Integration", value: "", included: false }
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: "Custom",
      annualPrice: "Custom", 
      description: "For large organizations with custom needs",
      features: [
        { name: "Expert Consultations", value: "Unlimited", included: true },
        { name: "Panel Discussions", value: "Unlimited", included: true },
        { name: "Workflow Executions", value: "Unlimited", included: true },
        { name: "Team Members", value: "Unlimited", included: true },
        { name: "Support", value: "Dedicated", included: true },
        { name: "Custom AI Agents", value: "✓", included: true },
        { name: "Enterprise Integration", value: "✓", included: true }
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Simple, Transparent Pricing for Every Stage
          </h2>
          
          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-lg ${!isAnnual ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-vital-blue-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${isAnnual ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="bg-vital-green-100 text-vital-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                Save 20%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-vital-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                plan.popular 
                  ? 'border-vital-blue-200 shadow-xl bg-white' 
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                  <p className="text-neutral-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    {typeof plan.monthlyPrice === 'number' ? (
                      <div>
                        <span className="text-5xl font-bold text-neutral-900">
                          ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-neutral-600">/month</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-neutral-900">{plan.monthlyPrice}</div>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className="text-neutral-900 font-medium">{feature.name}</span>
                        {feature.value && (
                          <span className="text-neutral-600 ml-2">({feature.value})</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full py-3 text-lg font-semibold ${
                    plan.popular 
                      ? 'bg-vital-blue-600 hover:bg-vital-blue-700 text-white' 
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-neutral-600">
            All plans include: Daily updates, data isolation, API access
          </p>
        </div>
      </div>
    </section>
  )
}
