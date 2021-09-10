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
        D: 'CRE Name',
        E: 'CRE Name + Extra',
        F: 'Drizly Name'
    }
})['Sheet1'];

const matchResults =[];

const formatString = {
    cleanString:function(string){
        if(string === undefined){
            string = 'missing';
        }
        //basic clean up
        string = string.toString();
        string = string.toLowerCase();
        string = string.replace( /\(/g, "");
        string = string.replace( /\)/g, "");
        string = string.replace(/\u0301|\u00e9/g,'e'); // é to e 
        string = string.replace(/\u00F3|\u00F2/g,'e'); // ó to o 
        string = string.replace(/\u00E4/g,'a');        // ä to a 
        string = string.replace(/\u00F1/g,'n');        // ñ to n
        string = string.replace(/-/g,' ');             // remove -
        string = string.replace(/'/g,'');              // remove '
        string = string.replace(/no\./g,' no. ');      //forces space around
        string = string.replace(/\syear/g,' yr');
        //outlier(s)
        string = string.replace('355ml','12oz');
        //regexp
        const lookForOz    = RegExp("(\\s+[0-9]+\\s+oz)|(\\s+[0-9]+oz)|(\\s+[0-9]+\\.[0-9]+oz)|(\\s+[0-9]+\\.[0-9]+\\s+oz)");
        const lookForMl    = RegExp("(\\s+[0-9]+\\s+ml)|(\\s+[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+\\s+ml)");
        const lookForLiter = RegExp("(\\s+[0-9]+\\s+l)|(\\s+[0-9]+l)|(\\s+[0-9]+\\.[0-9]+l)|(\\s+[0-9]+\\.[0-9]+\\s+l)");

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
        const lookForLiter = RegExp("(\\s+[0-9]+\\s+l)|(\\s+[0-9]+l)|(\\s+[0-9]+\\.[0-9]+l)|(\\s+[0-9]+\\.[0-9]+\\s+l)");                  

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
        "bottles","bottle",
        "cans","can",
        "'s",'\xAE',
        "ct","bags","bag",
        "boxes","box","plastic",
        "count "
    ],
};



const calculateStringMatch = {
    getMatchResults:function(excelData){
        for(let i = 0; i < excelData.length;i++){

            let productA      = excelData[i]['POS360 DB Name'].toString().toLowerCase();
            let productB      = excelData[i]['CRE Name'].toString().toLowerCase();
            let productC      = excelData[i]['CRE Name + Extra'].toString().toLowerCase();
            let productD      = excelData[i]['Drizly Name'].toString().toLowerCase();

            productA = productA.replace(/\s{2,}/g," "); 
            productB = productB.replace(/\s{2,}/g," "); 
            productC = productC.replace(/\s{2,}/g," "); 
            productD = productD.replace(/\s{2,}/g," "); 


            let productAClean = formatString.cleanString(excelData[i]['POS360 DB Name']);
            let productBClean = formatString.cleanString(excelData[i]['CRE Name']);
            let productCClean = formatString.cleanString(excelData[i]['CRE Name + Extra']);
            let productDClean = formatString.cleanString(excelData[i]['Drizly Name']);


            productA      = productA.split(" ");
            productB      = productB.split(" ");
            productC      = productC.split(" ");
            productD      = productD.split(" ");

            productAClean = productAClean.split(" ");
            productBClean = productBClean.split(" ");
            productCClean = productCClean.split(" ");
            productDClean = productDClean.split(" ");

            let stringMatchOriginalAtoB = this.getMatchPercentage(productA,productB);
            let stringMatchOriginalBtoA = this.getMatchPercentage(productB,productA);
            let stringMatchOriginalAtoC = this.getMatchPercentage(productA,productC);
            let stringMatchOriginalCtoA = this.getMatchPercentage(productC,productA);
            let stringMatchOriginalAtoD = this.getMatchPercentage(productA,productD);
            let stringMatchOriginalDtoA = this.getMatchPercentage(productD,productA);


            let stringMatchCleanAtoB    = this.getMatchPercentage(productAClean,productBClean);
            let stringMatchCleanBtoA    = this.getMatchPercentage(productBClean,productAClean);
            let stringMatchCleanAtoC    = this.getMatchPercentage(productAClean,productCClean);
            let stringMatchCleanCtoA    = this.getMatchPercentage(productCClean,productAClean);
            let stringMatchCleanAtoD    = this.getMatchPercentage(productAClean,productDClean);
            let stringMatchCleanDtoA    = this.getMatchPercentage(productDClean,productAClean);

            let resultForOriginalComparisonAandB = (stringMatchOriginalAtoB + stringMatchOriginalBtoA)/2
            let resultForOriginalComparisonAandC = (stringMatchOriginalAtoC + stringMatchOriginalCtoA)/2
            let resultForOriginalComparisonAandD = (stringMatchOriginalAtoD + stringMatchOriginalDtoA)/2

            let resultForCleanComparisonAandB    = (stringMatchCleanAtoB + stringMatchCleanBtoA)/2
            let resultForCleanComparisonAandC    = (stringMatchCleanAtoC + stringMatchCleanCtoA)/2
            let resultForCleanComparisonAandD    = (stringMatchCleanAtoD + stringMatchCleanDtoA)/2

            resultForOriginalComparisonAandB = parseFloat(resultForOriginalComparisonAandB.toFixed(2));
            resultForOriginalComparisonAandC = parseFloat(resultForOriginalComparisonAandC.toFixed(2));
            resultForOriginalComparisonAandD = parseFloat(resultForOriginalComparisonAandD.toFixed(2));

            resultForCleanComparisonAandB = parseFloat(resultForCleanComparisonAandB.toFixed(2));
            resultForCleanComparisonAandC = parseFloat(resultForCleanComparisonAandC.toFixed(2));
            resultForCleanComparisonAandD = parseFloat(resultForCleanComparisonAandD.toFixed(2));

 
            productAClean = productAClean.join(" ");
            productBClean = productBClean.join(" ");
            productCClean = productCClean.join(" ");
            productDClean = productDClean.join(" ");

            matchResults.push(excelData[i] = {
                'itemNum'                          :excelData[i]['itemNum'],
                'UPC'                              :excelData[i]['UPC'],

                'POS360 DB Name'                   :excelData[i]['POS360 DB Name'],
                'CRE Name'                         :excelData[i]['CRE Name'],
                'CRE Name + Extra'                 :excelData[i]['CRE Name + Extra'],
                'Drizly Name'                      :excelData[i]['Drizly Name'],

                'Result OG POS & CRE'              :resultForOriginalComparisonAandB,
                'Result OG POS & CRE Extra'        :resultForOriginalComparisonAandC,
                'Result OG  POS & Drizly'          :resultForOriginalComparisonAandD,

                'Clean POS360 DB Name'             :productAClean,
                'Clean CRE Name'                   :productBClean,
                'Clean CRE Name + Extra'           :productCClean,
                'Clean Drizly Name'                :productDClean,

                'Clean Result OG POS & CRE'        :resultForCleanComparisonAandB,
                'Clean Result OG POS & CRE Extra'  :resultForCleanComparisonAandC,
                'Clean Result OG  POS & Drizly'    :resultForCleanComparisonAandD,
            });    
        }
    },
    getMatchPercentage:function(productA,productB){
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
}

calculateStringMatch.getMatchResults(excelData);

// Read QC Template into a file
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(
    './excel/confidenceLevelResultsTemplate.xlsx'
);
const sheet = workbook.getWorksheet('Sheet1');
const rows = sheet.getRows(3, matchResults.length);
for (let i = 0; i < matchResults.length; i++) {

    const itemNum                   = rows[i].getCell('A');
    const UPC                       = rows[i].getCell('B');

    const ogPOS360                  = rows[i].getCell('C');
    const ogCRE                     = rows[i].getCell('D');
    const ogCREPlus                 = rows[i].getCell('E');
    const ogDrizly                  = rows[i].getCell('F');


    const cleanPOS360               = rows[i].getCell('G');
    const cleanCRE                  = rows[i].getCell('H');
    const cleanCREPlus              = rows[i].getCell('I');
    const cleanDrizly               = rows[i].getCell('J');

    const ogCREResults              = rows[i].getCell('K');
    const ogCREPlusResults          = rows[i].getCell('L');
    const ogDrizlyResults           = rows[i].getCell('M');

    const cleanCREResults           = rows[i].getCell('N');
    const cleanCREPlusResults       = rows[i].getCell('O');
    const cleanDrizlyResults        = rows[i].getCell('P');

     itemNum.value                  = matchResults[i]['itemNum'];              
     UPC.value                      = matchResults[i]['UPC'];                  

     ogPOS360.value                 = matchResults[i]['POS360 DB Name'];             
     ogCRE.value                    = matchResults[i]['CRE Name'];                
     ogCREPlus.value                = matchResults[i]['CRE Name + Extra'];            
     ogDrizly.value                 = matchResults[i]['Drizly Name'];            

     cleanPOS360.value              = matchResults[i]['Clean POS360 DB Name'];          
     cleanCRE.value                 = matchResults[i]['Clean CRE Name'];             
     cleanCREPlus.value             = matchResults[i]['Clean CRE Name + Extra'];         
     cleanDrizly.value              = matchResults[i]['Clean Drizly Name'  ];          

     ogCREResults.value             = matchResults[i]['Result OG POS & CRE'];         
     ogCREPlusResults.value         = matchResults[i]['Result OG POS & CRE Extra'];     
     ogDrizlyResults.value          = matchResults[i]['Result OG  POS & Drizly'];      

     cleanCREResults.value          = matchResults[i]['Clean Result OG POS & CRE'];      
     cleanCREPlusResults.value      = matchResults[i]['Clean Result OG POS & CRE Extra'];  
     cleanDrizlyResults.value       = matchResults[i]['Clean Result OG  POS & Drizly'];   


}
await workbook.xlsx.writeFile(
    `./excel/confidenceLevelResults.xlsx`
);

console.log('script ran');

//pos to drizly 116