/**
 * API Versioning Middleware
 *
 * Provides API versioning support with multiple strategies:
 * - URL path versioning: /api/v1/resource
 * - Header versioning: Accept: application/vnd.vital.v1+json
 * - Query parameter versioning: /api/resource?version=1
 *
 * Features:
 * - Version validation
 * - Version deprecation warnings
 * - Sunset date enforcement
 * - Version routing
 * - Backward compatibility
 *
 * @module middleware/api-versioning
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

export interface APIVersion {
  version: number;
  releaseDate: Date;
  deprecationDate?: Date;
  sunsetDate?: Date;
  status: 'current' | 'supported' | 'deprecated' | 'sunset';
  features: string[];
  breakingChanges?: string[];
}

export interface VersioningConfig {
  currentVersion: number;
  versions: Map<number, APIVersion>;
  defaultVersion: number;
  strategy: 'path' | 'header' | 'query' | 'all';
  headerName?: string;
  queryParam?: string;
}

export interface VersionedRequest extends NextRequest {
  apiVersion: number;
  isLatestVersion: boolean;
  versionInfo: APIVersion;
}

// ============================================================================
// API VERSION REGISTRY
// ============================================================================

export const API_VERSIONS: Map<number, APIVersion> = new Map([
  [
    1,
    {
      version: 1,
      releaseDate: new Date('2025-01-25'),
      status: 'current',
      features: [
        'Chat API',
        'Agent Management',
        'Knowledge Documents',
        'Panel Orchestration',
        'RAG Integration',
        'Rate Limiting',
        'Error Boundaries',
        'Connection Pooling',
      ],
    },
  ],
  // Future versions can be added here
  // [
  //   2,
  //   {
  //     version: 2,
  //     releaseDate: new Date('2025-06-01'),
  //     status: 'supported',
  //     features: ['Streaming responses', 'Enhanced RAG', 'Multi-modal support'],
  //     breakingChanges: ['Changed response format for /api/chat'],
  //   },
  // ],
]);

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_VERSIONING_CONFIG: VersioningConfig = {
  currentVersion: 1,
  versions: API_VERSIONS,
  defaultVersion: 1,
  strategy: 'all', // Support all versioning strategies
  headerName: 'X-API-Version',
  queryParam: 'version',
};

// ============================================================================
// VERSION EXTRACTION
// ============================================================================

/**
 * Extract API version from URL path
 * Matches patterns like: /api/v1/resource or /api/v2/resource
 */
