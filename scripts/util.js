export function constInit() {
    let FFG_UTIL = {
        MODULE_ID: "ffg-star-wars-utilities"
    };
    return FFG_UTIL;
}

export async function init() {

    Hooks.once("init", () => {
        const FFG_UTIL = constInit();
    });

    Hooks.once("ready", () => {
        // Add class to body element to identify is user is a GM
        if (game.user.isGM) {
            $("body").addClass("isGM");
        }
    });
}