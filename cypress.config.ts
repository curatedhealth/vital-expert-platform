import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Healthcare-specific timeouts for AI agent responses
    pageLoadTimeout: 30000, // Longer for AI processing

    setupNodeEvents(on, config) {
      // Healthcare compliance logging
      on('task', {
        log(message) {
          console.log(`[VITAL Path E2E] ${new Date().toISOString()}: ${message}`)
          return null
        },

        // HIPAA compliance check
        checkHIPAACompliance(data) {
          // Mock HIPAA compliance validation
          const isCompliant = !data.includes('SSN') && !data.includes('DOB')
          return { compliant: isCompliant, data: data }
        },

        // Medical data validation
        validateMedicalData(data) {
          const medicalKeywords = ['patient', 'diagnosis', 'treatment', 'medication']
          const containsMedicalData = medicalKeywords.some(keyword =>
            data.toLowerCase().includes(keyword)
          )
          return { containsMedicalData, validationTime: Date.now() }
        }
      })

      // Healthcare audit trail
      on('before:run', (details) => {
        console.log('Starting VITAL Path E2E Tests')
        console.log('Healthcare Compliance Mode: ENABLED')
        console.log('Test Environment:', config.env)
      })

      on('after:run', (results) => {
        console.log('VITAL Path E2E Tests Complete')
        console.log(`Total Tests: ${results.totalTests}`)
        console.log(`Passed: ${results.totalPassed}`)
        console.log(`Failed: ${results.totalFailed}`)
      })
    },

    env: {
      // Healthcare environment variables
      HEALTHCARE_MODE: true,
      HIPAA_COMPLIANCE: true,
      MEDICAL_VALIDATION: true,

      // Test data configuration
      TEST_USER_EMAIL: 'test.user@vitalpath.health',
      TEST_AGENT_TIMEOUT: 15000,
      MAX_AI_RESPONSE_TIME: 30000,
    },

    // Retry configuration for healthcare critical tests
    retries: {
      runMode: 2,    // Retry failed tests in CI
      openMode: 1    // Retry once in dev mode
    },

    // Test file patterns
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    // Browser configuration
    chromeWebSecurity: false, // For testing localhost

    // Experimental features for modern testing
    experimentalStudio: true,
    experimentalWebKitSupport: true,
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },

  // Global configuration
  watchForFileChanges: false,
  trashAssetsBeforeRuns: true,

  // Reporter configuration for healthcare compliance
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
    charts: true,
    reportTitle: 'VITAL Path Healthcare AI Platform E2E Tests',
    reportPageTitle: 'VITAL Path Test Results'
  }
})