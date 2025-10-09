
🚀 VERCEL ENVIRONMENT SETUP INSTRUCTIONS
=========================================

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: vital-expert-preprod
3. Go to Settings > Environment Variables
4. Add the following variables:

   NEXT_PUBLIC_SUPABASE_URL = https://xazinxsiglqokwfmogyk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
   SUPABASE_SERVICE_ROLE_KEY = [YOUR_ACTUAL_SERVICE_ROLE_KEY]
   OPENAI_API_KEY = [YOUR_ACTUAL_OPENAI_API_KEY]
   NEXT_PUBLIC_APP_URL = https://vital-expert-preprod.vercel.app
   NODE_ENV = production

5. Redeploy your application after adding the variables

🔑 GETTING YOUR SUPABASE SERVICE ROLE KEY:
- Go to https://supabase.com/dashboard
- Select your project: xazinxsiglqokwfmogyk
- Go to Settings > API
- Copy the "service_role" key (not the anon key)

🔑 GETTING YOUR OPENAI API KEY:
- Go to https://platform.openai.com/api-keys
- Create a new API key
- Copy the key (starts with sk-)
