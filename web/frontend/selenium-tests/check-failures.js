const ExcelJS = require('exceljs');

async function checkFailures() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('FitWave_Test_Report.xlsx');
  const worksheet = workbook.getWorksheet(1);
  let failCount = 0;
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const status = row.getCell(4).value;
      if (status === 'FAIL') {
        failCount++;
        console.log(`Failed: ${row.getCell(1).value} - ${row.getCell(3).value} | Error: ${row.getCell(5).value}`);
      }
    }
  });
  console.log(`Total Failures: ${failCount}`);
}

checkFailures();
