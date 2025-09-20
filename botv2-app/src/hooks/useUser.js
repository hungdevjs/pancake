import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

import useUserStore from '../stores/user.store';

const useUser = () => {
  const { ready, authenticated, user: privyUser } = usePrivy();
  const getUser = useUserStore((state) => state.getUser);
  const reset = useUserStore((state) => state.reset);

  const getUserData = async () => {
    try {
      if (!privyUser) {
        reset();
        return;
      }

      await getUser();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (ready) {
      getUserData();
    }
  }, [ready, authenticated]);
};

export default useUser;
