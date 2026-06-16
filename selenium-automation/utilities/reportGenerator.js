const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

async function generateExcelReport(results) {
  const reportPath = path.join(__dirname, '..', 'reports', 'TestExecutionReport.xlsx');
  logger.info(`Starting generation of Excel report at: ${reportPath}`);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Fitwave Quality Assurance';
  workbook.lastModifiedBy = 'Selenium E2E Framework';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Color Palette Definitions
  const colors = {
    headerBg: 'FF1E293B',    // Slate 800
    white: 'FFFFFFFF',
    passBg: 'FFE6F4EA',      // Soft Green
    passText: 'FF137333',    // Dark Green
    failBg: 'FFFCE8E6',      // Soft Red
    failText: 'FFC5221F',    // Dark Red
    summaryBg: 'FFF8FAFC',   // Slate 50
    cardTotalBg: 'FFE8F0FE', // Light blue card
    cardPassBg: 'FFE6F4EA',  // Light green card
    cardFailBg: 'FFFCE8E6',  // Light red card
    border: 'FFCBD5E1',      // Slate 300
    chartGreen: 'FF10B981',  // Emerald
    chartRed: 'FFEF4444'     // Rose
  };

  // Border style
  const thinBorder = {
    top: { style: 'thin', color: { argb: colors.border } },
    left: { style: 'thin', color: { argb: colors.border } },
    bottom: { style: 'thin', color: { argb: colors.border } },
    right: { style: 'thin', color: { argb: colors.border } }
  };

  // Helper function to style header row
  const styleHeader = (sheet) => {
    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.headerBg }
      };
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: colors.white }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = thinBorder;
    });
  };

  const sheetTestCases = workbook.addWorksheet('Test Cases');
  sheetTestCases.views = [{ showGridLines: true }];
  sheetTestCases.columns = [
    { header: 'Test Case ID', key: 'id', width: 15 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Test Scenario', key: 'scenario', width: 45 },
    { header: 'Expected Result', key: 'expected', width: 55 },
    { header: 'Result', key: 'status', width: 12 }
  ];

  results.forEach(r => {
    sheetTestCases.addRow({
      id: r.id,
      module: r.module,
      scenario: r.scenario,
      expected: r.expected,
      status: r.status
    });
  });

  // Apply row styling for Sheet 1
  sheetTestCases.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.height = 20;
      const statusCell = row.getCell('status');
      const statusVal = statusCell.value;

      row.eachCell(cell => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle' };
      });

      // Apply status styling
      if (statusVal === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.passBg } };
        statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: colors.passText } };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.failBg } };
        statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: colors.failText } };
      }
      statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });
  styleHeader(sheetTestCases);

  // ==========================================
  // SHEET 2: Execution Results
  // ==========================================
  const sheetResults = workbook.addWorksheet('Execution Results');
  sheetResults.views = [{ showGridLines: true }];
  sheetResults.columns = [
    { header: 'Test Case ID', key: 'id', width: 15 },
    { header: 'Actual Result', key: 'actual', width: 60 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Execution Time', key: 'time', width: 18 }
  ];

  results.forEach(r => {
    sheetResults.addRow({
      id: r.id,
      actual: r.status === 'PASS' ? 'Test executed successfully meeting all verification checkpoints.' : r.actual,
      status: r.status,
      time: `${(r.duration / 1000).toFixed(2)}s`
    });
  });

  sheetResults.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.height = 22;
      const statusCell = row.getCell('status');
      const statusVal = statusCell.value;
      
      row.eachCell(cell => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle' };
      });

      // Apply status styling
      if (statusVal === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.passBg } };
        statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: colors.passText } };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.failBg } };
        statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: colors.failText } };
      }
      statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });
  styleHeader(sheetResults);

  // ==========================================
  // SHEET 3: Summary & Visual Charts
  // ==========================================
  const sheetSummary = workbook.addWorksheet('Summary');
  sheetSummary.views = [{ showGridLines: true }];
  
  // Calculate Stats
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = total - passed;
  const passPercent = total > 0 ? (passed / total) * 100 : 0;
  const failPercent = total > 0 ? (failed / total) * 100 : 0;

  // Title block
  sheetSummary.mergeCells('A1:G2');
  const titleCell = sheetSummary.getCell('A1');
  titleCell.value = 'Fitwave Test Automation Dashboard';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: colors.white } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Metadata Panel
  sheetSummary.getCell('A4').value = 'Execution Date:';
  sheetSummary.getCell('B4').value = new Date().toLocaleString();
  sheetSummary.getCell('A5').value = 'Environment:';
  sheetSummary.getCell('B5').value = 'Local Mock App Server';
  sheetSummary.getCell('A6').value = 'Target Browser:';
  sheetSummary.getCell('B6').value = 'Google Chrome';
  sheetSummary.getCell('A7').value = 'Framework Stack:';
  sheetSummary.getCell('B7').value = 'NodeJS / Selenium / Mocha';

  // Apply bold tags for metadata labels
  ['A4', 'A5', 'A6', 'A7'].forEach(cellId => {
    sheetSummary.getCell(cellId).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF475569' } };
  });
  ['B4', 'B5', 'B6', 'B7'].forEach(cellId => {
    sheetSummary.getCell(cellId).font = { name: 'Segoe UI', size: 10, color: { argb: 'FF0F172A' } };
  });

  // KPI Cards Table
  // Table structure:
  // Card title on row 9, Value on row 10
  const cardData = [
    { col: 'D', title: 'TOTAL CASES', val: total, bg: colors.cardTotalBg, fontColor: 'FF1E40AF' },
    { col: 'E', title: 'PASSED', val: passed, bg: colors.cardPassBg, fontColor: colors.passText },
    { col: 'F', title: 'FAILED', val: failed, bg: colors.cardFailBg, fontColor: colors.failText },
    { col: 'G', title: 'PASS RATE', val: `${passPercent.toFixed(1)}%`, bg: colors.cardPassBg, fontColor: colors.passText }
  ];

  cardData.forEach(card => {
    const titleCell = sheetSummary.getCell(`${card.col}4`);
    titleCell.value = card.title;
    titleCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF475569' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    titleCell.border = thinBorder;

    const valCell = sheetSummary.getCell(`${card.col}5`);
    valCell.value = card.val;
    valCell.font = { name: 'Segoe UI', size: 18, bold: true, color: { argb: card.fontColor } };
    valCell.alignment = { vertical: 'middle', horizontal: 'center' };
    valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: card.bg } };
    valCell.border = thinBorder;
  });

  // Chart representation section
  sheetSummary.mergeCells('A9:G9');
  const chartTitle = sheetSummary.getCell('A9');
  chartTitle.value = 'PASS / FAIL RATIO CHART';
  chartTitle.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: colors.white } };
  chartTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  chartTitle.alignment = { vertical: 'middle', horizontal: 'center' };

  // Draw block graph
  // A 20-cell progress bar spanning columns A to G (we can split cells or map columns)
  // Let's create a beautiful text-styled progress bar inside row 11
  sheetSummary.mergeCells('A11:G11');
  const barCell = sheetSummary.getCell('A11');
  
  // Create representation using blocks (e.g. █ character)
  const totalBlocks = 30;
  const passBlocks = Math.round((passPercent / 100) * totalBlocks);
  const failBlocks = totalBlocks - passBlocks;
  const barText = '█'.repeat(passBlocks) + '░'.repeat(failBlocks);
  
  barCell.value = `Passed Ratio: ${barText} (${passPercent.toFixed(1)}% Pass)`;
  barCell.font = { name: 'Consolas', size: 14, bold: true, color: { argb: colors.passText } };
  barCell.alignment = { vertical: 'middle', horizontal: 'center' };
  barCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.summaryBg } };
  barCell.border = thinBorder;

  // Key Legend
  sheetSummary.getCell('B13').value = '█ Green Area';
  sheetSummary.getCell('B13').font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: colors.passText } };
  sheetSummary.getCell('C13').value = 'Passed Tests';

  sheetSummary.getCell('B14').value = '░ Gray/Red Area';
  sheetSummary.getCell('B14').font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF64748B' } };
  sheetSummary.getCell('C14').value = 'Failed Tests';

  sheetSummary.getColumn('A').width = 20;
  sheetSummary.getColumn('B').width = 22;
  sheetSummary.getColumn('C').width = 15;
  sheetSummary.getColumn('D').width = 15;
  sheetSummary.getColumn('E').width = 15;
  sheetSummary.getColumn('F').width = 15;
  sheetSummary.getColumn('G').width = 15;

  // ==========================================
  // SHEET 4: Defect Report
  // ==========================================
  const sheetDefects = workbook.addWorksheet('Defect Report');
  sheetDefects.views = [{ showGridLines: true }];
  sheetDefects.columns = [
    { header: 'Defect ID', key: 'defectId', width: 15 },
    { header: 'Test Case ID', key: 'testCaseId', width: 15 },
    { header: 'Description', key: 'desc', width: 60 },
    { header: 'Severity', key: 'severity', width: 14 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  let defectCount = 0;
  results.forEach(r => {
    if (r.status === 'FAIL') {
      defectCount++;
      sheetDefects.addRow({
        defectId: `DEF-${String(defectCount).padStart(3, '0')}`,
        testCaseId: r.id,
        desc: r.actual || 'Assertion failed during Selenium execution steps.',
        severity: r.severity || 'Medium',
        status: 'OPEN'
      });
    }
  });

  sheetDefects.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.height = 22;
      row.eachCell(cell => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle' };
      });
      
      const statusCell = row.getCell('status');
      statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF991B1B' } };

      const severityCell = row.getCell('severity');
      severityCell.alignment = { vertical: 'middle', horizontal: 'center' };
      const sev = severityCell.value;
      if (sev === 'High') {
        severityCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: colors.failText } };
      } else {
        severityCell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FFD97706' } }; // Orange
      }
    }
  });
  styleHeader(sheetDefects);

  // ==========================================
  // SHEET 5: Failed Screenshots
  // ==========================================
  const sheetScreenshots = workbook.addWorksheet('Failed Screenshots');
  sheetScreenshots.views = [{ showGridLines: true }];
  sheetScreenshots.columns = [
    { header: 'Test Case ID', key: 'testCaseId', width: 18 },
    { header: 'Screenshot Path', key: 'screenshotPath', width: 80 }
  ];

  results.forEach(r => {
    if (r.status === 'FAIL' && r.screenshotPath) {
      sheetScreenshots.addRow({
        testCaseId: r.id,
        screenshotPath: r.screenshotPath
      });
    }
  });

  sheetScreenshots.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.height = 20;
      row.eachCell(cell => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle' };
      });
      const pathCell = row.getCell('screenshotPath');
      pathCell.font = { name: 'Consolas', size: 9, color: { argb: 'FF0284C7' } }; // Blue link style
    }
  });
  styleHeader(sheetScreenshots);

  // Save Workbook
  await workbook.xlsx.writeFile(reportPath);
  logger.info(`Excel report created successfully at: ${reportPath}`);
}

module.exports = { generateExcelReport };
