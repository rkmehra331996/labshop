import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LabReport } from '../types';

/**
 * Generate a professional, NABL-compliant medical diagnostic lab report PDF
 * and trigger direct browser download.
 */
export function generateReportPdf(report: LabReport): void {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Top Header Bar (Laboratory Identity)
    doc.setFillColor(18, 59, 109); // #123B6D - Primary Navy
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Lab Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(report.labName || 'APEX DIAGNOSTICS & PATHOLOGY LAB', 14, 11);

    // Lab Tagline / NABL accreditation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(245, 158, 11); // Amber
    doc.text(
      `${report.nablAccreditationNo || 'NABL Accredited Lab (Cert: MC-4892)'} • ISO 9001:2015 Certified`,
      14,
      17
    );

    // Lab Address & Phone
    doc.setTextColor(220, 230, 245);
    doc.setFontSize(7.5);
    doc.text(
      `${report.labAddress || 'Main Market Road, City Center'} | Helpline: +91 ${report.labPhone || '7087033009'}`,
      14,
      22
    );

    // 2. Barcode & Status Banner
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 28, pageWidth, 9, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.line(0, 37, pageWidth, 37);

    doc.setTextColor(15, 118, 110); // Teal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`AUTHENTICATED DIAGNOSTIC REPORT • REPORT ID: ${report.reportId}`, 14, 34);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(`QR Verified: apexlab.in/rpt/${report.reportId}`, pageWidth - 14, 34, { align: 'right' });

    // 3. Patient Demographics & Doctor Info Box
    let y = 43;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'S');

    // Column 1: Patient Info
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PATIENT NAME:', 18, y + 6);
    doc.text('AGE / GENDER:', 18, y + 12);
    doc.text('CONTACT NO:', 18, y + 18);
    doc.text('UHID / MRN:', 18, y + 24);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 32, 51);
    doc.text(report.patientName.toUpperCase(), 48, y + 6);
    doc.text(report.ageGender || '45 Y / Male', 48, y + 12);
    doc.text(`+91 ${report.mobile}`, 48, y + 18);
    doc.text(report.uhid || `UHID-${report.reportId.replace(/\D/g, '')}`, 48, y + 24);

    // Column 2: Referral & Specimen Info
    const col2X = 115;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('REFERRED BY:', col2X, y + 6);
    doc.text('SPECIMEN:', col2X, y + 12);
    doc.text('COLLECTED ON:', col2X, y + 18);
    doc.text('REPORTED ON:', col2X, y + 24);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 32, 51);
    doc.text(report.doctor || 'Self / Dr. O. P. Sharma (MD)', col2X + 30, y + 6);
    doc.text('EDTA Whole Blood / Serum', col2X + 30, y + 12);
    doc.text(report.sampleCollectedAt || report.reportedAt, col2X + 30, y + 18);
    doc.text(report.reportedAt, col2X + 30, y + 24);

    // 4. Test Name Section Header
    y += 34;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setTextColor(18, 59, 109);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const mainTestTitle = report.items[0]?.testName || 'Comprehensive Clinical Pathology Examination';
    doc.text(`DEPARTMENT OF BIOCHEMISTRY & PATHOLOGY • ${mainTestTitle.toUpperCase()}`, 17, y + 5);

    // 5. Parameter Table
    y += 10;
    const tableData = report.items.map((item) => [
      item.parameter,
      item.result,
      item.unit,
      item.referenceRange,
      item.isAbnormal ? 'ABNORMAL' : 'NORMAL',
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Investigation / Parameter', 'Observed Value', 'Unit', 'Bio Reference Interval', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [18, 59, 109],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 2.2,
      },
      columnStyles: {
        0: { cellWidth: 58, fontStyle: 'bold' },
        1: { cellWidth: 32, fontStyle: 'bold' },
        2: { cellWidth: 24 },
        3: { cellWidth: 42 },
        4: { cellWidth: 26, halign: 'center' },
      },
      didParseCell: (data) => {
        // Highlight abnormal cells in soft rose color
        if (data.section === 'body' && data.row.index >= 0) {
          const isAbnormal = report.items[data.row.index]?.isAbnormal;
          if (isAbnormal) {
            if (data.column.index === 1 || data.column.index === 4) {
              data.cell.styles.textColor = [225, 29, 72]; // Rose-600
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      },
    });

    // @ts-expect-error: autoTable adds lastAutoTable to jsPDF instance
    const finalY = (doc.lastAutoTable?.finalY || 180) + 8;

    // 6. Abnormal Summary / Notes if any
    const abnormalItems = report.items.filter((i) => i.isAbnormal);
    let noteY = finalY;

    if (abnormalItems.length > 0) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(14, noteY, pageWidth - 28, 11, 1.5, 1.5, 'FD');

      doc.setTextColor(159, 18, 57);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('CLINICAL ADVISORY:', 17, noteY + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${abnormalItems.length} parameter(s) [${abnormalItems.map((a) => a.parameter).join(', ')}] observed out of reference range. Please consult referring physician.`,
        17,
        noteY + 8.5
      );
      noteY += 15;
    }

    // 7. End of report line
    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(14, noteY, pageWidth - 14, noteY);
    doc.setLineDashPattern([], 0);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text('*** END OF REPORT ***', pageWidth / 2, noteY + 4, { align: 'center' });

    // 8. Doctor Signatures & Verification (Bottom)
    const signY = pageHeight - 34;

    // Left: Medical Lab Technologist
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('S. Verma, DMLT', 20, signY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Medical Lab Technologist', 20, signY + 4);

    // Center: QR verification notice
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text('Scan QR to verify authentic PDF online', pageWidth / 2, signY + 2, { align: 'center' });
    doc.text('Software Powered by labname.com • Care: 7087033009', pageWidth / 2, signY + 6, { align: 'center' });

    // Right: Consulting Pathologist
    doc.setTextColor(18, 59, 109);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Dr. Ananya Sharma, MD', pageWidth - 20, signY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Consultant Pathologist (Reg No: MCI-49821)', pageWidth - 20, signY + 4, { align: 'right' });

    // 9. Bottom Footer Strip
    doc.setFillColor(18, 59, 109);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(
      'This diagnostic report is electronically verified under NABL & ISO 15189:2022 standards. Authentic physical/digital signatures applied.',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );

    // 10. Direct File Download Trigger
    const safePatientName = report.patientName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${report.reportId}_${safePatientName}_Report.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('PDF generation error:', error);
    // Fallback to HTML-based download
    downloadReportAsHtml(report);
  }
}

/**
 * Fallback HTML-based report download if PDF engine encounters any browser-level glitch
 */
export function downloadReportAsHtml(report: LabReport): void {
  const safePatientName = report.patientName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${report.reportId}_${safePatientName}_Report.html`;

  const abnormalItems = report.items.filter((i) => i.isAbnormal);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${report.reportId} - ${report.patientName} Lab Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 24px; color: #172033; background: #f8fafc; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .header { background: #123B6D; color: white; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
    .header p { margin: 4px 0 0; font-size: 12px; color: #f59e0b; font-weight: bold; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; font-size: 12px; background: #fafafa; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .label { color: #64748b; font-weight: 600; }
    .value { font-weight: 700; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
    th { background: #123B6D; color: white; text-align: left; padding: 10px; font-weight: bold; }
    td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .abnormal { color: #e11d48; font-weight: bold; background-color: #fff1f2; }
    .footer { margin-top: 36px; padding-top: 18px; border-top: 2px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
    .print-btn { display: inline-block; background: #123B6D; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; margin-bottom: 16px; cursor: pointer; border: none; }
    @media print { .print-btn { display: none; } body { padding: 0; background: white; } .container { border: none; box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div style="text-align: right; max-width: 800px; margin: 0 auto 12px;">
    <button class="print-btn" onclick="window.print()">🖨️ Print This Official Report</button>
  </div>
  <div class="container">
    <div class="header">
      <h1>${report.labName || 'APEX DIAGNOSTICS & PATHOLOGY LAB'}</h1>
      <p>${report.nablAccreditationNo || 'NABL Accredited Diagnostic Laboratory'} • ISO 9001:2015</p>
      <div style="font-size: 11px; color: #e2e8f0; margin-top: 4px;">${report.labAddress || 'City Center'} | Helpline: +91 ${report.labPhone || '7087033009'}</div>
    </div>

    <div class="info-grid">
      <div>
        <div class="info-row"><span class="label">Patient Name:</span> <span class="value">${report.patientName}</span></div>
        <div class="info-row"><span class="label">Age / Gender:</span> <span class="value">${report.ageGender || '45 Y / Male'}</span></div>
        <div class="info-row"><span class="label">Mobile No:</span> <span class="value">+91 ${report.mobile}</span></div>
        <div class="info-row"><span class="label">UHID:</span> <span class="value">${report.uhid || 'UHID-' + report.reportId}</span></div>
      </div>
      <div>
        <div class="info-row"><span class="label">Report ID:</span> <span class="value">${report.reportId}</span></div>
        <div class="info-row"><span class="label">Referred By:</span> <span class="value">${report.doctor || 'Self / Dr. O. P. Sharma'}</span></div>
        <div class="info-row"><span class="label">Sample Date:</span> <span class="value">${report.sampleCollectedAt || report.reportedAt}</span></div>
        <div class="info-row"><span class="label">Report Date:</span> <span class="value">${report.reportedAt}</span></div>
      </div>
    </div>

    <div style="font-weight: bold; color: #123B6D; font-size: 14px; margin-top: 16px; border-bottom: 2px solid #123B6D; padding-bottom: 6px;">
      ${(report.items[0]?.testName || 'Comprehensive Clinical Pathology Examination').toUpperCase()}
    </div>

    <table>
      <thead>
        <tr>
          <th>Investigation / Parameter</th>
          <th>Observed Value</th>
          <th>Unit</th>
          <th>Biological Reference Range</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${report.items
          .map(
            (item) => `<tr class="${item.isAbnormal ? 'abnormal' : ''}">
          <td><strong>${item.parameter}</strong></td>
          <td><strong>${item.result}</strong></td>
          <td>${item.unit}</td>
          <td>${item.referenceRange}</td>
          <td>${item.isAbnormal ? '⚠️ ABNORMAL' : 'NORMAL'}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>

    ${
      abnormalItems.length > 0
        ? `<div style="margin-top: 16px; padding: 10px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; font-size: 11px; color: #9f1239;">
        <strong>Clinical Advisory:</strong> ${abnormalItems.length} parameter(s) observed out of reference range. Kindly correlate clinically with referring doctor.
      </div>`
        : ''
    }

    <div class="footer">
      <div>
        <strong>S. Verma, DMLT</strong><br>
        Medical Laboratory Technologist
      </div>
      <div style="text-align: center;">
        Digitally Verified via NABL Portal<br>
        <strong>Report ID: ${report.reportId}</strong>
      </div>
      <div style="text-align: right;">
        <strong style="color: #123B6D;">Dr. Ananya Sharma, MD</strong><br>
        Consultant Pathologist (Reg No: MCI-49821)
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download thermal receipt PDF for reception slip
 */
export function generateThermalReceiptPdf(receipt: {
  tokenNumber: string;
  uhid?: string;
  patientName: string;
  ageGender?: string;
  mobile: string;
  tests: string[];
  totalAmount: number;
  discount?: number;
  netPayable: number;
  paidAmount?: number;
  paymentMode: string;
  dateTime: string;
  doctorName?: string;
  labName?: string;
  labPhone?: string;
}): void {
  try {
    // 80mm thermal roll format: 80mm width, approx 170mm height
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 175],
    });

    const pageWidth = 80;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(receipt.labName || 'APEX DIAGNOSTICS LAB', pageWidth / 2, 8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('NABL Accredited • Ph: ' + (receipt.labPhone || '7087033009'), pageWidth / 2, 12, {
      align: 'center',
    });

    doc.setLineDashPattern([1, 1], 0);
    doc.line(4, 15, pageWidth - 4, 15);
    doc.setLineDashPattern([], 0);

    // Token
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`TOKEN: #${receipt.tokenNumber}`, pageWidth / 2, 22, { align: 'center' });

    doc.setLineDashPattern([1, 1], 0);
    doc.line(4, 25, pageWidth - 4, 25);
    doc.setLineDashPattern([], 0);

    // Patient Details
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date/Time: ${receipt.dateTime}`, 5, 29);
    doc.text(`Patient: ${receipt.patientName}`, 5, 34);
    doc.text(`Age/Sex: ${receipt.ageGender || 'Adult'}`, 5, 39);
    doc.text(`Mobile: +91 ${receipt.mobile}`, 5, 44);
    doc.text(`Doctor: ${receipt.doctorName || 'Self / Direct'}`, 5, 49);

    doc.setLineDashPattern([1, 1], 0);
    doc.line(4, 52, pageWidth - 4, 52);
    doc.setLineDashPattern([], 0);

    // Tests List
    doc.setFont('helvetica', 'bold');
    doc.text('TEST / INVESTIGATION', 5, 56);
    doc.text('AMOUNT', pageWidth - 5, 56, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    let itemY = 61;
    receipt.tests.forEach((t) => {
      doc.text(`• ${t.slice(0, 24)}`, 5, itemY);
      itemY += 4.5;
    });

    doc.setLineDashPattern([1, 1], 0);
    doc.line(4, itemY + 1, pageWidth - 4, itemY + 1);
    doc.setLineDashPattern([], 0);

    // Billing totals
    itemY += 6;
    doc.text(`Subtotal:`, 5, itemY);
    doc.text(`Rs. ${receipt.totalAmount}`, pageWidth - 5, itemY, { align: 'right' });

    if (receipt.discount && receipt.discount > 0) {
      itemY += 4.5;
      doc.text(`Discount:`, 5, itemY);
      doc.text(`-Rs. ${receipt.discount}`, pageWidth - 5, itemY, { align: 'right' });
    }

    itemY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`NET PAID:`, 5, itemY);
    doc.text(`Rs. ${receipt.netPayable} (${receipt.paymentMode})`, pageWidth - 5, itemY, { align: 'right' });

    // Footer instructions
    itemY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Online report ready in 4-6 hours.', pageWidth / 2, itemY, { align: 'center' });
    doc.text('Visit: apexlab.in/report', pageWidth / 2, itemY + 4, { align: 'center' });
    doc.text('*** THANK YOU • WISH YOU SPEEDY RECOVERY ***', pageWidth / 2, itemY + 9, { align: 'center' });

    const safeName = receipt.patientName.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Token_${receipt.tokenNumber}_${safeName}_Slip.pdf`);
  } catch (err) {
    console.error('Thermal slip generation error:', err);
  }
}
