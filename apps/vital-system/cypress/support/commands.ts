// ***********************************************
// VITAL Path Healthcare AI Custom Cypress Commands
// ***********************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      setupHealthcareTest(): Chainable<void>
      selectHealthcareAgent(agentType: string): Chainable<void>
      sendMedicalQuery(query: string): Chainable<void>
      waitForAIResponse(timeout?: number): Chainable<void>
      validateHIPAACompliance(): Chainable<void>
      checkMedicalAccuracy(): Chainable<void>
      simulateRealUserDelay(min?: number, max?: number): Chainable<void>
      interceptAIModelCalls(): Chainable<void>
      validateClinicalCitations(): Chainable<void>
      checkResponseSafety(): Chainable<void>
    }
  }
}

// Healthcare test setup
Cypress.Commands.add('setupHealthcareTest', () => {
  cy.visit('/')
  cy.window().then((win) => {
    win.localStorage.setItem('healthcare-mode', 'true')
    win.localStorage.setItem('test-environment', 'e2e')
  })
  cy.get('[data-testid="app-loading"]', { timeout: 10000 }).should('not.exist')
})

// Select healthcare AI agent
Cypress.Commands.add('selectHealthcareAgent', (agentType: string) => {
  cy.get('[data-testid="agent-selector"]').click()
  cy.get(`[data-testid="agent-option-${agentType}"]`).click()
  cy.get('[data-testid="selected-agent"]').should('contain', agentType.replace('-', ' '))
})

// Send medical query with validation
Cypress.Commands.add('sendMedicalQuery', (query: string) => {
  // Validate query doesn't contain PHI
  cy.task('checkHIPAACompliance', query).then((result: any) => {
    expect(result.compliant).to.be.true
  })

  cy.get('[data-testid="chat-input"]').type(query)
  cy.get('[data-testid="send-button"]').click()

  // Log medical query for audit trail
  cy.task('validateMedicalData', query)
})

// Wait for AI response with healthcare-specific timeouts
Cypress.Commands.add('waitForAIResponse', (timeout = 30000) => {
  // Wait for thinking indicator
  cy.get('[data-testid="ai-thinking"]', { timeout: 5000 }).should('be.visible')

  // Wait for response completion
  cy.get('[data-testid="ai-response"]', { timeout }).should('be.visible')
  cy.get('[data-testid="ai-thinking"]').should('not.exist')

  // Verify response contains healthcare content
  cy.get('[data-testid="ai-response"]').should(($response) => {
    const text = $response.text().toLowerCase()
    const hasHealthcareContent = [
      'clinical', 'medical', 'patient', 'therapy', 'diagnosis',
      'treatment', 'healthcare', 'pharmaceutical', 'regulatory'
    ].some(term => text.includes(term))

    expect(hasHealthcareContent).to.be.true
  })
})

// HIPAA compliance validation
Cypress.Commands.add('validateHIPAACompliance', () => {
  cy.get('body').should(($body) => {
    const bodyText = $body.text()

    // Check for common PHI patterns
    const phiPatterns = [
      /\d{3}-\d{2}-\d{4}/, // SSN
      /\d{2}\/\d{2}\/\d{4}/, // DOB pattern
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email (potential PHI)
      /\d{10,}/ // Long numbers that could be medical IDs
    ]

    phiPatterns.forEach(pattern => {
      expect(bodyText).not.to.match(pattern)
    })
  })

  // Verify HIPAA compliance indicators
  cy.get('[data-testid="hipaa-indicator"]').should('have.class', 'compliant')
})

// Medical accuracy validation
Cypress.Commands.add('checkMedicalAccuracy', () => {
  cy.get('[data-testid="ai-response"]').within(() => {
    // Check for medical citations
    cy.get('[data-testid="citation"]').should('have.length.at.least', 1)

    // Verify confidence score
    cy.get('[data-testid="confidence-score"]').should(($score) => {
      const confidence = parseFloat($score.text())
      expect(confidence).to.be.at.least(0.8) // 80% minimum for healthcare
    })

    // Check for medical disclaimers
    cy.get('[data-testid="medical-disclaimer"]').should('be.visible')
  })
})

// Simulate realistic user interaction delays
Cypress.Commands.add('simulateRealUserDelay', (min = 500, max = 2000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  cy.wait(delay)
})

// Intercept AI model API calls
Cypress.Commands.add('interceptAIModelCalls', () => {
  cy.intercept('POST', '**/api/llm/**', (req) => {
    // Log AI model calls for monitoring
    cy.task('log', `AI Model Call: ${req.url}`)

    // Validate request doesn't contain PHI
    cy.task('checkHIPAACompliance', JSON.stringify(req.body))
  }).as('aiModelCall')

  cy.intercept('POST', '**/api/agents/**', (req) => {
    cy.task('log', `Agent API Call: ${req.url}`)
  }).as('agentCall')
})

// Validate clinical citations
Cypress.Commands.add('validateClinicalCitations', () => {
  cy.get('[data-testid="citation"]').each(($citation) => {
    // Check citation has required fields
    cy.wrap($citation).within(() => {
      cy.get('[data-testid="citation-title"]').should('be.visible')
      cy.get('[data-testid="citation-authors"]').should('be.visible')
      cy.get('[data-testid="citation-year"]').should('be.visible')
      cy.get('[data-testid="citation-relevance"]').should(($relevance) => {
        const score = parseFloat($relevance.text())
        expect(score).to.be.at.least(0.7) // 70% minimum relevance
      })
    })
  })
})

// Check response safety for medical content
Cypress.Commands.add('checkResponseSafety', () => {
  cy.get('[data-testid="ai-response"]').should(($response) => {
    const text = $response.text().toLowerCase()

    // Check for harmful medical advice patterns
    const dangerousPatterns = [
      'stop taking medication',
      'ignore your doctor',
      'self-medicate',
      'diagnose yourself',
      'skip medical treatment'
    ]

    dangerousPatterns.forEach(pattern => {
      expect(text).not.to.include(pattern)
    })

    // Verify safety disclaimers
    const safetyIndicators = [
      'consult your healthcare provider',
      'medical professional',
      'not medical advice',
      'informational purposes'
    ]

    const hasSafetyIndicator = safetyIndicators.some(indicator =>
      text.includes(indicator)
    )
    expect(hasSafetyIndicator).to.be.true
  })

  // Check for safety warning indicators
  cy.get('[data-testid="safety-warning"]').should('be.visible')
})