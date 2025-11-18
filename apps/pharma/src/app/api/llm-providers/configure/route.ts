import crypto from 'crypto';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';



const ENCRYPTION_KEY = process.env.ENCRYPTION_MASTER_KEY || 'default-key-change-in-production';

function encryptApiKey(apiKey: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);

  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const body = await request.json();
    const { provider_type, api_key, models } = body;

    if (!provider_type || !api_key) {
      return NextResponse.json(
        { error: 'Provider type and API key are required' },
        { status: 400 }
      );
    }

    // Encrypt the API key before storing
    const encryptedApiKey = encryptApiKey(api_key);

    // Update provider configuration
    const { data: providers, error: fetchError } = await supabase
      .from('llm_providers')
      .select('id, provider_name')
      .eq('provider_type', provider_type);

    if (fetchError) {
      console.error('Error fetching providers:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch providers' },
        { status: 500 }
      );
    }

    // Update each provider with the encrypted API key
    const updatePromises = providers?.map(provider =>
      supabase
        .from('llm_providers')
        .update({
          api_key_encrypted: encryptedApiKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', provider.id)
    );

    if (updatePromises) {
      const results = await Promise.all(updatePromises);
      const errors = results.filter((result: any) => result.error);

      if (errors.length > 0) {
        console.error('Errors updating providers:', errors);
        return NextResponse.json(
          { error: 'Failed to update some providers' },
          { status: 500 }
        );
      }
    }

    // Log the configuration event
    await supabase
      .from('audit_logs')
      .insert({
        user_id: 'system', // TODO: Get from session
        action: 'llm_provider_configured',
        resource_type: 'llm_provider',
        resource_id: provider_type,
        details: {
          provider_type,
          models_configured: models,
          timestamp: new Date().toISOString()
        }
      });

    return NextResponse.json({
      success: true,
      message: `${provider_type} providers configured successfully`,
      providers_updated: providers?.length || 0
    });

  } catch (error) {
    console.error('Error configuring providers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}