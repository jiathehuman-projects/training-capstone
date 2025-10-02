// Test decimalTransformer behavior
const { decimalTransformer } = require('./shared/models/transformers');

console.log('Testing decimalTransformer:');
console.log('from("4.20"):', decimalTransformer.from("4.20"));
console.log('from("5.20"):', decimalTransformer.from("5.20"));  
console.log('from("4.80"):', decimalTransformer.from("4.80"));
console.log('from(null):', decimalTransformer.from(null));
console.log('from(undefined):', decimalTransformer.from(undefined));
console.log('from(""):', decimalTransformer.from(""));

console.log('to(4.20):', decimalTransformer.to(4.20));
console.log('to(5.20):', decimalTransformer.to(5.20));
console.log('to(null):', decimalTransformer.to(null));
console.log('to(undefined):', decimalTransformer.to(undefined));