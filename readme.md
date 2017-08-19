# wikit

## Contents

 - [About](#about)
 - [Installation](#installation)
 - [Usage](#usage)
   - [Flags](#flags)
   - [Examples](#examples)
   - [Output](#output)
 - [Bugs & Suggestions](#bugs-and-suggestions)

## About

Wikit is a command line program for getting Wikipedia summaries easily.

#### Wikit
> Verb. The act of looking up something at www.wikipedia.org, the prominent open source encyclopedia.
>
> Derivation comes from the eventual contraction of the suggestion that a person "wikipedia it" which evolved into "wiki it" which became simply "wikit".
 - [urbandictionary.com](https://www.urbandictionary.com/define.php?term=wikit)

## Installation

`$ npm install wikit -g`

## Usage

Syntax: `$ wikit <query> [-flags]`

Quotes are not required for multi-word queries.
Flags can be placed anywhere.

### Flags

| Flag | Description |
| ---- | ----------- |
| `-b` | Open full Wikipedia article in browser. |
| `-l num` | Set line wrap length to `num` (minimum 15). |
| `-lang langCode` | Specify language. `langCode` is an [HTML ISO language code](https://www.w3schools.com/tags/ref_language_codes.asp). |

### Examples

Click on a command to see the output.

<details>
<summary>`$ wikit wikipedia`</summary>
```
Wikipedia (/ˌwɪkɪˈpiːdiə/ WIK-i-PEE-dee-ə or /ˌwɪkiˈpiːdiə/ WIK-ee-PEE-dee-ə) is
a free online encyclopedia with the aim to allow anyone to edit articles. Wikipedia
is the largest and most popular general reference work on the Internet and is ranked
among the ten most popular websites. Wikipedia is owned by the nonprofit Wikimedia
Foundation.Wikipedia was launched on January 15, 2001, by Jimmy Wales and Larry Sanger.
Sanger coined its name, a portmanteau of wiki[notes 4] and encyclopedia. There was
only the English-language version initially, but it quickly developed similar versions
in other languages, which differ in content and in editing practices. With 5,462,528
articles,[notes 5] the English Wikipedia is the largest of the more than 290 Wikipedia
encyclopedias. Overall, Wikipedia consists of more than 40 million articles in more
than 250 different languages and, as of February 2014[update], it had 18 billion
page views and nearly 500 million unique visitors each month.As of March 2017, Wikipedia
has about forty thousand high-quality articles known as Featured Articles and Good
Articles that cover vital topics. In 2005, Nature published a peer review comparing
42 science articles from Encyclopædia Britannica and Wikipedia, and found that Wikipedia's
level of accuracy approached that of Encyclopædia Britannica.Wikipedia has been criticized
for allegedly exhibiting systemic bias, presenting a mixture of "truths, half truths,
and some falsehoods", and, in controversial topics, being subject to manipulation
and spin.
```
</details>

<details>
<summary>`$ wikit empire state building`</summary>
```
The Empire State Building is a 102-story skyscraper located on Fifth Avenue between
West 33rd and 34th Streets in Midtown, Manhattan, New York City. It has a roof height
of 1,250 feet (381 m), and with its antenna included, it stands a total of 1,454
feet (443.2m) tall. Its name is derived from the nickname for New York, the Empire
State. It stood as the world's tallest building for nearly 40 years, from its completion
in early 1931 until the topping out of the original World Trade Center's North Tower
in late 1970. Following the September 11 attacks in 2001, the Empire State Building
was again the tallest building in New York, until One World Trade Center reached
a greater height in April 2012. The Empire State Building is currently the fifth-tallest
completed skyscraper in the United States and the 35th-tallest in the world. It is
also the fifth-tallest freestanding structure in the Americas. When measured by pinnacle
height, it is the fourth-tallest building in the United States.The Empire State Building
is an American cultural icon. It is designed in the distinctive Art Deco style and
has been named as one of the Seven Wonders of the Modern World by the American Society
of Civil Engineers. The building and its street floor interior are designated landmarks
of the New York City Landmarks Preservation Commission, and confirmed by the New
York City Board of Estimate. It was designated as a National Historic Landmark in
1986. In 2007, it was ranked number one on the AIA's List of America's Favorite 
rchitecture.
```
</details>

<details>
<summary>`$ wikit linux -b`</summary>
This page: https://en.wikipedia.org/wiki/Linux opens in your (default) browser.
</details>

<details>
<summary>`$ wikit -lang es jugo`</summary>
```
El jugo de frutas o zumo de frutas es la sustancia líquida que se extrae al licuar
habitualmente por presión, aunque el conjunto de procesos intermedios puede suponer
la cocción, molienda o centrifugación del producto original. Generalmente, el término
hace referencia al líquido resultante de exprimir un fruto. Así, por ejemplo, el
jugo o zumo de naranja es el líquido extraído de la fruta del naranjo. A menudo se
venden jugos envasados, que pasan por un proceso durante su elaboración que les hace
perder parte de sus beneficiosas propiedades nutricionales, una porción de jugo equivale
a una porción de fruta.
```
</details>

### Output

The output will be the paragraphs of the wikipedia article before the table of contents.
Line length is neatly wrapped based on your terminal's window size, with a max
of about 80 characters. For example:

```
$ wikit arch linux
Arch Linux (or Arch /ˈɑːrtʃ/) is a Linux distribution for computers based on
x86-64 architectures. Arch Linux is composed predominantly of free and open-source
software, and supports community involvement. The design approach of the development
team follows the KISS principle ("keep it simple, stupid") as the general guideline,
and focuses on elegance, code correctness, minimalism and simplicity, and expects
the user to be willing to make some effort to understand the system's operation.
A package manager written specifically for Arch Linux, pacman, is used to install,
remove and update software packages. Arch Linux uses a rolling release model,
such that a regular system update is all that is needed to obtain the latest
Arch software; the installation images released by the Arch team are simply
up-to-date snapshots of the main system components. Arch Linux has comprehensive
documentation in the form of a community wiki, called the ArchWiki. The wiki
is widely regarded among the entire Linux community and ecosystem for often
having the most recent information on a specific topic that go beyond Arch Linux
only.
```

## Bugs and Suggestions

Please create an issue
[here](https://github.com/koryschneider/wikit/issues/new). Thanks!
