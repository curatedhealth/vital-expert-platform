'use client';

import * as React from 'react';
import {
  LinearGrowth,
  ExponentialGrowth,
  KnowledgeLoss,
  KnowledgePyramid,
} from './flat-visuals';

export const ParadigmShiftSection = () => {
  const [hoveredLeftIndex, setHoveredLeftIndex] = React.useState<number | null>(null);
  const [hoveredRightIndex, setHoveredRightIndex] = React.useState<number | null>(null);

  const leftItems = [
    {
      title: 'FIXED CAPACITY',
      description: '10-20 FTEs Max',
      visual: <img src="/assets/vital/illustrations/rigid-structure.svg" alt="Fixed Capacity" className="w-32 h-32 object-contain transition-transform duration-300 ease-in-out" />,
    },
    {
      title: 'LINEAR GROWTH',
      description: 'Linear growth trajectory',
      visual: <div className="w-36 h-24 mx-auto transition-transform duration-300 ease-in-out"><LinearGrowth /></div>,
    },
    {
      title: 'KNOWLEDGE LOSS',
      description: 'Knowledge walks out the door',
      visual: <div className="w-36 h-28 mx-auto transition-transform duration-300 ease-in-out"><KnowledgeLoss animated /></div>,
    },
  ];

  const rightItems = [
    {
      title: 'INFINITE CAPACITY',
      description: 'Unlimited Scale',
      visual: <img src="/assets/vital/illustrations/elastic-structure.svg" alt="Infinite Capacity" className="w-40 h-40 object-contain transition-transform duration-300 ease-in-out" />,
    },
    {
      title: 'EXPONENTIAL GROWTH',
      description: 'Exponential growth potential',
      visual: <div className="w-44 h-28 mx-auto transition-transform duration-300 ease-in-out"><ExponentialGrowth animated /></div>,
    },
    {
      title: 'KNOWLEDGE COMPOUND',
      description: 'Knowledge compounds forever',
      visual: <div className="w-36 h-32 mx-auto transition-transform duration-300 ease-in-out"><KnowledgePyramid animated /></div>,
    },
  ];

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-12 text-center">
          PARADIGM SHIFT: FROM FIXED TO ELASTIC
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="border border-stone-200 rounded-xl p-8">
            <h3 className="text-xl font-bold text-stone-700 text-center mb-8">TRADITIONAL (RIGID) ORGANIZATION</h3>
            <div className="space-y-8">
              {leftItems.map((item, index) => (
                <div key={index} className="text-center"
                  onMouseEnter={() => setHoveredLeftIndex(index)}
                  onMouseLeave={() => setHoveredLeftIndex(null)}>
                  <div className={`mx-auto ${hoveredLeftIndex === index ? 'scale-105' : 'scale-100'} transition-transform duration-300 ease-in-out`}>
                    {item.visual}
                  </div>
                  <h4 className="text-lg font-semibold text-stone-800 mt-4">{item.title}</h4>
                  <p className="text-stone-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="border-2 border-purple-500 rounded-xl p-8 bg-purple-50/50">
            <h3 className="text-xl font-bold text-purple-600 text-center mb-8">ELASTIC (VITAL) ORGANIZATION</h3>
            <div className="space-y-8">
              {rightItems.map((item, index) => (
                <div key={index} className="text-center"
                  onMouseEnter={() => setHoveredRightIndex(index)}
                  onMouseLeave={() => setHoveredRightIndex(null)}>
                  <div className={`mx-auto ${hoveredRightIndex === index ? 'scale-105' : 'scale-100'} transition-transform duration-300 ease-in-out`}>
                    {item.visual}
                  </div>
                  <h4 className="text-lg font-semibold text-purple-700 mt-4">{item.title}</h4>
                  <p className="text-purple-900/70">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};