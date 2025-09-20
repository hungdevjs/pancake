import { useRef, useEffect, useState } from 'react';
import { toast } from 'sonner';

import useUserStore from '../stores/user.store';

const usePosition = () => {
  const [status, setStatus] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);

  const positions = useUserStore((state) => state.positions);
  const getUserPositions = useUserStore((state) => state.getUserPositions);

  const getPositions = async () => {
    try {
      await getUserPositions({ status, page, limit });
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const interval = useRef();
  const removeInterval = () => {
    if (interval.current) {
      clearInterval(interval.current);
    }
  };

  useEffect(() => {
    removeInterval();

    interval.current = setInterval(getPositions, 2_000);

    return () => removeInterval();
  }, [page, status, limit]);

  const { items, total } = positions;

  return {
    items,
    total,
    page,
    setPage,
    limit,
    status,
    setStatus,
  };
};

export default usePosition;
