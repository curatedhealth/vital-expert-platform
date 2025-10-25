import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';



interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

async function testHuggingFaceModel(apiEndpoint: string, testPrompt: string): Promise<{ success: boolean; response?: string; error?: string; latency?: number }> {
  const startTime = Date.now();

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: testPrompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.3,
          top_p: 0.9,
          do_sample: true
        }
      })
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        latency
      };
    }

    const data: HuggingFaceResponse[] | HuggingFaceResponse = await response.json();

    // Handle different response formats
    let generatedText = '';
    if (Array.isArray(data)) {
      generatedText = data[0]?.generated_text || '';
    } else {
      generatedText = data.generated_text || '';
    }

    if (data && 'error' in data) {
      return {
        success: false,
        error: data.error,
        latency
      };
    }

    return {
      success: true,
      response: generatedText,
      latency
    };

  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      latency
    };
  }
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
    const { provider_id, test_prompt = 'What is the primary function of insulin in the human body?' } = body;

    if (!provider_id) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Fetch provider details
    const { data: provider, error: fetchError } = await supabase
      .from('llm_providers')
      .select('*')
      .eq('id', provider_id)
      .single();

    if (fetchError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if provider is active
    if (!provider.is_active) {
      return NextResponse.json(
        { error: 'Provider is not active' },
        { status: 400 }
      );
    }

    let testResult;

    // Test based on provider type
    switch (provider.provider_type) {
      case 'huggingface':
        testResult = await testHuggingFaceModel(provider.api_endpoint, test_prompt);
        break;

      default:
        return NextResponse.json(
          { error: `Testing not implemented for provider type: ${provider.provider_type}` },
          { status: 400 }
        );
    }

    // Update provider metrics
    if (testResult.success) {
      await supabase
        .from('llm_providers')
        .update({
          last_health_check: new Date().toISOString(),
          average_latency_ms: testResult.latency,
          status: 'active'
        })
        .eq('id', provider_id);
    } else {
      await supabase
        .from('llm_providers')
        .update({
          last_health_check: new Date().toISOString(),
          status: 'error'
        })
        .eq('id', provider_id);
    }

    // Log the test event
    await supabase
      .from('audit_logs')
      .insert({
        user_id: 'system', // TODO: Get from session
        action: 'llm_provider_tested',
        resource_type: 'llm_provider',
        resource_id: provider_id,
        details: {
          provider_name: provider.provider_name,
          test_prompt,
          success: testResult.success,
          latency: testResult.latency,
          error: testResult.error,
          timestamp: new Date().toISOString()
        }
      });

    return NextResponse.json({
      success: testResult.success,
      provider_name: provider.provider_name,
      latency: testResult.latency,
      response: testResult.response,
      error: testResult.error,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error testing provider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}