# StarWarsFFG-utilities

This module adds some utilities for [StarWarsFFG FoundryVTT system](https://github.com/StarWarsFoundryVTT/StarWarsFFG) like macros
Everythings are translated.  
Update suggestions for the dice_helper feature from [StarWarsFFG_Enhancements](https://github.com/wrycu/StarWarsFFG-Enhancements) module

## Compendium

### Items

Add critical hits and critical injuries items

### Macros

Macros come from https://github.com/StarWarsFoundryVTT/StarWarsFFG/wiki/Helpful-macros.  
Some modifications was done to these macros to add translations in interface message. And some minor modifications / fixes.  

## Instalation

Install this module through the Foundry VTT Administrator interface by specifying the following URL: https://raw.githubusercontent.com/TeddyBears/StarWarsFFG-utilities/main/module.json

## Setup

1. As a Gamemaster, activate the ffg-star-wars-utilities module in your world.
1. Be sure you don't have other critical injuries or critical damage items in your world. The macros to create roll table use all items from these 2 types.
1. After installed the module go to compendium and import all items. This will add all critical items.
1. Go to macro and use the macros _Create critical hits roll table_ and _Create critical injuries roll table_.
1. On module settings you can activate option to add suggestions for all skills. For this the option for dice_helper have to be available in the module "StarWarsFFG_Enhancements"
   * If the journal entry for the dice_helper already exists you should delete or rename it to allow the creation of a new one

Now you can use the macro to apply critical. And have more suggestion on skill tests.
