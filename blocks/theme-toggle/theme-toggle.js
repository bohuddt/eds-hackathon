export default function decorate(block) {
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'theme-toggle-container';

  const toggleButton = document.createElement('button');
  toggleButton.className = 'theme-toggle-button';
  toggleButton.setAttribute('aria-label', 'Toggle dark/light theme');

  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'theme-toggle-icon';

  const toggleText = document.createElement('span');
  toggleText.className = 'theme-toggle-text';

  toggleButton.appendChild(toggleIcon);
  toggleButton.appendChild(toggleText);
  toggleContainer.appendChild(toggleButton);

  // Initialize theme - default to dark
  let isDark = localStorage.getItem('theme') !== 'light';

  function updateTheme() {
    const { body } = document;
    const html = document.documentElement;

    if (isDark) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
      html.classList.add('dark-theme');
      html.classList.remove('light-theme');
      toggleIcon.textContent = '🌙';
      toggleText.textContent = 'Dark';
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
      html.classList.add('light-theme');
      html.classList.remove('dark-theme');
      toggleIcon.textContent = '☀️';
      toggleText.textContent = 'Light';
      localStorage.setItem('theme', 'light');
    }

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('themeChange', {
      detail: { theme: isDark ? 'dark' : 'light' },
    }));
  }

  function toggleTheme() {
    isDark = !isDark;
    updateTheme();
  }

  toggleButton.addEventListener('click', toggleTheme);

  // Initialize theme on load
  updateTheme();

  block.replaceChildren(toggleContainer);
}
