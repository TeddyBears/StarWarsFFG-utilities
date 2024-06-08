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
}


/** Check chat message. if it is a result from a weapon test, add chat button to apply damage and critical
 * 
 * Return void
 */
export async function damage_helper() {
    if (!game.settings.get("ffg-star-wars-utilities", "damage-helper-active")) {
        return;
    }
    Hooks.on("renderChatMessage", (messageData, meta_data, id) => {
        if (!game.user.isGM) return;
        if (messageData.isRoll) {
            let roll = messageData.rolls[0];
            let successNumber = roll.ffg ? parseInt(roll.ffg.success) : 0;

            if (roll.data.type === "weapon"
                && successNumber > 0) {
                let weapon = roll.data;
                let criticalHit = (weapon.system.crit?.adjusted) ? weapon.system.crit.adjusted : weapon.system.crit.value;
                let tr = roll.ffg.triumph;
                let ad = roll.ffg.advantage;
                let actions = {}, data = {};
                let tokenTargeted = canvas.tokens.get(messageData.user.targets.ids[0]);

                actions.damage = "apply_damage"; //it's a success, so apply damage by default
                data.weapon = weapon
                data.isGM = game.user.isGM;
                data.message = messageData;
                data.target = tokenTargeted ? tokenTargeted : null;

                if (tr > 0 || ad >= criticalHit) {
                    actions.critical = "apply_critical";
                    data.isCritical = true;
                }
                appendChatMessage(messageData._id, "buttons", data, actions);
            }
        }
    });
}

let Handler = {};
Handler.apply_damage = async function (data) {
    if (canvas.tokens.controlled.length === 0) {
        ui.notifications.info(game.i18n.localize('ffg-star-wars-utilities.token.noSelected'));
        return;
    }
    let target = canvas.tokens.controlled[0];
    let weapon = data.weapon
    let chatContent = "";

    if (target) {
        let soak = parseInt(target.actor.system.stats.soak.value);
        let oldWounds = Number.isInteger(parseInt(target.actor.system.stats.wounds.value)) ? parseInt(target.actor.system.stats.wounds.value) : 0;
        let oldStrain = Number.isInteger(parseInt(target.actor.system.stats.strain.value)) ? parseInt(target.actor.system.stats.strain.value) : 0;
        let pierce = 0, breach = 0, haveCortosis = false;

        let pierceList = await weapon.system.itemmodifier.filter(w => w.name.toLowerCase().startsWith("pierce"));
        let breachList = await weapon.system.itemmodifier.filter(w => w.name.toLowerCase().startsWith("breach"));
        let isStrain = await weapon.system.itemmodifier.filter(w => w.name.toLowerCase().startsWith("stun damage"));
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
        let baseDamage = (weapon.system.damage?.adjusted) ? weapon.system.damage.adjusted : weapon.system.damage.value;
        let extraDamage = parseInt(data.message.rolls[0].ffg.success);
        let totalDamage = parseInt(baseDamage + extraDamage);
        let damageTaken = (parseInt(totalDamage - leftoverSoak) < 0) ? 0 : parseInt(totalDamage - leftoverSoak);
        let damageType = "", damageValue = 0;

        if (isStrain.length > 0) {
            damageValue = (oldStrain + damageTaken);
            damageType = 'system.stats.strain.value';
        } else {
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


Handler.apply_critical = async function (data) {
    if (canvas.tokens.controlled.length === 0) {
        ui.notifications.info(game.i18n.localize('ffg-star-wars-utilities.token.noSelected'));
        return;
    }
    let token = canvas.tokens.controlled[0];

    if (token.actor.type === "minion") {
        // minions don't take critical injuries. Just reduce the quantity by 1

        let unit_wounds = token.actor.system.unit_wounds.value
        let currentWounds = token.actor.system.stats.wounds.value
        let maxWound = token.actor.system.quantity.max * unit_wounds + 1
        let newUnit_wound = currentWounds + unit_wounds + 1

        await token.actor.update({ ['system.stats.wounds.value']: Math.min(maxWound, parseInt(newUnit_wound)) });
    } else {
        const tables = game.tables.map(table => {
            if (table.name.includes("Critical")) {
                if (token != null && ((token.actor.type === "vehicle" && table.name === "Critical Damage")
                    || (token.actor.type === "character" && table.name === "Critical Injuries")
                    || (token.actor.type === "nemesis" && table.name === "Critical Injuries")
                    || (token.actor.type === "rival" && table.name === "Critical Injuries")

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
        modifier = token.actor.items.filter(item => item.type === "criticalinjury" || item.type === "criticaldamage").length * 10;

        //Check if the attacker has lethal blows talents
        let attackerToken = await game.actors.get(data.message.speaker.actor);
        let lethalBlowsTalent = attackerToken.talentList.filter(item => item.name.toLowerCase().includes(game.i18n.localize("ffg-star-wars-utilities.damage-helper.items.lethalBlows")));
        if (lethalBlowsTalent.length > 0) {
            modifier += lethalBlowsTalent[0].rank * 10;
        }
        //check to see if the token has the Durable talent
        let durableTalent = token.actor.items.filter(item => item.name.toLowerCase() === "durable");
        //If the talent is found multiply it by 10 for the roll
        if (durableTalent.length > 0) {
            durableRank = durableTalent[0].system.ranks.current
            durableValue = durableTalent[0].system.ranks.current * 10;
        }

        data.tables = optionValues
        data.durableRank = durableRank
        data.modifier = modifier - durableValue
        console.log(data)

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
                        console.log(html.find("#modifier").val())
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
                        if (token) {
                            //Table roles are async so wait for it to return
                            tableResult.then(function (value) {
                                //Ignore if we didn't draw a result
                                if (value.results.length <= 0) {
                                    return;
                                }

                                var firstResult = value.results[0];
                                var item = game.items.get(firstResult.documentId);
                                if (item != null) {
                                    //Add injury to the selected chracter
                                    token.actor.createEmbeddedDocuments("Item", [item.toObject()]);
                                    ChatMessage.create({
                                        speaker: { alias: token.actor.name, token: token.actor.id },
                                        content: item.system.description
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

/* display action buttons
 *
 */
async function _appendToDamageRolls(message) {
    const div = document.createElement("DIV");
    let weapon = message.rolls[0].data;
    let roll = message.rolls[0];

    div.innerHTML = await renderTemplate("modules/ffg-star-wars-utilities/templates/buttons.hbs", roll);
    div.querySelectorAll("[data-action]").forEach(n => {
        if (parseInt(roll.ffg.success) > 0) n.addEventListener("click", _quickApply.bind());
    });
}

async function appendChatMessage(messageId, templateName, data, bindActions) {
    let div = document.createElement("DIV");
    div.innerHTML = await renderTemplate("modules/ffg-star-wars-utilities/templates/" + templateName + ".hbs", data);

    div.querySelectorAll("[data-action]").forEach(n => {
        const action = n.dataset.action;
        if (bindActions[action]) n.addEventListener("click", Handler[bindActions[action]].bind(this, data));
    });

    $("[data-message-id=" + messageId + "] .message-content").append(div.firstElementChild);
}