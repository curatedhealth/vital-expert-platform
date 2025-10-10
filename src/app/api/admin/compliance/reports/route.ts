import { NextRequest, NextResponse } from 'next/server';
import { ComplianceReportingService } from '@/services/compliance-reporting.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const complianceService = new ComplianceReportingService();

    switch (type) {
      case 'hipaa':
        const hipaaReport = await complianceService.generateHIPAAReport();
        return NextResponse.json(hipaaReport);
      
      case 'soc2':
        const soc2Report = await complianceService.generateSOC2Report();
        return NextResponse.json(soc2Report);
      
      case 'fda':
        const fdaReport = await complianceService.generateFDAReport();
        return NextResponse.json(fdaReport);
      
      default:
        const [allHipaaReport, allSoc2Report, allFdaReport] = await Promise.all([
          complianceService.generateHIPAAReport(),
          complianceService.generateSOC2Report(),
          complianceService.generateFDAReport()
        ]);
        
        return NextResponse.json({
          hipaa: allHipaaReport,
          soc2: allSoc2Report,
          fda: allFdaReport
        });
    }
  } catch (error) {
    console.error('Error generating compliance reports:', error);
    return NextResponse.json(
      { error: 'Failed to generate compliance reports' },
      { status: 500 }
    );
  }
}
