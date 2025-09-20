import { create } from 'zustand';

import {
  getMe,
  updateConfigs,
  updateStatus,
  getPositions,
} from '../services/user.service';

const useUserStore = create((set, get) => ({
  initialized: false,
  user: null,
  positions: {
    total: 0,
    items: [],
  },
  setInitialized: (initialized) => set(() => ({ initialized })),
  updateUser: (values) =>
    set((state) => ({ user: { ...state.user, ...values } })),
  getUser: async () => {
    const res = await getMe();
    set(() => ({ user: res.data, initialized: true }));
  },
  updateUserConfigs: async ({ addressConfig, telegramConfig, betConfig }) => {
    await updateConfigs({ addressConfig, telegramConfig, betConfig });
    get().updateUser({ telegramConfig, betConfig, onboarded: true });
  },
  updateUserStatus: async ({ status }) => {
    await updateStatus({ status });
    get().updateUser({ status });
  },
  getUserPositions: async ({ page, limit, status }) => {
    const res = await getPositions({ status, page, limit });
    set(() => ({ positions: res.data }));
  },
  reset: () => set(() => ({ user: null, positions: [], initialized: true })),
}));

export default useUserStore;
