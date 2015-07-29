# Readme for Pok&#233;mon Save File Reader #

by Lyndon Armitage


This is a HTML5 implementation of a Pok&#233;mon Red, Blue and Yellow save game viewer (and possibly editor in the future).
Made for fun, and educational purposes only.

## Current Version: ##

Currently in the very early stages of development.
Can currently open a .sav file and read the following:
* Trainer Name
* Rival Name
* Trainer ID
* Time Played
* Items in Pocket
* items in PC
* Money
* Checksum
* Current Box selected
* Pok&#233;dex Owned and Seen stats
* Basic Location support (x, y, and map id)

## Other: ##

This page is useful for The structure of Pok&#233;mon Red/Blue & Possibly Yellow save files:
http://bulbapedia.bulbagarden.net/wiki/Save_data_structure_in_Generation_I
Although not all of it's data is accurate.

I have also created a small Hex Viewer using the HTML5 File API and Storage API that let's you view a files contents and write notes.
Note that this may crash your browser for files with a lot of bytes (i.e. bigger files). I have only tested it with .sav files which are 32kb large.

### Copyright: ###

Pok&#233;mon © 2002-2015 Pok&#233;mon. © 1995-2015 Nintendo/Creatures Inc./GAME FREAK inc. TM, ® and Pok&#233;mon character names are trademarks of Nintendo.
