// Handle clicks on tool buttons
document.querySelectorAll('.tool-btn, .open-full').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Links handle navigation automatically with target="_blank"
    // Close popup after click
    setTimeout(() => window.close(), 100);
  });
});

