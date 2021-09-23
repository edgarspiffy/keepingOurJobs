export default {
    basicCleaning:function(string){
        if(string === undefined){string = '';}
        if(string === null){string ='';}
        string = string.toString();
        string = string.toLowerCase();
        string = string.replace( /\(/g, "");              // remove ()
        string = string.replace( /\)/g, "");              // remove )
        string = string.replace(/'s+/g,'');               // remove 's
        string = string.replace(/-/g,' ');                // remove -
        string = string.replace(/,/g,' ');                // remove ,
        string = string.replace(/'/g,'');                 // remove '
        string = string.replace(/\u002F/g,' ');           // remove /
        string = string.replace(/\xAE/g,'');              // remove ®
        string = string.replace(/\u00A9/g,'');            // remove ©
        string = string.replace(/no\./g,' no. ');         // forces space around
        string = string.replace(/\s+counts\s+/g,' ct ');  // counts to ct
        string = string.replace(/\s+packs\s+/g,' pk ');   // packs to pk
        string = string.replace(/\s+ounces/g,' oz');      // packs to pk
        string = string.replace(/\s{2,}/g," ");
        string = string.trim();
        //outliers
        string = string.replace(/7\s+up/g,'7up');           // 7 up to 7up
        return string;
        
    },
    removeAccents:function(string){
        string = string.replace(/\u00E8|\u00e9/g,'e');    // é to e 
        string = string.replace(/\u00F3|\u00F2/g,'o');    // ó to o 
        string = string.replace(/\u00ED/g,'i');           // í to i 
        string = string.replace(/\u00E4|\u00E3/g,'a');    // ä,ã, to a 
        string = string.replace(/\u00F1/g,'n');           // ñ to n
        return string;
    },
    stringConversion:function(string){
        if(string === null){return null}
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
        const wordsToRemove = [ "bottles","bottle","counts","count","cans","can"," ct","bags","bag", "boxes","box","plastic","flavored"] 
        string = string.split(" ");
        for(let i = 0; i < string.length; i++){
            for(let j = 0; j < wordsToRemove.length;j++){
               if(string[i] === wordsToRemove[j]){
                    string.splice([i],1);
               }
            }
        }
        string = string.join(" ");
        return string;
    },
}