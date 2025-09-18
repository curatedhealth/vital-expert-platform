// Performance Test for Optimized LangChain Processing
const FormData = require('form-data');

async function performanceTest() {
  console.log('⚡ Testing Optimized LangChain Performance...\n');

  try {
    // Test with medium-sized content that will create multiple chunks
    const largeContent = `
    Healthcare Regulatory Framework Overview

    The healthcare regulatory landscape is complex and multifaceted, encompassing various federal agencies, state-level authorities, and international standards bodies. This comprehensive guide provides an overview of the key regulatory requirements that healthcare organizations must navigate.

    FDA Regulation and Oversight
    The Food and Drug Administration (FDA) serves as the primary regulatory body for medical devices, pharmaceuticals, and digital health technologies in the United States. Under the Federal Food, Drug, and Cosmetic Act, the FDA has broad authority to regulate products that are intended to diagnose, treat, cure, or prevent disease.

    Medical Device Classification
    Medical devices are classified into three categories based on their risk profile:
    - Class I devices are subject to general controls and typically require no premarket review
    - Class II devices require special controls and often need 510(k) clearance
    - Class III devices pose the highest risk and typically require premarket approval (PMA)

    Digital Health and Software as Medical Device (SaMD)
    The rise of digital health technologies has introduced new regulatory challenges. Software as Medical Device (SaMD) is regulated based on its intended use and the level of healthcare decision-making it supports. The FDA has issued guidance documents outlining the regulatory pathway for various types of digital health technologies.

    Clinical Trial Regulations
    Clinical trials must comply with Good Clinical Practice (GCP) guidelines, which ensure that trials are conducted ethically and that the data generated is reliable. The FDA requires an Investigational New Drug (IND) application for most drug studies and an Investigational Device Exemption (IDE) for significant risk device studies.

    Quality Management Systems
    Healthcare organizations must implement robust quality management systems that comply with relevant standards such as ISO 13485 for medical devices or ISO 14155 for clinical investigations. These systems ensure consistent quality throughout the product lifecycle.

    Data Privacy and Security
    Healthcare data is subject to strict privacy and security requirements under HIPAA (Health Insurance Portability and Accountability Act) and state-level regulations. Organizations must implement appropriate safeguards to protect patient information and ensure compliance with these requirements.

    International Regulatory Considerations
    For organizations seeking global market access, understanding international regulatory requirements is crucial. The European Union's Medical Device Regulation (MDR) and In Vitro Diagnostic Regulation (IVDR) have introduced significant changes to the regulatory landscape in Europe.

    Risk Management and Post-Market Surveillance
    Regulatory compliance extends beyond initial market approval. Organizations must maintain ongoing risk management processes and conduct post-market surveillance to monitor product performance and identify potential safety issues.

    Conclusion
    Navigating the healthcare regulatory landscape requires a comprehensive understanding of applicable requirements and a proactive approach to compliance. Organizations should work closely with regulatory experts to ensure their products meet all relevant standards and requirements.
    `.repeat(3); // Repeat to create a larger document

    console.log(`📄 Testing with document of ${largeContent.length} characters...`);

    const startTime = Date.now();

    const form = new FormData();
    form.append('files', Buffer.from(largeContent), {
      filename: 'performance-test-large-doc.txt',
      contentType: 'text/plain'
    });
    form.append('agentId', 'performance-test-agent');
    form.append('isGlobal', 'false');
    form.append('domain', 'digital-health');

    const response = await fetch('http://localhost:3001/api/knowledge/upload', {
      method: 'POST',
      body: form
    });

    const result = await response.json();
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('\n📊 Performance Results:');
    console.log('======================');
    console.log(`✅ Upload Success: ${result.success ? 'YES' : 'NO'}`);
    console.log(`📁 Files Processed: ${result.totalProcessed}`);
    console.log(`❌ Files Failed: ${result.totalFailed}`);
    console.log(`🧩 Chunks Created: ${result.results?.[0]?.chunksProcessed || 'N/A'}`);
    console.log(`⏱️  Total Time: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);

    if (result.results?.[0]?.chunksProcessed) {
      const timePerChunk = duration / result.results[0].chunksProcessed;
      console.log(`🚀 Time per Chunk: ${timePerChunk.toFixed(0)}ms`);
    }

    console.log(`\n${duration < 10000 ? '🎉 EXCELLENT' : duration < 30000 ? '✅ GOOD' : '⚠️ SLOW'} Performance!`);

  } catch (error) {
    console.error('🚨 Performance test error:', error.message);
  }
}

// Use fetch polyfill for Node.js
async function fetch(url, options) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
}

performanceTest();