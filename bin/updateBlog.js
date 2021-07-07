const blogData = require("../blog/data.json");
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const md5 = crypto.createHash('md5');
const newData = {};
const blogDir = path.join(__dirname, "../blog");

const getOldFileInfo = (oldArr, name) => {
  if(!oldArr || !Array.isArray(oldArr)) return undefined;
  let file = oldArr.filter(o => o.name === name);
  return file.length ? file[0] : undefined;
}

const yearDirs = fs.readdirSync(blogDir).filter(name => name.match(/^\d{4}$/));
yearDirs.forEach(y => {
  const newArr = [];
  const oldArr = blogData[y];
  const yearDir = path.join(blogDir, y);
  const postDirs = fs.readdirSync(yearDir);

  postDirs.forEach(postName => {
    const mdPath = path.join(yearDir, postName, 'index.md');
    const mdFile = fs.readFileSync(mdPath);
    if(!mdFile) {
      console.log('no md file for', mdPath);
      return;
    }

    const hash = md5.update(mdFile).digest('hex');
    const oldFileInfo = getOldFileInfo(oldArr, postName);
    const newFileInfo = {...oldFileInfo, hash, name: postName};

    // 日期显示以timestamp为准
    if(!newFileInfo.timestamp) {
      newFileInfo.timestamp = Date.now();
    }
    const d = new Date(newFileInfo.timestamp);
    newFileInfo.date = `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}`;

    newArr.push(newFileInfo);
  });

  newData[y] = newArr.sort((a, b) => a.timestamp - b.timestamp);
});

const newJson = JSON.stringify(newData, null, 2);
fs.writeFileSync(path.join(blogDir, 'data.json'), newJson);

