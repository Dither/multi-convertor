// this code supposed to be browser independent
var METHODS = {
hexunicode : {
    name: 'unicode to hex',
    help:  'The hexunicode method returns an encoded local codepage characters in \\uNNNN format. It will not encode english characters. Decoding function reverts that.',
    encode: function (text) {
        if (!text) return;
        var newText = '';
        var nulls = new Array('00', '0', '');
        for (var i = 0; i < text.length; i++) {
            var code = text.charCodeAt(i);
            if (code <= 127) code = text.charAt(i);
            else {
                code = code.toString(16);
                code = '\\u' + nulls[code.length - 2] + code;
            }
            newText += code;
        }
        return newText;
    },
    decode: function (text) {
        return text = text.replace(/\\u[0-9a-f]{3,4}/gi, function (match) { return String.fromCharCode(parseInt(match.substring(2), 16)); });
    }
},

URI : {
	name: 'URI',
	help: 'The encodeURI method returns an encoded URI. It will not encode: ~!@#$&*()=:/,;?+\' If you pass the result to decodeURI, the original string is returned.',
	encode: function (text) {
		return encodeURI(text);
	},
	decode: function (text) {
		return decodeURI(text);
	}
},

URIComponent : {
	name: 'URI component',
	help: 'The encodeURIComponent method returns an encoded URI. It will not encode: ~!*()\' If you pass the result to decodeURIComponent, the original string is returned.',
	encode: function (text) {
		return encodeURIComponent(text);
	},
	decode: function (text) {
		return decodeURIComponent(text);
	}
},

escape : {
	name: 'escape',
	help: 'escape() will not encode: @*/+ The escape method returns a string value (in Unicode format) that contains the contents of [the argument]. All spaces, punctuation, accented characters, and any other non-ASCII characters are replaced with %xx encoding, where xx is equivalent to the hexadecimal number representing the character. For example, a space is returned as "%20." Unescape reverts that.',
	encode: function (text) {
		return escape(text);
	},
	decode: function (text) {
		return unescape(text);
	}
},

UTF8 : {
	name: 'utf-8',
encode: function(argString) {
    // Encodes an ISO-8859-1 string to UTF-8  
    var string = (argString + ''); // .replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var utftext = "",
        start, end, stringl = 0;
 
    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;
 
        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
        } else {
            enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }
 
    if (end > start) {
        utftext += string.slice(start, stringl);
    }
 
    return utftext;
},
    decode: function(str_data) {
    // Converts a UTF-8 encoded string to ISO-8859-1  
    var tmp_arr = [],
        i = 0,
        ac = 0,
        c1 = 0,
        c2 = 0,
        c3 = 0;
 
    str_data += '';
 
    while (i < str_data.length) {
        c1 = str_data.charCodeAt(i);
        if (c1 < 128) {
            tmp_arr[ac++] = String.fromCharCode(c1);
            i++;
        } else if (c1 > 191 && c1 < 224) {
            c2 = str_data.charCodeAt(i + 1);
            tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = str_data.charCodeAt(i + 1);
            c3 = str_data.charCodeAt(i + 2);
            tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
     return tmp_arr.join('');
}
},

CRC32 : {
	name: 'CRC32',
	encode: function (str) {
    	str = METHODS.UTF8.encode(str);
    	var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
 
    var crc = 0;
    var x = 0;
    var y = 0;
 
    crc = crc ^ (-1);
    for (var i = 0, iTop = str.length; i < iTop; i++) {
        y = (crc ^ str.charCodeAt(i)) & 0xFF;
        x = "0x" + table.substr(y * 9, 8);
        crc = (crc >>> 8) ^ x;
    }
    return (0xFFFFFFFF + (crc ^ (-1)) + 1).toString(16).toUpperCase();
},
},

MD5 : {
   name: 'MD5',
   encode: function (str) {
    var xl;
    var rotateLeft = function (lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); };
    var addUnsigned = function (lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) { return (lResult ^ 0xC0000000 ^ lX8 ^ lY8); }
            else { return (lResult ^ 0x40000000 ^ lX8 ^ lY8); }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    };
 
    var _F = function (x, y, z) { return (x & y) | ((~x) & z); };
    var _G = function (x, y, z) { return (x & z) | (y & (~z)); };
    var _H = function (x, y, z) { return (x ^ y ^ z); };
    var _I = function (x, y, z) { return (y ^ (x | (~z))); };
 
    var _FF = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
 
    var _GG = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
 
    var _HH = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
 
    var _II = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
 
    var convertToWordArray = function (str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };
 
    var wordToHex = function (lValue) {
        var wordToHexValue = "",
            wordToHexValue_temp = "",
            lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue_temp = "0" + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
    };
 
    var x = [],
        k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22,
        S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20,
        S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23,
        S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21;
 
    str = METHODS.UTF8.encode(str);
    x = convertToWordArray(str);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;
 
    xl = x.length;
    for (k = 0; k < xl; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }
 
    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
    return temp.toUpperCase();
},
},

