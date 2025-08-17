export const hideAlert = (): void => {
  const el = document.querySelector('.alert');
  if (el && el.parentElement) {
    el.parentElement.removeChild(el);
  }
};

export const showAlert = (
  type: 'success' | 'error',
  msg: string,
  time: number = 7,
): void => {
  hideAlert();

  // Determine styles based on alert type
  const baseClasses =
    'fixed top-0 inset-x-0 left-1/2 transform -translate-x-1/2 z-50';
  const alertClasses = `px-4 py-3 rounded-sm shadow-lg transition-transform duration-200 cursor-default max-w-sm w-full mx-auto`;
  const typeClasses =
    type === 'success'
      ? 'bg-green-200 border-2 border-green-500 text-green-700'
      : 'bg-green-200 border-2 border-red-500 text-red-700';

  const combinedClasses = `${baseClasses} ${alertClasses} ${typeClasses}`;

  const markup = `<div class="${combinedClasses}">${msg}</div>`;
  document.body.insertAdjacentHTML('afterbegin', markup);

  const alertDiv = document.querySelector(
    '.fixed.top-4.inset-x-0.flex.justify-center.z-50 div',
  );
  if (alertDiv) {
    (alertDiv as HTMLElement).classList.add(
      'hover:scale-105',
      'hover:shadow-2xl',
    );
  }

  window.setTimeout(hideAlert, time * 1000);
};
