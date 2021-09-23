export default {
    getMatchPercentage:function(stringA,stringB){
        if(stringA === '' || stringB === ''){return 0}
        let scoreAtoB = this.getWordMatchScore(stringA,stringB);
        let scoreBtoA = this.getWordMatchScore(stringB,stringA);
        let matchPercentage = (scoreAtoB + scoreBtoA)/2

        let scoreAtoBWeighted = this.getWeightedWordMatchScore(stringA,stringB);
        let scoreBtoAWeighted = this.getWeightedWordMatchScore(stringB,stringA);
        let matchPercentageWeighted = (scoreAtoBWeighted + scoreBtoAWeighted)/2

        let finalMatchPercentageScore = (matchPercentage + matchPercentageWeighted)/2

        return finalMatchPercentageScore;
    },
    checkIfNumbersMatch:function(stringA,stringB){
        if(stringA === null && stringB === null){return true;}
        if(stringA === null && stringB !== null){return false;}
        if(stringA !== null && stringB === null){return false;}
        if(stringA.length !== stringB.length){return false;}
        stringA = stringA.join(" ");
        stringB = stringB.join(" ");
        let scoreAtoB = this.getWordMatchScore(stringA,stringB);
        let scoreBtoA = this.getWordMatchScore(stringB,stringA);
        let matchPercentage = (scoreAtoB + scoreBtoA)/2
        if(matchPercentage !== 100){
            return false;
        }else{
            return true;
        }
    },
    checkForVolumeMatch:function(stringA,stringB,ozAllowance){
        if(stringA === stringB){return true;}
        stringA = parseFloat(stringA);
        stringB = parseFloat(stringB);
        let volumeDifference = Math.abs(stringA - stringB);
   
        volumeDifference =  Math.round(10 * volumeDifference)/10;  
        console.log(volumeDifference);
        console.log(ozAllowance);
        if(volumeDifference <= ozAllowance){
            return true;
        }else{
            return false;
        }
    },
    getWordMatchScore:function(stringA,stringB){
        stringA = stringA.split(" ");
        stringB = stringB.split(" ");
        let matchwingWordsCountAtoB = 0;
        let arraySubtractorAtoB = 0; //when a word gets concatenated and a match returns we need to subtract it from word count
        for(let j = 0; j < stringA.length;j++){
            for(let m = 0; m < stringB.length; m++){
                if(stringA[j] === stringB[m]){
                    matchwingWordsCountAtoB++;
                    break;
                }
                if(`${stringA[j]}.` === stringB[m]){
                    matchwingWordsCountAtoB++;
                    break;
                }
                if(`${stringA[j]}s` === stringB[m]){
                    matchwingWordsCountAtoB++;
                    break;
                }
                if(stringA[j].slice(0, -1) === stringB[m]){
                    matchwingWordsCountAtoB++;
                    break;
                }
                if(`${stringA[j]}${stringA[j+1]}` === stringB[m]){
                    matchwingWordsCountAtoB++;
                    arraySubtractorAtoB++
                    j++
                    break;
                }
                if(stringA[j] === `${stringB[m]}${stringB[m+1]}`){
                    matchwingWordsCountAtoB++;
                    break;
                }
                //This usually catches brands that are 2 letters with an & in the middle
                if(`${stringA[j]}${stringA[j+1]}${stringA[j+2]}` === stringB[m]){
                    matchwingWordsCountAtoB++;
                    j+=2
                    arraySubtractorAtoB+=2;
                    break;
                }
                if(stringA[j] === `${stringB[m]}${stringB[m+1]}${stringB[m+2]}`){
                    matchwingWordsCountAtoB++;
                    break;
                }
            }
        }
        let accuracyAtoB = (matchwingWordsCountAtoB/(stringA.length - arraySubtractorAtoB))*100;
        return accuracyAtoB;
    },
    getWeightedWordMatchScore:function(stringA,stringB){
        let totalCharacterCount = stringA.replace(/\s+/g,'').length;
        stringA = stringA.split(" ");
        stringB = stringB.split(" ");
        let matchwingWordsCountAtoB = 0;
        let arraySubtractorAtoB = 0; //when a word gets concatenated and a match returns we need to subtract it from word count
        for(let j = 0; j < stringA.length;j++){
            for(let m = 0; m < stringB.length; m++){
                if(stringA[j] === stringB[m]){
                    let wordCharCount = stringA[j].length;
                    let weightedScore = wordCharCount/totalCharacterCount;
                    matchwingWordsCountAtoB+=weightedScore;
                    break;
                }
                if(`${stringA[j]}.` === stringB[m]){
                    let wordCharCount = stringA[j].length;
                    let weightedScore = wordCharCount/totalCharacterCount;
                    matchwingWordsCountAtoB+=weightedScore;
                    break;
                }
                if(`${stringA[j]}s` === stringB[m]){
                    let wordCharCount = stringA[j].length;
                    let weightedScore = wordCharCount/totalCharacterCount;
                    matchwingWordsCountAtoB+=weightedScore;
                    break;
                }
                if(stringA[j].slice(0, -1) === stringB[m]){
                    let wordCharCount = stringA[j].length;
                    let weightedScore = wordCharCount/totalCharacterCount;
                    matchwingWordsCountAtoB+=weightedScore;
                    break;
                }
                if(`${stringA[j]}${stringA[j+1]}` === stringB[m]){
                    let wordCharCount = `${stringA[j]}${stringA[j+1]}`.length;
                    let weightedScore = wordCharCount/totalCharacterCount;
                    matchwingWordsCountAtoB+=weightedScore;
                    arraySubtractorAtoB++ //CHECK THIS
                    j++
                    break;
                }
                if(stringA[j] === `${stringB[m]}${stringB[m+1]}`){
                    let wordCharCount = stringA[j].length;
                    let weightedScore = wordCharCount/totalCharacterCount;
                    matchwingWordsCountAtoB+=weightedScore;
                    break;
                }
                //This usually catches brands that are 2 letters with an & in the middle
                if(`${stringA[j]}${stringA[j+1]}${stringA[j+2]}` === stringB[m]){
                    let wordCharCount = `${stringA[j]}${stringA[j+1]}${stringA[j+2]}`.length;
                    let weightedScore = wordCharCount/totalCharacterCount;
                    matchwingWordsCountAtoB+=weightedScore;
                    j+=2
                    arraySubtractorAtoB+=2; //CHECK THIS
                    break;
                }
                if(stringA[j] === `${stringB[m]}${stringB[m+1]}${stringB[m+2]}`){
                    let weightedScore = stringA[j].length/totalCharacterCount;
                    matchwingWordsCountAtoB+=weightedScore;
                    break;
                }
            }
        }
        let accuracyAtoB = matchwingWordsCountAtoB * 100;
        accuracyAtoB = Math.round((accuracyAtoB + Number.EPSILON) * 100) / 100
        return accuracyAtoB;
    },
    checkIfNumbersMatch:function(stringA,stringB){
        if(stringA === null && stringB === null){return true;}
        if(stringA === null && stringB !== null){return false;}
        if(stringA !== null && stringB === null){return false;}

        let numbersMatchCount = 0;
        for(let j = 0; j < stringA;j++){
            for(let m = 0; m < stringB.length; m++){
                if(stringA[j] === stringB[m]){
                    numbersMatchCount++;
                    break;
                }
            }
        }
        let accuracyAtoB = (numbersMatchCount/(stringA.length))*100;
        if(accuracyAtoB !== 100){
            return false;
        }else{
            return true;
        }
    },
    checkIfEqual:(stringA,stringB)=>{
        return stringA === stringB;
    },
}