// src/operations/balanceOps.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const { ethers } = require('ethers');
const { loadSettings } = require('../wallet/settings');
const { loadAddressBook } = require('../wallet/addressBook');
const config = require('../config/config');
const fs = require('fs-extra');
const path = require('path');

const handleDisplayBalance = async () => {
    await displayMainWalletBalance();
    const { showOthers } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'showOthers',
            message: 'Баланс остальных кошельков (показать?)',
            default: false,
        },
    ]);

    if (showOthers) {
        const settings = await loadSettings();
        const network = settings.network || 'alfajores'; // По умолчанию alfajores

        let provider;

        if (network === 'alfajores') {
            provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
        } else if (network === 'mainnet') {
            provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
        } else {
            console.log(chalk.red('Неподдерживаемая сеть.'));
            return;
        }

        const addressBook = await loadAddressBook();
        for (const entry of addressBook) {
            if (!entry.address) continue;
            const balanceWei = await provider.getBalance(entry.address);
            const balanceCELO = ethers.utils.formatEther(balanceWei);
            console.log(chalk.blue(`Кошелек ${entry.name}: ${balanceCELO} CELO`));
        }
    }
};

const displayMainWalletBalance = async () => {
    const settings = await loadSettings();
    if (!settings.mainWallet) {
        console.log(chalk.yellow('Основной кошелек не установлен.'));
        return;
    }
    const network = settings.network || 'alfajores'; // По умолчанию alfajores
    const walletPath = path.join(config.WALLETS_DIR, `wallet_${settings.mainWallet}.json`);
    if (!await fs.pathExists(walletPath)) {
        console.log(chalk.red('Основной кошелек не найден.'));
        return;
    }
    const walletData = await fs.readJson(walletPath);

    let provider;

    if (network === 'alfajores') {
        provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
    } else if (network === 'mainnet') {
        provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
    } else {
        throw new Error('Неподдерживаемая сеть');
    }

    const balanceWei = await provider.getBalance(walletData.address);
    const balanceCELO = ethers.utils.formatEther(balanceWei);
    console.log(chalk.blue(`\nБаланс вашего основного кошелька - ${balanceCELO} CELO (сеть: ${network})`));
};


module.exports = {
    handleDisplayBalance,
    displayMainWalletBalance,
};
