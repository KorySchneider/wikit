# wikit

A command line program for getting Wikipedia summaries easily.

 - [Installation](#installation)
 - [Usage](#usage)
   - [Flags](#flags)
   - [Examples](#examples)
   - [Output](#output)
 - [Bugs & Suggestions](#bugs-and-suggestions)


## Installation

`$ npm install wikit -g`

## Usage

Syntax: `$ wikit <query> [-flags]`

Quotes are not required for multi-word queries.
Flags can be placed anywhere.

To change the default language, edit `~/.config/configstore/wikit.json`.

### Flags

| Flag | Description |
| ---- | ----------- |
| `-lang langCode`<br>`-l langCode` | Specify language; `langCode` is an [HTML ISO language code](https://www.w3schools.com/tags/ref_language_codes.asp). |
| `-line num` | Set line wrap length to `num` (minimum 15). |
| `-b` | Open full Wikipedia article in default browser. |
| `--browser browser` | Open full Wikipedia article in specific `browser`. |
| `-d` | Open disambiguation page in browser. |

### Examples

`$ wikit wikipedia`

`$ wikit empire state building`

`$ wikit linux -b`

`$ wikit -lang es jugo`

### Output

The output will be the paragraphs of the wikipedia article before the table of contents.
Line length is neatly wrapped based on your terminal's window size, with a max
of about 80 characters. For example:

```
$ wikit arch linux
 Arch Linux (or Arch /ˈɑːrtʃ/) is a Linux distribution for computers based on x86-64
 architectures. Arch Linux is composed predominantly of free and open-source software,
 and supports community involvement. The design approach of the development team
 follows the KISS principle ("keep it simple, stupid") as the general guideline,
 and focuses on elegance, code correctness, minimalism and simplicity, and expects
 the user to be willing to make some effort to understand the system's operation.
 A package manager written specifically for Arch Linux, pacman, is used to install,
 remove and update software packages. Arch Linux uses a rolling release model, such
 that a regular system update is all that is needed to obtain the latest Arch software;
 the installation images released by the Arch team are simply up-to-date snapshots
 of the main system components. Arch Linux has comprehensive documentation in the
 form of a community wiki, called the ArchWiki. The wiki is widely regarded among
 the Linux community and ecosystem for often having the most recent information on
 a specific topic and being applicable beyond Arch Linux.
```

## Bugs and Suggestions

Please create an issue
[here](https://github.com/koryschneider/wikit/issues/new). Thanks!
