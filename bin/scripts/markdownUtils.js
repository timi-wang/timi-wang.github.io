const marked = require("marked");
const md5 = require('crypto').createHash('md5');
const hljs = require('highlight.js');
const {CDN_BASE} = require('./consts');
const fs = require('fs');

marked.use({
  renderer: {
    heading(text, level) {
      const escapedText = encodeURIComponent(text);
      return `
      <h${level} id="${escapedText}">
        <a aria-hidden="true" class="anchor" href="#${escapedText}">
            <svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>
        </a>
        ${text}
      </h${level}>
    `;
    },
    code(code, infostring) {
      if(infostring.match(/^callout_/)) { // 高亮块
        const splitArr = infostring.split('_');
        if(splitArr.length < 1) return '';

        const emoji = splitArr[1];
        const color = splitArr.length > 2 ? splitArr[2] : 'orange';
        return `<div class="callout ${color}">
          <span class="emoji">${emoji}</span>
          ${marked(code, {breaks: true})}
        </div>`;
      }
      const language = hljs.getLanguage(infostring) ? infostring : 'plaintext';
      return `<pre><code class="language-${language} hljs">${hljs.highlight(code, { language }).value}</code></pre>`;
    },
    image(href, _, text) {
      const base = process.env.NODE_ENV === 'production' ? CDN_BASE : 'http://localhost:8080';
      href = href.match(/^http(s):\/\//) ? href : `${base}/${href}`;
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
