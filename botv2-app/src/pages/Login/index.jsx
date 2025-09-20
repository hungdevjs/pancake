import { usePrivy } from '@privy-io/react-auth';

const Login = () => {
  const { login } = usePrivy();

  return (
    <div className="h-dvh flex items-center justify-center">
      <button
        className="px-6 py-2 bg-yellow-400 transition duration-200 active:scale-95 hover:bg-yellow-500 rounded-lg cursor-pointer"
        onClick={login}
      >
        <p className="font-bold">Login</p>
      </button>
    </div>
  );
};

export default Login;