function extractVersionFromPath(pathname: string): number | null {
  const pathMatch = pathname.match(/\/api\/v(\d+)\//);
  return pathMatch ? parseInt(pathMatch[1]) : null;
}

/**
 * Extract API version from Accept header
 * Matches patterns like: application/vnd.vital.v1+json
 */
function extractVersionFromHeader(request: NextRequest, headerName?: string): number | null {
  const acceptHeader = request.headers.get('accept') || '';
  const customHeader = headerName ? request.headers.get(headerName) : null;

  // Check custom version header first
  if (customHeader) {
    const version = parseInt(customHeader);
    if (!isNaN(version)) {
      return version;
    }
  }

  // Check Accept header for vendor media type
  const vendorMatch = acceptHeader.match(/application\/vnd\.vital\.v(\d+)\+json/);
  if (vendorMatch) {
    return parseInt(vendorMatch[1]);
  }

  return null;
}

/**
 * Extract API version from query parameter
 */
function extractVersionFromQuery(request: NextRequest, queryParam?: string): number | null {
  const param = queryParam || 'version';
  const version = request.nextUrl.searchParams.get(param);

  if (version) {
    const parsed = parseInt(version);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}

/**
 * Extract API version using configured strategy
 */
export function extractAPIVersion(
  request: NextRequest,
  config: VersioningConfig = DEFAULT_VERSIONING_CONFIG
): number {
  const pathname = request.nextUrl.pathname;

  // Try different strategies based on configuration
  let version: number | null = null;

  if (config.strategy === 'path' || config.strategy === 'all') {
    version = extractVersionFromPath(pathname);
    if (version !== null) return version;
  }

  if (config.strategy === 'header' || config.strategy === 'all') {
    version = extractVersionFromHeader(request, config.headerName);
    if (version !== null) return version;
  }

  if (config.strategy === 'query' || config.strategy === 'all') {
    version = extractVersionFromQuery(request, config.queryParam);
    if (version !== null) return version;
  }

  // Return default version if no version specified
  return config.defaultVersion;
}

// ============================================================================
// VERSION VALIDATION
// ============================================================================

/**
 * Validate if requested API version is supported
 */
export function validateAPIVersion(
  version: number,
  config: VersioningConfig = DEFAULT_VERSIONING_CONFIG
): { valid: boolean; error?: string; versionInfo?: APIVersion } {
  const versionInfo = config.versions.get(version);

  if (!versionInfo) {
    return {
      valid: false,
      error: `API version ${version} not found. Supported versions: ${Array.from(
        config.versions.keys()
      ).join(', ')}`,
    };
  }

  // Check if version is sunset (no longer available)
  if (versionInfo.status === 'sunset') {
    return {
      valid: false,
      error: `API version ${version} has been sunset and is no longer available. Please upgrade to v${config.currentVersion}.`,
      versionInfo,
    };
  }

  return { valid: true, versionInfo };
}

// ============================================================================
// DEPRECATION WARNINGS
// ============================================================================

/**
 * Generate deprecation warning headers
 */
export function getDeprecationHeaders(versionInfo: APIVersion): Record<string, string> {
  const headers: Record<string, string> = {};

  if (versionInfo.status === 'deprecated' && versionInfo.sunsetDate) {
    headers['Deprecation'] = 'true';
    headers['Sunset'] = versionInfo.sunsetDate.toUTCString();
    headers['Link'] = '</api/v1>; rel="successor-version"'; // Link to current version
  }

  return headers;
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export interface VersioningOptions {
  config?: Partial<VersioningConfig>;
  onVersionExtracted?: (version: number, request: NextRequest) => void;
  onDeprecatedVersion?: (version: number, request: NextRequest) => void;
}

/**
 * API Versioning Middleware
 *
 * Wraps request handlers with API version extraction and validation
 *
 * @example
 * ```typescript
 * export const GET = withVersioning(async (request: VersionedRequest) => {
 *   const version = request.apiVersion;
 *
 *   if (version === 1) {
 *     // V1 logic
 *   } else if (version === 2) {
 *     // V2 logic
 *   }
 *
 *   return NextResponse.json({ data: result });
 * });
 * ```
 */
export function withVersioning<T extends any[]>(
  handler: (request: VersionedRequest, ...args: T) => Promise<NextResponse>,
  options: VersioningOptions = {}
): (request: NextRequest, ...args: T) => Promise<NextResponse> {
  const config: VersioningConfig = {
    ...DEFAULT_VERSIONING_CONFIG,
    ...options.config,
  };

  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Extract version
    const version = extractAPIVersion(request, config);

    // Validate version
    const validation = validateAPIVersion(version, config);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'UNSUPPORTED_API_VERSION',
          message: validation.error,
          supportedVersions: Array.from(config.versions.keys()),
          currentVersion: config.currentVersion,
        },
        { status: 400 }
      );
    }

    // Call hooks
    if (options.onVersionExtracted) {
      options.onVersionExtracted(version, request);
    }

    if (validation.versionInfo?.status === 'deprecated' && options.onDeprecatedVersion) {
      options.onDeprecatedVersion(version, request);
    }

    // Augment request with version information
    const versionedRequest = request as VersionedRequest;
    versionedRequest.apiVersion = version;
    versionedRequest.isLatestVersion = version === config.currentVersion;
    versionedRequest.versionInfo = validation.versionInfo!;

    // Execute handler
    const response = await handler(versionedRequest, ...args);

    // Add version headers to response
    response.headers.set('X-API-Version', version.toString());
    response.headers.set('X-API-Current-Version', config.currentVersion.toString());

    // Add deprecation headers if needed
    if (validation.versionInfo?.status === 'deprecated') {
      const deprecationHeaders = getDeprecationHeaders(validation.versionInfo);
      Object.entries(deprecationHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  };
}

// ============================================================================
// VERSION ROUTING HELPERS
// ============================================================================

/**
 * Route request to version-specific handler
 *
 * @example
 * ```typescript
 * export const GET = withVersioning(
 *   routeByVersion({
 *     1: handleV1,
 *     2: handleV2,
 *   })
 * );
 * ```
 */
export function routeByVersion(
  handlers: Record<number, (request: VersionedRequest) => Promise<NextResponse>>
): (request: VersionedRequest) => Promise<NextResponse> {
  return async (request: VersionedRequest): Promise<NextResponse> => {
    const handler = handlers[request.apiVersion];

    if (!handler) {
      return NextResponse.json(
        {
          error: 'VERSION_NOT_IMPLEMENTED',
          message: `API version ${request.apiVersion} handler not implemented`,
        },
        { status: 501 }
      );
    }

    return handler(request);
  };
}

// ============================================================================
// VERSION MANAGEMENT
// ============================================================================

/**
 * Register a new API version
 */
export function registerAPIVersion(version: APIVersion): void {
  API_VERSIONS.set(version.version, version);
}

/**
 * Deprecate an API version
 */
export function deprecateAPIVersion(version: number, sunsetDate: Date): void {
  const versionInfo = API_VERSIONS.get(version);
  if (versionInfo) {
    versionInfo.status = 'deprecated';
    versionInfo.deprecationDate = new Date();
    versionInfo.sunsetDate = sunsetDate;
  }
}

/**
 * Sunset an API version (make it unavailable)
 */
export function sunsetAPIVersion(version: number): void {
  const versionInfo = API_VERSIONS.get(version);
  if (versionInfo) {
    versionInfo.status = 'sunset';
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default withVersioning;
