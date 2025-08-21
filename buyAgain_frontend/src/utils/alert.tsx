import { useAlert } from '../hooks/useAlert';

const AlertContainer = () => {
  const { alert, hideAlert } = useAlert();

  if (!alert) return null;

  const alertClasses = {
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <div
      className={`fixed inset-0 z-50 mx-auto flex h-[30px] w-[70%] items-center justify-center rounded-sm px-8 py-10 ${alertClasses[alert.type]}`}
      role="alert"
    >
      <div className="flex justify-center">
        <span>{alert.message}</span>
        <button
          onClick={hideAlert}
          className="ml-10 text-current opacity-75 hover:opacity-100"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default AlertContainer;
