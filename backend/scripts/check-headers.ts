import XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'backend/ispanyaIstatistik.xlsx');
console.log(`Reading file: ${filePath}`);

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length > 0) {
        console.log('Headers:', data[0]);
    } else {
        console.log('File is empty or could not be read.');
    }
} catch (error) {
    console.error('Error reading file:', error);
}
