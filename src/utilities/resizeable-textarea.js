function resize({ target }) {
  target.style.height = '1px';
  target.style.height = +target.scrollHeight + 'px';
}

export function text_area_resize(el) {
  resize({ target: el });
  // setTimeout(() => {
  //   resize({ target: el });
  // }, 30);
  el.style.overflow = 'hidden';
  el.addEventListener('input', resize);
  el.addEventListener('focus', resize);

  return {
    destroy: () => {
      el.removeEventListener('input', resize);
      el.removeEventListener('focus', resize);
    },
  };
}
