import SplashScreen from '../components/SplashScreen';
import AuthRoutes from './AuthRoutes';
import MainRoutes from './MainRoutes';
import OnboardRoutes from './OnboardRoutes';
import useUserStore from '../stores/user.store';
import useUser from '../hooks/useUser';

const Navigations = () => {
  const initialized = useUserStore((state) => state.initialized);
  const user = useUserStore((state) => state.user);

  useUser();

  if (!initialized) return <SplashScreen />;

  if (!user) return <AuthRoutes />;

  if (!user.onboarded) return <OnboardRoutes />;

  return <MainRoutes />;
};

export default Navigations;
