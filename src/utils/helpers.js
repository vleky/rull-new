// src/utils/helpers.js

module.exports = {
    delay: ms => new Promise(resolve => setTimeout(resolve, ms)),
    generate2FACode: () => Math.floor(100000 + Math.random() * 900000).toString(),
};
