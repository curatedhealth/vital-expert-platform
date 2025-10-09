#!/usr/bin/env node

/**
 * LangSmith Monitoring Setup Script
 * Helps configure AI observability and tracing
 */

console.log('🔍 VITAL Expert - LangSmith Monitoring Setup');
console.log('============================================\n');

console.log('📊 LangSmith Benefits:');
console.log('• AI conversation tracing');
console.log('• Performance monitoring');
console.log('• Error tracking and debugging');
console.log('• Cost analysis and optimization');
console.log('• Model performance insights');
console.log('');

console.log('🚀 Setup Instructions:');
console.log('');

console.log('1️⃣  Create LangSmith Account');
console.log('   • Go to https://smith.langchain.com/');
console.log('   • Sign up for free account');
console.log('   • Create a new project');
console.log('');

console.log('2️⃣  Get API Key');
console.log('   • Go to Settings → API Keys');
console.log('   • Create a new API key');
console.log('   • Copy the key (starts with "lsv2_")');
console.log('');

console.log('3️⃣  Configure Environment Variables');
console.log('   Add to Vercel environment variables:');
console.log('   LANGCHAIN_TRACING_V2=true');
console.log('   LANGCHAIN_API_KEY=your_langsmith_api_key_here');
console.log('   LANGCHAIN_PROJECT=vital-path-production');
console.log('');

console.log('4️⃣  Verify Setup');
console.log('   • Deploy your application');
console.log('   • Make a chat request');
console.log('   • Check LangSmith dashboard for traces');
console.log('');

console.log('📈 What You\'ll See in LangSmith:');
console.log('• Chat conversation flows');
console.log('• Agent selection reasoning');
console.log('• RAG retrieval performance');
console.log('• Token usage and costs');
console.log('• Error rates and debugging info');
console.log('• Response times and latency');
console.log('');

console.log('💰 Cost Considerations:');
console.log('• LangSmith has a free tier');
console.log('• Pay-per-use pricing model');
console.log('• Typically <$10/month for moderate usage');
console.log('• Can be disabled anytime');
console.log('');

console.log('🔧 Advanced Configuration:');
console.log('');

console.log('Environment Variables:');
console.log('LANGCHAIN_TRACING_V2=true                    # Enable tracing');
console.log('LANGCHAIN_API_KEY=lsv2_...                  # Your API key');
console.log('LANGCHAIN_PROJECT=vital-path-production     # Project name');
console.log('LANGCHAIN_ENDPOINT=https://api.smith.langchain.com  # Optional: custom endpoint');
console.log('');

console.log('🎯 Monitoring Features:');
console.log('• Real-time conversation tracking');
console.log('• Performance metrics dashboard');
console.log('• Error alerting and notifications');
console.log('• Cost analysis and optimization');
console.log('• Model comparison and selection');
console.log('');

console.log('📖 Full documentation: ENVIRONMENT_SETUP.md');
console.log('🔗 LangSmith Dashboard: https://smith.langchain.com/');
