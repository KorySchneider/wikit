#!/usr/bin/env node
'use strict';

const path = require('path'),
      Configstore = require('configstore'),
      pkg = require(path.join(__dirname, '/package.json'));

const conf = new Configstore(pkg.name, { lang: 'en' });

let args = process.argv.slice(2, process.argv.length);

// If no arguments, print usage and exit
if (args.length == 0) {
  console.log(`\
Usage: $ wikit <query> [-flags]

Quotes are not required for multi-word queries.
Flags can be placed anywhere.

  Flags:

    -lang <LANG>         Specify language;
    -l <LANG>            LANG is an HTML ISO language code

    -b                   Open Wikipedia article in browser

    --browser <BROWSER>  Open article in specific BROWSER

    -d                   Open disambiguation page in browser

    -line <NUM>          Set line wrap length to NUM (minimum 15)

  Examples:

    $ wikit nodejs

    $ wikit empire state building

    $ wikit linux -b

    $ wikit -lang es jugo`);

  process.exit(-1);
}

// Flags
let _openInBrowser = false;
let _browser = null;
let _lineLength = process.stdout.columns - 10; // Terminal width - 10
let _lang = conf.get('lang');

if (_lineLength > 80) {
  // Keep it nice to read in large terminal windows
  _lineLength = 80;
} else if (_lineLength < 15) {
  _lineLength = 15;
}

// Parse flags
for (let i=0; i < args.length; i++) {
  if (args[i].startsWith('-')) {
    switch(args[i]) {
      case '-b':
        _openInBrowser = true;
        args.splice(i, 1); // remove flag from args array
        break;

      case '--browser':
        _openInBrowser = true;
        _browser = args[i + 1];
        args.splice(i, 2);
        break;

      case '-line':
        let newLength = parseInt(args[i + 1]);
        if (newLength) {
          _lineLength = newLength;
          if (_lineLength < 15) {
            _lineLength = 15; // things break if length is less than 15
          }
          args.splice(i, 2); // remove flag and value
        } else {
          console.log(`Invalid line length: ${args[i + 1]}`);
          process.exit(-1);
        }
        break;

      case '-l':
      case '-lang':
        let validLang = false;
        let languages = JSON.parse(
          require('fs').readFileSync(path.join(__dirname, 'data/languages.json'))
        );

        Object.keys(languages).forEach(l => {
          if (l == args[i + 1]) validLang = true;
        });

        if (validLang) {
          _lang = args[i + 1];
        } else {
          console.log(`Invalid language: ${args[i + 1]}\nPlease use a two-character language code, e.g. 'en' for English.`);
          process.exit(-1);
        }

        args.splice(i, 2); // remove flag and value
        break;

      case '-d':
        args.splice(i, 1); // remove flag
        args.push('(disambiguation)');
        _openInBrowser = true;
        break;
    }
  }
}

const query = args.join(' ');
if (query == '') {
  console.log('Please enter a search query');
  process.exit(-1);
}

// Execute
if (_openInBrowser) openInBrowser();
else printWikiSummary(_lang);


// ===== Functions =====

function printWikiSummary() {
  let spinner = require('ora')({ text: 'Searching...', spinner: 'dots4' }).start();

  require('node-wikipedia').page.data(query, { content: true, lang: _lang }, (res) => {
    spinner.stop();
    if (res) {
      res = res.text['*'].split('\n');

      // Find summary text (text above the TOC that isn't a note)
      let summaryLines = [];
      let inSummary = false;
      for (let i=0; i < res.length; i++) {
        let line = res[i];

        if (inSummary && line.includes('="toc')) {
          break;
        }

        if (line.toLowerCase().includes('<b>', query.toLowerCase)) {
          inSummary = true;
        }

        if (inSummary) {
          summaryLines.push(line);
        }
      }

      let output = summaryLines.join('\n');

      output = require('html2plaintext')(output)
        .replace(/\[[0-9a-z]*\]|\[note [0-9a-z]*\]/g, '') // remove citation text
        .replace(/listen\)/g, ''); // remove 'listen' button text

      // Check if output is summary
      if (output.includes('may refer to:')) {
        console.log('Ambiguous results, opening in browser...');
        openInBrowser();
      } else if (output.trim() == '') {
        console.log('Error, opening in browser...');
        openInBrowser();
      }

      // Output summary text
      console.log(lineWrap(output, _lineLength));

    } else { // No response
      console.log('Not found :^(');
    }
  });
}

function lineWrap(txt, max) {
  let formattedText = ' ';
  let text = txt.trim();
  text = text.replace(/\n/g, ' '); // replace newlines with spaces

  while (text.length > max) {
    let nextSpaceIndex = -1;
    for (let i=max; i < text.length; i++) {
      if (text[i] == ' ') {
        nextSpaceIndex = i;
        break;
      }
    }
    if (nextSpaceIndex < 0) nextSpaceIndex = max; // No space char was found

    formattedText += text.slice(0, nextSpaceIndex) + '\n';
    text = text.slice(nextSpaceIndex, text.length);
  }
  // add remaining text
  formattedText += (text.startsWith(' '))
    ? text
    : ' ' + text;

  return formattedText;
}

function openInBrowser() {
  const opn = require('opn');
  const format = (s) => { return s.trim().replace(/ /g, '+'); }; // replace spaces with +'s
  let url = 'https://wikipedia.org/w/index.php?title=Special:Search&search=';
  url += format(query);

  if (_browser)
    opn(url, { app: _browser });
  else
    opn(url);

  process.exit(0);
}
