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
      className={`fixed inset-x-1/2 top-4 z-50 w-[70%] max-w-3xl -translate-x-1/2 transform rounded-sm px-6 py-3 shadow-lg ${alertClasses[alert.type]}`}
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
