/**
 * Safely parse JSON response, handling HTML error pages
 */
export async function safeJsonParse<T = any>(
  response: Response
): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  
  // Check if response is actually JSON
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    
    // If it's HTML (likely an error page), throw a more helpful error
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new Error(
        `Expected JSON but received HTML. Status: ${response.status}. ` +
        `This usually means the request was redirected to a login page or error page. ` +
        `Response preview: ${text.substring(0, 200)}`
      );
    }
    
    // Otherwise, try to parse as JSON anyway
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      throw new Error(`Failed to parse response as JSON: ${text.substring(0, 200)}`);
    }
  }
  
  // Safe to parse as JSON
  return response.json();
}

