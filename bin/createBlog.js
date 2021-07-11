// 将index.md生成正式的index.html，更新data.json和中文字体

if(!process.argv[2]) {
  console.log("dir is needed");
  process.exit(1);
}

const path = require('path');
const {CDN_BASE} = require('./scripts/consts');

const {parseCharacters, generateFonts} = require("./scripts/saveText");
const {getBlogInfo, saveBlogInfo} = require("./scripts/blogUtils");
const {parseMarkdown} = require("./scripts/markdownUtils");
const {createBlogHtml, commonHeaderHtml} = require("./scripts/templateUtils");

let {year, name, blogDir, blogData, blogInfo, mdPath, prev, next} = getBlogInfo(process.argv[2]);
const {mdFile, htmlStr, hash, highlight} = parseMarkdown(mdPath);

if(!blogInfo) {
  const d = new Date();
  blogInfo = {
    hash,
    name,
    timestamp: d.getTime(),
    date: `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}`
  };
  blogData[year].unshift(blogInfo);
} else {
  blogInfo.hash = hash;
}

const ejsData = {
  cdnBase: CDN_BASE,
  highlight,
  headerHtmlStr: commonHeaderHtml,
  title: name.replace(/_/g, " "),
  date: blogInfo.date,
  content: htmlStr,
  headPath: path.join(__dirname, 'templates/head.ejs'),
  prev: prev ? {
    href: `/blog/${year}/${prev.name}`,
    title: prev.name.replace(/_/g, ' ')
  } : undefined,
  next: next ? {
    href: `/blog/${year}/${next.name}`,
    title: next.name.replace(/_/g, ' ')
  } : undefined
};
createBlogHtml(ejsData, path.join(blogDir, 'index.html'));
console.log("html created");

parseCharacters(mdFile);
generateFonts();
console.log("fonts created");

saveBlogInfo();
console.log("blog data saved");


