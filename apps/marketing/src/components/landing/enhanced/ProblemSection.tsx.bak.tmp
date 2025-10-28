'use client'

import { motion } from 'framer-motion'
import { Shield, Users, Brain, Rocket } from 'lucide-react'

export default function ProblemSection() {
  const problems = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Regulatory Maze",
      description: "FDA submission taking months? Our AI experts navigate 510(k), De Novo, and PMA pathways in days, not months."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Shortage", 
      description: "Can't find or afford specialized consultants? Access 136+ expert AI agents instantly, from regulatory to clinical to reimbursement."
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Knowledge Loss",
      description: "Consultants leave, taking expertise with them? Our AI retains 100% of knowledge, learning and improving continuously."
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Speed to Market",
      description: "Competitors moving faster? Accelerate every decision with instant expert panels and automated workflows."
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Healthcare Innovation Challenges, Solved
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm bg-white/90">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-vital-blue-50 rounded-xl text-vital-blue-600 group-hover:bg-vital-blue-100 transition-colors">
                    {problem.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {problem.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
