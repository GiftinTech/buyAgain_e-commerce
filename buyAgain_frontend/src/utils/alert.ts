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
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.body.insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time * 1000);
};
