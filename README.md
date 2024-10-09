# StarWarsFFG-utilities

This module adds some utilities for [StarWarsFFG FoundryVTT system](https://github.com/StarWarsFoundryVTT/StarWarsFFG) like macros  
Everythings are translated in french.  
Update suggestions for the dice_helper feature from [StarWarsFFG_Enhancements](https://github.com/wrycu/StarWarsFFG-Enhancements) module  
Add buttons to apply damage or critical after a weapon check.  

## Compendium

### Items

Add critical hits and critical injuries items

### Macros

Macros come from [StarWarsFFG FoundryVTT system wiki](https://github.com/StarWarsFoundryVTT/StarWarsFFG/wiki/Helpful-macros).  
Some modifications was done to these macros to add translations in interface message. And some minor modifications / fixes.  

#### Create critical hits roll table

Create roll table for critical hits to be used by the _apply critical_ macro
Critical hits items should exist. Can be imported from compendium.  

#### Create critical injuries roll table

Create roll table for critical injuries to be used by the _apply critical_ macro.  
Critical injuries items should exist. Can be imported from compendium.  

#### Strain Recover

Can be used after a combat to recover strain.  
Roll _discipline_ or _cool_ skill and update the actor.
Check if the actor has the talent Balance. If yes add his force pool to the check and calculation of strain healed.   

## Installation

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
If ok, players or gamemaster can target (not select) a token and click on the damage and / or critilcal button in the chat message.
For damage calculation the module uses item qualities (items name have to be in english):  

* Pierce and Breach qualities for the used weapon
* Cortosis quality on equipped armor from the selected token

For critical modifiers the module uses attacker and target talents or items:

* If attacker has lethal Blows talent (Coup mortel in french) modifier is updated (+ rank * 10)
* If targeted token has durable talent (same in french)  modifier is updated (- rank * 10)
* If targeted token is a minions, one minion is removed from the group
