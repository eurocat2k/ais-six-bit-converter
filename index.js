/**
 * BitArray in JS
 */
(function(name, impl) {
    if (typeof define === 'function' && define.amd) {
        define(impl);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = impl();
    } else {
        var instance = impl();
        var global   = this;
        var old      = global[name];
        instance.noConflict = function () {
            global[name] = old;
            return instance;
        };
        global[name] = instance;
    }
})('I5NConvert',function() {
    'use strict';
    const CHAR_BITS_6 = 6;
    const CHAR_BITS_8 = 8;
    const BitArray = require('jsbitarray');
    const maxBits   = CHAR_BITS_6;
    const maxLen    = CHAR_BITS_8;
    const atCode    = '@'.charCodeAt(0);
    const ACode     = 'A'.charCodeAt(0);
    const ZCode     = 'Z'.charCodeAt(0);
    const spaceCode = ' '.charCodeAt(0);
    const zeroCode  = '0'.charCodeAt(0);
    const nineCode  = '9'.charCodeAt(0);
    let key, value, tmp;
    function I5NConvert() {
        let unused = 0;
        this.ba = new BitArray();
        this.SixBitCharsTable = {};
        // init table
        for (let i = 0, k = -1, max = 63, ch = atCode; i <= max; i += 1) {
            if (i >= 0 && i <= 26) {
                key = String.fromCharCode(ch + i);
                tmp = (i & 0x3f).toString(2);
                value = {bits: "0".repeat(maxBits - tmp.length) + tmp, idx: k += 1, code: (ch + i)};
                this.SixBitCharsTable[key] = value;
            } else if (i === 32) {
                key = String.fromCharCode((ch + i) - atCode);
                tmp = (i & 0x3f).toString(2);
                value = {bits: "0".repeat(maxBits - tmp.length) + tmp, idx: i, code: ((ch + i) - atCode)};
                this.SixBitCharsTable[key] = value;
            } else if (i >= 48 && i <= 57) {
                key = String.fromCharCode((ch + i) - atCode);
                tmp = (i & 0x3f).toString(2);
                value = {bits: "0".repeat(maxBits - tmp.length) + tmp, idx: k += 1, code: ((ch + i) - atCode)};
                this.SixBitCharsTable[key] = value;
            } else if (i >= 27 && i <= 31) {
                unused += 1;
                //key = String.fromCharCode((ch + i));
                key = "unused_" + "0".repeat(2 - unused.toString(10).length) + unused.toString(10);
                tmp = (i & 0x3f).toString(2);
                value = {bits: "0".repeat(maxBits - tmp.length) + tmp, idx: i, code: ((ch + i) - atCode)};
                this.SixBitCharsTable[key] = value;
            } else {
                //key = String.fromCharCode((ch + i) - atCode);
                unused += 1;
                key = "unused_" + "0".repeat(2 - unused.toString(10).length) + unused.toString(10);
                tmp = (i & 0x3f).toString(2);
                value = {bits: "0".repeat(maxBits - tmp.length) + tmp, idx: i, code: ((ch + i) - atCode)};
                this.SixBitCharsTable[key] = value;
            }
        }
    }
    // prototypes
    I5NConvert.prototype.showTable = function() {
        if (this.SixBitCharsTable) {
            let key, value;
            let arr = Object.keys(this.SixBitCharsTable)
            arr.forEach((k,i) => {
                if (!k.match(/^unused/g)) {
                    console.info("%s => %s", k, JSON.stringify(this.SixBitCharsTable[k]));
                }
            });
        }
    };
    I5NConvert.prototype.I5N_ASCII = function(b) {
        let buffer = undefined,
            byte = 0,
            code = 0,
            out = [];
        if (b) {
            if (b.constructor.name == 'Buffer') {
                buffer = Array.prototype.slice.call(b, 0);
            } else if (b.constructor.name == 'Array') {
                buffer = b;
            } else {
                throw new Error('Only array and buffer types supported yet!');
            }
        } else {
            throw new Error("A buffer as argument is missing!");
        }
        if (buffer) {
            this.ba.fromArr(buffer);
            for (let i = 0, k = 0; i < this.ba.bit_count; i +=1, k += 1) {
                byte |= parseInt(this.ba.getBit(i) << k);
                if ((i % 6) === 5) {
                    if ((byte >= 1) && (byte <= 26)) {
                        code = 'A'.charCodeAt(0) + (byte - 1);
                        out.push(String.fromCharCode(code));
                    } else if (byte === 32) {
                        out.push(' ');
                    } else if ((byte >= 48) && (byte <= 57)) {
                        code  = '0'.charCodeAt(0) + (byte - 48);
                        out.push(String.fromCharCode(code));
                    } else {
                        out.push('@');
                    }
                    byte = 0;
                    k = -1;
                }
            }
        }
        if (out.length) {
            out.reverse();
        }
        return (out.length ? out.join("") : "");
    };
    I5NConvert.prototype.ASCII_I5N = function(s) {
        if (s) {
            if (typeof s === 'string' && s.constructor) {
                if (s.constructor.name.toLowerCase() === 'string') {
                    let len = s.length;
                    let binaryStr = null;
                    let str = null;
                    if (len) {
                        str = Array.from(((len < maxLen) ? s + " ".repeat(maxLen - len) : (len > maxLen) ? s.substring(0, maxLen) : s).split("")).join("");
                        str.split("").forEach((x, i) => {
                            if (i === 0) {
                                if (this.SixBitCharsTable[x]) {
                                    binaryStr = this.SixBitCharsTable[x].bits;
                                }
                            } else {
                                if (this.SixBitCharsTable[x]) {
                                    binaryStr += this.SixBitCharsTable[x].bits;
                                }
                            }
                        });
                        //console.info({bstr: binaryStr});
                        //console.info({bytes: binaryStr.match(/.{1,8}/g).join(" ")});

                        this.ba.fromString(binaryStr);
                        this.ba.printArray();

                        console.log({ref: this.ba.octets.map((x) => x.toString(2).padStart(8, 0)).join(" "), res: binaryStr.match(/.{1,8}/g).join(" ")});

                        console.log({hex: this.ba.octets.map((x) => x.toString(16).padStart(2, 0)).join(" "), res: binaryStr.match(/.{1,8}/g).join(" ")});

                        console.info(this.ba.octets);
                        return this.ba.octets;
                    } else {
                        throw new Error("The callsign string should be 8 octets length!");
                    }
                }
            }
        } else {
            console.error("Missing string");
        }
        return false;
    };
    return I5NConvert;
});
