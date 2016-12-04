// Code below supposed to be browser independent.

// Project uses code parts from GPL/MIT projects such as phpjs.org.
// Thanks to orighinal authors for advancing this small world to a better future.

// Service functions

function inArray(arr, needle) {
	for (var i = 0, l = arr.length; i < l; i++) if(arr[i] && arr[i] === needle) return true;
	return false;
}

function unique(arr) {
    var i, out = [], obj = {};
    for (i = 0, len = arr.length; i < len; i++) obj[arr[i]] = 0;
    for (i in obj) out.push(i);
    return out;
}

var METHODS = {

fixKBlayout: {
    name: 'Keyboard layout RUS/ENG',
    help: 'Fixes invalid keyboard layout for Cyrillic/Latin letters.',
    RUS: "\u0451\u0401!\"\u2116;%:?\u0439\u0446\u0443\u043a\u0435\u043d\u0433\u0448\u0449\u0437\u0445\u044a\u0444\u044b\u0432\u0430\u043f\u0440\u043e\u043b\u0434\u0436\u044d\u044f\u0447\u0441\u043c\u0438\u0442\u044c\u0431\u044e.\u0419\u0426\u0423\u041a\u0415\u041d\u0413\u0428\u0429\u0417\u0425\u042a\u0424\u042b\u0412\u0410\u041f\u0420\u041e\u041b\u0414\u0416\u042d/\u042f\u0427\u0421\u041c\u0418\u0422\u042c\u0411\u042e,",
    ENG: "`~!@#$%^&qwertyuiop[]asdfghjkl;'zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:\"|ZXCVBNM<>?",
    encode: function(text) {
        var c = '';
        for (var i = 0; i < text.length; i++) {
            var j = this.ENG.indexOf(text.charAt(i));
            c += (j < 0) ? text.charAt(i) : this.RUS.charAt(j);
        }
        return c;
    },
    decode: function(text) {
        var c = '';
        for (var i = 0; i < text.length; i++) {
            var j = this.RUS.indexOf(text.charAt(i));
            c += (j < 0) ? text.charAt(i) : this.ENG.charAt(j);
        }
        return c;
    },
    guess: function (text) {
        if (/[\u0430-\u044f\u0410-\u042f]/.test(text)) return this.decode(text);
        else return this.encode(text);
    }
},

hexunicode : {
    name: 'JavaScript escape',
    help:  'The JavaScript escape method returns an encoded local codepage characters in \\uNNNN format. It will not encode Latin characters. Decoding function reverts that.',
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
        return text.replace(/\\(?:u|x)[0-9a-f]{2,4}/gi, function (match) { return String.fromCharCode(parseInt(match.substring(2), 16)); });
    },
    guess: function (text) {
        if (text.match(/\\u[0-9a-f]{3,4}/i)) { return this.decode(text); }
        else { return this.encode(text); }
    }
},

