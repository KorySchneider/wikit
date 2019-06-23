#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');

const wiki = require('wtf_wikipedia');
const inquirer = require('inquirer');
const ora = require('ora');
const opn = require('opn');
const htmlToText = require('html-to-text');

const Configstore = require('configstore');
const pkg = require(path.join(__dirname, '/package.json'));
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
  _disambig = true;
  _openInBrowser = false;
}
if (argv.D) {
  _disambig = true;
  _openInBrowser = true;
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
if (_openInBrowser) openInBrowser(query);
else printWikiSummary(query);

// ===== Functions =====

function printWikiSummary(queryText) {
  let spinner = ora({ text: 'Searching...', spinner: 'dots4' }).start();

  queryText = queryText.replace(/_/g, ' ');

  wiki.fetch(queryText, _lang, (err, doc) => {
    spinner.stop();

    if (err) {
      console.log('Error:', err);
    }

    if (doc) {
      let summary = doc.sections()[0].text();

      // Handle ambiguous results
      if (_disambig || summary.includes('may refer to:')) {
        handleAmbiguousResults(doc, queryText);
        return;
      }

      // Output
      if (summary) {
        console.log(lineWrap(summary, _lineLength));
      } else {
        console.log(`Something went wrong, opening in browser...\n(Error code: 0 | Query: "${queryText}")`);
        console.log('Submit bugs at https://github.com/koryschneider/wikit/issues/new');
        openInBrowser(queryText);
      }
    } else {
      console.log('Not found :^(');
    }
  });
}

function handleAmbiguousResults(doc, queryText) {
  const choices = [];
  doc.sections().forEach(section => {
    section.links().forEach(link => {
      if (link.page) choices.push(link.page);
    });
  });
  inquirer.prompt([
    {
      name: 'selection',
      type: 'list',
      message: `Ambiguous results, "${queryText}" may refer to:`,
      choices: choices,
      pageSize: 15,
    }
  ]).then(answers => {
    _disambig = false;
    printWikiSummary(answers.selection);
  }).catch(err => {
    console.log('Error:', err);
  });
}

function lineWrap(text, max) {
  // remove stray html elements
  text = htmlToText.fromString(text, {
    wordwrap: false,
    uppercaseHeadings: false,
    ignoreHref: true,
  });
  text = text.trim().replace(/\n\n/g, '\n');
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

function openInBrowser(query) {
  const format = (s) => s.trim().replace(/ /g, '+'); // replace spaces with +'s
  let url = `https://${_lang}.wikipedia.org/w/index.php?title=Special:Search&search=`;
  url += format(query);

  if (_browser)
    opn(url, { app: _browser });
  else
    opn(url);
}

function validLanguageCode(code) {
  const languages = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'data/languages.json')
  ));
  if (Object.keys(languages).includes(code)) return true;
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
  console.log(pkg.version);
  process.exit(0);
}
