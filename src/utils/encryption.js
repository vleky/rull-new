// src/utils/encryption.js

const crypto = require('crypto');

module.exports = {
    hashPassword: password => crypto.createHash('sha256').update(password).digest('hex'),
    verifyPassword: (password, hashedPassword) => {
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        return hash === hashedPassword;
    },
};
