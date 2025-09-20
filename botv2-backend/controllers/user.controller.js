import * as services from '../services/user.service.js';

export const getMe = async (req, res) => {
  try {
    const { userId } = req;
    const data = await services.getMe(userId);

    return res.status(200).send(data);
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
};

export const updateConfigs = async (req, res) => {
  try {
    const { userId } = req;
    const { addressConfig, telegramConfig, betConfig } = req.body;
    await services.updateConfigs(userId, {
      addressConfig,
      telegramConfig,
      betConfig,
    });

    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { userId } = req;
    const { text } = req.body;
    await services.sendMessage(userId, { text });

    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
};

export const getPositions = async (req, res) => {
  try {
    const { userId } = req;
    const { page, limit, type } = req.query;
    const data = await services.getPositions(userId, {
      page: Number(page),
      limit: Number(limit),
      type,
    });

    return res.status(200).send(data);
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
};

export const upsertPosition = async (req, res) => {
  try {
    const { userId } = req;
    await services.upsertPositions(userId, req.body);

    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { userId } = req;
    const { status } = req.body;
    await services.updateStatus(userId, { status });
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
};
