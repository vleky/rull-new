// src/mainMenu.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const axios = require('axios');
const { ethers } = require('ethers');

const { displayExchangeRates } = require('./operations/exchangeRatesOps');
const { displayMainWalletBalance } = require('./operations/balanceOps');
const { handleTransfers } = require('./operations/transfers');
const { handleAddressBook } = require('./operations/addressBookOps');
const { handleSettings } = require('./operations/settingsOps');
const { handleExplorers } = require('./operations/explorersOps');
const { handleDisplayBalance } = require('./operations/balanceOps');
const { handleGenerateNewAddress } = require('./operations/generateAddressOps');
const { handleImportExportWallet } = require('./operations/importExportOps');
const { handleTransactionHistory } = require('./operations/transactionHistoryOps');
const { handleViewWallets } = require('./operations/viewWalletsOps');
const { handleBackupWallets } = require('./operations/backupWalletsOps');
const { handleNodeManagement } = require('./operations/nodeManagementOps');

const mainMenu = async () => {
    while (true) {
        await displayExchangeRates();
        await displayMainWalletBalance();
        const { option } = await inquirer.prompt([
            {
                type: 'list',
                name: 'option',
                message: 'Выберите опцию:',
                choices: [
                    '1. Переводы',
                    '2. Адресная книга',
                    '3. Настройки',
                    '4. Работа с обозревателями',
                    '5. Отображение текущего баланса',
                    '6. Генерация нового адреса',
                    '7. Импорт/экспорт кошелька',
                    '8. Просмотр истории транзакций',
                    '9. Просмотр кошельков',
                    '10. Создание резервной копии кошельков',
                    '11. Управление нодой',
                    '99. Выход',
                ],
            },
        ]);

        switch (option.split('.')[0]) {
            case '1':
                await handleTransfers();
                break;
            case '2':
                await handleAddressBook();
                break;
            case '3':
                await handleSettings();
                break;
            case '4':
                await handleExplorers();
                break;
            case '5':
                await handleDisplayBalance();
                break;
            case '6':
                await handleGenerateNewAddress();
                break;
            case '7':
                await handleImportExportWallet();
                break;
            case '8':
                await handleTransactionHistory();
                break;
            case '9':
                await handleViewWallets();
                break;
            case '10':
                await handleBackupWallets();
                break;
            case '11':
                await handleNodeManagement();
                break;
            case '99':
                console.log(chalk.blue('До свидания!'));
                process.exit(0);
                break;
            default:
                console.log(chalk.red('Неверная опция.'));
        }
    }
};

module.exports = {
    mainMenu,
};
