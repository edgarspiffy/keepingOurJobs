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
    convertSizeToOz(string){
        if(string === null){return null}
        string = string.replace('250ml','8.5oz');
        string = string.replace('296ml','10oz');
        string = string.replace('350ml','11.8oz');
        string = string.replace('355ml','12oz');
        string = string.replace('375ml','12.9oz');
        string = string.replace('500ml','16.9oz');
        string = string.replace('750ml','25.4oz');
        string = string.replace('800ml','27.1oz');
        string = string.replace('850ml','28.7oz');
        string = string.replace('1000ml','33.8oz');
        string = string.replace('1250ml','42.3oz');
        string = string.replace('1500ml','50.7oz');

        string = string.replace('.5l','16.9oz');
        string = string.replace('.75l','25.4oz');
        string = string.replace('.85l','28.7oz');
        string = string.replace('1l','33.8oz');
        string = string.replace('1.25l','42.3oz');
        string = string.replace('1.5l','50.7oz');
        
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