// src/operations/transactionHistoryOps.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const axios = require('axios');
const { ethers } = require('ethers'); // Не забудьте импортировать ethers
const { loadAddressBook } = require('../wallet/addressBook');
const { loadSettings } = require('../wallet/settings'); // Импортируем настройки
const config = require('../config/config');

const handleTransactionHistory = async () => {
    const addressBook = await loadAddressBook();
    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Транзакции какого кошелька просмотреть? (введите краткое имя из адресной книги или номер кошелька):',
        },
    ]);

    const entry = addressBook.find(e => e.name === name || e.address === name);
    if (!entry) {
        console.log(chalk.red('Кошелек не найден.'));
        return;
    }

    const transactions = await getTransactionHistory(entry.address);
    if (transactions.length === 0) {
        console.log(chalk.yellow('История транзакций пуста.'));
        return;
    }

    const { filter } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'filter',
            message: 'Фильтровать транзакции по типу?',
            default: false,
        },
    ]);

    let filteredTransactions = transactions;
    if (filter) {
        const { filterType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'filterType',
                message: 'Выберите тип транзакций:',
                choices: ['1. Входящие', '2. Исходящие'],
            },
        ]);

        if (filterType.startsWith('1')) {
            filteredTransactions = transactions.filter(tx => tx.to.toLowerCase() === entry.address.toLowerCase());
        } else {
            filteredTransactions = transactions.filter(tx => tx.from.toLowerCase() === entry.address.toLowerCase());
        }
    }

    console.log(chalk.green('\nИстория транзакций:'));
    for (const tx of filteredTransactions) {
        console.log(chalk.blue('-----------------------------'));
        console.log(`${chalk.bold('Время:')} ${new Date(tx.timeStamp * 1000).toLocaleString()}`);
        console.log(`${chalk.bold('Сумма:')} ${ethers.utils.formatEther(tx.value)} CELO`);
        console.log(`${chalk.bold('Откуда:')} ${tx.from}`);
        console.log(`${chalk.bold('Куда:')} ${tx.to}`);
        console.log(`${chalk.bold('Хэш транзакции:')} ${tx.hash}`);
    }
    console.log(chalk.blue('-----------------------------\n'));
};

const getTransactionHistory = async address => {
    try {
        const settings = await loadSettings();
        const network = settings.network || 'alfajores';

        let explorerApiUrl;

        if (network === 'alfajores') {
            explorerApiUrl = 'https://alfajores-blockscout.celo-testnet.org/api';
        } else if (network === 'mainnet') {
            explorerApiUrl = 'https://explorer.celo.org/api';
        } else {
            console.log(chalk.red('Неподдерживаемая сеть.'));
            return [];
        }

        const response = await axios.get(`${explorerApiUrl}?module=account&action=txlist&address=${address}&sort=asc`);

        if (response.data.status !== '1' || !response.data.result) {
            return [];
        }

        return response.data.result;
    } catch (error) {
        console.error(chalk.red('Ошибка при получении истории транзакций:', error.message));
        return [];
    }
};

module.exports = {
    handleTransactionHistory,
};