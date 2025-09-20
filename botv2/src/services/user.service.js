import api from './api';

export const getMe = () => api.get('/api/v1/me');

export const updateConfigs = ({ addressConfig, telegramConfig, betConfig }) =>
  api.put('/api/v1/me/configs', { addressConfig, telegramConfig, betConfig });

export const sendMessage = ({ text }) =>
  api.post('/api/v1/me/messages', { text });

export const getPositions = ({ status, page, limit }) =>
  api.get('/api/v1/me/positions', { params: { status, page, limit } });

export const upsertPosition = (data) => api.put('/api/v1/me/positions', data);

export const updateStatus = ({ status }) =>
  api.put('/api/v1/me/status', { status });