HTMLspecialchars : {
	 name: 'HTML special chars',
	 quote_style: null,
	 charset: null,
	 double_encode: null,
encode: function  (string) {
    // Convert special characters to HTML entities  
    var optTemp = 0,
        i = 0,
        noquotes = false,
		quote_style = this.quote_styl
		charset = this.charset,
		double_encode = this.double_encode;
    if (typeof quote_style === 'undefined' || quote_style === null) {
        quote_style = 2;
    }
    string = string.toString();
    if (double_encode !== false) { // Put this first to avoid double-encoding
        string = string.replace(/&/g, '&amp;');
    }
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
 
    var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
    };
    if (quote_style === 0) {
        noquotes = true;
    }
    if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
        quote_style = [].concat(quote_style);
        for (i = 0; i < quote_style.length; i++) {
            // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
            if (OPTS[quote_style[i]] === 0) {
                noquotes = true;
            } else if (OPTS[quote_style[i]]) {
                optTemp = optTemp | OPTS[quote_style[i]];
            }
        }
        quote_style = optTemp;
    }
    if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/'/g, '&#039;');
    }
    if (!noquotes) {
        string = string.replace(/"/g, '&quot;');
    }
 
    return string;
},
decode: function  (string) {
    // Convert special HTML entities back to characters  
    var optTemp = 0,
        i = 0,
        noquotes = false,
		quote_style = this.quote_style;
    if (typeof quote_style === 'undefined') {
        quote_style = 2;
    }
    string = string.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
    };
    if (quote_style === 0) {
        noquotes = true;
    }
    if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
        quote_style = [].concat(quote_style);
        for (i = 0; i < quote_style.length; i++) {
            // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
            if (OPTS[quote_style[i]] === 0) {
                noquotes = true;
            } else if (OPTS[quote_style[i]]) {
                optTemp = optTemp | OPTS[quote_style[i]];
            }
        }
        quote_style = optTemp;
    }
    if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
        // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
    }
    if (!noquotes) {
        string = string.replace(/&quot;/g, '"');
    }
    // Put this in last place to avoid escape being double-decoded
    string = string.replace(/&amp;/g, '&');
 
    return string;
}
},

