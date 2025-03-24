import JSZip from 'jszip';

interface ExportContentProps {
  css: string;
  html: string;
  js: string;
}

export const exportContent = ({ css, html, js }: ExportContentProps) => {
  const zip = new JSZip();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>jsPlaygroundDev</title>
      <link rel="stylesheet" href="styles.css">
    </head>
    <body>
      ${html}
      <script src="script.js"></script>
    </body>
    </html>
      `;

  zip.file('index.html', htmlContent);
  zip.file('styles.css', css);
  zip.file('script.js', js);

  zip.generateAsync({ type: 'blob' }).then((content) => {
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jsPlaygroundDev.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
};
