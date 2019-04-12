#!/usr/bin/env node
'use strict';

const path = require('path'),
      Configstore = require('configstore'),
      pkg = require(path.join(__dirname, '/package.json'));

const conf = new Configstore(pkg.name, { lang: 'en' });

const argv = require('minimist')(process.argv.slice(2));

// Print version if requested
if (argv.version || argv.v) printVersionAndExit();
// If no query, print usage and exit
if (argv._.length == 0) printUsageAndExit();

// Flags
let _openInBrowser = false;
let _browser = null;
let _lineLength = process.stdout.columns - 10; // Terminal width - 10
let _lang = conf.get('lang');
let _disambig = false;

// Maintain comfortable line length
if (_lineLength > 80) _lineLength = 80;

// Parse flags
if (argv.b) {
  _openInBrowser = true;
}
if (argv.browser) {
  _openInBrowser = true;
  _browser = argv.browser;
}
if (argv.lang || argv.l) {
  _lang = argv.lang || argv.l;
  if (!validLanguageCode(_lang)) {
    console.log(`Unrecognized language code: ${_lang}`);
    process.exit(1);
  }
}
if (argv.d) {
  _openInBrowser = false;
  _disambig = true;
}
if (argv.D) {
  _openInBrowser = true;
  _disambig = true;
}
if (argv.line) {
  if (parseInt(argv.line) > 0) {
    _lineLength = parseInt(argv.line);
  } else {
    console.log(`Invalid line length: ${argv.line}`);
    process.exit(1);
  }
}

// Format query
let query = argv._.join(' ').trim();
if (_disambig) query += ' (disambiguation)';

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

        if (line.includes('may') && line.includes('refer to:')) {
          ambiguousResults = true;
          break;
        }

        if (line.includes('<table')) inTable = true;
        if (inTable && line.includes('</table')) inTable = false;

        if (line.includes('<b>') && line.toLowerCase().includes(queryText.toLowerCase()) && !inTable) {
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
          if (line.includes('<li')) {
            let linkIndex = line.indexOf('/wiki/');
            if (linkIndex > -1) {
              let link = line.slice(line.indexOf('/wiki/') + 6);
              link = link.split('');
              link = link.splice(0, link.indexOf('"'));
              link = decodeURIComponent(link.join(''));
              let lineText = h2p(line);
              if (lineText.startsWith('-')) // Remove leading dash
                lineText = lineText.slice(2, lineText.length);
              if (lineText.endsWith(':')) // Remove trailing colon
                lineText = lineText.slice(0, lineText.length - 1);
              links[lineText] = link;
            }
          }
        }

        // Prompt user
        require('inquirer')
          .prompt([
            { type: 'list',
              name: 'selection',
              message: `Ambiguous results, "${queryText}" may refer to:`,
              choices: Object.keys(links) }
          ])
          .then(answers => {
            console.clear();
            printWikiSummary(links[answers.selection].replace(/_/, ' '));
          })
      }

      // Browser fallback if output is empty
      else if (output.trim() == '') {
        console.log(`Something went wrong, opening in browser...\n(Error code: 0 | Query: "${queryText}")`);
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
  let url = `https://${_lang}.wikipedia.org/w/index.php?title=Special:Search&search=`;
  url += format(query);

  if (_browser)
    opn(url, { app: _browser });
  else
    opn(url);
}

function validLanguageCode(code) {
  const languages = JSON.parse(require('fs').readFileSync(
    path.join(__dirname, 'data/languages.json')
  ));
  Object.keys(languages).forEach(lang => {
    if (lang === code) return true;
  });
  return false;
}

function printUsageAndExit() {
  console.log(`\
Usage: $ wikit <query> [-flags]

Quotes are not required for multi-word queries.
Flags can be placed anywhere.

  Flags:

    --lang <LANG>        Specify language;
    -l <LANG>            LANG is an HTML ISO language code

    -b                   Open Wikipedia article in default browser

    --browser <BROWSER>  Open article in specific BROWSER

    -d                   Open disambiguation CLI menu

    -D                   Open disambiguation page in browser

    --line <NUM>         Set line wrap length to NUM (minimum 15)

    --version / -v       Print installed version number

  Examples:

    $ wikit nodejs

    $ wikit empire state building

    $ wikit linux -b

    $ wikit --lang es jugo`);

  process.exit(1);
}

function printVersionAndExit() {
  const { version } = require('./package.json');
  console.log(version);
  process.exit(0);
}
