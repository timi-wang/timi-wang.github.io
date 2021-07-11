const blogData = require("../../blog/data.json");
const path = require("path");
const fs = require("fs");

exports.blogData = blogData;
exports.getOldFileInfo = (oldArr, name) => {
  if(!oldArr || !Array.isArray(oldArr)) return undefined;
  let file = oldArr.filter(o => o.name === name);
  return file.length ? file[0] : undefined;
}

exports.getBlogInfo = (blogPath) => {
  const arr = blogPath.split('/');
  if(!arr.length) process.exit(1);
  if(arr[0] === '.') arr.shift();
  const year = arr[1];
  const name = arr[2];
  const blogDir = path.join(__dirname, '../../', blogPath);

  let blogInfo = undefined, prev, next;
  if(Array.isArray(blogData[year])) {
    const l = blogData[year].length;
    for(let i = 0; i < l; i++) {
      if(blogData[year][i].name === name) {
        blogInfo = blogData[year][i];

        // prev post
        if(i > 0) {
          prev = blogData[year][i-1];
        } else {
          const prevYear = String(Number(year) + 1);
          if(Array.isArray(blogData[prevYear])) {
            prev = blogData[prevYear][blogData[prevYear].length-1];
          }
        }
        // next post
        if(i < l-1) {
          next = blogData[year][i+1];
        } else {
          const nextYear = String(Number(year) - 1);
          if(Array.isArray(blogData[nextYear])) {
            next = blogData[nextYear][0];
          }
        }
        break;
      }
    }
  } else {
    blogData[year] = [];
  }

  return {year, name, blogDir, blogData, blogInfo, prev, next, mdPath: path.join(blogDir, 'index.md')};
}

exports.saveBlogInfo = (data = blogData, dist = path.join(__dirname, "../../blog/data.json")) => {
  const newJson = JSON.stringify(data, null, 2);
  fs.writeFileSync(path.join(dist, "../../blog/data.json"), newJson);
}
