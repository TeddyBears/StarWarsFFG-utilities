Hooks.on('createJournalEntry', async function (journalEntry, options, userID) {
    update_journal(journalEntry);
});

export function init() {
    game.settings.register("ffg-star-wars-utilities", "dice-helperOverride", {
        name: game.i18n.localize("ffg-star-wars-utilities.dice-helperOverride"),
        hint: game.i18n.localize("ffg-star-wars-utilities.dice-helperOverride-hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
}

async function update_journal(journalEntry) {
    // if the feature is not enabled, don't do anything
    const page_name = "dice_helper";

    if (!game.settings.get("ffg-star-wars-enhancements", "dice-helper")) {
        return;
    }
    if (!game.settings.get("ffg-star-wars-utilities", "dice-helperOverride")) {
        return;
    }

    // otherwise check to see if the journal already exists
    let journal_name = game.settings.get("ffg-star-wars-enhancements", "dice-helper-data");
    //let journal = game.journal.filter((journal) => journal.name === journal_name);

    if (journalEntry.name === journal_name) {
        // This is a problem with the dice_helper code. the page use the journal name but to work the page name should be "dice_helper"
        let journal_pages = journalEntry.pages.filter((i) => i.name === journal_name);

        // let's search for a translated one (will probably show an error in console, can't avoid it)
        let jsonFilePath = "modules/ffg-star-wars-utilities/content/dice_helper_" + game.i18n.lang + ".json";
        let logFileStatus = "translated";
        await fetch(jsonFilePath).then((response) => {
            if (!response.ok) {
                logFileStatus = "default";
                jsonFilePath = "modules/ffg-star-wars-utilities/content/dice_helper.json";
            }
        });

        // then update the page
        let suggestions = await $.getJSON(jsonFilePath);
        let data = {
            name: page_name,
            text: {
                content: JSON.stringify(suggestions),
            }
        };
        // Update the first page with suggestions. And change the page name to fix bug if the journal name is not "dice_helper"
        journal_pages[0].update(data);
    }
}
