// src/wallet/walletService.js

const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');
const { ethers } = require('ethers');

const loadWalletByIdentifier = async identifier => {
    // Проверка по адресу
    const walletPath = path.join(config.WALLETS_DIR, `wallet_${identifier}.json`);
    if (await fs.pathExists(walletPath)) {
        return await fs.readJson(walletPath);
    }

    // Проверка по seed phrase или private key
    try {
        const wallet = ethers.Wallet.fromMnemonic(identifier);
        return wallet;
    } catch (error) {
        try {
            const wallet = new ethers.Wallet(identifier);
            return wallet;
        } catch (error) {
            return null;
        }
    }
};

module.exports = {
    loadWalletByIdentifier,
};
