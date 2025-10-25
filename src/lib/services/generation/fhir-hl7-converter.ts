/**
 * FHIR/HL7 Converter for Structured Documents
 *
 * Converts schema-driven generated documents to FHIR R4 and HL7 v2.x formats
 */

import type { ClinicalSummary, RegulatoryDocument } from './response-schemas';

// ============================================================================
// FHIR R4 Conversion
// ============================================================================

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'collection' | 'document' | 'message' | 'transaction';
  timestamp: string;
  entry: FHIRBundleEntry[];
  meta?: {
    profile?: string[];
    tag?: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
}

export interface FHIRBundleEntry {
  fullUrl: string;
  resource: any;
}

export class FHIRConverter {
  /**
   * Convert Clinical Summary to FHIR Bundle
   */
  static clinicalSummaryToFHIR(summary: ClinicalSummary): FHIRBundle {
    const bundleId = `bundle-${Date.now()}`;
    const entries: FHIRBundleEntry[] = [];

    // Add Composition resource (document header)
    entries.push({
      fullUrl: `urn:uuid:${bundleId}-composition`,
      resource: {
        resourceType: 'Composition',
        id: `${bundleId}-composition`,
        status: 'final',
        type: {
          coding: [{
            system: 'http://loinc.org',
            code: '34133-9',
            display: 'Summarization of episode note'
          }]
        },
        date: summary.generated_at,
        title: 'Clinical Summary',
        section: [
          {
            title: 'Medications',
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: '10160-0',
                display: 'History of Medication use Narrative'
              }]
            }
          },
          {
            title: 'Diagnoses',
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: '11450-4',
                display: 'Problem list - Reported'
              }]
            }
          }
        ],
        meta: {
          tag: [{
            system: 'http://vital.ai/generation',
            code: 'schema-driven',
            display: `Generated at ${summary.generated_at}`
          }]
        }
      }
    });

    // Add MedicationStatement resources
    summary.medications.forEach((med, index) => {
      const medId = `medication-${index}`;
      entries.push({
        fullUrl: `urn:uuid:${medId}`,
        resource: {
          resourceType: 'MedicationStatement',
          id: medId,
          status: med.status || 'active',
          medicationCodeableConcept: {
            text: med.name,
            coding: med.coding?.rxnorm ? [{
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: med.coding.rxnorm,
              display: med.name
            }] : []
          },
          dosage: med.dosage ? [{
            text: med.dosage,
            route: med.route ? {
              text: med.route
            } : undefined,
            timing: med.frequency ? {
              repeat: {
                frequency: 1,
                period: 1,
                periodUnit: 'd'
              }
            } : undefined
          }] : [],
          reasonCode: med.indication ? [{
            text: med.indication
          }] : [],
          meta: {
            tag: [{
              system: 'http://vital.ai/confidence',
              code: String(med.entity.confidence),
              display: `${Math.round(med.entity.confidence * 100)}% confidence`
            }, {
              system: 'http://vital.ai/verification',
              code: med.entity.verification_status,
              display: `Verification: ${med.entity.verification_status}`
            }]
          },
          extension: [{
            url: 'http://vital.ai/source-attribution',
            valueString: JSON.stringify(med.entity.sources)
          }]
        }
      });
    });

    // Add Condition resources
    summary.diagnoses.forEach((diagnosis, index) => {
      const condId = `condition-${index}`;
      entries.push({
        fullUrl: `urn:uuid:${condId}`,
        resource: {
          resourceType: 'Condition',
          id: condId,
          clinicalStatus: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: diagnosis.status === 'confirmed' ? 'active' : 'inactive'
            }]
          },
          verificationStatus: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
              code: diagnosis.status === 'confirmed' ? 'confirmed' :
                     diagnosis.status === 'suspected' ? 'provisional' : 'unconfirmed'
            }]
          },
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: diagnosis.type === 'primary' ? 'encounter-diagnosis' : 'problem-list-item'
            }]
          }],
          code: {
            text: diagnosis.condition,
            coding: diagnosis.coding?.icd10 ? [{
              system: 'http://hl7.org/fhir/sid/icd-10',
              code: diagnosis.coding.icd10,
              display: diagnosis.condition
            }] : []
          },
          onsetString: diagnosis.onset,
          meta: {
            tag: [{
              system: 'http://vital.ai/confidence',
              code: String(diagnosis.entity.confidence),
              display: `${Math.round(diagnosis.entity.confidence * 100)}% confidence`
            }]
          },
          extension: [{
            url: 'http://vital.ai/source-attribution',
            valueString: JSON.stringify(diagnosis.entity.sources)
          }]
        }
      });
    });

    // Add Procedure resources
    summary.procedures.forEach((procedure, index) => {
      const procId = `procedure-${index}`;
      entries.push({
        fullUrl: `urn:uuid:${procId}`,
        resource: {
          resourceType: 'Procedure',
          id: procId,
          status: 'completed',
          code: {
            text: procedure.name,
            coding: procedure.coding?.cpt ? [{
              system: 'http://www.ama-assn.org/go/cpt',
              code: procedure.coding.cpt,
              display: procedure.name
            }] : []
          },
          performedDateTime: procedure.date,
          reasonCode: procedure.indication ? [{
            text: procedure.indication
          }] : [],
          outcome: procedure.outcome ? {
            text: procedure.outcome
          } : undefined,
          meta: {
            tag: [{
              system: 'http://vital.ai/confidence',
              code: String(procedure.entity.confidence),
              display: `${Math.round(procedure.entity.confidence * 100)}% confidence`
            }]
          },
          extension: [{
            url: 'http://vital.ai/source-attribution',
            valueString: JSON.stringify(procedure.entity.sources)
          }]
        }
      });
    });

    // Add Observation resources (lab results)
    summary.lab_results.forEach((lab, index) => {
      const labId = `observation-${index}`;
      entries.push({
        fullUrl: `urn:uuid:${labId}`,
        resource: {
          resourceType: 'Observation',
          id: labId,
          status: 'final',
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory'
            }]
          }],
          code: {
            text: lab.test_name,
            coding: lab.coding?.loinc ? [{
              system: 'http://loinc.org',
              code: lab.coding.loinc,
              display: lab.test_name
            }] : []
          },
          valueString: lab.value,
          valueQuantity: lab.value && lab.unit ? {
            value: parseFloat(lab.value),
            unit: lab.unit
          } : undefined,
          interpretation: lab.interpretation ? [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: lab.interpretation === 'normal' ? 'N' :
                     lab.interpretation === 'abnormal' ? 'A' : 'C'
            }]
          }] : [],
          referenceRange: lab.reference_range ? [{
            text: lab.reference_range
          }] : [],
          effectiveDateTime: lab.date,
          meta: {
            tag: [{
              system: 'http://vital.ai/confidence',
              code: String(lab.entity.confidence),
              display: `${Math.round(lab.entity.confidence * 100)}% confidence`
            }]
          },
          extension: [{
            url: 'http://vital.ai/source-attribution',
            valueString: JSON.stringify(lab.entity.sources)
          }]
        }
      });
    });

    return {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'document',
      timestamp: summary.generated_at,
      entry: entries,
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
        tag: [{
          system: 'http://vital.ai/schema',
          code: 'clinical_summary',
          display: 'VITAL Clinical Summary'
        }, {
          system: 'http://vital.ai/metadata',
          code: 'character-level-attribution',
          display: 'Character-level source attribution included'
        }]
      }
    };
  }

  /**
   * Convert Regulatory Document to FHIR Bundle
   */
  static regulatoryDocumentToFHIR(doc: RegulatoryDocument): FHIRBundle {
    const bundleId = `reg-bundle-${Date.now()}`;
    const entries: FHIRBundleEntry[] = [];

    // Add Composition resource for regulatory document
    entries.push({
      fullUrl: `urn:uuid:${bundleId}-composition`,
      resource: {
        resourceType: 'Composition',
        id: `${bundleId}-composition`,
        status: 'final',
        type: {
          coding: [{
            system: 'http://loinc.org',
            code: '11502-2',
            display: 'Clinical study report'
          }]
        },
        date: doc.generated_at,
        title: doc.document_info.title,
        section: [
          {
            title: 'Executive Summary',
            text: {
              status: 'generated',
              div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${doc.executive_summary.text}</p></div>`
            }
          },
          {
            title: 'Safety',
            text: {
              status: 'generated',
              div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${doc.safety.summary}</p></div>`
            }
          },
          {
            title: 'Efficacy',
            text: {
              status: 'generated',
              div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${doc.efficacy.summary}</p></div>`
            }
          }
        ],
        meta: {
          tag: [{
            system: 'http://vital.ai/regulatory',
            code: doc.document_info.document_type,
            display: doc.document_info.document_type
          }]
        }
      }
    });

    // Add AdverseEvent resources
    doc.safety.adverse_events.forEach((ae, index) => {
      const aeId = `adverse-event-${index}`;
      entries.push({
        fullUrl: `urn:uuid:${aeId}`,
        resource: {
          resourceType: 'AdverseEvent',
          id: aeId,
          actuality: 'actual',
          event: {
            text: ae.event,
            coding: ae.coding?.snomed ? [{
              system: 'http://snomed.info/sct',
              code: ae.coding.snomed,
              display: ae.event
            }] : []
          },
          severity: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/adverse-event-severity',
              code: ae.severity
            }]
          },
          seriousness: doc.safety.serious_adverse_events.some(sae => sae.event === ae.event) ? {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/adverse-event-seriousness',
              code: 'serious'
            }]
          } : undefined,
          meta: {
            tag: [{
              system: 'http://vital.ai/confidence',
              code: String(ae.entity.confidence),
              display: `${Math.round(ae.entity.confidence * 100)}% confidence`
            }]
          },
          extension: [{
            url: 'http://vital.ai/source-attribution',
            valueString: JSON.stringify(ae.entity.sources)
          }, {
            url: 'http://vital.ai/causality',
            valueString: ae.causality || 'possible'
          }]
        }
      });
    });

    return {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'document',
      timestamp: doc.generated_at,
      entry: entries,
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
        tag: [{
          system: 'http://vital.ai/schema',
          code: 'regulatory_document',
          display: 'VITAL Regulatory Document'
        }, {
          system: 'http://vital.ai/compliance',
          code: doc.compliance.gcp_compliance ? 'gcp-compliant' : 'non-compliant',
          display: `GCP Compliance: ${doc.compliance.gcp_compliance}`
        }]
      }
    };
  }
}

// ============================================================================
// HL7 v2.x Conversion
// ============================================================================

export class HL7Converter {
  /**
   * Convert Clinical Summary to HL7 v2.x ORU^R01 message
   */
  static clinicalSummaryToHL7(summary: ClinicalSummary): string {
    const timestamp = this.formatHL7Timestamp(summary.generated_at);
    const messageId = `MSG${Date.now()}`;

    const segments: string[] = [];

    // MSH - Message Header
    segments.push(
      `MSH|^~\\&|VITAL|EXTRACTION|EHR|FACILITY|${timestamp}||ORU^R01|${messageId}|P|2.5`
    );

    // PID - Patient Identification (anonymized)
    const ageRange = summary.patient?.age_range || 'UNKNOWN';
    const gender = summary.patient?.gender ? summary.patient.gender[0].toUpperCase() : 'U';
    segments.push(
      `PID|1||PATIENT_ID^^^VITAL||DOE^JOHN||${ageRange}|${gender}`
    );

    // OBR - Observation Request (for each section)
    let obrIndex = 1;
    let obxIndex = 1;

    // Medications section
    if (summary.medications.length > 0) {
      segments.push(
        `OBR|${obrIndex}|ORD${obrIndex}||MEDICATIONS^Medication List|||${timestamp}`
      );
      obrIndex++;

      summary.medications.forEach(med => {
        segments.push(
          `OBX|${obxIndex}|TX|MEDICATION||${med.name}||||||F|||${timestamp}||^VITAL_AI^CONFIDENCE:${med.entity.confidence}`
        );
        if (med.dosage) {
          segments.push(
            `NTE|${obxIndex}|L|DOSAGE: ${med.dosage}${med.route ? ', ROUTE: ' + med.route : ''}${med.frequency ? ', FREQUENCY: ' + med.frequency : ''}`
          );
        }
        if (med.coding?.rxnorm) {
          segments.push(
            `NTE|${obxIndex}|L|RXNORM: ${med.coding.rxnorm}`
          );
        }
        obxIndex++;
      });
    }

    // Diagnoses section
    if (summary.diagnoses.length > 0) {
      segments.push(
        `OBR|${obrIndex}|ORD${obrIndex}||DIAGNOSES^Diagnosis List|||${timestamp}`
      );
      obrIndex++;

      summary.diagnoses.forEach(diagnosis => {
        segments.push(
          `OBX|${obxIndex}|TX|DIAGNOSIS||${diagnosis.condition}||||||F|||${timestamp}||^VITAL_AI^CONFIDENCE:${diagnosis.entity.confidence}`
        );
        if (diagnosis.coding?.icd10) {
          segments.push(
            `NTE|${obxIndex}|L|ICD10: ${diagnosis.coding.icd10}`
          );
        }
        if (diagnosis.type) {
          segments.push(
            `NTE|${obxIndex}|L|TYPE: ${diagnosis.type}`
          );
        }
        obxIndex++;
      });
    }

    // Procedures section
    if (summary.procedures.length > 0) {
      segments.push(
        `OBR|${obrIndex}|ORD${obrIndex}||PROCEDURES^Procedure List|||${timestamp}`
      );
      obrIndex++;

      summary.procedures.forEach(proc => {
        segments.push(
          `OBX|${obxIndex}|TX|PROCEDURE||${proc.name}||||||F|||${timestamp}||^VITAL_AI^CONFIDENCE:${proc.entity.confidence}`
        );
        if (proc.coding?.cpt) {
          segments.push(
            `NTE|${obxIndex}|L|CPT: ${proc.coding.cpt}`
          );
        }
        obxIndex++;
      });
    }

    // Lab results section
    if (summary.lab_results.length > 0) {
      segments.push(
        `OBR|${obrIndex}|ORD${obrIndex}||LABS^Laboratory Results|||${timestamp}`
      );
      obrIndex++;

      summary.lab_results.forEach(lab => {
        const value = lab.value || 'N/A';
        const unit = lab.unit || '';
        const refRange = lab.reference_range || '';
        segments.push(
          `OBX|${obxIndex}|NM|${lab.test_name}||${value}|${unit}|${refRange}|${lab.interpretation || ''}|||F|||${timestamp}||^VITAL_AI^CONFIDENCE:${lab.entity.confidence}`
        );
        if (lab.coding?.loinc) {
          segments.push(
            `NTE|${obxIndex}|L|LOINC: ${lab.coding.loinc}`
          );
        }
        obxIndex++;
      });
    }

    return segments.join('\r\n') + '\r\n';
  }

  /**
   * Format timestamp for HL7 (YYYYMMDDHHmmss)
   */
  private static formatHL7Timestamp(isoTimestamp: string): string {
    const date = new Date(isoTimestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}

// Export converters
export const fhirConverter = FHIRConverter;
export const hl7Converter = HL7Converter;
