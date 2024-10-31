// src/operations/explorersOps.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const axios = require('axios');
const { ethers } = require('ethers');
const config = require('../config/config');
const { loadSettings } = require('../wallet/settings');

const handleExplorers = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Выберите действие:',
            choices: [
                '1. Проверка актуальности сети',
                '2. Проверка транзакций по хэшу',
                '3. Проверка состояния ноды',
                '4. Вернуться в главное меню',
            ],
        },
    ]);

    switch (action.split('.')[0]) {
        case '1':
            await checkNetworkStatus();
            break;
        case '2':
            await checkTransactionByHash();
            break;
        case '3':
            await checkNodeStatus();
            break;
        case '4':
            return;
        default:
            console.log(chalk.red('Неверная опция.'));
    }
};


const checkNetworkStatus = async () => {
    const settings = await loadSettings();
    const network = settings.network || 'alfajores';

    let provider;

    if (network === 'alfajores') {
        provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
    } else if (network === 'mainnet') {
        provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
    } else {
        throw new Error('Неподдерживаемая сеть');
    }

    try {
        const blockNumber = await provider.getBlockNumber();
        console.log(chalk.green(`Сеть ${network} работает. Текущий блок: ${blockNumber}`));
    } catch (error) {
        console.error(chalk.red('Ошибка при проверке сети:', error.message));
    }
};




// src/operations/explorersOps.js

// src/operations/explorersOps.js

const checkTransactionByHash = async () => {
    const { txHash } = await inquirer.prompt([
        {
            type: 'input',
            name: 'txHash',
            message: 'Введите хэш транзакции:',
            validate: input => /^0x([A-Fa-f0-9]{64})$/.test(input) || 'Введите корректный хэш.',
        },
    ]);

    const settings = await loadSettings();
    const network = settings.network || 'alfajores';

    let explorerApiUrl;

    if (network === 'alfajores') {
        explorerApiUrl = 'https://alfajores-blockscout.celo-testnet.org/api';
    } else if (network === 'mainnet') {
        explorerApiUrl = 'https://explorer.celo.org/api';
    } else {
        console.log(chalk.red('Неподдерживаемая сеть.'));
        return;
    }

    try {
        const response = await axios.get(`${explorerApiUrl}?module=transaction&action=gettxinfo&txhash=${txHash}`);
        const txData = response.data.result;

        if (txData) {
            console.log(chalk.green('\nТранзакция найдена!'));
            console.log(chalk.blue('-----------------------------'));
            console.log(`${chalk.bold('Хэш транзакции:')} ${txData.hash}`);
            console.log(`${chalk.bold('Статус:')} ${txData.status === '1' ? 'Подтверждена' : 'Не подтверждена'}`);
            console.log(`${chalk.bold('Отправитель:')} ${txData.from}`);
            console.log(`${chalk.bold('Получатель:')} ${txData.to}`);
            console.log(`${chalk.bold('Сумма:')} ${ethers.utils.formatEther(txData.value)} CELO`);
            console.log(`${chalk.bold('Комиссия за газ:')} ${ethers.utils.formatEther((BigInt(txData.gasUsed) * BigInt(txData.gasPrice)).toString())} CELO`);
            console.log(`${chalk.bold('Блок:')} ${txData.blockNumber}`);
            console.log(`${chalk.bold('Время:')} ${new Date(txData.timeStamp * 1000).toLocaleString()}`);
            console.log(chalk.blue('-----------------------------\n'));
        } else {
            console.log(chalk.yellow('Транзакция не найдена.'));
        }
    } catch (error) {
        console.error(chalk.red('Ошибка при проверке транзакции:', error.message));
    }
};



const checkNodeStatus = async () => {
    // Предполагается, что нода доступна по локальному адресу
    try {
        const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
        const blockNumber = await provider.getBlockNumber();
        console.log(chalk.green(`Нода работает. Текущий блок: ${blockNumber}`));
    } catch (error) {
        console.error(chalk.red('Нода не отвечает или выключена.'));
    }
};

module.exports = {
    handleExplorers,
};
