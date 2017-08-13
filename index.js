#!/usr/bin/env node
'use strict';

let args = process.argv.slice(2, process.argv.length);

// If no arguments, print usage and exit
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
let browserFlag = false;

// Parse flags
for (let i=0; i < args.length; i++) {
  if (args[i].startsWith('-')) {
    switch(args[i]) {
      case '-b':
        browserFlag = true;
        args.splice(i, 1); // remove flag from args array
        break;
    }
  }
}

const query = args.join(' ');

// Execute
if (browserFlag) openInBrowser();
else printWikiSummary();


// ===== Functions =====

function printWikiSummary() {
  let spinner = require('ora')({ text: 'Searching...', spinner: 'dots4' }).start();

  require('node-wikipedia').page.data(query, { content: true }, (res) => {
    spinner.stop();
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

      shortRes = shortRes.replace(/<(?:.|\n)*?>/g, '') // remove HTML tags
                         .replace(/&#[0-9]*;/g, '') // remove HTML ascii codes TODO encode them instead
                         .replace(/\(listen\)/g, '') // remove 'listen' button text
                         .replace(/\[[0-9]*\]|\[note [0-9]*\]/g, '') // remove citation numbers
                         .replace(/\.[^ ]/g, '. '); // fix space being removed after periods

      if (shortRes.includes('may refer to:')) {
        console.log('Ambiguous results, opening in browser...');
        openInBrowser();
      }

      console.log(lineWrap(shortRes, 75));
    } else {
      console.log('Not found :^(');
    }
  });
}

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
  formattedText += text; // add remaining text

  return formattedText;
}

function openInBrowser() {
  let url = 'https://wikipedia.org/w/index.php?title=Special:Search&search='
  let format = (s) => {
    s = s.replace(/ /g, '+') // replace spaces with +'s
    return s.trim();
  }
  require('opn')(url + format(query));
  process.exit(0);
}
