import { init } from "./dice_helper.js";

Hooks.on('init', () => {
    if (typeof Babele !== 'undefined') {

        Babele.get().register({
            module: 'ffg-star-wars-utilities',
            lang: 'fr',
            dir: 'lang/compendium'
        });
    }
});

Hooks.once("ready", () => {
    init();
});

