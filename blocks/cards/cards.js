import { createOptimizedPicture } from '../../scripts/aem.js';

function typeWriterEffect(element, text, speed = 100) {
  // Clear any existing timeouts for this element
  if (element.typewriterTimeout) {
    clearTimeout(element.typewriterTimeout);
  }

  element.textContent = '';
  element.style.borderRight = '2px solid #00ff00';
  let i = 0;

  function typeChar() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i += 1;
      element.typewriterTimeout = setTimeout(typeChar, speed + Math.random() * 50);
    } else {
      element.typewriterTimeout = setTimeout(() => {
        element.style.borderRight = 'none';
      }, 1000);
    }
  }

  typeChar();
}

export default function decorate(block) {
  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'carousel-container';

  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'carousel-wrapper';

  const ul = document.createElement('ul');
  ul.className = 'carousel-track';

  let currentIndex = 0;
  const cards = [];

  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    li.className = 'carousel-slide';
    li.setAttribute('data-index', index);

    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
        const textElements = div.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
        textElements.forEach((el) => {
          if (el.tagName.toLowerCase().startsWith('h')) {
            // For headings, keep text visible and mark as title
            el.classList.add('card-title');
          } else {
            // For paragraphs, prepare for typing effect
            el.setAttribute('data-original-text', el.textContent);
            el.textContent = '';
            el.classList.add('card-description');
          }
        });
      }
    });

    cards.push(li);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(
    createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
  ));

  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-btn carousel-prev';
  prevBtn.innerHTML = '&#8249;';
  prevBtn.setAttribute('aria-label', 'Previous card');

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-btn carousel-next';
  nextBtn.innerHTML = '&#8250;';
  nextBtn.setAttribute('aria-label', 'Next card');

  function resetAllAnimations() {
    // Stop all existing typing animations
    cards.forEach((card) => {
      const descriptionElements = card.querySelectorAll('.card-description[data-original-text]');
      descriptionElements.forEach((el) => {
        if (el.typewriterTimeout) {
          clearTimeout(el.typewriterTimeout);
        }
        el.textContent = '';
        el.style.borderRight = 'none';
      });
    });
  }

  function updateCarousel() {
    ul.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Reset all animations first
    resetAllAnimations();

    // Start new animations for current card
    const currentCard = cards[currentIndex];
    const descriptionElements = currentCard.querySelectorAll('.card-description[data-original-text]');

    descriptionElements.forEach((el, index) => {
      const originalText = el.getAttribute('data-original-text');
      setTimeout(() => {
        typeWriterEffect(el, originalText, 30);
      }, index * 100);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  }

  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  carouselWrapper.appendChild(ul);
  carouselContainer.appendChild(prevBtn);
  carouselContainer.appendChild(carouselWrapper);
  carouselContainer.appendChild(nextBtn);

  block.replaceChildren(carouselContainer);

  updateCarousel();
}
