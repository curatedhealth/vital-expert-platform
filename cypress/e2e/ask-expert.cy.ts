describe('Ask Expert - Manual Agent Selection', () => {
  beforeEach(() => {
    cy.visit('/ask-expert');
  });

  it('displays agent sidebar with available experts', () => {
    cy.get('[data-testid="enhanced-agent-sidebar"]').should('be.visible');
    cy.get('[data-testid="agent-card"]').should('have.length.greaterThan', 0);
  });

  it('allows agent selection in manual mode', () => {
    // Click on first agent
    cy.get('[data-testid="agent-card"]').first().click();
    
    // Verify agent is selected
    cy.get('[data-testid="agent-card"]').first()
      .should('have.class', 'ring-2')
      .should('have.class', 'ring-primary');
  });

  it('shows tool selector when agent is selected', () => {
    // Select an agent
    cy.get('[data-testid="agent-card"]').first().click();
    
    // Verify tool selector appears
    cy.get('[data-testid="tool-selector"]').should('be.visible');
  });

  it('allows tool selection', () => {
    // Select an agent
    cy.get('[data-testid="agent-card"]').first().click();
    
    // Select a tool
    cy.get('[data-testid="tool-checkbox"]').first().check();
    
    // Verify tool is selected
    cy.get('[data-testid="tool-checkbox"]').first().should('be.checked');
  });

  it('sends message and receives response', () => {
    // Select an agent
    cy.get('[data-testid="agent-card"]').first().click();
    
    // Type message
    cy.get('[data-testid="message-input"]').type('What are the symptoms of chest pain?');
    
    // Send message
    cy.get('[data-testid="send-button"]').click();
    
    // Verify message appears
    cy.get('[data-testid="message"]').should('contain', 'What are the symptoms of chest pain?');
    
    // Wait for response
    cy.get('[data-testid="message"]', { timeout: 10000 }).should('have.length.greaterThan', 1);
  });

  it('shows reasoning process during response', () => {
    // Select an agent
    cy.get('[data-testid="agent-card"]').first().click();
    
    // Type message
    cy.get('[data-testid="message-input"]').type('What are the symptoms of chest pain?');
    
    // Send message
    cy.get('[data-testid="send-button"]').click();
    
    // Verify reasoning display appears
    cy.get('[data-testid="reasoning-display"]', { timeout: 5000 }).should('be.visible');
  });

  it('filters agents by search', () => {
    // Type in search box
    cy.get('[data-testid="agent-search"]').type('cardiology');
    
    // Verify only matching agents are shown
    cy.get('[data-testid="agent-card"]').should('have.length', 1);
    cy.get('[data-testid="agent-card"]').should('contain', 'cardiology');
  });

  it('filters agents by tier', () => {
    // Click tier filter
    cy.get('[data-testid="tier-filter-3"]').click();
    
    // Verify only tier 3 agents are shown
    cy.get('[data-testid="agent-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'Tier 3');
    });
  });

  it('handles agent selection modal in automatic mode', () => {
    // Switch to automatic mode
    cy.get('[data-testid="mode-toggle"]').click();
    
    // Type message
    cy.get('[data-testid="message-input"]').type('What are the symptoms of chest pain?');
    
    // Send message
    cy.get('[data-testid="send-button"]').click();
    
    // Verify agent selection modal appears
    cy.get('[data-testid="agent-selection-modal"]', { timeout: 5000 }).should('be.visible');
  });

  it('shows error message for invalid input', () => {
    // Select an agent
    cy.get('[data-testid="agent-card"]').first().click();
    
    // Send empty message
    cy.get('[data-testid="send-button"]').click();
    
    // Verify error message
    cy.get('[data-testid="error-message"]').should('be.visible');
  });
});
