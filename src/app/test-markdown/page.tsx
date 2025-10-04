"use client";

import { StreamingResponse } from "@/shared/components/ui/ai";

export default function TestMarkdown() {
  const testContent = `## Overview
For your novel oncology therapeutic, here's a comprehensive **FDA breakthrough therapy strategy**:

### 1. **Pre-Clinical Foundation**
- Establish robust preclinical data package
- Demonstrate **unmet medical need** in target indication
- Generate compelling efficacy signals

### 2. **Regulatory Pathway**
- Submit **Breakthrough Therapy Designation (BTD)** request
- Prepare for **Fast Track** designation
- Consider **Priority Review** pathway

### 3. **Clinical Trial Design**
\`\`\`typescript
interface ClinicalTrial {
  phase: 'I' | 'II' | 'III';
  endpoints: string[];
  patientPopulation: string;
  statisticalPower: number;
}
\`\`\`

### 4. **Key Success Factors**
- [ ] **Strong preclinical data**
- [ ] **Clear clinical benefit**
- [ ] **Unmet medical need**
- [ ] **Manufacturing readiness**

### 5. **Timeline Estimate**
- **Pre-IND Meeting**: 2-3 months
- **IND Submission**: 6-9 months
- **BTD Request**: 9-12 months
- **Phase I/II**: 18-24 months
- **NDA Submission**: 36-48 months

> **Important**: Always consult with FDA early and often throughout development.

### Next Steps
1. Schedule **pre-IND meeting** with FDA
2. Prepare **comprehensive data package**
3. Engage **regulatory consultants**
4. Develop **risk mitigation strategies**

For more detailed guidance, consider engaging our **Regulatory Strategy Expert** for personalized consultation.`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Markdown Rendering Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Raw Markdown:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {testContent}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Rendered Markdown (Static):</h2>
          <StreamingResponse
            content={testContent}
            isStreaming={false}
            variant="enhanced"
            showCursor={false}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Streaming Markdown (Progressive):</h2>
          <StreamingResponse
            content={testContent}
            isStreaming={true}
            variant="enhanced"
            showCursor={true}
          />
        </div>
      </div>
    </div>
  );
}
