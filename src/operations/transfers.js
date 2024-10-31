// src/operations/transfers.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const { ethers } = require('ethers');
const { loadAddressBook } = require('../wallet/addressBook');
const { loadWalletByIdentifier } = require('../wallet/walletService');
const { sendEmail } = require('../utils/emailService');
const { generate2FACode } = require('../utils/helpers');
const config = require('../config/config');
const fs = require('fs-extra');
const { loadSettings } = require('../wallet/settings');
const ora = require('ora');
const path = require('path');
const { hashPassword } = require('../utils/encryption');

const handleTransfers = async () => {
    const settings = await loadSettings();
    const network = settings.network || 'alfajores'; // По умолчанию alfajores

    console.log(chalk.blue(`\nСейчас выбрана сеть: ${network}`));

    const { walletIdentifier } = await inquirer.prompt([
        {
            type: 'input',
            name: 'walletIdentifier',
            message: 'Введите seed phrase, private key или название кошелька из адресной книги:',
        },
    ]);

    const fromWallet = await loadWalletByIdentifier(walletIdentifier);
    if (!fromWallet) {
        console.log(chalk.red('Кошелек не найден.'));
        return;
    }

    const { toAddress } = await inquirer.prompt([
        {
            type: 'input',
            name: 'toAddress',
            message: 'Куда отправить (номер кошелька или название из адресной книги):',
        },
    ]);

    const addressBook = await loadAddressBook();
    const recipient = addressBook.find(e => e.name === toAddress || e.address === toAddress);
    const recipientAddress = recipient ? recipient.address : toAddress;

    if (!ethers.utils.isAddress(recipientAddress)) {
        console.log(chalk.red('Введите корректный адрес получателя.'));
        return;
    }

    const { amountInput } = await inquirer.prompt([
        {
            type: 'input',
            name: 'amountInput',
            message: 'Введите сумму CELO (можете в USDT такого формата: 00.00 USDT):',
            validate: input => /^\d+(\.\d+)?( CELO| USDT)?$/.test(input) || 'Введите корректную сумму.',
        },
    ]);

    let amount = parseFloat(amountInput);
    let currency = 'CELO';
    if (amountInput.includes('USDT')) {
        currency = 'USDT';
    }

    // Комиссия разработчика
    const developerFee = 0.7;

    console.log('Перепроверьте информацию:');
    console.log(`Откуда: ${fromWallet.address}`);
    console.log(`Куда: ${recipientAddress}`);
    console.log(`Сумма: ${amount} ${currency}`);
    console.log(`Комиссия сети - динамическая, комиссия разработчика - ${developerFee} CELO`);
    console.log(`Сейчас выбрана сеть: ${network}`);

    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Подтверждаете?',
            default: false,
        },
    ]);

    if (!confirm) {
        console.log(chalk.yellow('Транзакция отменена.'));
        return;
    }

    const userData = await fs.readJson(config.USER_DATA_PATH);
    if (userData.twoFA) {
        const code = generate2FACode();
        await sendEmail(userData.email, 'Код подтверждения транзакции', `Ваш код: ${code}`);

        const { inputCode } = await inquirer.prompt([
            {
                type: 'input',
                name: 'inputCode',
                message: 'Укажите код, который пришел к вам на почту:',
                validate: input => input === code || 'Неверный код.',
            },
        ]);
    } else {
        const { password } = await inquirer.prompt([
            {
                type: 'password',
                name: 'password',
                message: 'Введите ваш пароль:',
                mask: '*',
                validate: input => hashPassword(input) === userData.password || 'Неверный пароль.',
            },
        ]);
    }

    try {
        // Определяем адрес кошелька разработчика в зависимости от сети
        const developerAddress = network === 'alfajores' ? config.DEV_WALLET_ALFAJORES : config.DEV_WALLET_MAINNET;
        const spinner = ora('Отправка транзакции...').start();

        // Настраиваем провайдер
        let provider;
        if (network === 'alfajores') {
            provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
        } else if (network === 'mainnet') {
            provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
        } else {
            throw new Error('Неподдерживаемая сеть');
        }

        const wallet = new ethers.Wallet(fromWallet.privateKey, provider);

        // Получаем актуальный nonce
        const nonce = await provider.getTransactionCount(wallet.address, 'latest');

        // Получаем комиссии за газ
        const gasPrice = await provider.getGasPrice();
        const maxPriorityFeePerGas = ethers.utils.parseUnits('2', 'gwei');
        const maxFeePerGas = gasPrice.add(maxPriorityFeePerGas);

        // Транзакция отправки средств получателю
        const tx1 = {
            to: recipientAddress,
            value: ethers.utils.parseEther(amount.toString()),
            nonce: nonce,
            gasLimit: ethers.utils.hexlify(210000), // Увеличенный лимит газа для CELO
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            type: 2,
        };

        // Отправка транзакции получателю
        const txResponse1 = await wallet.sendTransaction(tx1);

        // Транзакция комиссии разработчику
        const tx2 = {
            to: developerAddress,
            value: ethers.utils.parseEther(developerFee.toString()),
            nonce: nonce + 1,
            gasLimit: ethers.utils.hexlify(210000),
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            type: 2,
        };

        // Отправка транзакции комиссии разработчику
        const txResponse2 = await wallet.sendTransaction(tx2);

        // Ожидание подтверждения транзакций
        await Promise.all([txResponse1.wait(), txResponse2.wait()]);

        spinner.succeed('Транзакция успешно отправлена!');
        console.log(`Хэш вашей транзакции: ${txResponse1.hash}`);
        console.log(`Хэш транзакции комиссии разработчику: ${txResponse2.hash}`);

        // Сохранение информации о транзакции
        const txData = {
            from: fromWallet.address,
            to: recipientAddress,
            amount,
            currency,
            hash: tx1.hash,
            timestamp: new Date().toISOString(),
            network,
        };
        const txFilePath = path.join(config.TRANSACTIONS_DIR, `${tx1.hash}.json`);
        await fs.writeJson(txFilePath, txData, { spaces: 2 });

        // Сохранение информации о комиссии разработчику
        const feeTxData = {
            from: fromWallet.address,
            to: developerAddress,
            amount: developerFee,
            currency: 'CELO',
            hash: tx2.hash,
            timestamp: new Date().toISOString(),
            network,
        };
        const feeTxFilePath = path.join(config.TRANSACTIONS_DIR, `${tx2.hash}.json`);
        await fs.writeJson(feeTxFilePath, feeTxData, { spaces: 2 });

    } catch (error) {
        console.error(chalk.red('Ошибка при отправке транзакции:', error.message));
    }
};

module.exports = {
    handleTransfers,
};
