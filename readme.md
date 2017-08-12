# wikit

> Verb. The act of looking up something at www.wikipedia.org, the prominent open source encyclopedia.
>
> Derrivation comes from the eventual contraction of the suggestion that a person "wikipedia- it" which evolved into "wiki it" which became simply "wikit".
 - [urbandictionary.com](https://www.urbandictionary.com/define.php?term=wikit)

### Installation

`$ npm install wikit -g`

### Usage

Syntax: `$ wikit <query> [-flags]`

Quotes are not required for multi-word queries.

Flags can be placed anywhere.

#### Flags:

 - **-b** ... Open in browser

#### Examples:

`$ wikit nodejs`

`$ wikit empire state building`

`$ wikit linux -b`

#### Output

The output will be the paragraphs of the wikipedia article before the table of contents. For example:

````
$ wikit arch linux
Arch Linux (or Arch /ˈɑːrtʃ/) is a Linux distribution for computers based on
x86-64 architectures.Arch Linux is composed predominantly of free and open-source
software, and supports community involvement.The design approach of the development
team follows the KISS principle ("keep it simple, stupid") as the general guideline,
and focuses on elegance, code correctness, minimalism and simplicity, and expects
the user to be willing to make some effort to understand the system's operation.
A package manager written specifically for Arch Linux, pacman, is used to install,
remove and update software packages.Arch Linux uses a rolling release model,
such that a regular system update is all that is needed to obtain the latest
Arch software; the installation images released by the Arch team are simply
up-to-date snapshots of the main system components.Arch Linux has comprehensive
documentation in the form of a community wiki, called the ArchWiki. The wiki
is widely regarded among the entire Linux community and ecosystem for often
having the most recent information on a specific topic that go beyond Arch Linux
only.
````

### Bugs & Suggestions

Please create an issue
[here](https://github.com/koryschneider/wikit/issues/new). Thanks!
