const bcrypt = require('bcrypt');

const testPassword = 'password123';
const hashFromDB = '/wNzs1XS8dVykXUta';

bcrypt.compare(testPassword, hashFromDB).then(result => {
    console.log('Password match result:', result);
    if (result) {
        console.log(' Password verification PASSED');
    } else {
        console.log(' Password verification FAILED');
    }
}).catch(err => {
    console.error('Error during verification:', err);
});
