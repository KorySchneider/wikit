#!/usr/bin/env node
'use strict';

const path = require('path'),
      Configstore = require('configstore'),
      pkg = require(path.join(__dirname, '/package.json'));

const conf = new Configstore(pkg.name, { lang: 'en' });

let args = process.argv.slice(2);

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

    -d                   Open disambiguation CLI menu

    -D                   Open disambiguation page in browser

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
      // Open in default browser
      case '-b':
        _openInBrowser = true;
        break;

      // Open in specific browser
      case '--browser':
        _openInBrowser = true;
        _browser = args[i + 1];
        args.splice(i, 2);
        break;

      // Specify line length
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

      // Specify language
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

        break;

      // Open disambiguation CLI menu
      case '-d':
        args.push('(disambiguation)');
        _openInBrowser = false;
        break;

      // Open disambiguation page in browser
      case '-D':
        args.push('(disambiguation)');
        _openInBrowser = true;
        break;
    }
  }
}

// Manually excluding command-line options from query
let query = args.join(' ').trim();
query = query.replace('-b','');
query = query.replace(/-l [a-z]{2}/,'');
query = query.replace(/-lang [a-z]{2}/,'');
query = query.replace(/-d/i,'');

if (query === '') {
  console.log('Please enter a search query');
  process.exit(-1);
}

// Execute
if (_openInBrowser) openInBrowser();
else printWikiSummary(query);

// ===== Functions =====

function printWikiSummary(queryText) {
  let spinner = require('ora')({ text: 'Searching...', spinner: 'dots4' }).start();
  const h2p = require('html2plaintext');

  require('node-wikipedia').page.data(queryText, { content: true, lang: _lang }, (res) => {
    spinner.stop();
    if (res) {
      res = res.text['*'].split('\n');

      // Find summary text (text above the TOC that isn't a note)
      let summaryLines = [];
      let inSummary = false;
      let inTable = false;
      let ambiguousResults = false;
      for (let i=0; i < res.length; i++) {
        let line = res[i];

        if (inSummary && line.includes('="toc')) break;

        if (line.includes('may', 'refer to:')) {
          ambiguousResults = true;
          break;
        }

        if (line.includes('<table')) inTable = true;
        if (inTable && line.includes('</table')) inTable = false;

        if (line.toLowerCase().includes('<b>') && line.toLowerCase().includes(query.toLowerCase()) && !inTable) {
          inSummary = true;
        }

        if (inSummary && !inTable
                      && !line.startsWith('<td', '<table', '<a')
                      && !line.includes('needs additional citations')
                      && !line.includes('box-Notability')
                      && !line.includes('mw-cite-backlink')
                      && !line.includes('id="References"')
                      && !line.includes('Wikipedia:Stub')) {
          summaryLines.push(line);
        }
      }

      let output = summaryLines.join('\n');

      output = h2p(output) // HTML to plaintext
        .replace(/\[[0-9a-z]*\]|\[note [0-9a-z]*\]/g, '') // remove citation text
        .replace(/listen\)/g, ''); // remove 'listen' button text

      // Handle ambiguous results
      if (ambiguousResults) {
        let links = {}; // Line text : link text
        for (let i=0; i < res.length; i++) {
          let line = res[i].trim();
          if (line.startsWith('<li>')) {
            let linkIndex = line.indexOf('/wiki/');
            if (linkIndex > -1) {
              let link = line.slice(line.indexOf('/wiki/') + 6);
              link = link.split('');
              link = link.splice(0, link.indexOf('"'));
              link = decodeURIComponent(link.join(''));
              links[h2p(line)] = link;
            }
          }
        }

        // Prompt user
        require('inquirer')
          .prompt([
            { type: 'list',
              name: 'selection',
              message: `Ambiguous results, "${query}" may refer to:`,
              choices: Object.keys(links) }
          ])
          .then(answers => {
            printWikiSummary(links[answers.selection]);
          })
      }

      // Browser fallback if output is empty
      else if (output.trim() == '') {
        console.log(`Something went wrong, opening in browser...\n(Error code: 0 | Query: "${query}")`);
        console.log('Submit bugs at https://github.com/koryschneider/wikit/issues/new');
        openInBrowser();
      }

      // Output summary text
      else {
        console.log(lineWrap(output, _lineLength));
      }

    // No response
    } else {
      console.log('Not found :^(');
    }
  });
}

function lineWrap(text, max) {
  text = text.trim().replace(/\n/g, ' '); // replace newlines with spaces
  let formattedText = ' ';

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
  const format = (s) => s.trim().replace(/ /g, '+'); // replace spaces with +'s
  let url = 'https://' + _lang + '.wikipedia.org/w/index.php?title=Special:Search&search=';
  
  url += format(query);
  console.log("URL: " + url);
  if (_browser)
    opn(url, { app: _browser });
  else
    opn(url);

  process.exit(0);
}
