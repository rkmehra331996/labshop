import { LabReport } from '../types';
import { generateReportPdf } from './pdfGenerator';

/**
 * Checks if the current document is running inside an iframe
 */
export function isRunningInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Safely trigger print with automatic fallback if sandboxed inside an iframe
 */
export function safePrint(onBlocked?: () => void): boolean {
  try {
    window.print();
    return true;
  } catch (error) {
    console.warn('Direct window.print() failed or blocked in iframe sandbox:', error);
    if (onBlocked) {
      onBlocked();
    }
    return false;
  }
}

/**
 * Prints or downloads a LabReport reliably across all devices and iframe sandboxes
 */
export function printReportSafely(report: LabReport): void {
  // If running in an iframe, try print first, but also trigger PDF generation or printable window
  let printed = false;
  try {
    window.print();
    printed = true;
  } catch {
    printed = false;
  }

  // If window.print was blocked or failed, generate the actual official PDF
  if (!printed) {
    generateReportPdf(report);
  }
}
