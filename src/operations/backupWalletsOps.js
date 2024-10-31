// src/operations/backupWalletsOps.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');
const config = require('../config/config');

const handleBackupWallets = async () => {
    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Вы хотите создать экспорт всех кошельков в ZIP?',
            default: false,
        },
    ]);

    if (!confirm) {
        console.log(chalk.yellow('Операция отменена.'));
        return;
    }

    const backupFileName = `wallets_backup_${Date.now()}.zip`;
    const backupFilePath = path.join(config.DATA_DIR, backupFileName);

    const output = fs.createWriteStream(backupFilePath);
    const archive = archiver('zip', {
        zlib: { level: 9 },
    });

    output.on('close', () => {
        console.log(chalk.green(`Резервная копия создана: ${backupFileName}`));
    });

    archive.pipe(output);
    archive.directory(config.WALLETS_DIR, false);
    await archive.finalize();
};

module.exports = {
    handleBackupWallets,
};
