// src/operations/nodeManagementOps.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const { exec } = require('child_process');

const handleNodeManagement = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Выберите действие с нодой:',
            choices: [
                '1. Запустить ноду',
                '2. Остановить ноду',
                '3. Перезапустить ноду',
                '4. Проверить статус ноды',
                '5. Вернуться в главное меню',
            ],
        },
    ]);

    switch (action.split('.')[0]) {
        case '1':
            await startNode();
            break;
        case '2':
            await stopNode();
            break;
        case '3':
            await restartNode();
            break;
        case '4':
            await checkNodeStatus();
            break;
        case '5':
            return;
        default:
            console.log(chalk.red('Неверная опция.'));
    }
};

const startNode = async () => {
    exec('systemctl start celo-node', (error, stdout, stderr) => {
        if (error) {
            console.error(chalk.red('Ошибка при запуске ноды:', error.message));
            return;
        }
        console.log(chalk.green('Нода запущена.'));
    });
};

const stopNode = async () => {
    exec('systemctl stop celo-node', (error, stdout, stderr) => {
        if (error) {
            console.error(chalk.red('Ошибка при остановке ноды:', error.message));
            return;
        }
        console.log(chalk.green('Нода остановлена.'));
    });
};

const restartNode = async () => {
    exec('systemctl restart celo-node', (error, stdout, stderr) => {
        if (error) {
            console.error(chalk.red('Ошибка при перезапуске ноды:', error.message));
            return;
        }
        console.log(chalk.green('Нода перезапущена.'));
    });
};

const checkNodeStatus = async () => {
    exec('systemctl status celo-node', (error, stdout, stderr) => {
        if (error) {
            console.error(chalk.red('Ошибка при проверке статуса ноды:', error.message));
            return;
        }
        console.log(chalk.green('Статус ноды:'));
        console.log(stdout);
    });
};

module.exports = {
    handleNodeManagement,
};
