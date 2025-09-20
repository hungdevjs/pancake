import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isAddress } from '@ethersproject/address';

import { IconSave } from '../../components/Icons';
import useUserStore from '../../stores/user.store';

const Configs = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const updateUserConfigs = useUserStore((state) => state.updateUserConfigs);
  const updateUserStatus = useUserStore((state) => state.updateUserStatus);
  const [loading, setLoading] = useState(false);

  const { addressConfig, telegramConfig, betConfig, status } = user;
  const [form, setForm] = useState({
    trackingAddress: addressConfig?.trackingAddress || null,
    startBalance: addressConfig?.startBalance || 0,
    telegramBotToken: telegramConfig?.token || null,
    telegramChatId: telegramConfig?.chatId || null,
    fulfillPhaseEndTime: betConfig?.fulfillPhaseEndTime || 30,
    claimPhaseEndTime: betConfig?.claimPhaseEndTime || 10,
    analyzePhaseStartTime: betConfig?.analyzePhaseStartTime || 3,
    minROI: betConfig?.minROI || 3,
    numberOfRoundsToClaim: betConfig?.numberOfRoundsToClaim || 5,
    betAmount: betConfig?.betAmount || 0.001,
    gasMultiplier: betConfig?.gasMultiplier || 3,
    strategy: betConfig?.strategy || 'Mathematics',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const submit = async () => {
    if (loading) return;
    try {
      setLoading(true);

      const {
        trackingAddress,
        startBalance,
        telegramBotToken,
        telegramChatId,
        fulfillPhaseEndTime,
        claimPhaseEndTime,
        analyzePhaseStartTime,
        minROI,
        numberOfRoundsToClaim,
        betAmount,
        gasMultiplier,
        strategy,
      } = form;

      if (!isAddress(trackingAddress))
        throw new Error('Invalid tracking address');
      if (isNaN(startBalance)) throw new Error('Invalid start balance');
      if (isNaN(fulfillPhaseEndTime))
        throw new Error('Invalid fulfill phase end time');
      if (isNaN(claimPhaseEndTime))
        throw new Error('Invalid claim phase end time');
      if (isNaN(analyzePhaseStartTime))
        throw new Error('Invalid analyze phase start time');
      if (isNaN(minROI)) throw new Error('Invalid min ROI');
      if (isNaN(numberOfRoundsToClaim))
        throw new Error('Invalid number of rounds to claim');
      if (isNaN(betAmount)) throw new Error('Invalid bet amount');
      if (isNaN(gasMultiplier)) throw new Error('Invalid gas multiplier');

      const data = {
        addressConfig: {
          trackingAddress,
          startBalance,
        },
        telegramConfig: {
          token: telegramBotToken,
          chatId: telegramChatId,
        },
        betConfig: {
          fulfillPhaseEndTime,
          claimPhaseEndTime,
          analyzePhaseStartTime,
          minROI,
          numberOfRoundsToClaim,
          betAmount,
          gasMultiplier,
          strategy,
        },
      };

      await updateUserConfigs(data);

      toast.success('Updated configs');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const newStatus = status === 'on' ? 'off' : 'on';

      await updateUserStatus({ status: newStatus });

      toast.success(`Turn ${newStatus} bot`);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const groupItems = [
    {
      name: 'Address config',
      items: [
        { field: 'trackingAddress', label: 'Tracking address' },
        { field: 'startBalance', label: 'Start balance' },
      ],
    },
    {
      name: 'Telegram config',
      items: [
        { field: 'telegramBotToken', label: 'Telegram bot token' },
        { field: 'telegramChatId', label: 'Telegram chat ID' },
      ],
    },
    {
      name: 'Bet config',
      items: [
        { field: 'fulfillPhaseEndTime', label: 'Fulfill phase end time' },
        { field: 'claimPhaseEndTime', label: 'Claim phase end time' },
        { field: 'analyzePhaseStartTime', label: 'Analyze phase start time' },
        { field: 'minROI', label: 'Min ROI' },
        { field: 'numberOfRoundsToClaim', label: 'Number of rounds to claim' },
        { field: 'betAmount', label: 'Bet amount' },
        { field: 'gasMultiplier', label: 'Gas multiplier' },
        {
          field: 'strategy',
          label: 'Strategy',
          options: [
            { label: 'Mathematics', label: 'Mathematics' },
            { label: 'Price action', value: 'Price action' },
          ],
        },
      ],
    },
  ];

  const items = [
    { field: 'trackingAddress', label: 'Tracking address' },
    { field: 'startBalance', label: 'Start balance' },
    { field: 'telegramBotToken', label: 'Telegram bot token' },
    { field: 'telegramChatId', label: 'Telegram chat ID' },
    { field: 'fulfillPhaseEndTime', label: 'Fulfill phase end time' },
    { field: 'claimPhaseEndTime', label: 'Claim phase end time' },
    { field: 'analyzePhaseStartTime', label: 'Analyze phase start time' },
    { field: 'minROI', label: 'Min ROI' },
    { field: 'numberOfRoundsToClaim', label: 'Number of rounds to claim' },
    { field: 'betAmount', label: 'Bet amount' },
    { field: 'gasMultiplier', label: 'Gas multiplier' },
    { field: 'strategy', label: 'Strategy' },
  ];

  return (
    <div className="h-dvh p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-[640px] mx-auto max-h-[70vh] overflow-auto p-4 rounded-lg bg-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p
            className="text-white underline text-sm cursor-pointer"
            onClick={() => navigate('/')}
          >
            Back to home
          </p>
          <p className="text-white text-center">Update your configs</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              id="switch"
              type="checkbox"
              className="peer sr-only"
              checked={user.status === 'on'}
              onChange={toggleStatus}
            />
            <label htmlFor="switch" className="hidden"></label>
            <div className="peer h-6 w-11 rounded-xl border border-gray-400 bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:rounded-full peer-focus:ring-green-300"></div>
          </label>
          <p className={status === 'on' ? 'text-green-500' : 'text-red-500'}>
            Bot status: {status.toUpperCase()}
          </p>
        </div>
        {groupItems.map((group) => (
          <div key={group.name} className="rounded-xl bg-gray-950 p-4">
            <div className="pb-4">
              <p className="text-white">{group.name.toUpperCase()}</p>
            </div>
            {group.items.map((item) =>
              item.options ? (
                <div className="flex flex-col gap-1">
                  <label className="block text-sm text-white">
                    {item.label}
                  </label>
                  <select
                    name={item.field}
                    value={form[item.field]}
                    onChange={handleChange}
                    required
                    className="w-full text-white  border-none bg-white/5 px-4 py-2 rounded-lg appearance-none outline-none"
                  >
                    {item.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div key={item.field} className="flex flex-col gap-1">
                  <label className="block text-sm text-white">
                    {item.label}
                  </label>
                  <input
                    name={item.field}
                    placeholder={item.label}
                    disabled={loading}
                    value={form[item.field]}
                    onChange={handleChange}
                    className="w-full border border-gray-800 rounded-lg px-3 py-2 outline-none text-white"
                  />
                </div>
              )
            )}
          </div>
        ))}
        <div>
          <button
            disabled={loading}
            className="w-full px-4 py-2 flex justify-center items-center gap-2 bg-yellow-500 transition duration-200 active:scale-95 hover:bg-yellow-600 disabled:cursor-default disabled:opacity-50 rounded-lg cursor-pointer"
            onClick={submit}
          >
            <IconSave fill="#000000" className="w-5 aspect-square" />
            <p>{loading ? 'Saving...' : 'Save'}</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configs;
