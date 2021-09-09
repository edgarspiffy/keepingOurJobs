import ExcelJS from 'exceljs';
import excelToJson from 'convert-excel-to-json';

const excelData = excelToJson({
    sourceFile: './excel/namesQC.xlsx',
    header:{
        rows: 1
    },
    columnToKey: {
        A: 'itemNum',
        B: 'UPC',
        C: 'drizlyName',
        D: 'ucName',
        E: 'category'
    }
})['Sheet1'];

const newData =[];

const formatString = {
    cleanString:function(string){
        //basic clean up
        string = string.toLowerCase();
        string = string.replace( /\(/g, "");
        string = string.replace( /\)/g, "");
        string = string.replace(/\u0301|\u00e9/g,'e'); // é to e 
        string = string.replace(/\u00E4/g,'a'); // ä to a 
        string = string.replace(/\u00F1/g,'n'); // ñ to n
        string = string.replace(/snapples/g,'snapple');
        string = string.replace(/\syear/g,' yr');
        string = string.replace(/\s+no\./g,' no');
        string = string.replace(/a\s&\sj/g,'e&j');
        string = string.replace(/j\s&\sb/g,'j&b');
        string = string.replace(/-/g,' '); // remove -
        string = string.replace(/a\s&\sw/g,'a&w'); // remove -


        //outlier(s)
        string = string.replace('355ml','12oz');
        //regexp
        const lookForOz    = RegExp("(\\s+[0-9]+\\s+oz)|(\\s+[0-9]+oz)|(\\s+[0-9]+\\.[0-9]+oz)|(\\s+[0-9]+\\.[0-9]+\\s+oz)");
        const lookForMl    = RegExp("(\\s+[0-9]+\\s+ml)|(\\s+[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+\\s+ml)");
        const lookForLiter = RegExp("(\\s+[0-9]+\\s+l)|(\\s+[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+l)|(\\s+[0-9]+\\.[0-9]+\\s+l)");

        if(lookForOz.test(string)){
            string = this.removeOz(string);
        }
        if(lookForMl.test(string)){
        //function converts ml to oz and removes ml
            string = this.removeMl(string); 
        }
        if(lookForLiter.test(string)){
            string = this.removeLiter(string); //I don't remove liters since this dimension size seeems consistant vs ml/oz
        }
        //remove words that may lower confidence level
        string = this.removeAmbiguousWords(string);
        //remove any double+ white space
        string = string.replace(/\s{2,}/g," "); 
        string = string.trim();
        return string;
    },
    removeOz:function(string){
        //matches with 18oz, 18 oz
        const lookForOz             = RegExp("(\\s+[0-9]+\\s+oz)|(\\s+[0-9]+oz)");                
        //matches with 18.3oz, 18.3 oz   
        const lookForOzAndDecimal   = RegExp("(\\s+[0-9]+\\.[0-9]+oz)|(\\s+[0-9]+\\.[0-9]+\\s+oz)");

        if(lookForOz.test(string)){
            let numWithOz = lookForOz.exec(string)[0];
            let numOnly = numWithOz.slice(0,-2);
            string = string.replace(numWithOz,numOnly);
            return string;
        }
        
        if(lookForOzAndDecimal.test(string)){   
            let numWithOz = lookForOzAndDecimal.exec(string)[0];
            let numOnly = numWithOz.slice(0,-2);

            //remove everything after decimal and decimal point
            let hasDecimal = true;
            while(hasDecimal){
                if(numOnly[numOnly.length -1] === "."){
                    hasDecimal = false;
                }
                numOnly = numOnly.slice(0,-1);
            }
            string = string.replace(numWithOz,numOnly);
            return string;
        }
    },
    removeMl:function(string){
        //matches with 18ml, 18 ml
        const lookForMl = RegExp("(\\s+[0-9]+\\s+ml)|(\\s+[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+\\s+ml)");                
        if(lookForMl.test(string)){
            let numWithMl = lookForMl.exec(string)[0];
            let numOnly = numWithMl.slice(0,-2);
            numOnly = parseInt(numOnly);
            numOnly = numOnly * 0.0338;
            numOnly = numOnly.toString();
            const hasDecimalRegExp = new RegExp("\\.");
            let hasDecimal = false;
            if(hasDecimalRegExp.test(numOnly)){
                    hasDecimal = true;}
            while(hasDecimal){
                if(numOnly[numOnly.length -1] === "."){
                    hasDecimal = false;
                }
                numOnly = numOnly.slice(0,-1);
            }
            string = string.replace(numWithMl,` ${numOnly}`);
            return string;
        }
    },
    removeLiter:function(string){
        const lookForLiter = RegExp("(\\s+[0-9]+\\s+l)|(\\s+[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+l)|(\\s+[0-9]+\\.[0-9]+\\s+l)");                

            let numWithLiter = lookForLiter.exec(string)[0];
            let numOnly = numWithLiter.slice(0,-1);
            string = string.replace(numWithLiter,numOnly);
            return string;

    },
    removeAmbiguousWords:function(string){

        for(let i = 0; i < this.wordsToRemove.length;i++){
            let wordToRemove = new RegExp(`${this.wordsToRemove[i]}`,'g');
            string = string.replace(wordToRemove," ");
        }
        return string;
    },
    wordsToRemove:[ //plural needs to come before singular words so bottles needs to come before bottle
        "bottle","bottles",
        "cans","can",
        "'s",'\xAE',
        "ct",
    ],
};



