import ExcelJS      from 'exceljs';
import excelToJson  from 'convert-excel-to-json';
import stringFormat from './stringFormat.js';
import stringInfo   from './stringInfo.js';
import stringMatch  from './stringMatch.js';

const excelData = excelToJson({
    sourceFile: './excel/POS360 Product Data.xlsx',
    header:{
        rows: 1
    },
    columnToKey: {
        A: 'itemNum',
        B: 'UPC',
        C: 'POS360 Name',
        D: 'Drizly Name',
        E: 'Item Category'
    }
})['Sheet1'];

const generateCleanString = function(string){
    string = stringFormat.basicCleaning(string);
    string = stringFormat.removeAccents(string);
    string = stringFormat.removeVolumeSize(string);
    string = stringFormat.removePackSize(string);
    string = stringFormat.removeNumbersFromString(string);
    string = stringFormat.removeFillerWords(string);
    return string;
}

const findVolumeSize = function(string){
    string = stringFormat.basicCleaning(string);
    string = stringInfo.findVolumeSize(string);
    return string;
}

const findPackSize = function(string){
    string = stringFormat.basicCleaning(string);
    string = stringInfo.findPackSize(string);
    return string;
}

const findNumbersInString = function(string){
    string = stringFormat.basicCleaning(string);
    string = stringFormat.removeVolumeSize(string);
    string = stringFormat.removePackSize(string);
    string = stringInfo.findNumbersInString(string);
    return string;
}

const generateStringMatchScore = function(stringA,stringB){
    stringA = generateCleanString(stringA);
    stringB = generateCleanString(stringB);
    let matchScore = stringMatch.getMatchPercentage(stringA,stringB)
    return matchScore;
};

const doesPacksizeMatch = function(stringA,stringB){
    stringA = findPackSize(stringA);
    stringB = findPackSize(stringB);
    let packSizeMatch = stringMatch.checkIfEqual(stringA,stringB);
    return packSizeMatch;
}

const doStringNumbersMatch = function(stringA,stringB){
    stringA = findNumbersInString(stringA);
    stringB = findNumbersInString(stringB);
    let numbersMatch = stringMatch.checkIfNumbersMatch(stringA,stringB);
    return numbersMatch;
}

const doesVolumeSizeMatch = function(stringA,stringB){
    stringA = findVolumeSize(stringA);
    stringB = findVolumeSize(stringB);
    stringA = stringFormat.convertSizeToOz(stringA);
    stringB = stringFormat.convertSizeToOz(stringB);
    let volumeSizeMatch = stringMatch.checkForVolumeMatch(stringA,stringB);
    return volumeSizeMatch;
    
}



const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(
    './excel/QC - Results.xlsx'
);
const sheet = workbook.getWorksheet('Sheet1');
const rows = sheet.getRows(2, excelData.length);
for (let i = 0; i < excelData.length; i++){


    const itemNum           = rows[i].getCell('A');
    const UPC               = rows[i].getCell('B');
    const category          = rows[i].getCell('C');   

    const pos360Name        = rows[i].getCell('D');
    const drizlyName        = rows[i].getCell('E');

    const pos360NameClean   = rows[i].getCell('F');
    const drizlyNameClean   = rows[i].getCell('G');

    const pos360Num         = rows[i].getCell('H');
    const drizlyNum         = rows[i].getCell('I');

    const pos360PackSize    = rows[i].getCell('J');
    const drizlyPackSize    = rows[i].getCell('K');

    const pos360VolumeSize  =rows[i].getCell('L');
    const drizlyVolumeSize  =rows[i].getCell('M');

    const stringMatch       = rows[i].getCell('N');
    const doNumbersMatch    = rows[i].getCell('O');
    const doPackSizeMatch   = rows[i].getCell('P');
    const doVolumesMatch    = rows[i].getCell('Q');

    const stringA           = excelData[i]['POS360 Name'];
    const stringB           = excelData[i]['Drizly Name']

    itemNum.value           = excelData[i]['itemNum'];                  
    UPC.value               = excelData[i]['UPC'];  
    category.value          = excelData[i]['Item Category'];        

    pos360Name.value        = stringFormat.basicCleaning(stringA);                
    drizlyName.value        = stringFormat.basicCleaning(stringB);  

    pos360NameClean.value   = generateCleanString(stringA);                
    drizlyNameClean.value   = generateCleanString(stringB);  
    

    pos360Num.value         = findNumbersInString(stringA);                
    drizlyNum.value         = findNumbersInString(stringB);        

    pos360PackSize.value    = findPackSize(stringA);  
    drizlyPackSize.value    = findPackSize(stringB);    

    pos360VolumeSize.value  = findVolumeSize(stringA);    
    drizlyVolumeSize.value  = findVolumeSize(stringB);   

    stringMatch.value       = generateStringMatchScore(stringA,stringB);
    doNumbersMatch.value    = doStringNumbersMatch(stringA,stringB);    
    doPackSizeMatch.value   = doesPacksizeMatch(stringA,stringB);
    doVolumesMatch.value    = doesVolumeSizeMatch(stringA,stringB);
 
}
await workbook.xlsx.writeFile(
    `./excel/QC - Results.xlsx`
);

console.log('script ran');