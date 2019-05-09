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
})('BitArray',function() {
    'use strict';
    const CHAR_BITS = 8;
    const DEBUG = false;
    function parseHexString(str) {
        var result = [];
        while (str.length >= 8) {
            result.push(parseInt(str.substring(0, 8), 16));
            str = str.substring(8, str.length);
        }
        return result;
    }
    function xorSwap(array) {
        var i = null;
        var r = null;
        var length = array.length;
        for (i = 0, r = length - 1; i < r; i += 1, r -= 1) {
            var left = array[i];
            var right = array[r];
            left ^= right;
            right ^= left;
            left ^= right;
            array[i] = left;
            array[r] = right;
        }
        return array;
    }
    const isLittleEndian = new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x78;
    function parseStringToHexArray(str) {
        var result = [];
        if (typeof str === 'undefined') {
            return false;
        }
        while(str.length >= 1) {
            result.push(parseInt(str.substring(0, 1).charCodeAt(0), 16));
            str = str.substring(1, str.length);
        }
        return result;
    }
    /**
     * The module
     */
    var BitArray = function() {
        let self = this;
        this.init = function init() {
            self.byte_count = 0;
            self.bit_count = 0;
            self.octets = null;
            self.bits_be = null;
            self.bits_le = null;
            self.endianness = (new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x12) ? 'big' : 'little';
        };
        this.init();
    };
    BitArray.prototype.create = function(b) {
        let typestr = null,
            i = 0,
            j = 0,
            idx = 0,
            bitcount = 0,
            octet = null;
        if (typeof b === 'undefined') {
            throw new Error('Bit array source must be defined!');
        }
        // detect if param is a typed array: Uint8Array()
        typestr = b.constructor.name.toLowerCase();
        switch(typestr) {
            case 'string':
                this.octets = Uint8Array.from(parseStringToHexArray(b));
            break;
            case 'array' :
                this.octets = Uint8Array.from(b);
            break;
            case 'uint8array':
                this.octets = b;
            break;
            default:
                throw new Error("Invalid input type! Use array, string or typed array");
        }
        this.byte_count = b.length;
        // create bit array
        this.bits_be = new Uint8Array((CHAR_BITS * this.byte_count));
        this.bits_le = new Uint8Array((CHAR_BITS * this.byte_count));
        this.bit_count = this.bits_be.length;
        bitcount = CHAR_BITS * this.byte_count;
        bitcount -= 1;
        for (i = 0; i < this.byte_count; i += 1) {
            octet = this.octets[i];
            console.log('Octet[%d]: %s', i, octet.toString(2).padStart(8, 0));
            for (j = CHAR_BITS - 1; j >= 0; j -= 1) {
                idx = (i * CHAR_BITS) + j;
                if (octet & 1) {
                    this.bits_be[(bitcount - idx)] = 1;
                    this.bits_le[idx] = 1;
                } else {
                    this.bits_be[(bitcount - idx)] = 0;
                    this.bits_le[idx] = 0;
                }
                octet >>= 1;
            }
        }
    };
    // little endian bit order
    BitArray.prototype.getBitLe = function(idx) {
        let i = 0,
            j = 0,
            bitcount = CHAR_BITS * this.byte_count;
        bitcount -= 1;
        if (idx < 0 || idx >= this.bit_count) {
            throw new Error("Invalid index " + idx + " the bitarray size does not fit!");
        }
        return this.bits_le[bitcount-idx];
    };
    BitArray.prototype.setBitLe = function(idx) {
        let i = 0,
            j = 0,
            bitcount = CHAR_BITS * this.byte_count;
        bitcount -= 1;;
        if (idx < 0 || idx >= this.bit_count) {
            throw new Error("Invalid index " + idx + " the bitarray size does not fit!");
        }
        this.bits_le[bitcount-idx] = 1;
    };
    BitArray.prototype.clearBitLe = function(idx) {
        let i = 0,
            j = 0,
            bitcount = CHAR_BITS * this.byte_count;
        bitcount -= 1;;
        if (idx < 0 || idx >= this.bit_count) {
            throw new Error("Invalid index " + idx + " the bitarray size does not fit!");
        }
        this.bits_le[bitcount-idx] = 0;
    };
    BitArray.prototype.xorBitLe = function(idx) {
        let i = 0,
            j = 0,
            bitcount = CHAR_BITS * this.byte_count;
        bitcount -= 1;;
        if (idx < 0 || idx >= this.bit_count) {
            throw new Error("Invalid index " + idx + " the bitarray size does not fit!");
        }
        this.bits_le[bitcount-idx] ^= 1;
    };
    // big endian bit order
    BitArray.prototype.getBitBe = function(idx) {
        let i = 0,
            j = 0;
        if (idx < 0 || idx >= this.bit_count) {
            throw new Error("Invalid index " + idx + " the bitarray size does not fit!");
        }
        return this.bits_be[idx];
    };
    BitArray.prototype.setBitBe = function(idx) {
        let i = 0,
        j = 0;
        if (idx < 0 || idx >= this.bit_count) {
            throw new Error("Invalid index " + idx + " the bitarray size does not fit!");
        }
        this.bits_be[idx] = 1;
    };
    BitArray.prototype.clearBitBe = function(idx) {
        let i = 0,
        j = 0;
        if (idx < 0 || idx >= this.bit_count) {
            throw new Error("Invalid index " + idx + " the bitarray size does not fit!");
        }
        this.bits_be[idx] = 0;
    };
    BitArray.prototype.xorBitBe = function(idx) {
        let i = 0,
        j = 0;
        if (idx < 0 || idx >= this.bit_count) {
            throw new Error("Invalid index " + idx + " the bitarray size does not fit!");
        }
        this.bits_be[idx] ^= 1;
    };
    BitArray.prototype.getBit = function(idx) {
        if (this.endianness === 'little') {
            return this.getBitLe(idx);
        } else {
            return this.getBitBe(idx);
        }
    };
    BitArray.prototype.setBit = function(idx) {
        let i = 0, j = 0, ba = new BitArray();
        if (this.endianness === 'little') {
            this.setBitLe(idx);
            this.bits_be = this.bits_le.slice();
        } else {
            this.clearBitBe(idx);
            this.bits_le = this.bits_be.slice();
        }
        ba.init();
        ba.fromString(this.toString());
        if (DEBUG) {
            ba.printArray();
        }
        if (ba.octets && ba.octets.length) {
            this.octets = ba.octets.slice();
        }
    };
    BitArray.prototype.xorBit = function(idx) {
        let i = 0, j = 0, ba = new BitArray();
        if (this.endianness === 'little') {
            this.xorBitLe(idx);
            this.bits_be = this.bits_le.slice();
        } else {
            this.xorBitBe(idx);
            this.bits_le = this.bits_be.slice();
        }
        ba.init();
        ba.fromString(this.toString());
        if (DEBUG) {
            ba.printArray();
        }
        if (ba.octets && ba.octets.length) {
            this.octets = ba.octets.slice();
        }
    };
    BitArray.prototype.clearBit = function(idx) {
        let i = 0, j = 0, ba = new BitArray();
        if (this.endianness === 'little') {
            this.clearBitLe(idx);
            this.bits_be = this.bits_le.slice();
        } else {
            this.clearBitBe(idx);
            this.bits_le = this.bits_be.slice();
        }
        ba.fromString(this.toString());
        if (DEBUG) {
            ba.printArray();
        }
        if (ba.octets && ba.octets.length) {
            this.octets = ba.octets.slice();
        }
    };
    BitArray.prototype.fromArr = function(b) {
        var cname = null,
            i = 0,
            len = 0,
            bstr = '';
        this.init();
        if (b) {
            cname = b.constructor.name;
            if (cname.match(/array/ig)) {
                // handle it as array
                for (i = 0, len = b.length; i < len; i += 1) {
                    bstr += b[i].toString(2).padStart(8, 0);
                }
                if (bstr.length) {
                    this.fromString(bstr);
                }
            } else if (cname.match(/buffer/ig)) {
                // handle it as buffer
            } else {
                throw new Error('invalid type of argument: %s', cname);
            }
        } else {
            throw new Error("fromArr requires argument either array, typed array or buffer");
        }
    };
    BitArray.prototype.fromString = function(s) {
        var cname = null,
            i = 0,
            j = 0,
            bstr = '',
            octet = 0,
            blen = 0,
            gap = 0;
        this.init();
        if (s) {
            cname = s.constructor.name;
            if (cname.match(/string/gi)) {
                if (s.match(/^(?:([01]+))$/)) {
                    blen = s.length;
                    if ((blen % CHAR_BITS)) {
                        gap = Math.abs((blen % CHAR_BITS) - CHAR_BITS);
                    }
                    blen += gap;
                    while(gap--) {
                        bstr += '0';
                    }
                    bstr += s;
                    if (this.endianness === 'little'){
                        this.bits_le = bstr.split('').map((e) => { return parseInt(e, 10); });
                        this.bits_be = Array.from(this.bits_le);
                        this.bits_be.reverse();
                    } else {
                        this.bits_be = bstr.split('').map((e) => { return parseInt(e, 10); });
                        this.bits_le = Array.from(this.bits_be);
                        this.bits_le.reverse();
                    }
                    this.octets = new Array(blen / CHAR_BITS).fill(0);
                    for (i = 0, j = 0; i < blen; i += 1) {
                        if (i && ((i % CHAR_BITS) === 0)) {
                            //console.log(this.octets[j]);
                            j += 1;
                        }
                        if (this.endianness === 'little') {
                            this.octets[j] |= (this.bits_be[i] << (i % CHAR_BITS));
                        } else {
                            this.octets[j] |= (this.bits_le[i] << (i % CHAR_BITS));
                        }
                    }
                    this.octets.reverse();
                    this.byte_count = this.octets.length;
                    this.bit_count = this.byte_count * CHAR_BITS;
                } else {
                    throw new Error('invalid argument type: binary number string required: "10011100..."!');
                }
            } else {
                throw new Error('invalid argument type: string required!');
            }
        }
    };
    BitArray.prototype.toString = function() {
        return (this.endianness === 'big') ? this.bits_be.join("") : this.bits_le.join("");
    };
    BitArray.prototype.printArray = function() {
        var hexstr = '',
            binstr = '',
            octstr = '',
            decstr = '',
            ascii  = '';
        for (let i = 0; i < this.byte_count; i += 1) {
            if (i == 0) {
                binstr += this.octets[i].toString(2).padStart(8, 0);
                octstr += this.octets[i].toString(8).padStart(3, 0);
                hexstr += this.octets[i].toString(16).toUpperCase().padStart(2, 0);
                decstr += this.octets[i].toString(10);
            } else {
                binstr += ' ';
                hexstr += ' ';
                octstr += ' ';
                decstr += ' ';
                binstr += this.octets[i].toString(2).padStart(8, 0);
                octstr += this.octets[i].toString(8).padStart(3, 0);
                hexstr += this.octets[i].toString(16).toUpperCase().padStart(2, 0);
                decstr += this.octets[i].toString(10);
            }
        }
        console.log({'BIN': binstr, 'OCT': octstr, 'HEX': hexstr, 'DEC': decstr});
    }
    //
    return BitArray;
});
