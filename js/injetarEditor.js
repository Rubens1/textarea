function injetarCSS(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

injetarCSS('textarea/css/styles.css');
injetarCSS('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

function injetarEditor(idDiv) {
  injetarCSS('css/styles.css');
  injetarCSS('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

  fetch('textarea/editor.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById(idDiv).innerHTML = html;
      const script = document.createElement('script');
      script.src = 'textarea/js/script.js';
      script.onload = () => {
        new RichTextEditor();
      };
      document.body.appendChild(script);
    });
}
