const slides = [...document.querySelectorAll('.slide')];
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const position = document.querySelector('#position');
let index = 0;

function showSlide(target) {
  index = Math.max(0, Math.min(slides.length - 1, target));
  slides.forEach((slide, i) => { slide.hidden = i !== index; });
  previous.disabled = index === 0;
  next.disabled = index === slides.length - 1;
  position.textContent = `${index + 1} / ${slides.length}`;
  window.scrollTo(0, 0);
}

previous.addEventListener('click', () => showSlide(index - 1));
next.addEventListener('click', () => showSlide(index + 1));
document.querySelector('#fullscreen').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') showSlide(index + 1);
  if (event.key === 'ArrowLeft') showSlide(index - 1);
  if (event.key === 'Home') showSlide(0);
  if (event.key === 'End') showSlide(slides.length - 1);
});
showSlide(0);
