export default {
    basicCleaning:function(string){
        if(string === undefined){string = '';}
        if(string === null){string ='';}
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
        string = string.replace(/\s{2,}/g," ");
        string = string.trim();
        return string;
    },
    removeAccents:function(string){
        string = string.replace(/\u00E8|\u00e9/g,'e');    // é to e 
        string = string.replace(/\u00F3|\u00F2/g,'o');    // ó to o 
        string = string.replace(/\u00ED/g,'i');           // í to i 
        string = string.replace(/\u00E4/g,'a');           // ä to a 
        string = string.replace(/\u00F1/g,'n');           // ñ to n
        return string;
    },
    stringConversion:function(string){
        if(string === null){return null}
        // string = string.replace(/\b100ml/,'3.4oz');
        // string = string.replace(/\b200ml/,'6.8oz');
        // string = string.replace(/\b250ml/,'8.5oz');
        // string = string.replace(/\b296ml/,'10oz');
        // string = string.replace(/\b350ml/,'11.8oz');
        // string = string.replace(/\b355ml/,'12oz');
        // string = string.replace(/\b375ml/,'12.9oz');
        // string = string.replace(/\b500ml/,'16.9oz');
        // string = string.replace(/\b750ml/,'25.4oz');
        // string = string.replace(/\b800ml/,'27.1oz');
        // string = string.replace(/\b850ml/,'28.7oz');
        // string = string.replace(/\b1000ml/,'33.8oz');
        // string = string.replace(/\b1250ml/,'42.3oz');
        // string = string.replace(/\b1500ml/,'50.7oz');

        // string = string.replace(/\b\\.5l/,'16.9oz');
        // string = string.replace(/\b\\.75l/,'25.4oz');
        // string = string.replace(/\b\\.85l/,'28.7oz');
        // string = string.replace(/\b\\.1l/,'33.8oz');
        // string = string.replace(/\b1\\.25l/,'42.3oz');
        // string = string.replace(/\b1\\.5l/,'50.7oz');
        // string = string.replace(/\b1\\.75l/,'59.2oz');
        // string = string.replace(/\b2l/,'67.6oz');

        if(/ml/.test(string)){
            string = parseFloat(string);
            string = string * .0338;
            string = Math.round(10 * string)/10;     
            string = `${string}oz`;
        }
        if(/l/.test(string)){
            string = parseFloat(string);
            string = string * 33.814
            string = Math.round(10 * string)/10;     
            string = `${string}oz`;
        }

        return string;
    },
    dynamicConversion:function(string){
        if(string === NaN){
            return null;
        }
        if(/ml/.test(string)){
            string = parseFloat(string);
            string = string * .0338;
            string = Math.round(10 * string)/10;     
            string = `${string}oz`;
        }
        if(/l/.test(string)){
            string = parseFloat(string);
            string = string * 33.814
            string = Math.round(10 * string)/10;     
            string = `${string}oz`;
        }
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
        for(let i = 0;i < string.length;i++){
            if(Number(string[i])){
                string.splice(i, 1); 
                i--;
            }
        }
        string = string.join(" ");
        return string;
    },
    removeFillerWords:function(string){
        //Plural words need to go before singular
        const wordsToRemove = [ "bottles","bottle"," cans"," can","'s",'\xAE'," ct","bags","bag", "boxes","box","plastic","flavored"] 
        for(let i = 0; i < wordsToRemove.length;i++){
            let wordToRemove = new RegExp(`${wordsToRemove[i]}`,'g');
            string = string.replace(wordToRemove,'');
        }
        return string;
    },
}