import { NextRequest } from 'next/server';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export async function validateChatRequest(req: NextRequest) {
  const body = await req.json();
  
  // Layer 1: Basic validation
  if (!body.message?.trim()) {
    throw new ValidationError('Message is required');
  }
  
  // Layer 2: Mode-specific validation
  // Check if we have per-session mode data or fallback to global mode
  const isAutomaticMode = body.isAutomaticMode ?? (body.interactionMode === 'automatic');
  
  if (!isAutomaticMode) {
    if (!body.agent?.id) {
      throw new ValidationError('Agent selection required in manual mode');
    }
    
    // Validate agent structure for manual mode
    const requiredFields = ['id', 'name', 'system_prompt'];
    for (const field of requiredFields) {
      if (!body.agent[field]) {
        throw new ValidationError(`Agent missing required field: ${field}`);
      }
    }
  }
  
  // For automatic mode, agent selection is handled by the system
  // No validation needed as the system will select appropriate agents
  
  // Layer 3: Security validation
  if (body.message.length > 4000) {
    throw new ValidationError('Message too long');
  }
  
  return body;
}
