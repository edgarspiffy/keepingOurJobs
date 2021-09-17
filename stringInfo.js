export default {
    findVolumeSize:function(string){
        let volumeSize = undefined;
        let sizeIdentifiers = ['oz','ml','l'];
        for(let i = 0; i < sizeIdentifiers.length; i++){
            let lookForSizeIdentifiers = RegExp(`(\\s+[0-9]+\\s+${sizeIdentifiers[i]})|(\\s+[0-9]+${sizeIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+${sizeIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+\\s+${sizeIdentifiers[i]})`);
            if(lookForSizeIdentifiers.test(string)){
                volumeSize = lookForSizeIdentifiers.exec(string)[0];
                break;
            }else{
                volumeSize = null;
                return null;
            }
        }
        volumeSize = volumeSize.replace(/\s/g,""); 
        return volumeSize;
    },
    findPackSize:function(string){
        let packSize = undefined
        let packIdentifiers = ['pc','pack','pk','ct','x'];
        for(let i = 0; i < packIdentifiers.length; i++){
            let lookForPackSize = RegExp(`(\\s+[0-9]+\\s+${packIdentifiers[i]})|(\\s+[0-9]+${packIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+${packIdentifiers[i]})|(\\s+[0-9]+\\.[0-9]+\\s+${packIdentifiers[i]})|(\\s+[0-9]+\\s+${packIdentifiers[i]})|(\\s+[0-9]+${packIdentifiers[i]})`);
            if(lookForPackSize.test(string)){
                packSize = lookForPackSize.exec(string)[0];
                break;
            }else{
                packSize = null;  
                return null;
            }
        }
        return packSize;
    },
    findNumbersInString:function(string){
        string = string.split(" ");
        let numbersInString = [];
        for(let i = 0;i< string.length;i++){
            if(Number(string[i])){
                numbersInString.push(string[i]);
            }
        }
        if(numbersInString.length === 0){
            return null;
        }
        return numbersInString;
    },
}