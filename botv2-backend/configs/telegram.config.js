import TelegramBot from 'node-telegram-bot-api';

export const sendMessage = async ({ token, chatId, text }) => {
  try {
    const bot = new TelegramBot(token);
    await bot.sendMessage(chatId, text);
  } catch (err) {
    console.error(`[sendNotification] error ${err.message}`, err);
  }
};
