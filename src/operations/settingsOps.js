// src/operations/settingsOps.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const { loadSettings, saveSettings } = require('../wallet/settings');
const { hashPassword, verifyPassword } = require('../utils/encryption');
const fs = require('fs-extra');
const config = require('../config/config');
const { sendEmail } = require('../utils/emailService');
const { loadAddressBook } = require('../wallet/addressBook'); // Не забываем импортировать
const path = require('path');

const handleSettings = async () => {
    const { setting } = await inquirer.prompt([
        {
            type: 'list',
            name: 'setting',
            message: 'Выберите настройку:',
            choices: [
                '1. Основной кошелек',
                '2. Изменить пароль',
                '3. Настроить уведомления',
                '4. Установить язык интерфейса',
                '5. Включение/выключение 2FA',
                '6. Установка предельной суммы для транзакций',
                '7. Выбрать сеть для отправки CELO',
                '8. Сбросить настройки до заводских',
                '9. Вернуться в главное меню',
            ],
        },
    ]);

    switch (setting.split('.')[0]) {
        case '1':
            await setMainWallet();
            break;
        case '2':
            await changePassword();
            break;
        case '3':
            await setupNotifications();
            break;
        case '4':
            await setLanguage();
            break;
        case '5':
            await toggle2FA();
            break;
        case '6':
            await setTransactionLimit();
            break;
        case '7':
            await setNetwork();
            break;
        case '8':
            await resetSettings();
            break;
        case '9':
            return;
        default:
            console.log(chalk.red('Неверная опция.'));
    }
};

// Новая функция для установки сети
const setNetwork = async () => {
    const { network } = await inquirer.prompt([
        {
            type: 'list',
            name: 'network',
            message: 'Выберите сеть для отправки CELO:',
            choices: ['alfajores', 'mainnet'],
        },
    ]);

    const settings = await loadSettings();
    settings.network = network;
    await saveSettings(settings);
    console.log(chalk.green(`Сеть установлена на ${network}.`));
};

const setMainWallet = async () => {
    const addressBook = await loadAddressBook();
    if (addressBook.length === 0) {
        console.log(chalk.yellow('Адресная книга пуста.'));
        return;
    }

    const { name } = await inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: 'Введите номер основного кошелька или имя из адресной книги:',
            choices: addressBook.map(entry => entry.name),
        },
    ]);

    const settings = await loadSettings();
    settings.mainWallet = name;
    await saveSettings(settings);
    console.log(chalk.green('Основной кошелек установлен.'));
};

const changePassword = async () => {
    const userData = await fs.readJson(config.USER_DATA_PATH);
    const { currentPassword } = await inquirer.prompt([
        {
            type: 'password',
            name: 'currentPassword',
            message: 'Введите текущий пароль:',
            mask: '*',
            validate: input => verifyPassword(input, userData.password) || 'Неверный пароль.',
        },
    ]);

    const { newPassword, confirmPassword } = await inquirer.prompt([
        {
            type: 'password',
            name: 'newPassword',
            message: 'Введите новый пароль (если не нужно, введите 0):',
            mask: '*',
        },
        {
            type: 'password',
            name: 'confirmPassword',
            message: 'Подтвердите новый пароль:',
            mask: '*',
        },
    ]);

    if (newPassword === '0') {
        console.log(chalk.yellow('Пароль не изменен.'));
        return;
    }

    if (newPassword !== confirmPassword) {
        console.log(chalk.red('Пароли не совпадают.'));
        return;
    }

    userData.password = hashPassword(newPassword);
    await fs.writeJson(config.USER_DATA_PATH, userData, { spaces: 2 });
    console.log(chalk.green('Пароль успешно изменен.'));
};

const setupNotifications = async () => {
    const userData = await fs.readJson(config.USER_DATA_PATH);
    const { newEmail } = await inquirer.prompt([
        {
            type: 'input',
            name: 'newEmail',
            message: 'Введите новую почту (если не нужно, введите 0):',
        },
    ]);

    if (newEmail === '0') {
        console.log(chalk.yellow('Настройки уведомлений не изменены.'));
        return;
    }

    const code = generate2FACode();
    await sendEmail(userData.email, 'Код подтверждения изменения почты', `Ваш код: ${code}`);

    const { oldEmailCode } = await inquirer.prompt([
        {
            type: 'input',
            name: 'oldEmailCode',
            message: 'Введите код со старой почты отправленный вам:',
            validate: input => input === code || 'Неверный код.',
        },
    ]);

    const newCode = generate2FACode();
    await sendEmail(newEmail, 'Код подтверждения новой почты', `Ваш код: ${newCode}`);

    const { newEmailCode } = await inquirer.prompt([
        {
            type: 'input',
            name: 'newEmailCode',
            message: 'Введите код с новой почты отправленный вам:',
            validate: input => input === newCode || 'Неверный код.',
        },
    ]);

    userData.email = newEmail;
    await fs.writeJson(config.USER_DATA_PATH, userData, { spaces: 2 });
    console.log(chalk.green('Почта успешно изменена.'));
};

const setLanguage = async () => {
    const { language } = await inquirer.prompt([
        {
            type: 'list',
            name: 'language',
            message: 'Выберите язык:',
            choices: ['Русский', 'English', 'Español'],
        },
    ]);

    const userData = await fs.readJson(config.USER_DATA_PATH);
    userData.language = language;
    await fs.writeJson(config.USER_DATA_PATH, userData, { spaces: 2 });
    console.log(chalk.green('Язык интерфейса установлен.'));
};

const toggle2FA = async () => {
    const userData = await fs.readJson(config.USER_DATA_PATH);
    if (userData.twoFA) {
        const { disable } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'disable',
                message: 'Хотите выключить двухфакторную аутентификацию?',
                default: false,
            },
        ]);

        if (disable) {
            userData.twoFA = false;
            await fs.writeJson(config.USER_DATA_PATH, userData, { spaces: 2 });
            console.log(chalk.green('2FA отключена.'));
        }
    } else {
        const { enable } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enable',
                message: 'Хотите включить двухфакторную аутентификацию?',
                default: false,
            },
        ]);

        if (enable) {
            userData.twoFA = true;
            await fs.writeJson(config.USER_DATA_PATH, userData, { spaces: 2 });
            console.log(chalk.green('2FA включена.'));
        }
    }
};

const setTransactionLimit = async () => {
    const settings = await loadSettings();
    const { limit } = await inquirer.prompt([
        {
            type: 'input',
            name: 'limit',
            message: 'Введите максимальную сумму в CELO (или USDT в формате: 00.00 USDT):',
        },
    ]);

    settings.transactionLimit = limit;
    await saveSettings(settings);
    console.log(chalk.green('Предельная сумма установлена.'));
};

const resetSettings = async () => {
    const userData = await fs.readJson(config.USER_DATA_PATH);
    const { password } = await inquirer.prompt([
        {
            type: 'password',
            name: 'password',
            message: 'Введите пароль:',
            mask: '*',
            validate: input => verifyPassword(input, userData.password) || 'Неверный пароль.',
        },
    ]);

    const code = generate2FACode();
    await sendEmail(userData.email, 'Код подтверждения сброса настроек', `Ваш код: ${code}`);

    const { inputCode } = await inquirer.prompt([
        {
            type: 'input',
            name: 'inputCode',
            message: 'Введите код с почты:',
            validate: input => input === code || 'Неверный код.',
        },
    ]);

    await saveSettings({});
    console.log(chalk.green('Настройки сброшены до заводских.'));
};

module.exports = {
    handleSettings,
};