function compareString( s1, s2, splitChar ){ //based on solution by chim on https://stackoverflow.com/questions/8024102/javascript-compare-strings-and-get-end-difference
    if ( typeof splitChar == "undefined" ){
        splitChar = " ";
    }
    var string1 = new Array();
    var string2 = new Array();

    string1 = s1.split( splitChar );
    string2 = s2.split( splitChar );
    var diff = new Array();

    if(s1.length>s2.length){
        var long = string1;
    }
    else {
        var long = string2;
    }
    for(x=0;x<long.length;x++){
        if(string1[x]!=string2[x]){
            diff.push(string2[x]);
        }
    }

    return diff;    
}