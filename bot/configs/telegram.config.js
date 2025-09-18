import TelegramBot from 'node-telegram-bot-api';

import environments from '../utils/environments.js';

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = environments;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

export const sendNotification = (type) => async (text) => {
  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, `[${type}] ${text}`);
  } catch (err) {
    console.error(`[sendNotification] error ${err.message}`, err);
  }
};
