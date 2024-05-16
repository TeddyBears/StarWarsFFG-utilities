# StarWarsFFG-utilities

This module adds some utilities for [StarWarsFFG FoundryVTT system](https://github.com/StarWarsFoundryVTT/StarWarsFFG) like macros  
Everythings are translated.  
Update suggestions for the dice_helper feature from [StarWarsFFG_Enhancements](https://github.com/wrycu/StarWarsFFG-Enhancements) module  
Add buttons to apply damage or critical after a weapon check.  

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
1. On module settings you can activate option to add suggestions for all skills. For this the option dice_helper have to be available in the module "StarWarsFFG_Enhancements"
   * If the journal entry for the dice_helper already exists you should delete or rename it to allow the creation of a new one
1. on module settings you can activate damage and critical action buttons in chat message.
   * And you can choose to display net damage apply to the target or only an estimation. With this option macro to apply critical injuries or damages are not usefully. But still available

Now you can use the macro to apply critical. And have more suggestion on skill tests.

## How apply damage or critical injuries from chat message

After a weapon check, the module tests if it's a success and if critical injuries are available (enough advantages or a triumph).  
If ok, only gamemaster shows the action buttons in the chat message.  
The Gamemaster have to select a token (don't target the token)  
For damage calculation the module uses item qualities (items name have to be in english):  
* Pierce and Breach qualities for the used weapon
* Cortosis quality on equipped armor from the selected token
