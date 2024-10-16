# Changelog

`12.0.1.1_903`

* Features:
  * Use the translated version for the Durable talent (Dur au mal in french) to calculate the critical modifier
  * Add modifier explainations in critical dialog box
  * The module is only available with the system `starwarsffg`
  * Damage between vehicle and humain are calculated : vehicle damage * 10 VS human and human damage / 10 VS vehicle

* Fixes:
  * The link in the chat message is now to the token instaed the actor. This avoid problem for token not linked to an Actor
  * Damage can be applied to vehicle
  * The result of the critical roll is affected to the attacker instead of the target in the chat message
