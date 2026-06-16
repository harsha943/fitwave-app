const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateExcelReport(testResults) {
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, 'MobileExecutionReport.xlsx');
    const workbook = new ExcelJS.Workbook();
    
    workbook.creator = 'Appium QA Bot';
    workbook.created = new Date();

    const colors = {
        headerBg: 'FF2563EB', // Blue
        white: 'FFFFFFFF',
        passBg: 'FFE6F4EA',
        passText: 'FF137333',
        failBg: 'FFFCE8E6',
        failText: 'FFA50E0E',
        border: 'FFCBD5E1'
    };

    const thinBorder = {
        top: { style: 'thin', color: { argb: colors.border } },
        left: { style: 'thin', color: { argb: colors.border } },
        bottom: { style: 'thin', color: { argb: colors.border } },
        right: { style: 'thin', color: { argb: colors.border } }
    };

    const sheet = workbook.addWorksheet('Mobile Test Results');

    sheet.columns = [
        { header: 'Test Case ID', key: 'id', width: 18 },
        { header: 'Scenario', key: 'scenario', width: 50 },
        { header: 'Result', key: 'status', width: 15 },
        { header: 'Execution Time (s)', key: 'duration', width: 20 },
        { header: 'Error Log', key: 'error', width: 50 }
    ];

    // Style the header row
    const headerRow = sheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
        cell.font = { name: 'Arial', size: 12, bold: true, color: { argb: colors.white } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = thinBorder;
    });

    // Populate data
    testResults.forEach(result => {
        sheet.addRow({
            id: result.id,
            scenario: result.scenario,
            status: result.status,
            duration: result.duration.toFixed(2),
            error: result.error || 'N/A'
        });
    });

    // Style data rows
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            row.height = 20;
            row.eachCell(cell => {
                cell.font = { name: 'Arial', size: 11 };
                cell.border = thinBorder;
                cell.alignment = { vertical: 'middle', wrapText: true };
            });

            // Style the status cell
            const statusCell = row.getCell('status');
            const isPass = statusCell.value === 'PASS';
            
            statusCell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: isPass ? colors.passBg : colors.failBg } 
            };
            statusCell.font = { 
                name: 'Arial', 
                size: 11, 
                bold: true, 
                color: { argb: isPass ? colors.passText : colors.failText } 
            };
            statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
    });

    await workbook.xlsx.writeFile(reportPath);
    console.log(`\n✅ Mobile E2E Report generated at: ${reportPath}`);
}

module.exports = { generateExcelReport };