HTMLentities : {
name: 'HTML entities',
quote_style: 'ENT_NOQUOTES',
translations: function(table) {
    // *     example 1: get_html_translation_table('HTML_SPECIALCHARS');
    // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
    var entities = {},
        hash_map = {},
        decimal = 0,
        symbol = '',
		quote_style = this.quote_style;
    var constMappingTable = {},
        constMappingQuoteStyle = {};
    var useTable = {},
        useQuoteStyle = {};

    // Translate arguments
    constMappingTable[0] = 'HTML_SPECIALCHARS';
    constMappingTable[1] = 'HTML_ENTITIES';
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
    constMappingQuoteStyle[2] = 'ENT_COMPAT';
    constMappingQuoteStyle[3] = 'ENT_QUOTES';

    useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
    useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

    if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
        throw new Error("Table: " + useTable + ' not supported');
        // return false;
    }

    entities['38'] = '&amp;';
    if (useTable === 'HTML_ENTITIES') {
        entities['160'] = '&nbsp;';
        entities['161'] = '&iexcl;';
        entities['162'] = '&cent;';
        entities['163'] = '&pound;';
        entities['164'] = '&curren;';
        entities['165'] = '&yen;';
        entities['166'] = '&brvbar;';
        entities['167'] = '&sect;';
        entities['168'] = '&uml;';
        entities['169'] = '&copy;';
        entities['170'] = '&ordf;';
        entities['171'] = '&laquo;';
        entities['172'] = '&not;';
        entities['173'] = '&shy;';
        entities['174'] = '&reg;';
        entities['175'] = '&macr;';
        entities['176'] = '&deg;';
        entities['177'] = '&plusmn;';
        entities['178'] = '&sup2;';
        entities['179'] = '&sup3;';
        entities['180'] = '&acute;';
        entities['181'] = '&micro;';
        entities['182'] = '&para;';
        entities['183'] = '&middot;';
        entities['184'] = '&cedil;';
        entities['185'] = '&sup1;';
        entities['186'] = '&ordm;';
        entities['187'] = '&raquo;';
        entities['188'] = '&frac14;';
        entities['189'] = '&frac12;';
        entities['190'] = '&frac34;';
        entities['191'] = '&iquest;';
        entities['192'] = '&Agrave;';
        entities['193'] = '&Aacute;';
        entities['194'] = '&Acirc;';
        entities['195'] = '&Atilde;';
        entities['196'] = '&Auml;';
        entities['197'] = '&Aring;';
        entities['198'] = '&AElig;';
        entities['199'] = '&Ccedil;';
        entities['200'] = '&Egrave;';
        entities['201'] = '&Eacute;';
        entities['202'] = '&Ecirc;';
        entities['203'] = '&Euml;';
        entities['204'] = '&Igrave;';
        entities['205'] = '&Iacute;';
        entities['206'] = '&Icirc;';
        entities['207'] = '&Iuml;';
        entities['208'] = '&ETH;';
        entities['209'] = '&Ntilde;';
        entities['210'] = '&Ograve;';
        entities['211'] = '&Oacute;';
        entities['212'] = '&Ocirc;';
        entities['213'] = '&Otilde;';
        entities['214'] = '&Ouml;';
        entities['215'] = '&times;';
        entities['216'] = '&Oslash;';
        entities['217'] = '&Ugrave;';
        entities['218'] = '&Uacute;';
        entities['219'] = '&Ucirc;';
        entities['220'] = '&Uuml;';
        entities['221'] = '&Yacute;';
        entities['222'] = '&THORN;';
        entities['223'] = '&szlig;';
        entities['224'] = '&agrave;';
        entities['225'] = '&aacute;';
        entities['226'] = '&acirc;';
        entities['227'] = '&atilde;';
        entities['228'] = '&auml;';
        entities['229'] = '&aring;';
        entities['230'] = '&aelig;';
        entities['231'] = '&ccedil;';
        entities['232'] = '&egrave;';
        entities['233'] = '&eacute;';
        entities['234'] = '&ecirc;';
        entities['235'] = '&euml;';
        entities['236'] = '&igrave;';
        entities['237'] = '&iacute;';
        entities['238'] = '&icirc;';
        entities['239'] = '&iuml;';
        entities['240'] = '&eth;';
        entities['241'] = '&ntilde;';
        entities['242'] = '&ograve;';
        entities['243'] = '&oacute;';
        entities['244'] = '&ocirc;';
        entities['245'] = '&otilde;';
        entities['246'] = '&ouml;';
        entities['247'] = '&divide;';
        entities['248'] = '&oslash;';
        entities['249'] = '&ugrave;';
        entities['250'] = '&uacute;';
        entities['251'] = '&ucirc;';
        entities['252'] = '&uuml;';
        entities['253'] = '&yacute;';
        entities['254'] = '&thorn;';
        entities['255'] = '&yuml;';
    }

    if (useQuoteStyle !== 'ENT_NOQUOTES') {
        entities['34'] = '&quot;';
    }
    if (useQuoteStyle === 'ENT_QUOTES') {
        entities['39'] = '&#39;';
    }
    entities['60'] = '&lt;';
    entities['62'] = '&gt;';


    // ascii decimals to real symbols
    for (decimal in entities) {
        symbol = String.fromCharCode(decimal);
        hash_map[symbol] = entities[decimal];
    }

    return hash_map;
},
encode: function (string) {
    // Convert all applicable characters to HTML entities  
    var hash_map = {},
        symbol = '',
        tmp_str = '',
        entity = '',
		quote_style = this.quote_style;
    tmp_str = string.toString();
 
    if (false === (hash_map = this.translations('HTML_ENTITIES'))) {
        return false;
    }
    hash_map["'"] = '&#039;';
    for (symbol in hash_map) {
        entity = hash_map[symbol];
        tmp_str = tmp_str.split(symbol).join(entity);
    }
 
    return tmp_str;
},
decode: function(string) {
    // Convert all HTML entities to their applicable characters  
    var hash_map = {},
        symbol = '',
        tmp_str = '',
        entity = '',
		quote_style = this.quote_style;
    tmp_str = string.toString();
 
    if (false === (hash_map = this.translations('HTML_ENTITIES'))) {
        return false;
    }
    // fix &amp; problem http://phpjs.org/functions/get_html_translation_table:416#comment_97660
    delete(hash_map['&']);
    hash_map['&'] = '&amp;';
 
    for (symbol in hash_map) {
        entity = hash_map[symbol];
        tmp_str = tmp_str.split(entity).join(symbol);
    }
    tmp_str = tmp_str.split('&#039;').join("'");
 
    return tmp_str;
}
},

