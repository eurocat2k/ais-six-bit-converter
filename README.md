# ais-six-bit-converter
Convert AIS 6 bit characters encoded string - ICAO/ADEXP FPL callsign or ident - from 6 bits encoding to ASCII, and from ASCII to 6 bits encodings.
## Description
Aircraft ident field usually encoded 6 bits string in Asterix radar data. To deal with decoding, or even generating simulated radar data with flight plan related info - mostly the ident field a.k.a. **CAT062 [FID:380 FRN:2]** - you might find useful this snippet.

I included the bitarray module to this one, as a dependency. *(However you can find a standalone version in my repos as well.)* 

## Usage

If you import and then instantiate the converter,...
```javascript
const I5NConvert = require('./i5nconv');

const data = [
    [0x2c, 0xc3, 0x78, 0xdf, 0x38, 0x20],
    [0x4C, 0x22, 0x79, 0xC7, 0x98, 0x20]
];

const conv = new I5NConvert();

for (let i = 0, len = data.length; i < len; i += 1) {
    var res = conv.I5N_to_Ascii(data[i]);
    var octets = conv.Ascii_to_I5N(res).map((x) => { return "0x" + "0".repeat(2 - (x & 0x3f).toString(16).length) +  (x & 0x3f).toString(16)});
    console.log({result: res, output: octets});
}
```
...then, you should expect the following output below:
```
{ result: 'KLM873  ',
  output: [ '0x2c', '0x03', '0x38', '0x1f', '0x38', '0x20' ] }

{ result: 'SBI919  ',
  output: [ '0x0c', '0x22', '0x39', '0x07', '0x18', '0x20' ] }
```
## Converter class
Has two public attributes:
- **ba** as its own BitArray component for bit manipulations.
- **SixBitCharsTable** as a static table for dealing with en-/decoding back and forth.

has further three public prototype methods:
- **showTable** which simply displays the contents of the 6 bits char table
- **I5N_to_Ascii** which then converts array of bytes - 6 bytes for callsign encoded 6 bits string - to ASCII charaters string
- **ASCII_to_I5N** which then encodes maximum 8 bytes length callsign string into a 6 bytes long 6 bits encoded string.
