export default function themeInitializer() {
  const theme = localStorage.getItem('theme');

  if (!theme || theme === '"dark"') {
    document.documentElement.classList.add('dark');
  }
}
