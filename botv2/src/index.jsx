import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { bsc } from 'wagmi/chains';
import { Toaster } from 'sonner';

import './index.css';
import App from './App';
import environment from './utils/environments';

const { PRIVY_APP_ID } = environment;

const config = {
  loginMethods: ['google'],
  defaultChain: bsc,
  supportedChains: [bsc],
  appearance: {
    theme: 'light',
    accentColor: '#fcd535',
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <PrivyProvider appId={PRIVY_APP_ID} config={config}>
      <App />
      <Toaster />
    </PrivyProvider>
  </BrowserRouter>
);
