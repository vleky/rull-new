// src/operations/importExportOps.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');
const config = require('../config/config');
const { loadAddressBook } = require('../wallet/addressBook');
const { ethers } = require('ethers');

const handleImportExportWallet = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Импорт или экспорт?',
            choices: ['1. Импорт', '2. Экспорт'],
        },
    ]);

    if (action.startsWith('1')) {
        await importWallet();
    } else {
        await exportWallet();
    }
};

const importWallet = async () => {
    const { address, seedPhrase, privateKey } = await inquirer.prompt([
        {
            type: 'input',
            name: 'address',
            message: 'Введите номер кошелька:',
            validate: input => ethers.utils.isAddress(input) || 'Введите корректный адрес.',
        },
        {
            type: 'input',
            name: 'seedPhrase',
            message: 'Введите seed phrase (если есть):',
        },
        {
            type: 'input',
            name: 'privateKey',
            message: 'Введите private key (если есть):',
        },
    ]);

    if (!seedPhrase && !privateKey) {
        console.log(chalk.red('Должны быть либо seed phrase, либо private key.'));
        return;
    }

    const walletData = { address, seedPhrase, privateKey };
    const walletPath = path.join(config.WALLETS_DIR, `wallet_${address}.json`);
    await fs.writeJson(walletPath, walletData, { spaces: 2 });
    console.log(chalk.green('Кошелек импортирован.'));
};

const exportWallet = async () => {
    const addressBook = await loadAddressBook();
    if (addressBook.length === 0) {
        console.log(chalk.yellow('Адресная книга пуста.'));
        return;
    }

    const { name } = await inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: 'Введите имя кошелька для экспорта:',
            choices: addressBook.map(entry => entry.name),
        },
    ]);

    const walletPath = path.join(config.WALLETS_DIR, `wallet_${name}.json`);
    if (!await fs.pathExists(walletPath)) {
        console.log(chalk.red('Кошелек не найден.'));
        return;
    }

    const output = fs.createWriteStream(`${name}.zip`);
    const archive = archiver('zip');

    output.on('close', () => {
        console.log(chalk.green(`Кошелек экспортирован в файл ${name}.zip`));
    });

    archive.pipe(output);
    archive.file(walletPath, { name: `wallet_${name}.json` });
    await archive.finalize();
};

module.exports = {
    handleImportExportWallet,
};