BASE64 : {
    name: 'base64',
    // Global lookup arrays for base64 conversions
    enc64List : [], 
    dec64List: [],
    init: function() {  // Load the lookup arrays
        this.enc64List = new Array();
        this.dec64List = new Array();
        var i;
        for (i = 0; i < 26; i++) this.enc64List[this.enc64List.length] = String.fromCharCode(65 + i);
        for (i = 0; i < 26; i++) this.enc64List[this.enc64List.length] = String.fromCharCode(97 + i);
        for (i = 0; i < 10; i++) this.enc64List[this.enc64List.length] = String.fromCharCode(48 + i);
        this.enc64List[this.enc64List.length] = "+";
        this.enc64List[this.enc64List.length] = "/";
        for (i = 0; i < 128; i++) this.dec64List[this.dec64List.length] = -1;
        for (i = 0; i < 64; i++) this.dec64List[this.enc64List[i].charCodeAt(0)] = i;
    },
    encode: function (str) {
        str = METHODS.UTF8.encode(str);
        var c, d, e, end = 0;
        var u, v, w, x;
        var ptr = -1;
        var input = str.split("");
        var output = "";
        while (end == 0) {
            c = (typeof input[++ptr] != "undefined") ? input[ptr].charCodeAt(0) : ((end = 1) ? 0 : 0);
            d = (typeof input[++ptr] != "undefined") ? input[ptr].charCodeAt(0) : ((end += 1) ? 0 : 0);
            e = (typeof input[++ptr] != "undefined") ? input[ptr].charCodeAt(0) : ((end += 1) ? 0 : 0);
            u = this.enc64List[c >> 2];
            v = this.enc64List[(0x00000003 & c) << 4 | d >> 4];
            w = this.enc64List[(0x0000000F & d) << 2 | e >> 6];
            x = this.enc64List[e & 0x0000003F];

            // handle padding to even out unevenly divisible string lengths
            if (end >= 1) { x = "="; }
            if (end == 2) { w = "="; }
            if (end < 3) { output += u + v + w + x; }
        }
        // format for 76-character line lengths per RFC
        var formattedOutput = "";
        var lineLength = 76;
        while (output.length > lineLength) {
            formattedOutput += output.substring(0, lineLength) + '\n';
            output = output.substring(lineLength);
        }
        formattedOutput += output;
        return formattedOutput;
    },
    decode: function (str) {
        var c = 0, d = 0, e = 0, f = 0, i = 0, n = 0;
        var input = str.split("");
        var output = "";
        var ptr = 0;
        do {
            f = input[ptr++].charCodeAt(0);
            i = this.dec64List[f];
            if (f >= 0 && f < 128 && i != -1) {
                if (n % 4 == 0) {
                    c = i << 2;
                } else if (n % 4 == 1) {
                    c = c | (i >> 4);
                    d = (i & 0x0000000F) << 4;
                } else if (n % 4 == 2) {
                    d = d | (i >> 2);
                    e = (i & 0x00000003) << 6;
                } else {
                    e = e | i;
                }
                n++;
                if (n % 4 == 0) {
                    output += String.fromCharCode(c) + String.fromCharCode(d) + String.fromCharCode(e);
                }
            }
        }
        while (typeof input[ptr] != 'undefined');
        output += (n % 4 == 3) ? String.fromCharCode(c) + String.fromCharCode(d) : ((n % 4 == 2) ? String.fromCharCode(c) : "");
        return METHODS.UTF8.decode(output);
    }
},

