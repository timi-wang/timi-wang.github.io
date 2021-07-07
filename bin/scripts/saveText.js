const config = require("../../fonts/config.json");
const path = require('path');
const opentype = require('opentype.js');
const fs = require('fs');

const fontDir = path.join(__dirname, '../../fonts');
const allCharacters = new Set(config.texts.split(''));
exports.allCharacters = allCharacters;

exports.parseCharacters = (str) => {
  const newSet = new Set(str.match(/[\u4e00-\u9fa5]/g));
  for (let c of newSet) {
    allCharacters.add(c);
  }
}

exports.generateFonts = (characters = allCharacters, fonts = config.fonts) => {
  const glyphs = Array.from(characters).join('');

  fonts.forEach(f => {
    const font = opentype.loadSync(path.join(fontDir, 'full', f));
    const postScriptName = font.getEnglishName('postScriptName');
    const dist = path.join(fontDir, 'subset', f);
    const [familyName, styleName = 'normal'] = postScriptName.split('-');

    const notdefGlyph = font.glyphs.get(0);
    notdefGlyph.name = '.notdef';
    const subGlyphs = [notdefGlyph].concat(font.stringToGlyphs(glyphs));

    const subsetFont = new opentype.Font({
      familyName: familyName,
      styleName: styleName || 'N',
      unitsPerEm: font.unitsPerEm,
      ascender: font.ascender,
      descender: font.descender,
      designer: font.getEnglishName('designer'),
      designerURL: font.getEnglishName('designerURL'),
      manufacturer: font.getEnglishName('manufacturer'),
      manufacturerURL: font.getEnglishName('manufacturerURL'),
      license: font.getEnglishName('license'),
      licenseURL: font.getEnglishName('licenseURL'),
      version: font.getEnglishName('version'),
      description: font.getEnglishName('description'),
      copyright: 'This is a subset font of ' + postScriptName + '. ' + font.getEnglishName('copyright'),
      trademark: font.getEnglishName('trademark'),
      glyphs: subGlyphs
    });

    subsetFont.download(dist);
  });

  config.texts = glyphs;
  fs.writeFileSync(path.join(fontDir, 'config.json'), JSON.stringify(config, null, 2));
}
