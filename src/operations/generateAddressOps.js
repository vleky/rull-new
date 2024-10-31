// src/operations/generateAddressOps.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const { ethers } = require('ethers');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');

const handleGenerateNewAddress = async () => {
    const wallet = ethers.Wallet.createRandom();
    console.log(`Номер кошелька: ${wallet.address}`);
    console.log(`Seed phrase: ${wallet.mnemonic.phrase}`);
    console.log(`Private key: ${wallet.privateKey}`);

    const { saveEncrypted } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'saveEncrypted',
            message: 'Сохранить в зашифрованном виде?',
            default: false,
        },
    ]);

    if (saveEncrypted) {
        const { password } = await inquirer.prompt([
            {
                type: 'password',
                name: 'password',
                message: 'Введите пароль:',
                mask: '*',
            },
        ]);

        const encryptedJson = await wallet.encrypt(password);
        const walletPath = path.join(config.WALLETS_DIR, `wallet_${wallet.address}.json`);
        await fs.writeFile(walletPath, encryptedJson);
        console.log(chalk.green('Кошелек сохранен в зашифрованном виде.'));
    } else {
        const walletData = {
            address: wallet.address,
            seedPhrase: wallet.mnemonic.phrase,
            privateKey: wallet.privateKey,
        };
        const walletPath = path.join(config.WALLETS_DIR, `wallet_${wallet.address}.json`);
        await fs.writeJson(walletPath, walletData, { spaces: 2 });
        console.log(chalk.green('Кошелек сохранен в незашифрованном виде.'));
    }
};

module.exports = {
    handleGenerateNewAddress,
};
