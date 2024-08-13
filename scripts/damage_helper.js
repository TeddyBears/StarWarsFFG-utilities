import { RollFFG } from "../../../systems/starwarsffg/modules/dice/roll.js";

export function init() {
    game.settings.register("ffg-star-wars-utilities", "damage-helper-active", {
        name: game.i18n.localize("ffg-star-wars-utilities.damage-helper.active.label"),
        hint: game.i18n.localize("ffg-star-wars-utilities.damage-helper.active.hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => {
            location.reload();
        }
    });
    game.settings.register("ffg-star-wars-utilities", "damage-helper-netDamage", {
        name: game.i18n.localize("ffg-star-wars-utilities.damage-helper.netDamage.label"),
        hint: game.i18n.localize("ffg-star-wars-utilities.damage-helper.netDamage.hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => {
            location.reload();
        }
    });

    //if it is a result from a weapon test, add chat button to apply damage and critical
    RollFFG.CHAT_TEMPLATE = "modules/ffg-star-wars-utilities/templates/dice/roll-ffg.html";
    // register templates parts
    const templatePaths = [
        "systems/starwarsffg/templates/dice/roll-ffg.html",
    ];

    loadTemplates(templatePaths);
}

export async function damage_helper() {
    if (!game.settings.get("ffg-star-wars-utilities", "damage-helper-active")) {
        return;
    }
    Hooks.on("renderChatMessage", (app, html, messageData) => {
        html.on("click", ".ffg-utilities-damage", async function () {
            await apply_damage(app.rolls[0]);
        });
        html.on("click", ".ffg-utilities-critical", async function () {
            await apply_critical(app, true);
        });

    });
}


async function apply_damage(data) {
    if (!game.user.isGM) {
        ui.notifications.info(game.i18n.localize('ffg-star-wars-utilities.user.notGM'));
        return;
    }
    if (game.user.targets.ids.length === 0) {
        ui.notifications.info(game.i18n.localize('ffg-star-wars-utilities.token.notarget'));
        return;
    }
    console.log(game.user)
    let target = canvas.tokens.get(game.user.targets.ids[0]);
    let weapon = data.data
    let chatContent = "";
    console.log(target)
    if (target) {
        let soak = parseInt(target.actor.system.stats.soak.value);
        let pierce = 0, breach = 0, haveCortosis = false;
        let pierceList = await weapon.system.itemmodifier.filter(w => w.name.toLowerCase().startsWith("pierce"));
        let breachList = await weapon.system.itemmodifier.filter(w => w.name.toLowerCase().startsWith("breach"));

        //calculate soak of the target from the used weapon  and equipped armor
        let armor = await target.actor.items.filter(item => item.type === "armour");
        armor.forEach(function (currentArmor) {
            if (currentArmor.system.equippable.equipped) {
                let cortosisMod = currentArmor.system.itemmodifier.filter(item => item.name.toLowerCase().startsWith("cortosis"));
                if (cortosisMod.length > 0) {
                    haveCortosis = true;
                }
            }
        });

        if (!haveCortosis) {
            if (pierceList.length > 0) {
                pierce = pierceList[0].system.rank;
            }
            if (breachList.length > 0) {
                breach = breachList[0].system.rank * 10;
            }
        }

        let leftoverSoak = (soak - (pierce + breach));
        leftoverSoak = (leftoverSoak < 0) ? 0 : leftoverSoak;

        //calculate damages from the weapon used, checked roll and calculated soak
        let baseDamage = (weapon.system.damage?.adjusted) ? weapon.system.damage.adjusted : weapon.system.damage.value;
        let extraDamage = parseInt(data.ffg.success);
        let totalDamage = parseInt(baseDamage + extraDamage);
        let damageTaken = (parseInt(totalDamage - leftoverSoak) < 0) ? 0 : parseInt(totalDamage - leftoverSoak);

        //calculate left wounds or strain of the target
        let damageType = "", damageValue = 0;
        let isStrain = await weapon.system.itemmodifier.filter(w => w.name.toLowerCase().startsWith("stun damage"));
        if (isStrain.length > 0 && target.actor.system.stats.strain && target.actor.type != "minion") {
            console.log('strain')
            let oldStrain = parseInt(target.actor.system.stats.strain.value)
            damageType = 'system.stats.strain.value';
            damageValue = (oldStrain + damageTaken);
        } else {
            let oldWounds = Number.isInteger(parseInt(target.actor.system.stats.wounds.value)) ? parseInt(target.actor.system.stats.wounds.value) : 0;
            damageValue = (oldWounds + damageTaken);
            damageType = 'system.stats.wounds.value';
        }

        await target.actor.update({ [damageType]: Math.max(0, parseInt(damageValue)) });

        if (game.settings.get("ffg-star-wars-utilities", "damage-helper-netDamage")) {
            chatContent = "@Actor[" + target.actor.name + "]" + game.i18n.localize('ffg-star-wars-utilities.damage.take') + damageTaken + game.i18n.localize('ffg-star-wars-utilities.damage.damages');
        } else {
            let maxWounds = target.actor.system.stats.wounds.max;
            let percentDamage = damageTaken / maxWounds * 100;
            let estimateWounds;
            if (percentDamage < 21) {
                estimateWounds = game.i18n.localize('ffg-star-wars-utilities.damage-helper.estimation.small');
            } else if (percentDamage < 61) {
                estimateWounds = game.i18n.localize('ffg-star-wars-utilities.damage-helper.estimation.some');
            } else {
                estimateWounds = game.i18n.localize('ffg-star-wars-utilities.damage-helper.estimation.serious');
            }

            chatContent = "@Actor[" + target.actor.name + "]" + game.i18n.localize('ffg-star-wars-utilities.damage.take') + estimateWounds;
        }

        //display infos into chat box
        ChatMessage.create({
            flavor: game.i18n.localize('ffg-star-wars-utilities.damage.result'),
            content: chatContent,
        });
    }
}