UUENCODE : {
name: 'UUE encode',
is_scalar: function (mixed_var) {
    // Returns true if value is a scalar  
    return (/boolean|number|string/).test(typeof mixed_var);
},
encode:function(str) {
    // shortcut
    str = METHODS.UTF8.encode(str);
    var chr = function (c) {
        return String.fromCharCode(c);
    };

    if (!str || str == "") {
        return chr(0);
    } else if (!this.is_scalar(str)) {
        return false;
    }

    var c = 0,
        u = 0,
        i = 0,
        a = 0;
    var encoded = "",
        tmp1 = "",
        tmp2 = "",
        bytes = {};

    // divide string into chunks of 45 characters
    var chunk = function () {
        bytes = str.substr(u, 45);
        for (i in bytes) {
            bytes[i] = bytes[i].charCodeAt(0);
        }
        if (bytes.length != 0) {
            return bytes.length;
        } else {
            return 0;
        }
    };

    while (chunk() !== 0) {
        c = chunk();
        u += 45;

        // New line encoded data starts with number of bytes encoded.
        encoded += chr(c + 32);

        // Convert each char in bytes[] to a byte
        for (i in bytes) {
            tmp1 = bytes[i].charCodeAt(0).toString(2);
            while (tmp1.length < 8) {
                tmp1 = "0" + tmp1;
            }
            tmp2 += tmp1;
        }

        while (tmp2.length % 6) {
            tmp2 = tmp2 + "0";
        }

        for (i = 0; i <= (tmp2.length / 6) - 1; i++) {
            tmp1 = tmp2.substr(a, 6);
            if (tmp1 == "000000") {
                encoded += chr(96);
            } else {
                encoded += chr(parseInt(tmp1, 2) + 32);
            }
            a += 6;
        }
        a = 0;
        tmp2 = "";
        encoded += '\n';
    }

    // Add termination characters
    encoded += chr(96) + '\n';

    return encoded;
}
},

