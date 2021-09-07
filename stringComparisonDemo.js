
const formatString = {
    cleanString:function(string){
        //basic clean up
        string = string.toLowerCase();
        string = string.replace( /\(/g, "");
        string = string.replace( /\)/g, "");
        //outlier(s)
        string = string.replace('355ml','12oz'); // conversion math gives us 11.99oz but it should be force to 12. Don't want to round for consistancy


        //regexp
        const lookForOz = RegExp("(\\s+[0-9]+\\s+oz)|(\\s+[0-9]+oz)|(\\s+[0-9]+\\.[0-9]+oz)|(\\s+[0-9]+\\.[0-9]+\\s+oz)");
        const lookForMl = RegExp("(\\s+[0-9]+\\s+ml)|(\\s+[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+ml)|(\\s+[0-9]+\\.[0-9]+\\s+ml)");
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
        console.log(`hi jess this is right before the failure and we have ${string}`);
        string = this.removeAmbiguousWords(string);
        //remove any double+ white space
        string = string.replace(/\s{2,}/g," "); 
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
        const lookForMl = RegExp("(\\s+[0-9]+\\s+ml)|(\\s+[0-9]+ml)");                

        if(lookForMl.test(string)){
            let numWithMl = lookForMl.exec(string)[0];
            let numOnly = numWithMl.slice(0,-2);
            console.log(`hi this should be okay ${numOnly}`);
            numOnly = parseInt(numOnly);
            console.log(numONly);
            numOnly = numOnly * 0.0338;
            numOnly = numOnly.toString();
            //this might be a problem if no decimal exist COME BACK TO THIS
            let hasDecimal = true;
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
            console.log(string);
            string = string.replace(wordToRemove," ");
        }
        return string;
    },
    wordsToRemove:[
        "bottle","bottles",
        "can","cans",
        "'s",'\xAE'
    ],
};



const calculateStringMatch = {
    originalStringMatch:function(array1,array2){
        for(let i = 0; i < array1.length;i++){
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
    cleanStringMatch:function(array1,array2){
        for(let i = 0; i < array1.length;i++){
            // productA = formatString.cleanString(array1[i]);
            console.log(array1[i]);
            console.log('no jess its here');
            console.log(array2[i]);
            let productA = formatString.cleanString(array1[i]);
            let productB = formatString.cleanString(array2[i]);
            productA = productA.split(" ");
            productB = productB.split(" ");

            let matchwingWordsCount = 0;

            for(let j = 0; j < productA.length;j++){
                for(let m = 0; m < productB.length; m++){
                    if(productA[j] === productB[m]){
                        matchwingWordsCount++;
                    }
                }
            }
            const accuracy = (matchwingWordsCount/productA.length)*100;
            console.log(`${i} ${accuracy.toFixed(2)}% || ${productA} || ${productB}`)
        }
    }
}


const test1 = ['Juul Classic Menthol Pods 4x 0.7ml Counts'];
const test2 = ['Juul Classic Menthol Pods 4x 0.7ml Counts'];


calculateStringMatch.cleanStringMatch(test1,test2);

// calculateStringMatch.cleanStringMatch(ucNames,drizlyNames);





