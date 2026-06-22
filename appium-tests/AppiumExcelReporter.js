const ExcelJS = require('exceljs');

class AppiumExcelReporter {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'Appium Test Runner';
    this.workbook.created = new Date();
    this.worksheet = this.workbook.addWorksheet('Mobile Test Results');
    this.testIdCounter = 1;
    
    // Define columns
    this.worksheet.columns = [
      { header: 'Test ID', key: 'id', width: 10 },
      { header: 'App Module', key: 'module', width: 20 },
      { header: 'Mobile Test Description', key: 'description', width: 50 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Error Details', key: 'error', width: 50 }
    ];

    this.worksheet.getRow(1).font = { bold: true };
    this.worksheet.getRow(1).alignment = { horizontal: 'center' };
  }

  addResult(id, moduleName, description, status, error = '') {
    const row = this.worksheet.addRow({
      id: id,
      module: moduleName,
      description: description,
      status: status,
      error: error
    });

    const statusCell = row.getCell('status');
    if (status === 'PASS') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00FF00' } // Green
      };
    } else if (status === 'FAIL') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' } // Red
      };
    }
  }

  async runMockMobileTest(moduleName, description) {
    const currentId = `APP-TC-${String(this.testIdCounter++).padStart(3, '0')}`;
    // Simulating appium test success
    this.addResult(currentId, moduleName, description, 'PASS');
  }

  async saveReport(filename = 'FitWave_Appium_Test_Report.xlsx') {
    await this.workbook.xlsx.writeFile(filename);
    console.log(`Excel report saved to ${filename}`);
  }
}

module.exports = AppiumExcelReporter;
