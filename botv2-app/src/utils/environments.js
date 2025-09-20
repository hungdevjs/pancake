const environments = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL,

  PRIVY_APP_ID: import.meta.env.VITE_PRIVY_APP_ID,
  NETWORK_ID: import.meta.env.VITE_NETWORK_ID,

  PANCAKE_BNB_PREDICTION_CONTRACT_ADDRESS: import.meta.env
    .VITE_PANCAKE_BNB_PREDICTION_CONTRACT_ADDRESS,
};

export default environments;
