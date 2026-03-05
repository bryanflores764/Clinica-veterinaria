const toggle = document.querySelector('.menu-toggle');
const backdrop = document.querySelector('.sidebar-backdrop');

function setMenu(open){
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}

toggle.addEventListener('click', () => {
  const isOpen = document.body.classList.contains('menu-open');
  setMenu(!isOpen);
});

backdrop.addEventListener('click', () => setMenu(false));

document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') setMenu(false);
});