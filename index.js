'use strict';

let wiki = require("node-wikipedia");

let query = 'empire state building';

wiki.page.data(query, { content: true }, (res) => {
  //console.log(res.text['*']);
  res = res.text['*'].split('\n');

  let startIndex, endIndex;
  // Find start of relevant text
  for (let i=0; i < res.length; i++) {
    if (res[i] == '</table>') {
      startIndex = i + 1;
      break;
    }
  }
  //Find end
  for (let i=0; i < res.length; i++) {
    if (res[i].startsWith('<div id="toc"')) {
      endIndex = i - 1;
      break;
    }
  }

  let shortRes = [];
  for (let i=startIndex; i < endIndex; i++) {
    shortRes.push(res[i]);
  }
  shortRes = shortRes.join('\n');
  shortRes = shortRes.replace(/<(?:.|\n)*?>/g, ''); // remove HTML
  shortRes = shortRes.replace(/\[[0-9]*\]|\[note [0-9]*\]/g, ''); // remove citation numbers
  //TODO replace html ascii codes
  console.log(shortRes);
});
