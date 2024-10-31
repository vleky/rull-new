// src/index.js

const fs = require('fs-extra');
const chalk = require('chalk');
const inquirer = require('inquirer');
const config = require('./config/config');
const { delay, generate2FACode } = require('./utils/helpers');
const { hashPassword, verifyPassword } = require('./utils/encryption'); // Исправленный импорт
const { sendEmail } = require('./utils/emailService');
const { mainMenu } = require('./mainMenu');

const initUserData = async () => {
    if (!await fs.pathExists(config.USER_DATA_PATH)) {
        console.log('Hello! Select your language:');
        const { language } = await inquirer.prompt([
            {
                type: 'list',
                name: 'language',
                message: 'Choose your language:',
                choices: ['English', 'Русский', 'Español'],
                default: 'English',
            }
        ]);

        if (language !== 'Русский') {
            console.log('Currently only Russian language is supported.');
            process.exit(0);
        }

        const { password, confirmPassword } = await inquirer.prompt([
            {
                type: 'password',
                name: 'password',
                message: 'Создайте обязательный пароль для входа (мин. 8 символов):',
                mask: '*',
                validate: input => input.length >= 8 || 'Пароль должен быть не менее 8 символов.',
            },
            {
                type: 'password',
                name: 'confirmPassword',
                message: 'Подтвердите пароль:',
                mask: '*',
                validate: (input, answers) => input === answers.password || 'Пароли не совпадают.',
            },
        ]);

        const { enable2FA } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enable2FA',
                message: 'Хотите настроить 2FA?',
                default: false,
            },
        ]);

        let email = '';
        let emailNotifications = false;

        if (enable2FA) {
            ({ email } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'email',
                    message: 'Введите вашу почту:',
                    validate: input => /^\S+@\S+\.\S+$/.test(input) || 'Введите корректный email.',
                },
            ]));

            ({ emailNotifications } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'emailNotifications',
                    message: 'Хотите получать информацию о выполняемых транзакциях с вашими кошельками на почту?',
                    default: false,
                },
            ]));
        }

        const hashedPassword = hashPassword(password);

        const userData = {
            language,
            password: hashedPassword,
            twoFA: enable2FA,
            email,
            emailNotifications,
        };

        await fs.writeJson(config.USER_DATA_PATH, userData, { spaces: 2 });
        console.log(chalk.green('Добро пожаловать!'));
        await delay(2000);
    }
};

const login = async () => {
    console.log(chalk.blue('Здравствуйте! Введите пароль:'));
    const { password } = await inquirer.prompt([
        {
            type: 'password',
            name: 'password',
            message: 'Пароль:',
            mask: '*',
            validate: input => input.length >= 8 || 'Пароль должен быть не менее 8 символов.',
        },
    ]);

    if (!await fs.pathExists(config.USER_DATA_PATH)) {
        console.log(chalk.red('Пользовательские данные не найдены.'));
        process.exit(0);
    }

    const userData = await fs.readJson(config.USER_DATA_PATH);
    if (!verifyPassword(password, userData.password)) {
        console.log(chalk.red('Неверный пароль.'));
        process.exit(0);
    }

    // Если включено 2FA
    if (userData.twoFA) {
        const code = generate2FACode();
        await sendEmail(userData.email, 'Код подтверждения', `Ваш код: ${code}`);

        const { inputCode } = await inquirer.prompt([
            {
                type: 'input',
                name: 'inputCode',
                message: 'Укажите код, который пришел к вам на почту:',
                validate: input => input === code || 'Неверный код.',
            },
        ]);
    }

    await mainMenu();
};

const initApp = async () => {
    await fs.ensureDir(config.DATA_DIR);
    await fs.ensureDir(config.WALLETS_DIR);
    await fs.ensureDir(config.TRANSACTIONS_DIR);
    await initUserData();
    await login();
};

initApp();
