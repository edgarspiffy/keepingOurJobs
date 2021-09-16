export default {
    basicCleaning:function(string){
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
        //outlier
        string = string.replace('355ml','12oz');
        return string;
    },
    removeAccents:function(string){
        string = string.replace(/\u03git01|\u00e9/g,'e'); // é to e 
        string = string.replace(/\u00F3|\u00F2/g,'e');    // ó to o 
        string = string.replace(/\u00E4/g,'a');           // ä to a 
        string = string.replace(/\u00F1/g,'n');           // ñ to n
        return string;
    },
    removeVolumeSize:function(string){
        let sizeIdentifiers = ['oz','ml','l'];
        for(let i = 0; i < sizeIdentifiers.length; i++){
            let lookForSizeIdentifiers = RegExp(`(\\s+[0-9]+\\s+${sizeIdentifiers[i]})|(\\s+[0-9]+${sizeIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+${sizeIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+\\s+${sizeIdentifiers[i]})`);
            if(lookForSizeIdentifiers.test(string)){
                let volumeSize = lookForSizeIdentifiers.exec(string)[0];
                string = string.replace(volumeSize,'');
                break;
            }
        }
        return string;
    },
    removePackSize:function(string){
        let packIdentifiers = ['pc','pack','pk','ct','x'];
        for(let i = 0; i < packIdentifiers.length; i++){
            let lookForPackSize = RegExp(`(\\s+[0-9]+\\s+${packIdentifiers[i]})|(\\s+[0-9]+${packIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+${packIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+\\s+${packIdentifiers[i]})|(\\s+[0-9]+\\s+${packIdentifiers[i]})|(\\s+[0-9]+${packIdentifiers[i]})`);
            if(lookForPackSize.test(string)){
                let packSize = lookForPackSize.exec(string)[0];
                string = string.replace(packSize,'');
                break;
            }
        }
        return string;
    },
    removeNumbersFromString:function(string){
        string = string.split(" ");
        for(let i = 0;i< string.length;i++){
            if(Number(string[i])){
                string.splice(i, 1); 
            }
        }
        string = string.join(" ");
        return string;
    },
    removeFillerWords:function(string){
        const wordsToRemove = [ "bottles","bottle"," cans"," can","'s",'\xAE'," ct","bags","bag", "boxes","box","plastic"] //Plural goes before singular
        for(let i = 0; i < wordsToRemove.length;i++){
            let wordToRemove = new RegExp(`${wordsToRemove[i]}`,'g');
            string = string.replace(wordToRemove,'');
        }
        return string;
    },
    removeAdditionalWhiteSpace:function(string){
        string = string.replace(/\s{2,}/g," "); 
        string = string.trim();
        return string;
    },
    removePackSizeWords:function(string){
        const wordsToRemove = ['pc','pack','pk','ct','x']
        for(let i = 0; i < wordsToRemove.length;i++){
            let wordToRemove = new RegExp(`${wordsToRemove[i]}`,'g');
            string = string.replace(wordToRemove,'');
        }
        return string;
    }
}
