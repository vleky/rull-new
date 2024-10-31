// src/operations/viewWalletsOps.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const { loadAddressBook } = require('../wallet/addressBook');
const QRCode = require('qrcode');
const path = require('path');
const config = require('../config/config');

const handleViewWallets = async () => {
    const addressBook = await loadAddressBook();
    if (addressBook.length === 0) {
        console.log(chalk.yellow('Адресная книга пуста.'));
        return;
    }

    console.log(chalk.green('Ваши кошельки:'));
    addressBook.forEach(entry => {
        console.log(`- ${entry.name}: ${entry.address}`);
    });

    const { generateQR } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'generateQR',
            message: 'Получить QR-код для адреса?',
            default: false,
        },
    ]);

    if (generateQR) {
        const { name } = await inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: 'Введите краткое имя из адресной книги или номер кошелька:',
                choices: addressBook.map(entry => entry.name),
            },
        ]);

        const entry = addressBook.find(e => e.name === name);
        if (!entry) {
            console.log(chalk.red('Кошелек не найден.'));
            return;
        }

        const qrPath = path.join(config.DATA_DIR, `${entry.name}_qr.png`);
        await QRCode.toFile(qrPath, entry.address);
        console.log(chalk.green(`QR-код сохранен в файл ${qrPath}`));
    }
};

module.exports = {
    handleViewWallets,
};
