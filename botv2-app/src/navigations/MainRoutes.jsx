import { Routes, Route, Navigate } from 'react-router-dom';

import Home from '../pages/Home';
import Configs from '../pages/Configs';

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/configs" element={<Configs />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default MainRoutes;
