import ExcelJS     from 'exceljs';
import excelToJson from 'convert-excel-to-json';

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



const stringBreakdown = (string)=>{
    if(string === undefined){
        string = "";
    }

    let stringObject = {
        'cleanName'     :undefined,
        'volumeSize'    :undefined,
        'packSize'      :undefined,
        'NumsInName'    :undefined
    };


    //basic clean up
    string = string.toString();
    string = string.toLowerCase();
    string = string.replace( /\(/g, "");              // remove ()
    string = string.replace( /\)/g, "");              // remove )
    string = string.replace(/-/g,' ');                // remove -
    string = string.replace(/,/g,' ');                // remove ,
    string = string.replace(/'/g,'');                 // remove '
    string = string.replace(/no\./g,' no. ');         // forces space around
    string = string.replace(/\s+counts\s+/g,' ct ');  // counts to ct
    string = string.replace(/\s+packs\s+/g,' pk ');   // packs to pk

    //clean accent letters
    string = string.replace(/\u03git01|\u00e9/g,'e'); // é to e 
    string = string.replace(/\u00F3|\u00F2/g,'e');    // ó to o 
    string = string.replace(/\u00E4/g,'a');           // ä to a 
    string = string.replace(/\u00F1/g,'n');           // ñ to n

    //outlier
    string = string.replace('355ml','12oz');

    //find size volume
    let sizeIdentifiers = ['oz','ml','l'];
    for(let i = 0; i < sizeIdentifiers.length; i++){
        let lookForSizeIdentifiers = RegExp(`(\\s+[0-9]+\\s+${sizeIdentifiers[i]})|(\\s+[0-9]+${sizeIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+${sizeIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+\\s+${sizeIdentifiers[i]})`);
        if(lookForSizeIdentifiers.test(string)){
            let volumeSize = lookForSizeIdentifiers.exec(string)[0];
            string = string.replace(volumeSize,'');
            volumeSize = volumeSize.replace(/\s+/g, '');
            stringObject['volumeSize'] = volumeSize;   
            break; 
        }else{
            stringObject.sizeVolume = null;      
        }
    }

    //find pack size
    let packIdentifiers = ['pc','pack','pk','ct'];
    for(let i = 0; i < packIdentifiers.length; i++){
        let lookForPackSize = RegExp(`(\\s+[0-9]+\\s+${packIdentifiers[i]})|(\\s+[0-9]+${packIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+${packIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+\\s+${packIdentifiers[i]})`);
        if(lookForPackSize.test(string)){
            let packSize = lookForPackSize.exec(string)[0];
            string = string.replace(packSize,'');
            packSize = packSize.replace(/\s+/g, '');
            stringObject['packSize'] = packSize;   
            break; 
        }else{
            stringObject.packSize = null;      
        }
    }

    //more basic cleaning
    string = string.replace(/\s{2,}/g," "); 
    string = string.trim();

    string = string.split(" ");
    const numsInString = []
    for(let i = 0;i< string.length;i++){
        if(Number(string[i])){
            numsInString.push(string[i]);
            string.splice(i, 1); 
        }
    }
    stringObject['NumsInName'] = numsInString;   
    string = string.join(" ");


    const wordsToRemove = [  "bottles","bottle", //plural needs to come before singular words so bottles needs to come before bottle
    "cans ","can ",
    "'s ",'\xAE',
    "ct ","bags ","bag ",
    "boxes ","box ","plastic",
    "count "]


    for(let i = 0; i < wordsToRemove.length;i++){
        let wordToRemove = new RegExp(`${wordsToRemove[i]}`,'g');
        string = string.replace(wordToRemove," ");
    }
 
    
  





    stringObject['cleanName'] = string;   



    return stringObject;

}






const getMatchPercentage = function(productA,productB){

            let matchwingWordsCountAtoB = 0;
            let arraySubtractorAtoB = 0; //when a word gets concatenated and a match returns we need to subtract it from word count
    
            for(let j = 0; j < productA.length;j++){
                for(let m = 0; m < productB.length; m++){
                    if(productA[j] === productB[m]){
                        matchwingWordsCountAtoB++;
                        break;
                    }
                    if(`${productA[j]}.` === productB[m]){
                        matchwingWordsCountAtoB++;
                        break;
                    }
                    if(`${productA[j]}s` === productB[m]){
                        matchwingWordsCountAtoB++;
                        break;
                    }
                    if(productA[j].slice(0, -1) === productB[m]){
                        matchwingWordsCountAtoB++;
                        break;
                    }
                    if(`${productA[j]}${productA[j+1]}` === productB[m]){
                        matchwingWordsCountAtoB++;
                        arraySubtractorAtoB++
                        j++
                        break;
                    }
                    if(productA[j] === `${productB[m]}${productB[m+1]}`){
                        matchwingWordsCountAtoB++;
                        break;
                    }
                    //This usually catches brands that are 2 letters with an & in the middle
                    if(`${productA[j]}${productA[j+1]}${productA[j+2]}` === productB[m]){
                        matchwingWordsCountAtoB++;
                        j+=2
                        arraySubtractorAtoB+=2;
                        break;
                    }
                    if(productA[j] === `${productB[m]}${productB[m+1]}${productB[m+2]}`){
                        matchwingWordsCountAtoB++;
                        break;
                    }
                }
            }
            let accuracyAtoB = (matchwingWordsCountAtoB/(productA.length - arraySubtractorAtoB))*100;
            return accuracyAtoB;
        }
    


const checkNumMatch = (a,b)=>{
    let matchwingWordsCountAtoB = 0;
    for(let j = 0; j < a.length;j++){
        for(let m = 0; m < b.length; m++){
            if(a[j] === b[m]){
                matchwingWordsCountAtoB++;
                break;
            }
        }
    }
    let accuracyAtoB = (matchwingWordsCountAtoB/(a.length))*100;
    return accuracyAtoB;
}        




const checkIfMatch = (a,b)=>{
    if(a === b){
        return true;
    }else{
        return false;
    }
}



const matchPercentage = (productA,productB)=>{
    let scoreAtoB = getMatchPercentage(productA,productB);
    let scoreBtoA = getMatchPercentage(productB,productA);
    let matchPercentage = (scoreAtoB + scoreBtoA)/2
    return matchPercentage;
}


const compareFunction = (excelData)=>{
    for(let i = 0; i < excelData.length;i++){

        let productA = stringBreakdown(excelData[i]['POS360 DB Name']);
        let productB = stringBreakdown(excelData[i]['Drizly Name']);
        let stringMatchScore = matchPercentage(productA['cleanName'],productB['cleanName']);
        let numberArrayMatch = matchPercentage(productA['NumsInName'],productB['NumsInName']);
        let volumeSizeMatch = checkIfMatch(productA['volumeSize'],productB['volumeSize']);
        let packSizeMatch = checkIfMatch(productA['packSize'],productB['packSize']);
       
        



        let matchResultsStatus = {
            'itemNumber'        :excelData[i]['itemNum'],
            'UPC'               :excelData[i]['UPC'],

            'POS360 Name'       :excelData[i]['POS360 DB Name'],
            'Drizly Name'       :excelData[i]['Drizly Name'],

            'Drizly Name Num'   :productB['NumsInName'],
            'POS360 Name Num'   :productA['NumsInName'],

            'POS360 Name Clean' :productA['cleanName'],
            'Drizly Name Clean' :productB['cleanName'],

            'Drizly Pack Size'  :productB['packSize'],
            'POS360 Pack Size'  :productA['packSize'],

            'POS360 Volume Size':productA['volumeSize'],
            'Drizly Volume Size':productB['volumeSize'],

            'string Match Score':stringMatchScore.toFixed(2),
            'Nums Match Score'  :numberArrayMatch.toFixed(2),
            'Volume Match'      :volumeSizeMatch,
            'Pack Size Match'   :packSizeMatch

        }
        matchResults.push(matchResultsStatus);

    }
}

        



compareFunction(excelData);
// console.log(matchResults);


//     removeOz:function(string){
//         //matches with 18oz, 18 oz
//         const lookForOz             = RegExp("(\\s+[0-9]+\\s+oz)|(\\s+[0-9]+oz)");                
//         //matches with 18.3oz, 18.3 oz   
//         const lookForOzAndDecimal   = RegExp("(\\s+[0-9]+\\.[0-9]+oz)|(\\s+[0-9]+\\.[0-9]+\\s+oz)");

//         if(lookForOz.test(string)){
//             let numWithOz = lookForOz.exec(string)[0];
//             let numOnly = numWithOz.slice(0,-2);
//             string = string.replace(numWithOz,numOnly);
//             return string;
//         }
//         if(lookForOzAndDecimal.test(string)){   
//             let numWithOz = lookForOzAndDecimal.exec(string)[0];
//             let numOnly = numWithOz.slice(0,-2);

//             //remove everything after decimal and decimal point
//             let hasDecimal = true;
//             while(hasDecimal){
//                 if(numOnly[numOnly.length -1] === "."){
//                     hasDecimal = false;
//                 }
//                 numOnly = numOnly.slice(0,-1);
//             }
//             string = string.replace(numWithOz,numOnly);
//             return string;
//         }
//     },
//     removeMl:function(string){
//         //matches with 18ml, 18 ml
//         const lookForMl = RegExp("(\\s+[0-9]+\\s+ml)|(\\s+[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+\\s+ml)");                
//         if(lookForMl.test(string)){
//             let numWithMl = lookForMl.exec(string)[0];
//             let numOnly = numWithMl.slice(0,-2);
//             numOnly = parseInt(numOnly);
//             numOnly = numOnly * 0.0338;
//             numOnly = numOnly.toString();
//             const hasDecimalRegExp = new RegExp("\\.");
//             let hasDecimal = false;
//             if(hasDecimalRegExp.test(numOnly)){
//                     hasDecimal = true;}
//             while(hasDecimal){
//                 if(numOnly[numOnly.length -1] === "."){
//                     hasDecimal = false;
//                 }
//                 numOnly = numOnly.slice(0,-1);
//             }
//             string = string.replace(numWithMl,` ${numOnly}`);
//             return string;
//         }
//     },
//     removeLiter:function(string){
//         const lookForLiter = RegExp("(\\s+[0-9]+\\s+l)|(\\s+[0-9]+l)|(\\s+[0-9]+\\.[0-9]+l)|(\\s+[0-9]+\\.[0-9]+\\s+l)");                  

//             let numWithLiter = lookForLiter.exec(string)[0];
//             let numOnly = numWithLiter.slice(0,-1);
//             string = string.replace(numWithLiter,numOnly);
//             return string;
//     },
//     removeAmbiguousWords:function(string){

//         for(let i = 0; i < this.wordsToRemove.length;i++){
//             let wordToRemove = new RegExp(`${this.wordsToRemove[i]}`,'g');
//             string = string.replace(wordToRemove," ");
//         }
//         return string;
//     },
//     wordsToRemove:[ //plural needs to come before singular words so bottles needs to come before bottle
//         "bottles","bottle",
//         "cans","can",
//         "'s",'\xAE',
//         "ct","bags","bag",
//         "boxes","box","plastic",
//         "count "
//     ],
// };





// Read QC Template into a file
// const workbook = new ExcelJS.Workbook();
// await workbook.xlsx.readFile(
//     './excel/QCTemplate.xlsx'
// );
// const sheet = workbook.getWorksheet('Sheet1');
// const rows = sheet.getRows(3, excelData.length);
// for (let i = 0; i < excelData.length; i++) {

//     const itemNum                   = rows[i].getCell('A');
//     const UPC                       = rows[i].getCell('B');

//     const ogPOS360                  = rows[i].getCell('C');
//     const ogDrizly                  = rows[i].getCell('D');


//     const cleanPOS360               = rows[i].getCell('E');
//     const cleanDrizly               = rows[i].getCell('F');

//     const stringMatch              = rows[i].getCell('G');
//     const volumeMatch              = rows[i].getCell('H');
//     const packSizeMatch            = rows[i].getCell('I');
//     const numbersMatch             = rows[i].getCell('J');



//      itemNum.value                  = excelData[i]['itemNum'];              
//      UPC.value                      = excelData[i]['UPC'];                  

//      ogPOS360.value                 = excelData[i]['POS360 DB Name'];             
//      ogCRE.value                    = excelData[i]['CRE Name'];                
//      ogCREPlus.value                = excelData[i]['CRE Name + Extra'];            
//      ogDrizly.value                 = excelData[i]['Drizly Name'];            

//      cleanPOS360.value              = excelData[i]['Clean POS360 DB Name'];          
//      cleanCRE.value                 = excelData[i]['Clean CRE Name'];             
//      cleanCREPlus.value             = excelData[i]['Clean CRE Name + Extra'];         
//      cleanDrizly.value              = excelData[i]['Clean Drizly Name'  ];          

//      ogCREResults.value             = excelData[i]['Result OG POS & CRE'];         
//      ogCREPlusResults.value         = excelData[i]['Result OG POS & CRE Extra'];     
//      ogDrizlyResults.value          = excelData[i]['Result OG  POS & Drizly'];      

//      cleanCREResults.value          = excelData[i]['Clean Result OG POS & CRE'];      
//      cleanCREPlusResults.value      = excelData[i]['Clean Result OG POS & CRE Extra'];  
//      cleanDrizlyResults.value       = excelData[i]['Clean Result OG  POS & Drizly'];   


// }


// Read QC Template into a file
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(
    './excel/QCTemplateResults.xlsx'
);
const sheet = workbook.getWorksheet('Sheet1');
const rows = sheet.getRows(3, matchResults.length);
for (let i = 0; i < matchResults.length; i++) {

    const itemNum                   = rows[i].getCell('A');
    const UPC                       = rows[i].getCell('B');

    const pos360Name                  = rows[i].getCell('C');
    const drizlyName                     = rows[i].getCell('D');
    const pos360NameClean                 = rows[i].getCell('E');
    const drizlyNameClean                  = rows[i].getCell('F');


    const stringMatch               = rows[i].getCell('G');
    const volumeMatch                  = rows[i].getCell('H');
    const packSizeMatch              = rows[i].getCell('I');
    const numbersMatch               = rows[i].getCell('J');

     itemNum.value                  = matchResults[i]['itemNum'];              
     UPC.value                      = matchResults[i]['UPC'];                  

     pos360Name.value                 = matchResults[i]['POS360 Name'];             
     drizlyName.value                    = matchResults[i]['Drizly Name'];   

     pos360NameClean.value                = matchResults[i]['POS360 Name Clean'];            
     drizlyNameClean.value                 = matchResults[i]['Drizly Name Clean'];            

     stringMatch.value              = matchResults[i]['string Match Score'];          
     numbersMatch.value                = matchResults[i]['Nums Match Score'];             
     volumeMatch.value             = matchResults[i]['Volume Match'];         
     packSizeMatch.value              = matchResults[i]['Pack Size Match'];          
}
await workbook.xlsx.writeFile(
    `./excel/QCTemplateResults.xlsx`
);

console.log('script ran');