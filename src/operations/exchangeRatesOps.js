// src/operations/exchangeRatesOps.js

const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const config = require('../config/config');

const displayExchangeRates = async () => {
    try {
        const spinner = ora('Получение курсов валют...').start();
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
            headers: {
                'X-CMC_PRO_API_KEY': config.COINMARKETCAP_API_KEY,
            },
            params: {
                symbol: 'BTC,ETH,CELO,USDT',
                convert: 'USD',
            },
        });
        spinner.stop();

        const data = response.data.data;
        console.log(chalk.green('\nТекущие стоимости валюты:'));
        for (const symbol of ['BTC', 'ETH', 'CELO', 'USDT']) {
            console.log(`- ${data[symbol].name} (${symbol}): $${data[symbol].quote.USD.price.toFixed(2)}`);
        }
    } catch (error) {
        console.error(chalk.red('Ошибка при получении курсов валют:', error.message));
    }
};

module.exports = {
    displayExchangeRates,
};