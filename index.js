#!/usr/bin/env node
'use strict';

const wiki = require('node-wikipedia');

let args = process.argv.slice(2, process.argv.length);

// Exit and print usage if no arguments
if (args.length == 0) {
  console.log(`\
Usage: $ wikit <query> [-flags]

Quotes are not required for multi-word queries.
Flags can be placed anywhere.

  Flags:

    -b    Open in browser

  Examples:

    $ wikit nodejs

    $ wikit empire state building

    $ wikit linux -b`);

  process.exit(-1);
}


// Flags
let openInBrowser = false;

// Parse flags
for (let i=0; i < args.length; i++) {
  if (args[i].startsWith('-')) {
    switch(args[i]) {
      case '-b':
        openInBrowser = true;
        args.splice(i, 1);
        break;
    }
  }
}

// Get query
const query = args.join(' ');

// Open in browser if instructed
if (openInBrowser) {
  let url = 'https://wikipedia.org/w/index.php?title=Special:Search&search='
  let format = (s) => {
    s = s.replace(/ /g, '+') // replace spaces with +'s
    return s.trim();
  }
  require('opn')(url + format(query));
  process.exit(0);
}

// Scrape wikipedia
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

    // Execute
    if (openInBrowser) {
    } else {
      console.log(lineWrap(shortRes, 80));
    }
  } else {
    console.log('Not found :^(');
  }
});

function lineWrap(txt, max) {
  // txt: text to format
  // max: max line length (approx)

  let formattedText = '';
  let text = txt.replace(/\n/g, ''); // remove newline characters

  while (text.length > max) {
    // Find next space after max
    let i = max;
    while (text[i] !== ' ') {
      i++;
    }
    // Append line to formattedText and remove it from text
    formattedText += text.slice(0, i) + '\n';
    text = text.slice(i + 1, text.length);
  }

  return formattedText;
}
