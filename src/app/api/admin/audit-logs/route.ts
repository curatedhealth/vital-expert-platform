import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { AuditService } from '@/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    if (format === 'csv') {
      // Export CSV
      const auditService = new AuditService();
      
      // Parse filters from query params
      const filters = {
        userId: searchParams.get('userId') || undefined,
        action: searchParams.get('action') || undefined,
        resourceType: searchParams.get('resourceType') || undefined,
        success: searchParams.get('success') ? searchParams.get('success') === 'true' : undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        search: searchParams.get('search') || undefined,
      };

      const csvContent = await auditService.exportToCSV(filters);
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default: return JSON data
    const auditService = new AuditService();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const filters = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') || undefined,
      resourceType: searchParams.get('resourceType') || undefined,
      success: searchParams.get('success') ? searchParams.get('success') === 'true' : undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const response = await auditService.getAuditLogs(filters, { page, limit });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Audit logs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
