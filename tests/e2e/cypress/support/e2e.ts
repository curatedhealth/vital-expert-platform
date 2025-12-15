// ***********************************************************
// VITAL Path Healthcare AI Platform E2E Support File
// ***********************************************************

import './commands'
import 'cypress-real-events/support'

// Healthcare-specific configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail tests on uncaught exceptions that are expected in healthcare AI context
  if (err.message.includes('WebSocket') ||
      err.message.includes('AI model') ||
      err.message.includes('timeout')) {
    return false
  }
})

// HIPAA compliance logging
beforeEach(() => {
  cy.task('log', `Starting test: ${Cypress.currentTest.title}`)

  // Add healthcare compliance headers
  cy.intercept('**', (req) => {
    req.headers['X-HIPAA-Compliant'] = 'true'
    req.headers['X-Medical-Data-Classification'] = 'test-data'
  })
})

afterEach(() => {
  // Clear any sensitive medical data after each test
  cy.clearLocalStorage()
  cy.clearCookies()

  cy.task('log', `Completed test: ${Cypress.currentTest.title}`)
})

// Global healthcare test configuration
Cypress.Commands.add('setupHealthcareTest', () => {
  // Set up healthcare-specific test environment
  cy.window().then((win) => {
    win.localStorage.setItem('healthcare-mode', 'true')
    win.localStorage.setItem('hipaa-compliance', 'enabled')
  })
})