import { useEffect, useRef, useState } from 'react';

import { useWallets } from '@privy-io/react-auth';
import { formatEther } from '@ethersproject/units';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';

import useUserStore from '../stores/user.store';
import PancakePredictionABI from '../assets/PancakePrediction.abi.json';
import environments from '../utils/environments';
import { getCryptoPriceInUSD } from '../services/crypto.service';

const { PANCAKE_BNB_PREDICTION_CONTRACT_ADDRESS } = environments;

const useSmartContract = () => {
  const user = useUserStore((state) => state.user);
  const { wallets } = useWallets();
  const [currentRound, setCurrentRound] = useState(null);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [userBalance, setUserBalance] = useState(0);

  const embedded = wallets.find((w) => w.walletClientType === 'privy');

  const web3ProviderRef = useRef();
  const getWeb3Provider = async () => {
    try {
      if (web3ProviderRef.current) return web3ProviderRef.current;

      if (!embedded) throw new Error('cannot find embedded wallet');

      const provider = await embedded.getEthereumProvider();
      const web3Provider = new Web3Provider(provider, 56);
      web3ProviderRef.current = web3Provider;

      return web3Provider;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const getContract = async () => {
    const web3Provider = await getWeb3Provider();

    const contract = new Contract(
      PANCAKE_BNB_PREDICTION_CONTRACT_ADDRESS,
      PancakePredictionABI.abi,
      web3Provider
    );

    return contract;
  };

  const getRound = async (contract, epoch) => {
    const currentRound = await contract.rounds(epoch);

    const {
      lockTimestamp,
      closeTimestamp,
      totalAmount: rawTotalAmount,
      bullAmount: rawBullAmount,
      bearAmount: rawBearAmount,
      oracleCalled,
      lockPrice: rawLockPrice,
      closePrice: rawClosePrice,
    } = currentRound;
    const now = Date.now();

    const isClosed = now >= closeTimestamp.toNumber() * 1_000;
    const isLocked = now >= lockTimestamp.toNumber() * 1_000;

    const lockPrice = Number(rawLockPrice.toString());
    const closePrice = Number(rawClosePrice.toString());

    const totalAmount = Number(formatEther(rawTotalAmount));
    const bullAmount = Number(formatEther(rawBullAmount));
    const bearAmount = Number(formatEther(rawBearAmount));

    const bullPayoutRatio = bullAmount ? totalAmount / bullAmount : 0;
    const bearPayoutRatio = bearAmount ? totalAmount / bearAmount : 0;

    const openTimeLeftInSeconds = Math.floor(
      (lockTimestamp.toNumber() * 1_000 - now) / 1_000
    );

    return {
      epoch,
      isClosed,
      isLocked,
      totalAmount,
      bullAmount,
      bearAmount,
      bullPayoutRatio,
      bearPayoutRatio,
      oracleCalled,
      lockPrice,
      closePrice,
      openTimeLeftInSeconds,
      lockTime: lockTimestamp.toNumber() * 1_000,
    };
  };

  const getCurrentRound = async () => {
    const contract = await getContract();

    const rawEpoch = await contract.currentEpoch();
    const epoch = rawEpoch.toNumber();
    const round = await getRound(contract, epoch);
    setCurrentRound(() => round);
  };

  const getBNBPrice = async () => {
    const res = await getCryptoPriceInUSD('bnb');
    setBnbPrice(Number(res.data.data.rates.USD));
  };

  const getUserBalance = async () => {
    const { trackingAddress } = user?.addressConfig || {};
    if (!trackingAddress) return;

    const web3Provider = await getWeb3Provider();
    if (!web3Provider) return;

    const rawBalance = await web3Provider.getBalance(trackingAddress);
    const balance = formatEther(rawBalance);
    setUserBalance(Number(balance));
  };

  const tick = async () => {
    try {
      await Promise.all([getCurrentRound(), getBNBPrice(), getUserBalance()]);
    } catch (err) {
      console.error(err.message);
    }
  };

  let interval = useRef();
  const removeInterval = () => {
    if (interval.current) {
      clearInterval(interval.current);
    }
  };

  useEffect(() => {
    removeInterval();

    tick();
    interval.current = setInterval(tick, 5_000);

    return () => removeInterval();
  }, [embedded?.address]);

  const userUSDBalance = userBalance * bnbPrice;
  const netProfit = userBalance - (user?.addressConfig?.startBalance || 0);
  const netUSDProfit = netProfit * bnbPrice;

  return { currentRound, userBalance, userUSDBalance, netProfit, netUSDProfit };
};

export default useSmartContract;
