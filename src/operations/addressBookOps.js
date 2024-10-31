// src/operations/addressBookOps.js

const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { ethers } = require('ethers');
const { loadAddressBook, saveAddressBook } = require('../wallet/addressBook');
const { hashPassword } = require('../utils/encryption');
const fs = require('fs-extra');
const config = require('../config/config');

const handleAddressBook = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Выберите действие:',
            choices: [
                '1. Ввести новый кошелек',
                '2. Удалить кошелек',
                '3. Просмотреть адресную книгу',
                '4. Вернуться в главное меню',
            ],
        },
    ]);

    switch (action.split('.')[0]) {
        case '1':
            await addAddressBookEntry();
            break;
        case '2':
            await removeAddressBookEntry();
            break;
        case '3':
            await viewAddressBook();
            break;
        case '4':
            return;
        default:
            console.log(chalk.red('Неверная опция.'));
    }
};

const addAddressBookEntry = async () => {
    const { name, address, seedPhrase, privateKey } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Введите название кошелька (для вашего удобства):',
        },
        {
            type: 'input',
            name: 'address',
            message: 'Введите номер кошелька:',
            validate: input => ethers.utils.isAddress(input) || 'Введите корректный адрес.',
        },
        {
            type: 'input',
            name: 'seedPhrase',
            message: 'Введите seed phrase (если имеется):',
        },
        {
            type: 'input',
            name: 'privateKey',
            message: 'Введите private key (если имеется):',
        },
    ]);

    const addressBook = await loadAddressBook();
    addressBook.push({ name, address, seedPhrase, privateKey });
    await saveAddressBook(addressBook);

    const walletData = { address, seedPhrase, privateKey };
    const walletPath = path.join(config.WALLETS_DIR, `wallet_${name}.json`);
    await fs.writeJson(walletPath, walletData, { spaces: 2 });

    console.log(chalk.green(`Сохранено в файле: wallet_${name}.json`));
};

const removeAddressBookEntry = async () => {
    const addressBook = await loadAddressBook();
    if (addressBook.length === 0) {
        console.log(chalk.yellow('Адресная книга пуста.'));
        return;
    }

    const { name } = await inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: 'Введите имя кошелька, который хотите удалить:',
            choices: addressBook.map(entry => entry.name),
        },
    ]);

    const userData = await fs.readJson(config.USER_DATA_PATH);
    const { password } = await inquirer.prompt([
        {
            type: 'password',
            name: 'password',
            message: 'Введите ваш пароль:',
            mask: '*',
            validate: input => hashPassword(input) === userData.password || 'Неверный пароль.',
        },
    ]);

    const updatedAddressBook = addressBook.filter(entry => entry.name !== name);
    await saveAddressBook(updatedAddressBook);

    const walletPath = path.join(config.WALLETS_DIR, `wallet_${name}.json`);
    if (await fs.pathExists(walletPath)) {
        await fs.unlink(walletPath);
    }

    console.log(chalk.green('Кошелек удален из адресной книги.'));
};

const viewAddressBook = async () => {
    const addressBook = await loadAddressBook();
    if (addressBook.length === 0) {
        console.log(chalk.yellow('Адресная книга пуста.'));
        return;
    }

    console.log(chalk.green('Список ваших кошельков:'));
    addressBook.forEach(entry => {
        console.log(`- ${entry.name}: ${entry.address}`);
    });
};

module.exports = {
    handleAddressBook,
};
