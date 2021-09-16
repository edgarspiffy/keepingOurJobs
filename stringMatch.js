

const dataMatch = {
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
    },
    matchPercentage:function(productA,productB){
        let scoreAtoB = this.getMatchPercentage(productA,productB);
        let scoreBtoA = this.getMatchPercentage(productB,productA);
        let matchPercentage = (scoreAtoB + scoreBtoA)/2
        return matchPercentage;
    },
    checkNumMatch:function(a,b){
        if(a === null && b === null){
            return true;
        }
        if(a === null && b !== null){
            return false;
        }
        if(a !== null && b === null){
            return false;
        }
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
        if(accuracyAtoB !== 100){
            return false;
        }else{
            return true;
        }
    },
    checkIfMatch:(productA,productB)=>{
        if(productA === productB){
            return true;
        }else{
            return false;
        }
    },
}

module.exports = dataMatch;