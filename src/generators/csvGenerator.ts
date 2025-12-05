/**
 * CSV generator for analysis results
 * Generates CSV reports matching the Python version's format
 */

import { createObjectCsvWriter } from 'csv-writer';
import { TableMapping, AnalysisIssue } from '../types/index.js';

export async function generateMappingsCsv(
  mappings: TableMapping[],
  outputPath: string,
  showDetectionMethods = false
): Promise<void> {
  const headers: any[] = [
    { id: 'solution', title: 'Solution' },
    { id: 'publisher', title: 'Publisher' },
    { id: 'version', title: 'Version' },
    { id: 'supportTier', title: 'Support Tier' },
    { id: 'connectorId', title: 'Connector ID' },
    { id: 'connectorTitle', title: 'Connector Title' },
    { id: 'connectorDescription', title: 'Description' },
    { id: 'tableName', title: 'Table Name' },
    { id: 'isUnique', title: 'Is Unique' },
  ];

  if (showDetectionMethods) {
    headers.push({ id: 'detectionMethod', title: 'Detection Method' });
  }

  headers.push(
    { id: 'solutionUrl', title: 'Solution GitHub URL' },
    { id: 'connectorFileUrl', title: 'Connector File URL' }
  );

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: headers,
  });

  // Prepare records, replacing newlines in descriptions
  const records = mappings.map((mapping) => ({
    ...mapping,
    connectorDescription: mapping.connectorDescription
      ? mapping.connectorDescription.replace(/\n/g, '<br>')
      : '',
    isUnique: mapping.isUnique ? 'Yes' : 'No',
    supportTier: mapping.supportTier || '',
    detectionMethod: showDetectionMethods ? mapping.detectionMethod : undefined,
  }));

  await csvWriter.writeRecords(records);
}

export async function generateIssuesCsv(
  issues: AnalysisIssue[],
  outputPath: string
): Promise<void> {
  if (issues.length === 0) {
    return;
  }

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'solution', title: 'Solution' },
      { id: 'connectorId', title: 'Connector ID' },
      { id: 'issueType', title: 'Issue Type' },
      { id: 'message', title: 'Message' },
      { id: 'filePath', title: 'File Path' },
    ],
  });

  const records = issues.map((issue) => ({
    solution: issue.solution,
    connectorId: issue.connectorId || '',
    issueType: issue.issueType,
    message: issue.message,
    filePath: issue.filePath || '',
  }));

  await csvWriter.writeRecords(records);
}

/**
 * Convert mappings to JSON format
 */
export function mappingsToJson(mappings: TableMapping[]): string {
  return JSON.stringify(mappings, null, 2);
}

/**
 * Convert issues to JSON format
 */
export function issuesToJson(issues: AnalysisIssue[]): string {
  return JSON.stringify(issues, null, 2);
}