async function apply_critical(data) {
    if (game.user.targets.ids.length === 0) {
        ui.notifications.info(game.i18n.localize('ffg-star-wars-utilities.token.notarget'));
        return;
    }
    let target = canvas.tokens.get(game.user.targets.ids[0]);

    if (target.actor.type === "minion") {
        // minions don't take critical injuries. Just reduce the quantity by 1

        let unit_wounds = target.actor.system.unit_wounds.value
        let currentWounds = target.actor.system.stats.wounds.value
        let maxWound = target.actor.system.quantity.max * unit_wounds + 1
        let newUnit_wound = currentWounds + unit_wounds + 1

        await target.actor.update({ ['system.stats.wounds.value']: Math.min(maxWound, parseInt(newUnit_wound)) });
    } else {
        const tables = game.tables.map(table => {
            if (table.name.includes("Critical")) {
                if (target != null && ((target.actor.type === "vehicle" && table.name === "Critical Damage")
                    || (target.actor.type === "character" && table.name === "Critical Injuries")
                    || (target.actor.type === "nemesis" && table.name === "Critical Injuries")
                    || (target.actor.type === "rival" && table.name === "Critical Injuries")

                )) {
                    return `<option value="${table._id}" selected>${table.name}</option>`;
                } else {
                    return `<option value="${table._id}">${table.name}</option>`;
                }
            }

        })
        const optionValues = tables.join("");
        let modifier = 0, durableValue = 0, durableRank = 0;

        //Count the number of injuries the token already has
        modifier = target.actor.items.filter(item => item.type === "criticalinjury" || item.type === "criticaldamage").length * 10;

        //Check if the attacker has lethal blows talents
        let attackerToken = await game.actors.get(data.speaker.actor);
        let lethalBlowsTalent = attackerToken.talentList.filter(item => item.name.toLowerCase().includes(game.i18n.localize("ffg-star-wars-utilities.damage-helper.items.lethalBlows")));
        if (lethalBlowsTalent.length > 0) {
            modifier += lethalBlowsTalent[0].rank * 10;
        }
        //check to see if the target has the Durable talent
        let durableTalent = target.actor.items.filter(item => item.name.toLowerCase() === "durable");
        //If the talent is found multiply it by 10 for the roll
        if (durableTalent.length > 0) {
            durableRank = durableTalent[0].system.ranks.current
            durableValue = durableTalent[0].system.ranks.current * 10;
        }

        data.tables = optionValues
        data.durableRank = durableRank
        data.modifier = modifier - durableValue

        let d = new Dialog({
            title: game.i18n.localize('ffg-star-wars-utilities.damage-helper.dialog.title'),
            content: await renderTemplate("modules/ffg-star-wars-utilities/templates/dialog-critical.hbs", data),
            buttons: {
                one: {
                    icon: '<i class="fas fa-user-injured"></i>',
                    label: game.i18n.localize('ffg-star-wars-utilities.damage-helper.dialog.buttons.critical'),
                    callback: (html) => {
                        let modifier;
                        modifier = parseInt(html.find("#modifier").val(), 10);
                        if (isNaN(modifier)) {
                            modifier = 0;
                        }
                        const table = html.find("#crittable :selected").val();
                        //Added in the Durable modifications as well as making sure it doesn't roll below 1
                        const critRoll = new Roll(`max(1d100 + ${modifier}, 1)`);
                        const tableResult = game.tables.get(table).draw({
                            roll: critRoll,
                            displayChat: true
                        });
                        //If we have an actor selected try to add the injury
                        if (target) {
                            //Table roles are async so wait for it to return
                            tableResult.then(function (value) {
                                //Ignore if we didn't draw a result
                                if (value.results.length <= 0) {
                                    return;
                                }
                                let msgContent = ""
                                let firstResult = value.results[0];
                                let item = game.items.get(firstResult.documentId);
                                if (item != null) {
                                    //Add injury to the selected chracter
                                    if (game.user.isGM) {
                                        target.actor.createEmbeddedDocuments("Item", [item.toObject()]);
                                    } else {
                                        msgContent = game.i18n.localize('ffg-star-wars-utilities.damage-helper.apply_critical.notApply')
                                    }

                                    ChatMessage.create({
                                        speaker: { alias: target.actor.name, token: target.actor.id },
                                        content: msgContent + item.system.description
                                    })
                                }
                            });
                        }
                    }
                },
                two: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize('ffg-star-wars-utilities.damage-helper.dialog.buttons.cancel'),
                    callback: () => console.log("Chose Two")
                }
            },
            default: "two",
            close: () => console.log("This always is logged no matter which option is chosen")
        });
        d.render(true);
    }
}