const calculateStringMatch = {
    originalStringMatch:function(excelData){
        for(let i = 0; i < excelData.length;i++){
            let productA = array1[i].split(" ");
            let productB = array2[i].split(" ");
    
            let matchCount = 0;
    
            for(let j = 0; j < productA.length;j++){
                for(let m = 0; m < productB.length; m++){
                    if(productA[j] === productB[m]){
                        matchCount++;
                    }
                }
            }
            const accuracy = (matchCount/productA.length)*100;
            console.log(`${accuracy}% || ${productA} || ${productB}`)
        }
    },
    cleanStringMatch:function(excelData){
        for(let i = 0; i < excelData.length;i++){
            let productA = formatString.cleanString(excelData[i]['ucName']);
            let productB = formatString.cleanString(excelData[i]['drizlyName']);
            productA = productA.split(" ");
            productB = productB.split(" ");

            const getMatchPercentage = function(productA,productB){
                let matchwingWordsCountAtoB = 0;
                let arraySubtractorAtoB = 0; //when a word gets conca and a match returns we need to subtract it from word count
                
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
                        if(`${productA[j]}${productA[j+1]}` === productB[m]){
                            matchwingWordsCountAtoB++;
                            arraySubtractorAtoB++
                            break;
                        }
                    }
                }
                let accuracyAtoB = (matchwingWordsCountAtoB/(productA.length - arraySubtractorAtoB))*100;
                return accuracyAtoB;
            }

            let yoyoab = getMatchPercentage(productA,productB);
            let accuracyBtoA = getMatchPercentage(productB,productA);
            let resultsAverage = (yoyoab + accuracyBtoA)/2
            resultsAverage = resultsAverage.toFixed(2);
            console.log(resultsAverage);
            // let matchwingWordsCountAtoB = 0;
            // let arraySubtractorAtoB = 0; //when a word gets conca and a match returns we need to subtract it from word count
            // for(let j = 0; j < productA.length;j++){
            //     for(let m = 0; m < productB.length; m++){
            //         if(productA[j] === productB[m]){
            //             matchwingWordsCountAtoB++;
            //             break;
            //         }
            //         if(`${productA[j]}.` === productB[m]){
            //             matchwingWordsCountAtoB++;
            //             break;
            //         }
            //         if(`${productA[j]}${productA[j+1]}` === productB[m]){
            //             matchwingWordsCountAtoB++;
            //             arraySubtractorAtoB++
            //             break;
            //         }
            //         if(productA[j] !== productB[m]){

            //         }
            //     }
            // }
            
            // let matchwingWordsCountBtoA = 0;
            // let arraySubtractorBtoA = 0; //when a word gets conca and a match returns we need to subtract it from word count
            // for(let s = 0; s < productB.length;s++){
            //     for(let f = 0; f < productA.length; f++){
            //         if(productB[s] === productA[f]){
            //             matchwingWordsCountBtoA++;
            //             break;
            //         }
            //         if(`${productA[s]}.` === productB[f]){
            //             matchwingWordsCountBtoA++;
            //             break;
            //         }
            //         if(`${productA[s]}${productA[s+1]}` === productB[f]){
            //             matchwingWordsCountBtoA++;
            //             arraySubtractorBtoA++
            //             break;
            //         }
                  

            //     }
            // }

            // let accuracyAtoB = (matchwingWordsCountAtoB/(productA.length - arraySubtractorAtoB))*100;
            // let accuracyBtoA = (matchwingWordsCountBtoA/(productB.length - arraySubtractorBtoA))*100;
            // let resultsAverage = (accuracyAtoB + accuracyBtoA)/2


            // resultsAverage = resultsAverage.toFixed(2);

            productA = productA.join(" ");
            productB = productB.join(" ");
         

             newData.push(excelData[i] = {
                'itemNum':excelData[i]['itemNum'],
                'UPC':excelData[i]['UPC'],
                'drizlyName':excelData[i]['drizlyName'],
                'ucName':excelData[i]['ucName'],
                'category':excelData[i]['category'],
                'ucNameClean':productA,
                'drizlyNameClean':productB,
                'percentageMatch':resultsAverage
            });


            // const accuracy = (matchwingWordsCount/productA.length)*100;
      

           // console.log(`${i} ${accuracy.toFixed(2)}% || ${productA} || ${productB}`)
        }
    }
}

calculateStringMatch.cleanStringMatch(excelData);


// Read QC Template into a file
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(
    './excel/confidenceLevelResultsTemplate.xlsx'
);
const sheet = workbook.getWorksheet('Sheet1');

const rows = sheet.getRows(2, newData.length);

for (let i = 0; i < newData.length; i++) {
    const upc          = rows[i].getCell('A');
    const itemNum      = rows[i].getCell('B');
    const ucNames      = rows[i].getCell('C');
    const drizlyNames  = rows[i].getCell('D');
    const ucClean      = rows[i].getCell('E');
    const drizlyClean  = rows[i].getCell('F');
    const cleanPercent = rows[i].getCell('H');
    // const category    = rows[i].getCell('E');
    

    upc.value            = newData[i]['UPC'];
    itemNum.value        = newData[i]['itemNum'];
    ucNames.value        = newData[i]['ucName'];
    drizlyNames.value    = newData[i]['drizlyName'];
    ucClean.value        = newData[i]['ucNameClean'];
    drizlyClean.value    = newData[i]['drizlyNameClean'];
    cleanPercent.value   = newData[i]['percentageMatch'];

    // category.value    = excelData[i]['çcategory'];
}

await workbook.xlsx.writeFile(
    `./excel/confidenceLevelResults.xlsx`
);




