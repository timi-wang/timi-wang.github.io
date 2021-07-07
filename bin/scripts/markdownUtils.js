const marked = require("marked");
const md5 = require('crypto').createHash('md5');
const hljs = require('highlight.js');
const {CDN_BASE} = require('./consts');
const fs = require('fs');

marked.use({
  renderer: {
    heading(text, level) {
      const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
      return `
      <h${level}>
        <a class="anchor" href="#${escapedText}"></a>
        ${text}
      </h${level}>
    `;
    },
    code(code, infostring) {
      const language = hljs.getLanguage(infostring) ? infostring : 'plaintext';
      return `<pre><code class="language-${language} hljs">${hljs.highlight(code, { language }).value}</code></pre>`;
    },
    image(href, _, text) {
      href = href.match(/^http(s):\/\//) ? href : `${CDN_BASE}/${href}`;
      return text ? `
          <figure>
              <img src="${href}" alt="${text}">
              <figcaption>${text}</figcaption>
          </figure>
        ` : `<img src="${href}" alt=""/>`;
    }
  }
});

exports.parseMarkdown = (mdPath) => {
  const mdFile = fs.readFileSync(mdPath, 'utf8');
  if(!mdFile) process.exit(1);

  const hash = md5.update(mdFile).digest('hex');
  const htmlStr = marked(mdFile, {breaks: true});
  const highlight = Boolean(htmlStr.match(/<pre><code class="language-/));
  return {mdFile, htmlStr, hash, highlight};
}
