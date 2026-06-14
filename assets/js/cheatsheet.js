mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose'
});

const sidebar = document.getElementById("sidebar");

function toggleSidebar() {
  sidebar.classList.toggle("collapsed");
}

if (window.innerWidth < 768) {
  sidebar.classList.add("collapsed");
}

document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 768) {
      sidebar.classList.add("collapsed");
    }
  });
});

function copyCode(button) {
  const codeBlock = button.parentElement;
  const pre = codeBlock.querySelector('pre');
  const code = pre.textContent;

  navigator.clipboard.writeText(code).then(() => {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy code');
  });
}