RUS2TRANSLIT : {
name: 'russian to translit',
help: 'The metod converts russian to translit using MVD site variant.',
decode: function(text)
{
var latD = new Object(); // Array
var rusD = new Object(); // Array

latD['a'] = ['ы+', 'Й+', 'Ы+', 'й+', 'Ы', 'й', 'ы', 'Й', '', ''];
rusD['a'] = ['ыа', 'Йа', 'Ыа', 'йа', 'Я', 'я', 'я', 'Я', 'а', 'a'];

latD['b'] = ['', ''];
rusD['b'] = ['б', 'b'];

latD['v'] = ['', ''];
rusD['v'] = ['в', 'v'];

latD['g'] = ['', ''];
rusD['g'] = ['г', 'g'];

latD['d'] = ['', ''];
rusD['d'] = ['д', 'd'];

latD['e'] = ['ы+', 'ы+', 'Й+', 'Й+', 'Ы+', 'Ы+', 'й+', 'й+', 'й', 'ы', 'Й', 'Ы', '', '', ''];
rusD['e'] = ['ыэ', 'ые', 'Йе', 'Йэ', 'Ыэ', 'Ые', 'йэ', 'йе', 'ё', 'ё', 'Ё', 'Ё', 'е', 'э', 'e'];

latD['o'] = ['ы+', 'Й+', 'Ы+', 'й+', 'Ы', 'ы', 'Й', 'й', '', ''];
rusD['o'] = ['ыо', 'Йо', 'Ыо', 'йо', 'Ё', 'ё', 'Ё', 'ё', 'о', 'o'];

latD['h'] = ['сhc+', 'Сhc+', 'Шc+', 'сhc', 'шc+', 'Сhc', 'c+', 'с+', 'К+', 'С+', 'C+', 'к+', 'З+', 'Шc', 'шc', 'з+', 'с', 'c', 'к', 'К', 'з', 'С', 'C', 'З', ''];
rusD['h'] = ['сhch', 'Сhch', 'Шch', 'щ', 'шch', 'Щ', 'ch', 'сh', 'Кh', 'Сh', 'Ch', 'кh', 'Зh', 'Щ', 'щ', 'зh', 'ш', 'ч', 'х', 'Х', 'ж', 'Ш', 'Ч', 'Ж', 'h'];

latD['z'] = ['', ''];
rusD['z'] = ['з', 'z'];

latD['i'] = ['ы+', 'Й+', 'Ы+', 'й+', 'Ы', 'й', 'ы', 'Й', '', ''];
rusD['i'] = ['ыи', 'Йи', 'Ыи', 'йи', 'И', 'и', 'и', 'И', 'и', 'i'];

latD['y'] = ['', '', ''];
rusD['y'] = ['ы', 'й', 'y'];

latD['k'] = ['', ''];
rusD['k'] = ['к', 'k'];

latD['l'] = ['', ''];
rusD['l'] = ['л', 'l'];

latD['m'] = ['', ''];
rusD['m'] = ['м', 'm'];

latD['n'] = ['', ''];
rusD['n'] = ['н', 'n'];

latD['p'] = ['', ''];
rusD['p'] = ['п', 'p'];

latD['r'] = ['', ''];
rusD['r'] = ['р', 'r'];

latD['s'] = ['Т+', 'т+', 'Т', 'т', '', ''];
rusD['s'] = ['Тс', 'тс', 'Ц', 'ц', 'с', 's'];

latD['t'] = ['', ''];
rusD['t'] = ['т', 't'];

latD['u'] = ['ы+', 'Й+', 'Ы+', 'й+', 'Ы', 'й', 'ы', 'Й', '', ''];
rusD['u'] = ['ыу', 'Йу', 'Ыу', 'йу', 'Ю', 'ю', 'ю', 'Ю', 'у', 'u'];

latD['f'] = ['', ''];
rusD['f'] = ['ф', 'f'];

latD['\"'] = ['ъ+', 'ъ', '', ''];
rusD['\"'] = ['ъъ', 'Ъ', 'ъ', '\"'];

latD['\''] = ['ь+', 'ь', '', ''];
rusD['\''] = ['ьь', 'Ь', 'ь', '\''];

latD['A'] = ['Ы+', 'Й+', 'Ы', 'Й', '', ''];
rusD['A'] = ['ЫА', 'ЙА', 'Я', 'Я', 'А', 'A'];

latD['B'] = ['', ''];
rusD['B'] = ['Б', 'B'];

latD['V'] = ['', ''];
rusD['V'] = ['В', 'V'];

latD['G'] = ['', ''];
rusD['G'] = ['Г', 'G'];

latD['D'] = ['', ''];
rusD['D'] = ['Д', 'D'];

latD['E'] = ['Ы+', 'Ы+', 'Й+', 'Й+', 'Ы', 'Й', '', '', ''];
rusD['E'] = ['ЫЭ', 'ЫЕ', 'ЙЭ', 'ЙЕ', 'Ё', 'Ё', 'Э', 'Е', 'E'];

latD['O'] = ['Ы+', 'Й+', 'Ы', 'Й', '', ''];
rusD['O'] = ['ЫО', 'ЙО', 'Ё', 'Ё', 'О', 'O'];

latD['H'] = ['СHC+', 'СHC', 'ШC+', 'C+', 'С+', 'К+', 'ШC', 'З+', 'К', 'C', 'С', 'З', ''];
rusD['H'] = ['СHCH', 'Щ', 'ШCH', 'CH', 'СH', 'КH', 'Щ', 'ЗH', 'Х', 'Ч', 'Ш', 'Ж', 'H'];

latD['Z'] = ['', ''];
rusD['Z'] = ['З', 'Z'];

latD['I'] = ['Ы+', 'Й+', 'Ы', 'Й', '', ''];
rusD['I'] = ['ЫИ', 'ЙИ', 'И', 'И', 'И', 'I'];

latD['Y'] = ['', '', ''];
rusD['Y'] = ['Ы', 'Й', 'Y'];

latD['K'] = ['', ''];
rusD['K'] = ['К', 'K'];

latD['L'] = ['', ''];
rusD['L'] = ['Л', 'L'];

latD['M'] = ['', ''];
rusD['M'] = ['М', 'M'];

latD['N'] = ['', ''];
rusD['N'] = ['Н', 'N'];

latD['P'] = ['', ''];
rusD['P'] = ['П', 'P'];

latD['R'] = ['', ''];
rusD['R'] = ['Р', 'R'];

latD['S'] = ['Т+', 'Т', '', ''];
rusD['S'] = ['ТС', 'Ц', 'С', 'S'];

latD['T'] = ['', ''];
rusD['T'] = ['Т', 'T'];

latD['U'] = ['Ы+', 'Й+', 'Ы', 'Й', '', ''];
rusD['U'] = ['ЫУ', 'ЙУ', 'Ю', 'Ю', 'У', 'U'];

latD['F'] = ['', ''];
rusD['F'] = ['Ф', 'F'];

    function untranslit(text) {
    	var before = text.substr(0, text.length - 1);
    	var last = text.substr(text.length - 1, 1);
    	var lat = latD[last];
    	var rus = rusD[last];
    	if (lat) {
    		for (var nchar = 0; nchar < lat.length; nchar++) {
    			var pos = before.length > lat[nchar].length ? (before.length - lat[nchar].length) : 0;
    			if (lat[nchar] == before.substr(pos, before.length - pos)) { return before.substr(0, before.length - lat[nchar].length) + rus[nchar]; }
    		}
    	}
    	return text;
    }
    
    var trans="";
    for (var nchar=0;nchar<text.length;nchar++) trans = untranslit(trans+text.substr(nchar,1));
    return trans;
},

encode : function(text) {
    var trTBL = {'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ё':'ye', 'ж':'zh', 'з':'z', 'и':'i', 'й':'y', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o', 'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'kh', 'ц':'ts', 'ч':'ch', 'ш':'sh', 'щ':'shch', 'ъ':'\"', 'ы':'y', 'ь':'\'', 'э':'e', 'ю':'yu', 'я':'ya', 'А':'A', 'Б':'B', 'В':'V', 'Г':'G', 'Д':'D', 'Е':'E', 'Ё':'Ye', 'Ж':'Zh', 'З':'Z', 'И':'I', 'Й':'Y', 'К':'K', 'Л':'L', 'М':'M', 'Н':'N', 'О':'O', 'П':'P', 'Р':'R', 'С':'S', 'Т':'T', 'У':'U', 'Ф':'F', 'Х':'Kh', 'Ц':'Ts', 'Ч':'Ch', 'Ш':'Sh', 'Щ':'Shch', 'Ъ':'\"\"', 'Ы':'Y', 'Ь':'\'\'', 'Э':'E', 'Ю':'Yu', 'Я':'Ya' };
    function translit(symb) { return trTBL[symb] ? trTBL[symb] : symb; }
    
    var trans="";
    for (var n=0;n<text.length;n++) trans += translit(text.substr(n,1));
    return trans;
}
},

