const ejs = require('ejs');
const path = require("path");
const fs = require('fs');

const templateDir = path.join(__dirname, '../templates');
const blogTplStr = fs.readFileSync(path.join(templateDir, 'blog.ejs'), 'utf8');
const blogTpl = ejs.compile(blogTplStr);

const headerHtml = fs.readFileSync(path.join(__dirname, '../../common/header.html'), 'utf8');

exports.commonHeaderHtml = headerHtml;
exports.createBlogHtml = (data, dist) => {
  const html = blogTpl(data);
  if(dist) {
    fs.writeFileSync(dist, html);
  }
  return html;
};
