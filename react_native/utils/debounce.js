export function debounce(function_, timeout = 300) {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      function_.apply(this, args);
    }, timeout);
  };
}