bookmarklet: {
    name: 'bookmarklet',
    help: 'The bookmarklet method encodes JS-code into bookmarklet format.',
    encode: function (text) {
		var literalStrings;  // For temporary storage of literal strings.

        function replaceLiteralStrings(s) {
            var c, t = '', lines, escaped, quoteChar, inQuote, literal;
            literalStrings = new Array();
            // Split script into individual lines.
            lines = s.split('\n');
            for (var i = 0; i < lines.length; i++) {

                j = 0;
                inQuote = false;
                while (j <= lines[i].length) {
                    c = lines[i].charAt(j);

                    // If not already in a string, look for the start of one.
                    if (!inQuote) {
                        if (c == '"' || c == "'") {
                            inQuote = true;
                            escaped = false;
                            quoteChar = c;
                            literal = c;
                        } else t += c;
                    }

                    // Already in a string, look for end and copy characters.
                    else {
                        if (c == quoteChar && !escaped) {
                            inQuote = false;
                            literal += quoteChar;
                            t += "________" + literalStrings.length + "________";
                            literalStrings[literalStrings.length] = literal;
                        } else if (c == '\\' && !escaped) escaped = true;
                        else escaped = false;
                        literal += c;
                    }
                    j++;
                }
                t += '\n';
            }

            return t;
        }

        function removeComments(s) {
            var t;
            // Remove '//' comments from each line.
            for (var i = 0, lines = s.split('\n'), t = ''; i < lines.length; i++) {t += lines[i].replace(/([^\x2f]*)\x2f{2,}.*/gi, '$1'); }
            // Replace newline characters with spaces.
            t = t.replace(/(.*)\n(.*)/g, "$1 $2");
            // Remove '/* ... */' comments.
            for (var i = 0, lines = t.split('*/'), t = ''; i < lines.length; i++) { t += lines[i].replace(/(.*)\u002f\u002a(.*)$/gi, '$1 '); }
            return t;
        }

        function compressWhiteSpace(s) {
            // Condense white space.
            s = s.replace(/[\s]+/g, " ");
            s = s.replace(/^\s(.*)/, "$1");
            s = s.replace(/(.*)\s$/, "$1");

            // Remove uneccessary white space around operators, braces and parentices.
            s = s.replace(/\s([\x21\x25\x26\x28\x29\x2a\x2b\x2c\x2d\x2f\x3a\x3b\x3c\x3d\x3e\x3f\x5b\x5d\x5c\x7b\x7c\x7d\x7e])/g, "$1");
            s = s.replace(/([\x21\x25\x26\x28\x29\x2a\x2b\x2c\x2d\x2f\x3a\x3b\x3c\x3d\x3e\x3f\x5b\x5d\x5c\x7b\x7c\x7d\x7e])\s/g, "$1");
            return s;
        }

        function combineLiteralStrings(s) {
            s = s.replace(/"\+"/g, "");
            s = s.replace(/'\+'/g, "");
            return s;
        }

        function restoreLiteralStrings(s) {
            for (var i = 0; i < literalStrings.length; i++)
            s = s.replace(new RegExp("________" + i + "________"), literalStrings[i]);
            return s;
        }

	var code = text;
        code = code.replace(/^javascript:/, ''); //strip it if it's there so we can add it in to be sure it's there later
        code = code.replace(/void\(.*\)$/, ''); //to make sure our end of line anchors will work in the future

	code = replaceLiteralStrings(code);
	code = removeComments(code);
	code = compressWhiteSpace(code);
        code = combineLiteralStrings(code);
        code = restoreLiteralStrings(code);

        //	Percent-encode special characters
        var replacers = {
            '%': '%25',
            '"': '%22',
            '<': '%3C',
            '>': '%3E',
            '#': '%23',
            '@': '%40',
            '\\s': '%20',
            '\\&': '%26',
            '\\?': '%3F'
        };
        for (var val in replacers) code = code.replace(new RegExp(val, "g"), replacers[val]);

        if (code.substring(0, 11) == 'javascript:') code = code.substring(11);
        if ((code.substring(0, 12) + code.substring(code.length - 5)) != '(function(){})();') code = '(function(){' + code + '})();';
        code = 'javascript:' + code;

        return code;
    }
}
} /* METHODS*/