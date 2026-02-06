// анимация кнопки при наведении

function handleButtonHover() {
  document.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      anime({
        targets: btn,
        scale: 1.05,
        duration: 200,
        easing: 'easeOutQuad',
      });
    });

    btn.addEventListener('mouseleave', () => {
      anime({
        targets: btn,
        scale: 1,
        duration: 200,
        easing: 'easeOutQuad',
      });
    });
  });
}

handleButtonHover();

// пояление заголовков

function fadeTitles() {
  document.querySelectorAll('.fade-text').forEach((elem) => {
    anime({
      targets: elem,
      opacity: 1,
      translateY: 0,
      duration: 1200,
      easing: 'easeOutExpo',
    });
  });
}

fadeTitles();

// пишушийся текст

function typingText() {
  document.querySelectorAll('.typewriter').forEach((elem) => {
    const text = elem.textContent;
    elem.textContent = '';

    anime({
      targets: elem,
      textContent: [0, text.length],
      round: 1,
      duration: 2000,
      easing: 'linear',
      update: (anim) => {
        elem.textContent = text.slice(0, anim.animations[0].currentValue);
      },
    });
  });
}

typingText();

// анимация нажатия кнопки

function handleButtonClick() {
  document.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      anime({
        targets: btn,
        scale: [1, 0.9, 1],
        duration: 250,
        easing: 'easeInOutQuad',
      });
    });
  });
}

handleButtonClick();

// текст с эфектом волны

function textWave() {
  const wave = document.querySelector('.wave-text');
  const letters = wave.textContent.split('');
  wave.innerHTML = letters
    .map((l) => `<span class="letter">${l}</span>`)
    .join('');

  anime({
    targets: '.wave-text .letter',
    translateY: [20, 0],
    opacity: [0, 1],
    delay: anime.stagger(60),
    easing: 'easeOutExpo',
  });
}
