// src/wallet/settings.js

const fs = require('fs-extra');
const config = require('../config/config');

const loadSettings = async () => {
    if (!await fs.pathExists(config.SETTINGS_PATH)) {
        await fs.writeJson(config.SETTINGS_PATH, {});
    }
    return await fs.readJson(config.SETTINGS_PATH);
};

const saveSettings = async settings => {
    await fs.writeJson(config.SETTINGS_PATH, settings, { spaces: 2 });
};

module.exports = {
    loadSettings,
    saveSettings,
};
