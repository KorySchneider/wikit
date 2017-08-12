'use strict';

const wiki = require('node-wikipedia');

// Exit if no query
if (process.argv.length <= 2) {
  console.log('No search query, exiting...');
  process.exit(-1);
}

// Get query
const query = (process.argv.length > 3)
  ? process.argv.slice(2, process.argv.length).join(' ')
  : process.argv[2];

// Search wikipedia
wiki.page.data(query, { content: true }, (res) => {
  if (res) {
    res = res.text['*'].split('\n');

    let startIndex, endIndex;
    for (let i=0; i < res.length; i++) {
      if (res[i].startsWith('<div class="mw-parser-output"')) {
        startIndex = i + 1;
      } else if (res[i].startsWith('<div id="toc"')) {
        endIndex = i - 1;
        break;
      }
    }

    let shortRes = [];
    for (let i=startIndex; i < endIndex; i++) {
      if (res[i].startsWith('<p')) {
        shortRes.push(res[i]);
      }
    }
    shortRes = shortRes.join('\n');
    shortRes = shortRes.replace(/<(?:.|\n)*?>/g, ''); // remove HTML
    shortRes = shortRes.replace(/\[[0-9]*\]|\[note [0-9]*\]/g, ''); // remove citation numbers
    //TODO replace html ascii codes
    console.log(shortRes);
  } else {
    console.log('Not found :^(');
  }
});
