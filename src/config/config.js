// src/config/config.js

require('dotenv').config();

module.exports = {
    COINMARKETCAP_API_KEY: process.env.COINMARKETCAP_API_KEY,
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    SMTP_EMAIL: process.env.SMTP_EMAIL,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    DEV_WALLET_ALFAJORES: process.env.DEV_WALLET_ALFAJORES,
    DEV_WALLET_MAINNET: process.env.DEV_WALLET_MAINNET,
    DATA_DIR: 'data',
    WALLETS_DIR: 'data/wallets',
    TRANSACTIONS_DIR: 'data/transactions',
    ADDRESS_BOOK_PATH: 'data/addressBook.json',
    SETTINGS_PATH: 'data/settings.json',
    USER_DATA_PATH: 'data/user.json',
};
