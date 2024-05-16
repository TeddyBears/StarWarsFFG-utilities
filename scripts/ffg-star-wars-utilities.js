import { init as dice_init} from "./dice_helper.js";
import { init as damage_init, damage_helper } from "./damage_helper.js";

Hooks.on('init', () => {
    if (typeof Babele !== 'undefined') {
        Babele.get().register({
            module: 'ffg-star-wars-utilities',
            lang: 'fr',
            dir: 'lang/compendium'
        });
    }
    damage_init();
    damage_helper();
});

Hooks.once("ready", () => {
    dice_init();
});



