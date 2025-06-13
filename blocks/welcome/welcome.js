export default function decorate(block) {
  const firstDiv = block.querySelector(':scope div:nth-child(1)');
  const secondDiv = block.querySelector(':scope div:nth-child(2)');
  if (!secondDiv) return;

  const welcomeH1 = firstDiv.querySelector('h1');
  if (welcomeH1) {
    welcomeH1.classList.add('typewriter');
  }

  const welcomeBtn = secondDiv.querySelector('p');
  if (welcomeBtn) {
    welcomeBtn.classList.add('pod-btn');
  }

  welcomeBtn.addEventListener('click', () => {
    const target = document.querySelector('.columns.select-pods');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      target.classList.add('highlight-target');

      setTimeout(() => {
        target.classList.remove('highlight-target');
      }, 2000);
    }
  });

  welcomeH1.addEventListener('animationend', (e) => {
    if (e.animationName === 'typing') {
      welcomeH1.classList.add('done');
    }
  });
}
