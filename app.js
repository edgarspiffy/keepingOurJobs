import ExcelJS      from 'exceljs';
import excelToJson  from 'convert-excel-to-json';
import formatString from './formatString';
import dataMatch    from './dataMatch';



const excelData = excelToJson({
    sourceFile: './excel/AllData.xlsx',
    header:{
        rows: 1
    },
    columnToKey: {
        A: 'itemNum',
        B: 'UPC',
        C: 'POS360 DB Name',
        D: 'Drizly Name'
    }
})['Sheet1'];

const matchResults =[];





const compareFunction = (excelData)=>{
    for(let i = 0; i < excelData.length;i++){
    
        let productA = excelData[i]['POS360 DB Name'];
        let productB = excelData[i]['Drizly Name'];

        //return string breakdown
        productA = stringFormatting.cleanString(productA);
        productB = stringFormatting.cleanString(productB);
        // console.log(productA);
        // console.log(productB);

        //
        let stringMatchPercentage = comparingFormuals.matchPercentage(productA['name'],productB['name']);
        let packSizeMatch         = comparingFormuals.checkIfMatch(productA['packSize'],productB['packSize']);
        let volumeSizeMatch       = comparingFormuals.checkIfMatch(productA['volumeSize'],productB['volumeSize']);
        let numbersMatch          = comparingFormuals.checkNumMatch(productA['nameNums'],productB['nameNums']);
        // console.log(numbersMatch);


        // console.log(`pack size match ${packSizeMatch}`);
        // console.log(`volume size match ${volumeSizeMatch}`);

        let results = {
            'UPC':excelData[i]['UPC'],
            'itemNum':excelData[i]['itemNum'],
            'POS360 Name':productA['name'],
            'Drizly Name':productB['name'],
            'POS360 Pack Size':productA['packSize'],
            'Drizly Pack Size':productB['packSize'],
            'POS360 Pack Volume':productA['volumeSize'],
            'Drizly Pack Volume':productB['volumeSize'],
            'POS360 Num':productA['nameNums'],
            'Drizly Num':productB['nameNums'],
            'stringMatch':stringMatchPercentage,
            'packSizeMatch':packSizeMatch,
            'volumeSizeMatch':volumeSizeMatch,
            'numMatch':numbersMatch
        }
        matchResults.push(results);
    }
}

        



// compareFunction(excelData);




// const workbook = new ExcelJS.Workbook();
// await workbook.xlsx.readFile(
//     './excel/QCTemplateResults.xlsx'
// );
// const sheet = workbook.getWorksheet('Sheet1');
// const rows = sheet.getRows(2, matchResults.length);
// for (let i = 0; i < matchResults.length; i++) {


//     const itemNum                   = rows[i].getCell('A');
//     const UPC                       = rows[i].getCell('B');


//     const pos360Name                  = rows[i].getCell('C');
//     const drizlyName                    = rows[i].getCell('D');

//     const pos360Num                = rows[i].getCell('E');
//     const drizlyNum                    = rows[i].getCell('F');

//     const pos360PackSize              = rows[i].getCell('G');
//     const drizlyPackSize                 = rows[i].getCell('H');

//     const pos360VolumeSize                 =rows[i].getCell('I');
//     const drizlyVolumeSize                =rows[i].getCell('J');

//     const stringMatch               = rows[i].getCell('K');
//     const numbersmatch                  = rows[i].getCell('L');
//     const volumeMatch              = rows[i].getCell('M');
//     const packSizeMatch               = rows[i].getCell('N');


//     itemNum.value =matchResults[i]['itemNum'];                  
//     UPC.value =matchResults[i]['UPC'];                      


//     pos360Name.value =matchResults[i]['POS360 Name'];                
//     drizlyName.value =matchResults[i]['Drizly Name'];                  

//     pos360Num.value =matchResults[i]['POS360 Num'];                
//     drizlyNum.value =matchResults[i]['Drizly Num'];        

//     pos360PackSize.value =matchResults[i]['POS360 Pack Size'];  
//     drizlyPackSize.value =matchResults[i]['Drizly Pack Size'];     
//     pos360VolumeSize.value =matchResults[i]['POS360 Pack Volume'];    
//     drizlyVolumeSize.value =matchResults[i]['Drizly Pack Volume'];   

//     stringMatch.value =matchResults[i]['stringMatch']; 
//     numbersmatch.value =matchResults[i]['numMatch'];      
//     volumeMatch.value =matchResults[i]['volumeSizeMatch'];  
//     packSizeMatch.value =matchResults[i]['packSizeMatch'];   
// }
// await workbook.xlsx.writeFile(
//     `./excel/QCTemplateResults.xlsx`
// );

console.log('script ran');