JSONLiteral: {
    name: 'JSON string literal',
    help: 'Method converts string to/from a valid JSON string literal between double(!) quotes.',
    decode: function (string) {
        return string.replace(/\\(?:"|\\|n|r|u2028|u2029)/g, function (character) {
            switch (character) {
              case '\\"':
                return '"';
              case '\\':
                return '\\';
              case '\\n':
                return '\n';
              case '\\r':
                return '\r';
              case '\\u2028':
                return '\u2028';
              case '\\u2029':
                return '\u2029';
              default:
                return character;
            }
        })
    },
    encode: function (string) {
        return string.replace(/\\?["\\\n\r\u2028\u2029]/g, function (character) {
            switch (character) {
              case '"':
              case '\\':
                return '\\' + character;
              case '\n':
                return '\\n';
              case '\r':
                return '\\r';
              case '\u2028':
                return '\\u2028';
              case '\u2029':
                return '\\u2029';
              default:
                return character;
            }
        })
    },
    guess: function (text) {
        if (text.match(/\b\\?["\n\r\u2028\u2029]/i)) { return this.encode(text); }
        else { return this.decode(text); }
    }
},

// JavaScript Punycode converter derived from example in RFC3492.
Punycode: {
    name: 'Punycode',
    help: 'Method converts URLs to/from punycode.',
    // This object converts to and from puny-code used in IDN
    //
    // punycode.ToASCII ( domain )
    //
    // Returns a puny coded representation of "domain".
    // It only converts the part of the domain name that
    // has non ASCII characters. I.e. it dosent matter if
    // you call it with a domain that already is in ASCII.
    //
    // punycode.ToUnicode (domain)
    //
    // Converts a puny-coded domain name to unicode.
    // It only converts the puny-coded parts of the domain name.
    // I.e. it dosent matter if you call it on a string
    // that already has been converted to unicode.
    //
    //
    utf16: {
        // The utf16-class is necessary to convert from javascripts internal character representation to unicode and back.
        decode: function(input){
            var output = [], i=0, len=input.length,value,extra;
            while (i < len) {
                value = input.charCodeAt(i++);
                if ((value & 0xF800) === 0xD800) {
                    extra = input.charCodeAt(i++);
                    if ( ((value & 0xFC00) !== 0xD800) || ((extra & 0xFC00) !== 0xDC00) ) {
                        throw new RangeError("UTF-16(decode): Illegal UTF-16 sequence");
                    }
                    value = ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
                }
                output.push(value);
            }
            return output;
        },
        encode: function (input){
            var output = [], i=0, len=input.length,value;
            while (i < len) {
                value = input[i++];
                if ( (value & 0xF800) === 0xD800 ) {
                    throw new RangeError("UTF-16(encode): Illegal UTF-16 value");
                }
                if (value > 0xFFFF) {
                    value -= 0x10000;
                    output.push(String.fromCharCode(((value >>>10) & 0x3FF) | 0xD800));
                    value = 0xDC00 | (value & 0x3FF);
                }
                output.push(String.fromCharCode(value));
            }
            return output.join("");
        }
    },
    //Default parameters
    initial_n : 0x80,
    initial_bias : 72,
    delimiter : "\x2D",
    base : 36,
    damp : 700,
    tmin: 1,
    tmax: 26,
    skew: 38,
    maxint : 0x7FFFFFFF,
    // decode_digit(cp) returns the numeric value of a basic code
    // point (for use in representing integers) in the range 0 to
    // base-1, or base if cp is does not represent a value.
    decode_digit: function(cp) {
        return cp - 48 < 10 ? cp - 22 : cp - 65 < 26 ? cp - 65 : cp - 97 < 26 ? cp - 97 : this.base;
    },
    // encode_digit(d,flag) returns the basic code point whose value
    // (when used for representing integers) is d, which needs to be in
    // the range 0 to base-1. The lowercase form is used unless flag is
    // nonzero, in which case the uppercase form is used. The behavior
    // is undefined if flag is nonzero and digit d has no uppercase form.
    encode_digit: function(d, flag) {
        return d + 22 + 75 * (d < 26) - ((flag != 0) << 5);
        //  0..25 map to ASCII a..z or A..Z
        // 26..35 map to ASCII 0..9
    },
    //** Bias adaptation function **
    adapt: function(delta, numpoints, firsttime ) {
        var k;
        delta = firsttime ? Math.floor(delta / this.damp) : (delta >> 1);
        delta += Math.floor(delta / numpoints);

        for (k = 0; delta > (((this.base - this.tmin) * this.tmax) >> 1); k += this.base) {
                delta = Math.floor(delta / ( this.base - this.tmin ));
        }
        return Math.floor(k + (this.base - this.tmin + 1) * delta / (delta + this.skew));
    },
    // encode_basic(bcp,flag) forces a basic code point to lowercase if flag is zero,
    // uppercase if flag is nonzero, and returns the resulting code point.
    // The code point is unchanged if it is caseless.
    // The behavior is undefined if bcp is not a basic code point.
    encode_basic: function(bcp, flag) {
        bcp -= (bcp - 97 < 26) << 5;
        return bcp + ((!flag && (bcp - 65 < 26)) << 5);
    },
    toUTF: function(input,preserveCase) {
        // Dont use utf16
        var output=[];
        var case_flags=[];
        var input_length = input.length;

        var n, out, i, bias, basic, j, ic, oldi, w, k, digit, t, len;

        // Initialize the state:

        n = this.initial_n;
        i = 0;
        bias = this.initial_bias;

        // Handle the basic code points: Let basic be the number of input code
        // points before the last delimiter, or 0 if there is none, then
        // copy the first basic code points to the output.

        basic = input.lastIndexOf(this.delimiter);
        if (basic < 0) basic = 0;

        for (j = 0; j < basic; ++j) {
            if(preserveCase) case_flags[output.length] = ( input.charCodeAt(j) -65 < 26);
            if ( input.charCodeAt(j) >= 0x80) {
                throw new RangeError("Illegal input >= 0x80");
            }
            output.push( input.charCodeAt(j) );
        }

        // Main decoding loop: Start just after the last delimiter if any
        // basic code points were copied; start at the beginning otherwise.
        for (ic = basic > 0 ? basic + 1 : 0; ic < input_length; ) {

            // ic is the index of the next character to be consumed,

            // Decode a generalized variable-length integer into delta,
            // which gets added to i. The overflow checking is easier
            // if we increase i as we go, then subtract off its starting
            // value at the end to obtain delta.
            for (oldi = i, w = 1, k = this.base; ; k += this.base) {
                    if (ic >= input_length) {
                        throw RangeError ("punycode_bad_input(1)");
                    }
                    digit = this.decode_digit(input.charCodeAt(ic++));

                    if (digit >= this.base) {
                        throw RangeError("punycode_bad_input(2)");
                    }
                    if (digit > Math.floor((this.maxint - i) / w)) {
                        throw RangeError ("punycode_overflow(1)");
                    }
                    i += digit * w;
                    t = k <= bias ? this.tmin : k >= bias + this.tmax ? this.tmax : k - bias;
                    if (digit < t) { break; }
                    if (w > Math.floor(this.maxint / (this.base - t))) {
                        throw RangeError("punycode_overflow(2)");
                    }
                    w *= (this.base - t);
            }

            out = output.length + 1;
            bias = this.adapt(i - oldi, out, oldi === 0);

            // i was supposed to wrap around from out to 0,
            // incrementing n each time, so we'll fix that now:
            if ( Math.floor(i / out) > this.maxint - n) {
                throw RangeError("punycode_overflow(3)");
            }
            n += Math.floor( i / out ) ;
            i %= out;

            // Insert n at position i of the output:
            // Case of last character determines uppercase flag:
            if (preserveCase) { case_flags.splice(i, 0, input.charCodeAt(ic -1) -65 < 26);}

            output.splice(i, 0, n);
            i++;
        }
        if (preserveCase) {
            for (i = 0, len = output.length; i < len; i++) {
                if (case_flags[i]) {
                    output[i] = (String.fromCharCode(output[i]).toUpperCase()).charCodeAt(0);
                }
            }
        }
        return this.utf16.encode(output);
    },
    toASCII: function (input,preserveCase) {
        //** Bias adaptation function **

        var n, delta, h, b, bias, j, m, q, k, t, ijv, case_flags;

        if (preserveCase) {
            // Preserve case, step1 of 2: Get a list of the unaltered string
            case_flags = this.utf16.decode(input);
        }
        // Converts the input in UTF-16 to Unicode
        input = this.utf16.decode(input.toLowerCase());

        var input_length = input.length; // Cache the length

        if (preserveCase) {
            // Preserve case, step2 of 2: Modify the list to true/false
            for (j=0; j < input_length; j++) {
                case_flags[j] = input[j] != case_flags[j];
            }
        }

        var output=[];

        // Initialize the state:
        n = this.initial_n;
        delta = 0;
        bias = this.initial_bias;

        // Handle the basic code points:
        for (j = 0; j < input_length; ++j) {
            if ( input[j] < 0x80) {
                output.push(
                    String.fromCharCode(
                        case_flags ? this.encode_basic(input[j], case_flags[j]) : input[j]
                    )
                );
            }
        }

        h = b = output.length;

        // h is the number of code points that have been handled, b is the
        // number of basic code points
        if (b > 0) output.push(this.delimiter);

        // Main encoding loop:
        while (h < input_length) {
            // All non-basic code points < n have been
            // handled already. Find the next larger one:

            for (m = this.maxint, j = 0; j < input_length; ++j) {
                ijv = input[j];
                if (ijv >= n && ijv < m) m = ijv;
            }

            // Increase delta enough to advance the decoder's
            // <n,i> state to <m,0>, but guard against overflow:

            if (m - n > Math.floor((this.maxint - delta) / (h + 1))) {
                throw RangeError("punycode_overflow (1)");
            }
            delta += (m - n) * (h + 1);
            n = m;

            for (j = 0; j < input_length; ++j) {
                ijv = input[j];

                if (ijv < n ) {
                    if (++delta > this.maxint) return Error("punycode_overflow(2)");
                }

                if (ijv == n) {
                    // Represent delta as a generalized variable-length integer:
                    for (q = delta, k = this.base; ; k += this.base) {
                        t = k <= bias ? this.tmin : k >= bias + this.tmax ? this.tmax : k - bias;
                        if (q < t) break;
                        output.push( String.fromCharCode(this.encode_digit(t + (q - t) % (this.base - t), 0)) );
                        q = Math.floor( (q - t) / (this.base - t) );
                    }
                    output.push( String.fromCharCode(this.encode_digit(q, preserveCase && case_flags[j] ? 1:0 )));
                    bias = this.adapt(delta, h + 1, h == b);
                    delta = 0;
                    ++h;
                }
            }

            ++delta, ++n;
        }
        return output.join("");
    },
    encode: function ( text ) {
        var domain = text.match(/(https?:\/\/)?(?:[^@]*@)?([^\s\/?#@:]+)(?::\d*)?/i);
        if (!domain[2]) return text;
        var domain_array = domain[2].split(".");
        var out = [];
        for (var i=0; i < domain_array.length; ++i) {
            var s = domain_array[i];
            out.push(
                s.match(/[^A-Za-z0-9-]/) ?
                "xn--" + this.toASCII(s) :
                s
            );
        }
        return (domain[1] || '') + out.join(".");
    },
    decode: function (text) {
        var domain = text.match(/(https?:\/\/)?(?:[^@]*@)?([^\s\/?#@:]+)(?::\d*)?/i);
        if (!domain[2]) return text;
        var domain_array = domain[2].split(".");
        var out = [];
        for (var i=0; i < domain_array.length; ++i) {
            var s = domain_array[i];
            out.push(
                s.match(/^xn--/) ?
                this.toUTF(s.slice(4)) :
                s
            );
        }
        return (domain[1] || '') + out.join(".");
    },
    guess: function (text) {
        var domain = text.match(/(?:https?:\/\/)?(?:[^@]*@)?([^\s\/?#@:]+)(?::\d*)?/i);
        if (!domain[1]) return text;
        if (domain[1].match(/[/.0-9a-zA-Z+_-]{3,4}/i)) { return this.decode(text + ' '); }
        else { return this.encode(text + ' '); }
    }
},

decimalncr : {
    name: 'CSS escape',
    help:  'The CSS escape method returns an encoded local codepage characters in "\\NNNN " format. It will not encode Latin characters. Decoding function reverts that.',
    encode: function (string) {
        if (!string) return;
        var output = '',
            counter = 0,
            length = string.length,
            value,
            character,
            codePoint,
            extra;

        while (counter < length) {
            character = string.charAt(counter++);
            codePoint = character.charCodeAt();
            // if it’s not a printable ASCII character
            if (codePoint < 0x20 || codePoint > 0x7E) {
                if (codePoint >= 0xD800 && codePoint <= 0xDBFF && counter < length) {
                    // high surrogate, and there is a next character
                    extra = string.charCodeAt(counter++);
                    if ((extra & 0xFC00) == 0xDC00) { // next character is low surrogate
                        codePoint = ((codePoint & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
                    } else {
                        counter--;
                    }
                }
                value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
            } else {
                if (/[\t\n\f\r\x0B:]/.test(character)) {
                    value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
                } else if (character == '\\') {
                    value = '\\' + character;
                } else {
                    value = character;
                }
            }
            output += value;
        }
        return output;
    },
    decode: function (text) {
        return text.replace(/\\[0-9a-f]{1,4} /gi, function (match) { return String.fromCharCode(parseInt(match.substring(1), 16)); });
    },
    guess: function (text) {
        var test = text.match(/\\[0-9a-f]{3,4} /i);
        if (!test || !test[0]) { return this.encode(text); }
        else { return this.decode(text); }
    }
},

URI: {
    name: 'URI',
    help: 'Method returns an encoded URI. It will not encode ~!@#$&*()=:/,;?+\' Decoding returns the original string.',
    encode: function (text) { return encodeURI(text); },
    decode: function (text) { return decodeURI(text); },
    guess: function (text) {
        var test = text.match(/(?:%\d{2})|(?:%u\d{3,4})/i);
        if (!test || !test[0]) { return this.encode(text); }
        else { return this.decode(text); }
    }
},

URIComponent : {
    name: 'URI component',
    help: 'Method returns an encoded URI component. It will not encode ~!*()\' Decoding returns the original string.',
    encode: function (text) { return encodeURIComponent(text); },
    decode: function (text) { return decodeURIComponent(text); },
    guess: function (text) {
        var test = text.match(/[@\#$&=:\/,;\?\+]+/);//
        if (!test || !test[0]) { return this.decode(text); }
        else { return this.encode(text); }
    }
},

ESC : {
    name: 'escape',
    help: 'Method returns a string value (in Unicode format) where all spaces, punctuation, accented characters, and any other non-ASCII characters except @*/+ are replaced with %xx encoding, where xx is equivalent to the hexadecimal number representing the character. For example, a space is returned as "%20." Decoding returns the original string.',
    encode: function (text) { return escape(text); },
    decode: function (text) { return unescape(text); },
    guess: function (text) {
        var test = text.match(/(?:%\d{2})|(?:%u\d{3,4})/i);
        if (!test || !test[0]) { return this.encode(text); }
        else { return this.decode(text); }
    }
},

REGEXESC : {
    name: 'RegExp escape',
    help: 'Method escapes a minimal set of characters (\ * + ? | { } [ ] ( ) ^ $ . #) by replacing them with their escapes. This instructs the regular expression engine to interpret these characters literally rather than as metacharacters. Decoding function reverts that.',
    encode: function (text) {
         text = text.replace(/[[\]{}()*+?.\\^$|#]/g, "\\$&");
         text = text.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
         return text;
    },
    decode: function (text) {
        text = text.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
        text = text.replace(/(?:\\)([[\]{}()*+?.\\^$|#])/g, "$1");
        return text;
    },
    guess: function (text) {
        var test = text.match(/(?:\\)([[\]{}()*+?.\\^$|#\s])/);
        if (!test || !test[0]) { return this.encode(text); }
        else { return this.decode(text); }
    }
},

UTF8 : {
name: 'UTF-8',
help: 'Method encodes an ISO-8859-1 string to UTF-8 and the other way.',
encode: function(text) {
    var string = (text + ''); // .replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var utftext = "",
        start, end, stringl = 0;

    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) { end++; }
        else if (c1 > 127 && c1 < 2048) { enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128); }
        else { enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128); }
        if (enc !== null) {
            if (end > start) { utftext += string.slice(start, end); }
            utftext += enc;
            start = end = n + 1;
        }
    }

    if (end > start) { utftext += string.slice(start, stringl); }
    return utftext;
},
decode: function(text) {
    // Converts a UTF-8 encoded string to ISO-8859-1
    var tmp_arr = [],
        i = 0,
        ac = 0,
        c1 = 0,
        c2 = 0,
        c3 = 0;

    text += '';

    while (i < text.length) {
        c1 = text.charCodeAt(i);
        if (c1 < 128) {
            tmp_arr[ac++] = String.fromCharCode(c1);
            i++;
        } else if (c1 > 191 && c1 < 224) {
            c2 = text.charCodeAt(i + 1);
            tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = text.charCodeAt(i + 1);
            c3 = text.charCodeAt(i + 2);
            tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
     return tmp_arr.join('');
},
guess: function (text) {
     var test = text.match(/[\xC2-\xDF][\x80-\xBF]|\xE0[\xA0-\xBF][\x80-\xBF]|[\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}|\xED[\x80-\x9F][\x80-\xBF]|\xF0[\x90-\xBF][\x80-\xBF]{2}|[\xF1-\xF3][\x80-\xBF]{3}|\xF4[\x80-\x8F][\x80-\xBF]{2}/);
     if (!test || !test[0]) { return this.decode(text); }
     else { return this.encode(text); }
}
},

CRC32: {
    name: 'CRC32',
    help: 'Method calculates CRC32 checksum of a text string.',
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
        return (0xFFFFFFFF + (crc ^ (-1)) + 1).toString(16).toUpperCase(); //negative hexadecimal fix
    }
},

MD5 : {
name: 'MD5',
help: 'Method calculates MD5 checksum of a text string.',
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

RUS2TRANSLIT : {
name: 'Russian to translit',
help: 'The metod converts russian to translit using MVD site variant.',
decode: function(text)
{
var latD = new Object(); // Array
var rusD = new Object(); // Array

latD['a'] = ['\u044b+', '\u0419+', '\u042b+', '\u0439+', '\u042b', '\u0439', '\u044b', '\u0419', '', ''];
rusD['a'] = ['\u044b\u0430', '\u0419\u0430', '\u042b\u0430', '\u0439\u0430', '\u042f', '\u044f', '\u044f', '\u042f', '\u0430', 'a'];

latD['b'] = ['', ''];
rusD['b'] = ['\u0431', 'b'];

latD['v'] = ['', ''];
rusD['v'] = ['\u0432', 'v'];

latD['g'] = ['', ''];
rusD['g'] = ['\u0433', 'g'];

latD['d'] = ['', ''];
rusD['d'] = ['\u0434', 'd'];

latD['e'] = ['\u044b+', '\u044b+', '\u0419+', '\u0419+', '\u042b+', '\u042b+', '\u0439+', '\u0439+', '\u0439', '\u044b', '\u0419', '\u042b', '', '', ''];
rusD['e'] = ['\u044b\u044d', '\u044b\u0435', '\u0419\u0435', '\u0419\u044d', '\u042b\u044d', '\u042b\u0435', '\u0439\u044d', '\u0439\u0435', '\u0451', '\u0451', '\u0401', '\u0401', '\u0435', '\u044d', 'e'];

latD['o'] = ['\u044b+', '\u0419+', '\u042b+', '\u0439+', '\u042b', '\u044b', '\u0419', '\u0439', '', ''];
rusD['o'] = ['\u044b\u043e', '\u0419\u043e', '\u042b\u043e', '\u0439\u043e', '\u0401', '\u0451', '\u0401', '\u0451', '\u043e', 'o'];

latD['h'] = ['\u0441hc+', '\u0421hc+', '\u0428c+', '\u0441hc', '\u0448c+', '\u0421hc', 'c+', '\u0441+', '\u041a+', '\u0421+', 'C+', '\u043a+', '\u0417+', '\u0428c', '\u0448c', '\u0437+', '\u0441', 'c', '\u043a', '\u041a', '\u0437', '\u0421', 'C', '\u0417', ''];
rusD['h'] = ['\u0441hch', '\u0421hch', '\u0428ch', '\u0449', '\u0448ch', '\u0429', 'ch', '\u0441h', '\u041ah', '\u0421h', 'Ch', '\u043ah', '\u0417h', '\u0429', '\u0449', '\u0437h', '\u0448', '\u0447', '\u0445', '\u0425', '\u0436', '\u0428', '\u0427', '\u0416', 'h'];

latD['z'] = ['', ''];
rusD['z'] = ['\u0437', 'z'];

latD['i'] = ['\u044b+', '\u0419+', '\u042b+', '\u0439+', '\u042b', '\u0439', '\u044b', '\u0419', '', ''];
rusD['i'] = ['\u044b\u0438', '\u0419\u0438', '\u042b\u0438', '\u0439\u0438', '\u0418', '\u0438', '\u0438', '\u0418', '\u0438', 'i'];

latD['y'] = ['', '', ''];
rusD['y'] = ['\u044b', '\u0439', 'y'];

latD['k'] = ['', ''];
rusD['k'] = ['\u043a', 'k'];

latD['l'] = ['', ''];
rusD['l'] = ['\u043b', 'l'];

latD['m'] = ['', ''];
rusD['m'] = ['\u043c', 'm'];

latD['n'] = ['', ''];
rusD['n'] = ['\u043d', 'n'];

latD['p'] = ['', ''];
rusD['p'] = ['\u043f', 'p'];

latD['r'] = ['', ''];
rusD['r'] = ['\u0440', 'r'];

latD['s'] = ['\u0422+', '\u0442+', '\u0422', '\u0442', '', ''];
rusD['s'] = ['\u0422\u0441', '\u0442\u0441', '\u0426', '\u0446', '\u0441', 's'];

latD['t'] = ['', ''];
rusD['t'] = ['\u0442', 't'];

latD['u'] = ['\u044b+', '\u0419+', '\u042b+', '\u0439+', '\u042b', '\u0439', '\u044b', '\u0419', '', ''];
rusD['u'] = ['\u044b\u0443', '\u0419\u0443', '\u042b\u0443', '\u0439\u0443', '\u042e', '\u044e', '\u044e', '\u042e', '\u0443', 'u'];

latD['f'] = ['', ''];
rusD['f'] = ['\u0444', 'f'];

latD['\"'] = ['\u044a+', '\u044a', '', ''];
rusD['\"'] = ['\u044a\u044a', '\u042a', '\u044a', '\"'];

latD['\''] = ['\u044c+', '\u044c', '', ''];
rusD['\''] = ['\u044c\u044c', '\u042c', '\u044c', '\''];

latD['A'] = ['\u042b+', '\u0419+', '\u042b', '\u0419', '', ''];
rusD['A'] = ['\u042b\u0410', '\u0419\u0410', '\u042f', '\u042f', '\u0410', 'A'];

latD['B'] = ['', ''];
rusD['B'] = ['\u0411', 'B'];

latD['V'] = ['', ''];
rusD['V'] = ['\u0412', 'V'];

latD['G'] = ['', ''];
rusD['G'] = ['\u0413', 'G'];

latD['D'] = ['', ''];
rusD['D'] = ['\u0414', 'D'];

latD['E'] = ['\u042b+', '\u042b+', '\u0419+', '\u0419+', '\u042b', '\u0419', '', '', ''];
rusD['E'] = ['\u042b\u042d', '\u042b\u0415', '\u0419\u042d', '\u0419\u0415', '\u0401', '\u0401', '\u042d', '\u0415', 'E'];

latD['O'] = ['\u042b+', '\u0419+', '\u042b', '\u0419', '', ''];
rusD['O'] = ['\u042b\u041e', '\u0419\u041e', '\u0401', '\u0401', '\u041e', 'O'];

latD['H'] = ['\u0421HC+', '\u0421HC', '\u0428C+', 'C+', '\u0421+', '\u041a+', '\u0428C', '\u0417+', '\u041a', 'C', '\u0421', '\u0417', ''];
rusD['H'] = ['\u0421HCH', '\u0429', '\u0428CH', 'CH', '\u0421H', '\u041aH', '\u0429', '\u0417H', '\u0425', '\u0427', '\u0428', '\u0416', 'H'];

latD['Z'] = ['', ''];
rusD['Z'] = ['\u0417', 'Z'];

latD['I'] = ['\u042b+', '\u0419+', '\u042b', '\u0419', '', ''];
rusD['I'] = ['\u042b\u0418', '\u0419\u0418', '\u0418', '\u0418', '\u0418', 'I'];

latD['Y'] = ['', '', ''];
rusD['Y'] = ['\u042b', '\u0419', 'Y'];

latD['K'] = ['', ''];
rusD['K'] = ['\u041a', 'K'];

latD['L'] = ['', ''];
rusD['L'] = ['\u041b', 'L'];

latD['M'] = ['', ''];
rusD['M'] = ['\u041c', 'M'];

latD['N'] = ['', ''];
rusD['N'] = ['\u041d', 'N'];

latD['P'] = ['', ''];
rusD['P'] = ['\u041f', 'P'];

latD['R'] = ['', ''];
rusD['R'] = ['\u0420', 'R'];

latD['S'] = ['\u0422+', '\u0422', '', ''];
rusD['S'] = ['\u0422\u0421', '\u0426', '\u0421', 'S'];

latD['T'] = ['', ''];
rusD['T'] = ['\u0422', 'T'];

latD['U'] = ['\u042b+', '\u0419+', '\u042b', '\u0419', '', ''];
rusD['U'] = ['\u042b\u0423', '\u0419\u0423', '\u042e', '\u042e', '\u0423', 'U'];

latD['F'] = ['', ''];
rusD['F'] = ['\u0424', 'F'];

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
    var trTBL = {'\u0430':'a', '\u0431':'b', '\u0432':'v', '\u0433':'g', '\u0434':'d', '\u0435':'e', '\u0451':'ye', '\u0436':'zh', '\u0437':'z', '\u0438':'i', '\u0439':'y', '\u043a':'k', '\u043b':'l', '\u043c':'m', '\u043d':'n', '\u043e':'o', '\u043f':'p', '\u0440':'r', '\u0441':'s', '\u0442':'t', '\u0443':'u', '\u0444':'f', '\u0445':'kh', '\u0446':'ts', '\u0447':'ch', '\u0448':'sh', '\u0449':'shch', '\u044a':'\"', '\u044b':'y', '\u044c':'\'', '\u044d':'e', '\u044e':'yu', '\u044f':'ya', '\u0410':'A', '\u0411':'B', '\u0412':'V', '\u0413':'G', '\u0414':'D', '\u0415':'E', '\u0401':'Ye', '\u0416':'Zh', '\u0417':'Z', '\u0418':'I', '\u0419':'Y', '\u041a':'K', '\u041b':'L', '\u041c':'M', '\u041d':'N', '\u041e':'O', '\u041f':'P', '\u0420':'R', '\u0421':'S', '\u0422':'T', '\u0423':'U', '\u0424':'F', '\u0425':'Kh', '\u0426':'Ts', '\u0427':'Ch', '\u0428':'Sh', '\u0429':'Shch', '\u042a':'\"\"', '\u042b':'Y', '\u042c':'\'\'', '\u042d':'E', '\u042e':'Yu', '\u042f':'Ya' };
    function translit(symb) { return trTBL[symb] ? trTBL[symb] : symb; }

    var trans="";
    for (var n=0;n<text.length;n++) trans += translit(text.substr(n,1));
    return trans;
},
guess: function (text) {
     var test = text.match(/[\u0430-\u044f\u0410-\u042f]+/i);
     if (!test || !test[0]) { return this.decode(text); }
     else { return this.encode(text); }
}
},

HTMLspecialchars : {
name: 'HTML special chars',
help: 'Method converts HTML special characters to their HTML representation. Decoding function reverts that.',
quote_style: null,
charset: null,
double_encode: null,
encode: function  (string) {
    // Convert special characters (< > etc) to HTML entities
    var optTemp = 0,
        i = 0,
        noquotes = false,
	quote_style = this.quote_style,
	charset = this.charset,
	double_encode = this.double_encode;
    if (typeof quote_style === 'undefined' || quote_style === null) { quote_style = 2; }
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
    if (quote_style === 0) { noquotes = true; }
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
    if (!noquotes) { string = string.replace(/"/g, '&quot;'); }

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
        string = string.replace(/&#0*39;/g, "'");
        // string = string.replace(/&apos;|&#x0*27;/g, "'");
    }
    if (!noquotes) {
        string = string.replace(/&quot;/g, '"');
    }
    // Put this in last place to avoid escape being double-decoded
    string = string.replace(/&amp;/g, '&');

    return string;
},
guess: function (text) {
     var test = text.match(/&\#|&\w+;/);
     if (!test || !test[0]) { return this.encode(text); }
     else { return this.decode(text); }
}
},

HTMLentities : {
name: 'HTML entities',
help: 'Method converts HTML entities characters to their HTML representation. Decoding function reverts that.',
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
    // fix &amp; problem
    delete(hash_map['&']);
    hash_map['&'] = '&amp;';

    for (symbol in hash_map) {
        entity = hash_map[symbol];
        tmp_str = tmp_str.split(entity).join(symbol);
    }
    tmp_str = tmp_str.split('&#039;').join("'");

    return tmp_str;
},
guess: function (text) {
     var test = text.match(/&\#|&\w+;/);
     if (!test || !test[0]) { return this.encode(text); }
     else { return this.decode(text); }
}
},

BASE64 : {
    name: 'base64',
    help: 'Method encodes a text as base64 and the other way. Partitial encodes supported poorly.',
    encode: function (data) {
        // Encodes string using MIME base64 algorithm
        //
        // version: 1109.2015
        // discuss at: http://phpjs.org/functions/base64_encode
        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
            ac = 0,
            enc = "",
            tmp_arr = [];

        if (!data)
            return data;

        data = METHODS.UTF8.encode(data + '');

        do { // pack three octets into four hexets
            o1 = data.charCodeAt(i++);
            o2 = data.charCodeAt(i++);
            o3 = data.charCodeAt(i++);

            bits = o1 << 16 | o2 << 8 | o3;

            h1 = bits >> 18 & 0x3f;
            h2 = bits >> 12 & 0x3f;
            h3 = bits >> 6 & 0x3f;
            h4 = bits & 0x3f;

            // use hexets to index into b64, and append result to encoded string
            tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        } while (i < data.length);

        enc = tmp_arr.join('');

        var r = data.length % 3;

        return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
    },
    decode: function (str) {
        // Encodes string using MIME base64 algorithm
        //
        // version: 1109.2015
        // discuss at: http://phpjs.org/functions/base64_encode
        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
            ac = 0,
            dec = '',
            tmp_arr = [],
            splitters = '';

        if (!str)
            return str;

        str += '';

        unique(str.split('')).forEach(function(name){
            if(!inArray(b64, name) && splitters.indexOf(name) === -1) {
                splitters += name;
            }
        });

        splitters = '[' + METHODS.REGEXESC.encode(splitters) + ']';
        var instrarray = str.split(new RegExp(splitters)).filter(function (element, index, array) {
            return (element.length >= 4);
        });

        instrarray.forEach(function(data){
            if (data.length % 4 === 0) {
                data = data.replace(/=+\s/, '');
            }

            if (data.length % 4 === 1) {
                return;
            }
            do { // unpack four hexets into three octets using index points in b64
                h1 = b64.indexOf(data.charAt(i++));
                h2 = b64.indexOf(data.charAt(i++));
                h3 = b64.indexOf(data.charAt(i++));
                h4 = b64.indexOf(data.charAt(i++));

                bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

                o1 = bits >> 16 & 0xff;
                o2 = bits >> 8 & 0xff;
                o3 = bits & 0xff;

                if (h3 == 64) {
                    tmp_arr[ac++] = String.fromCharCode(o1);
                } else if (h4 == 64) {
                    tmp_arr[ac++] = String.fromCharCode(o1, o2);
                } else {
                    tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
                }
            } while (i < data.length);

            dec += tmp_arr.join('');
        });

        return METHODS.UTF8.decode(dec);
    },
    guess: function (text) {
         var test = text.match(/[A-Za-z0-9+\/=]{30,}/i);
         if (!test || !test[0]) { return this.encode(text); }
         else { return this.decode(text); }
    }
},

UUENCODE : {
name: 'UUE encode',
help: 'Method encodes a text as UUE.',
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

bookmarklet: {
    name: 'bookmarklet',
    help: 'Method encodes JavaScript code into bookmarklet format.',
    encode: function (text) {
		var literalStrings;  // for temporary storage of literal strings.

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

                    // if not already in a string, look for the start of one.
                    if (!inQuote) {
                        if (c == '"' || c == "'") {
                            inQuote = true;
                            escaped = false;
                            quoteChar = c;
                            literal = c;
                        } else t += c;
                    }

                    // already in a string, look for end and copy characters.
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

            // remove uneccessary white space around operators, braces and parentices.
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
        code = code.replace(/^javascript:/, ''); // strip it if it's there so we can add it in to be sure it's there later
        code = code.replace(/void\(.*\)$/, ''); // to make sure our end of line anchors will work in the future

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
        //code = encodeURIcomponent(code); // better?

        if (code.substring(0, 11) == 'javascript:') code = code.substring(11);
        if ((code.substring(0, 12) + code.substring(code.length - 5)) != '(function(){})();') code = '(function(){' + code + '})();';
        code = 'javascript:' + code;

        return code;
    }
},

rot13 : {
    name: 'ROT13/17',
    help:  'Applying ROT13 to a piece of text examining its alphabetic characters and replacing each by the letter 13 places further along the English alphabet, wrapping back to the beginning if necessary. A becomes N, B becomes O, and so on up to M, which becomes Z, then the sequence continues at the beginning of the alphabet: N becomes A, O becomes B, and so on to Z, which becomes M. For Russian it\'s rotated 17 places by including "-" in the alphabet.',
    russian: '\u0430\u0431\u0432\u0433\u0434\u0435\u0451\u0436\u0437\u0438\u0439\u043a\u043b\u043c\u043d\u043e\u043f\u0440\u0441\u0442\u0443\u0444\u0445\u0446\u0447\u0448\u0449\u044a\u044b\u044c\u044d\u044e\u044f-',
    english: 'abcdefghijklmnopqrstuvwxyz',
    rotate: function (symbol) {
         var elen = this.english.length,
               rlen = this.russian.length;
         for (var rotation, lowercase, i = 0, l = rlen; i < l; ++i) {
             lowercase = symbol.toLowerCase();
             rotation = inArray(this.russian, lowercase) ? rlen / 2 : elen / 2;
            // to restore text we need rotate to 17 for russian and 13 for english
            // Russian is just for fun it is only reversible with the same operation for English as Russian alphabet has odd length.
             if (this.english[i] == lowercase)
                 return lowercase == symbol ? this.english[(i + rotation) % elen] : (this.english[(i + rotation) % elen]).toUpperCase();
             else if (this.russian[i] == lowercase)
                 return lowercase == symbol ? this.russian[(i + rotation) % rlen] : (this.russian[(i + rotation) % rlen]).toUpperCase();
         }
         return null;
    },
    encode: function (text) {
        if (!text) return;
        var res = '';
        for (var cd, i = 0; i < text.length; ++i) {
            if (cd = this.rotate(text[i])) res += cd;
            else res += text[i];
        }
        return res;
    },
    decode: function (text) {
        return this.encode(text);
    },
    guess: function (text) {
        return this.encode(text);
    }
},

timestamp: {
    name: 'Timestamp to date',
    help: 'Method converts unix epoch to human readable date.',
    encode: function(text) {
        if (!text) return;

        function localTimezone(d){
            if(!d) d = new Date();
            var gmtHours = -d.getTimezoneOffset()/60;
            var xc='';
            if (gmtHours > -1) xc = '+';
            return 'GMT' + xc + gmtHours;
        }

	var epoch = parseInt(text.replace(/[^\d]/i,''), 10);
	if (isNaN(epoch) || epoch === 0) return;

	var outputtext = '';
	var extraInfo = false;
	if(epoch > 1000000000000){
		// Assuming that this timestamp is in milliseconds...
		epoch = Math.round(epoch / 1000);
	} else {
		if(epoch > 10000000000) extraInfo = true;
		epoch = (epoch * 1000);
	}
	var datum = new Date(epoch);
	var localeString = datum.toLocaleString();
	var localeStringEnd = localeString.search(/GMT/i);
	if (localeStringEnd > 0) {
	    localeString=localeString.substring(0, localeStringEnd);
	}
	outputtext += 'GMT: '+datum.toGMTString().replace(/\s+GMT\s*/i,'')+'\nSYST: '+localeString+' '+localTimezone(datum);
	if (extraInfo) outputtext+='-> ' + epoch + ' seconds';
	return outputtext;
    },
},

reverse: {
    name: 'Reverse',
    help: 'Method reverses string lettering. For example Test becomes tseT and the other way.',
    encode: function(text) { return text.split('').reverse().join(''); },
    decode: function(text) { return this.encode(text); },
    guess: function (text) {
        return this.encode(text);
    }
}
}; /* METHODS*/
