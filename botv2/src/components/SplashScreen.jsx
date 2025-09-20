const SplashScreen = () => {
  return (
    <div className="h-dvh flex items-center justify-center">
      <div className="flex space-x-1 justify-center items-center">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div
          className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>
    </div>
  );
};

export default SplashScreen;
