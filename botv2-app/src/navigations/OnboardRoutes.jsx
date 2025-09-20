import { Routes, Route, Navigate } from 'react-router-dom';

import Configs from '../pages/Configs';

const OnboardRoutes = () => {
  return (
    <Routes>
      <Route path="/configs" element={<Configs />} />
      <Route path="*" element={<Navigate to="/configs" replace />} />
    </Routes>
  );
};

export default OnboardRoutes;
