// src/wallet/addressBook.js

const fs = require('fs-extra');
const config = require('../config/config');

const loadAddressBook = async () => {
    if (!await fs.pathExists(config.ADDRESS_BOOK_PATH)) {
        await fs.writeJson(config.ADDRESS_BOOK_PATH, []);
    }
    return await fs.readJson(config.ADDRESS_BOOK_PATH);
};

const saveAddressBook = async addressBook => {
    await fs.writeJson(config.ADDRESS_BOOK_PATH, addressBook, { spaces: 2 });
};

module.exports = {
    loadAddressBook,
    saveAddressBook,
};
