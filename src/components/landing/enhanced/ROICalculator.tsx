'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ROICalculator() {
  const [formData, setFormData] = useState({
    annualSpend: '',
    numConsultants: '',
    avgDuration: ''
  })

  const calculateROI = () => {
    const spend = parseFloat(formData.annualSpend) || 0
    const consultants = parseInt(formData.numConsultants) || 0
    const duration = parseInt(formData.avgDuration) || 0
    
    const vitalCost = 180000 // $180K annual cost
    const annualSavings = spend - vitalCost
    const timeSaved = duration * 0.91 // 91% faster
    const roi = spend > 0 ? ((annualSavings / vitalCost) * 100) : 0
    const paybackPeriod = annualSavings > 0 ? (vitalCost / (annualSavings / 12)) : 0

    return {
      annualSavings: Math.max(0, annualSavings),
      timeSaved: Math.max(0, timeSaved),
      roi: Math.max(0, roi),
      paybackPeriod: Math.max(0, paybackPeriod)
    }
  }

  const results = calculateROI()

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Calculate Your Savings
          </h2>
          <p className="text-xl text-gray-600">
            See how much you could save with VITAL Expert
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Input Form */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="annualSpend" className="text-lg font-semibold">
                Current Annual Consulting Spend
              </Label>
              <Input
                id="annualSpend"
                type="number"
                placeholder="3000000"
                value={formData.annualSpend}
                onChange={(e) => setFormData(prev => ({ ...prev, annualSpend: e.target.value }))}
                className="mt-2 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="numConsultants" className="text-lg font-semibold">
                Number of Consultants
              </Label>
              <Input
                id="numConsultants"
                type="number"
                placeholder="10"
                value={formData.numConsultants}
                onChange={(e) => setFormData(prev => ({ ...prev, numConsultants: e.target.value }))}
                className="mt-2 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="avgDuration" className="text-lg font-semibold">
                Average Project Duration (months)
              </Label>
              <Select 
                value={formData.avgDuration} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, avgDuration: value }))}
              >
                <SelectTrigger className="mt-2 text-lg">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="18">18 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Your Potential Savings with VITAL:
            </h3>

            <AnimatePresence>
              <motion.div
                key={results.annualSavings}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <div className="p-6 bg-gradient-to-r from-vital-blue-50 to-vital-purple-50 rounded-xl border border-vital-blue-200">
                  <div className="text-sm font-semibold text-vital-blue-600 mb-2">Annual Savings</div>
                  <div className="text-3xl font-bold text-vital-blue-600">
                    ${results.annualSavings.toLocaleString()}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-vital-teal-50 to-vital-blue-50 rounded-xl border border-vital-teal-200">
                  <div className="text-sm font-semibold text-vital-teal-600 mb-2">Time Saved</div>
                  <div className="text-3xl font-bold text-vital-teal-600">
                    {results.timeSaved.toFixed(1)} months
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-vital-amber-50 to-vital-orange-50 rounded-xl border border-vital-amber-200">
                  <div className="text-sm font-semibold text-vital-amber-600 mb-2">ROI</div>
                  <div className="text-3xl font-bold text-vital-amber-600">
                    {results.roi.toFixed(0)}%
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-vital-pink-50 to-vital-purple-50 rounded-xl border border-vital-pink-200">
                  <div className="text-sm font-semibold text-vital-pink-600 mb-2">Payback Period</div>
                  <div className="text-3xl font-bold text-vital-pink-600">
                    {results.paybackPeriod.toFixed(1)} months
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <Button 
              size="lg" 
              className="w-full bg-vital-blue-600 hover:bg-vital-blue-700 text-lg py-6"
            >
              Get Detailed ROI Report
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
