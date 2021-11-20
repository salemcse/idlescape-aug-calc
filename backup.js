// ==UserScript==
// @name         IdleScape - Augment Calculator
// @namespace    GXandarG
// @version      0.0.1
// @description  Augment Calculator - Using Mac15001900 formula (https://mac15001900.github.io/idlescape-calc/)
// @author       GxandarG
// @match        *://*.idlescape.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/HighOnMikey/idlescape-data/main/src/data.js
// @run-at document-start
// ==/UserScript==

(function() {
    'use strict';

    let observers = [];
    let listeners = [];

    window.GXandarG = {
        init: function(){
            let lib = this;

            setupUI();

            let waitInterval = setInterval(() => {
                if (typeof window.IdlescapeData !== "undefined") {
                    clearInterval(waitInterval);
                }
            }, 150);

            setupObservers();
            startObservers();
            startModifierKeyListeners();

            // console.log(getSkills());
        }

    }

    function getSkills(){
        let skills = ["miningHeader", "foragingHeader", "fishingHeader", "farmingHeader", "enchantingHeader",
                      "runecraftingHeader", "smithingHeader", "craftingHeader", "cookingHeader", "constitutionHeader",
                      "attackHeader", "strengthHeader", "defenseHeader"];
        let skdict = {};

        try {
            for(let sk=0; sk<skills.length; sk++){
                let skill = document.getElementById(skills[sk]);
                let spans = skill.getElementsByTagName("span");
                let name = spans[0].getElementsByTagName("b")[0].innerHTML;
                let level = spans[1].innerHTML.replace('Effective level: ', '');
                let xp = spans[2].innerHTML.replace(/\D/g,'');
                skdict[name] = level;
            }
        } catch(err) {}

        return skdict;
    }

    function setupUI(){
        const buttonId = "aug_calculator";
        const imageButtonHtml = `<img src="/images/enchanting/enchanting_logo.png" id="${buttonId}" alt="Augment Calculator" class="header-league-icon">`;
        document.getElementById('usersOnline').insertAdjacentHTML('beforeend', imageButtonHtml);
        let imageButton = document.getElementById(buttonId);

        imageButton.addEventListener("click",function(){
            showSummary();
        },false);
    }

    function showSummary(){
        const title = 'Augment Calculator';
        const message = `
        Form and Calculation copied form "Idlescape augement calculator" made by Mac15001900<br>
        <i>https://mac15001900.github.io/idlescape-calc/</i>
        `;
        const form = generateForm();
        const confirmLambda = () => {
            displayPopup('Reset resource tracker?', 'Are you sure you want to reset Resource Tracker data?', () => { this.config.reset(); }, () => {});
        };
        displayCompletePopup(title, message, form, 'Calculate', 'Close');
    }

    function generateForm(){

        let formHtml = `
            <div id="aug-calculator-form>">
                <label for="enchantingLevel">Enchanting level:</label>
                <input type="number" id="enchantingLevel" name="enchantingLevel" value="1" title="The level of your enchanting skill" style="margin-left: 10px;">&nbsp;&nbsp;&nbsp;
                <label for="chances">Chances enchant level:</label>
                <input type="number" id="chances" name="chances" value="0" title="The level of the 'chances' enchantment you're using. Leave 0 if you don't have that yet." style="margin-left: 10px;"><br>
                <label for="goal">Target augment level:</label>
                <input type="number" id="goal" name="goal" value="0" style="margin-left: 10px;"><br><br>

                Expected number of augments: <label id="o1">0</label>
                <br>

                Expected number of items:
                <label id="o2">0</label>
                <br>

                Probability of success on first try:
                <label id="o3">0%</label>
                <br>

                Expected cost (uses fields below):
                <label id="o35">0</label>
                <br>

                <hr>
            </div>
        `;

        return formHtml;
    }

    var bp = 0;
    var chances = 0;
    var goal = 0;

    //Probability of augmenting from (level-1) to level
    function p(level) {
        var res = Math.pow(bp,level) + chances/100;
        if(res>1) res=1;
        return(res);
    };

    //Probability of augmenting from startLevel to endLevel
    function cp(endLevel, startLevel) {
        if(startLevel>0) return cp(endLevel)/cp(startLevel);

        var res=1;
        for (var i = 1; i <= endLevel; i++) {
            res*= p(i);
        }
        return(res);
    };

    function calculate(){
        let enchantingLevel = input("enchantingLevel");
        bp = 0.9 + (Math.sqrt(enchantingLevel * 1.5) / 200);
        chances = input("chances");
        goal = input("goal");

        let averageWaste = 0;
        for (var i = 1; i <= goal; i++) {
            averageWaste+= i*(cp(i-1)*(1-p(i)));
        }

        let successChance = cp(goal);

        output(1, goal+averageWaste/successChance);
        output(2, 1/successChance);
        output(3, (successChance*100)+"%");
    }

    function tooltipCalculate(startLevel, endLevel){
        let enchLvl = 93;
        bp = 0.9 + (Math.sqrt(enchLvl * 1.5) / 200);
        chances = 6;

        let averageWaste = 0;
        for (var i = startLevel; i <= endLevel; i++) {
            averageWaste+= i*(cp(endLevel, startLevel)*(1-p(i)));
        }

        let successChance = cp(endLevel);

       // console.log('enchLvl: ' + enchLvl);
       // console.log('bp: ' + bp);
       // console.log('chances: ' + chances);
       // console.log('averageWaste: ' + averageWaste);
       // console.log('successChance: ' + successChance);
       // console.log('endLevel: ' + endLevel);
       // console.log(endLevel + '+' + averageWaste + '/' + successChance + ' = ' + endLevel+averageWaste/successChance);

        let html = `
        <span class="item-stat">Aug #: ${(endLevel+averageWaste/successChance).toFixed(2)} |
        Items #: ${(1/successChance).toFixed(2)} |
        1st try: ${(successChance*100).toFixed(2)}%</span>
        `;

        return html;
    }

    function input(name) {
        try{
            let res = document.getElementById(name).value;
            res = res.toLowerCase();
            res = res.replace(/k/g,"000");
            res = res.replace(/m/g,"000000");
            res = res.replace(/b/g,"000000000");
            let value = eval(res);
            if(isNaN(value)) {
                value=0;
                document.getElementById(name).style="color:#FF0000";
            }
            else document.getElementById(name).style="color:#FFFFFF";
            return(value);
        } catch(err){
            document.getElementById(name).style="color:#FF0000";
            return 0;
        }
    }

    function output(number, value){
        document.getElementById("o"+number).innerHTML = value;
    }

    function displayCompletePopup(title, message, extendedMessage, confirmString, cancelString, confirmLambda, cancelLambda){
        const popUpId = 'AugCalcPopup';
        const popUpCancel = 'AugCalcCancel';
        const popUpConfirm = 'AugCalcConfirm';
        const extraMessage = extendedMessage === null ? '' : `<div class="aug-calculator-form-holder">${extendedMessage}</div>`;
        const popUpHTML = `<div role="presentation" id="${popUpId}" class="MuiDialog-root donate-dialog feedback-dialog sell-item-dialog popup-dialog" style="position: fixed; z-index: 1300; inset: 0;">
                       <div class="MuiBackdrop-root" aria-hidden="true" style="opacity: 1; transition: opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;"></div>
                       <div tabindex="0" data-test="sentinelStart"></div>
                       <div class="MuiDialog-container MuiDialog-scrollPaper" role="none presentation" tabindex="-1" style="opacity: 1;transition: opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;">
                          <div class="MuiPaper-root MuiDialog-paper MuiDialog-paperScrollPaper MuiDialog-paperWidthSm MuiPaper-elevation24 MuiPaper-rounded" role="dialog">
                             <div class="MuiDialogTitle-root">
                                <h4 class="MuiTypography-root MuiTypography-h6">${title}</h4>
                             </div>
                             <p class="MuiTypography-root MuiDialogContentText-root MuiTypography-body1 MuiTypography-colorTextSecondary">${message}</p>
                             ${extraMessage}
                             <div class="MuiDialogActions-root MuiDialogActions-spacing" style="display: flex;">
                                <div class="button-container-250px">
                                   <div variant="contained" color="secondary" id="${popUpCancel}" class="close-dialog-button idlescape-button idlescape-button-gray" >${cancelString}</div>
                                </div>
                                <div class="button-container-250px">
                                   <div variant="contained" color="secondary" id="${popUpConfirm}" class="close-dialog-button idlescape-button idlescape-button-red">${confirmString}</div>
                                </div>
                             </div>
                          </div>
                       </div>
                       <div tabindex="0" data-test="sentinelEnd"></div>
                    </div>`;
        document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend', popUpHTML);
        document.getElementById(popUpCancel).addEventListener("click",function(){
            document.getElementById(popUpId).remove();
        },false);
        document.getElementById(popUpConfirm).addEventListener("click",function(){
            calculate();
        },false);
    }

    function setupObservers() {
        setupItemTooltipObserver();
    }

    function startObservers() {
        observers.forEach((o) => {
            o.observer.observe(o.target, o.options);
        });
    }

    function stopObservers() {
        observers.forEach((o) => {
            o.observer.disconnect();
        });
    }

    function setupItemTooltipObserver() {
        let self = this;
        let observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length !== 1) return;

                let container = mutation.addedNodes[0];
                if (container.className !== "react-tiny-popover-container") return;

                let tooltip = undefined;
                let itemName = undefined;
                let itemAugmentLevel = undefined;

                // give time for the dom to render the tooltip
                let tooltipTimeout = setTimeout(() => {}, 100);
                try {
                    tooltip = container.getElementsByClassName("item-tooltip")[0];
                    let nameContainer = tooltip.querySelector("span > i")
                        ? tooltip.querySelector("span > i")
                        : tooltip.querySelector("span > span");
                    itemName = nameContainer.firstChild.textContent;
                    itemAugmentLevel = nameContainer.querySelector("b.augmented-text").textContent;

                    clearTimeout(tooltipTimeout);
                } catch (error) {
                    // ignore, probably quickly moving the mouse over items without intending to read tooltip
                }

                let item = window.IdlescapeData.items.getByName(itemName);
                if (!item) {
                    return;
                }

                if(!item.getAugmentCost()) {
                    return;
                }

                let augmentHtml = buildAugCalcDataHTML(itemAugmentLevel);
                let extraDataContainer = document.createElement("span");
                extraDataContainer.className = "enraged-robot-tooltip-container";

                if (augmentHtml) {
                    // extraDataContainer.append(self.menuSeparator());
                    extraDataContainer.append(augmentHtml);
                }

                if (extraDataContainer.hasChildNodes()) {
                    tooltip.append(extraDataContainer);
                }
            }
        });

        observers.push({
            observer: observer,
            target: document.querySelector("body"),
            options: { attributes: true, childList: true, subtree: false },
        });
    }

    function buildAugCalcDataHTML(itemAugmentLevel){
        if(typeof itemAugmentLevel == 'undefined'){
            itemAugmentLevel = 0;
        };

        let span = document.createElement("span");
        let curAugLvl = parseInt(itemAugmentLevel);
        let targetAugLvl = parseInt(itemAugmentLevel) + 1;

        let resourcesHtml = tooltipCalculate(curAugLvl, targetAugLvl);
        let resources15Html = tooltipCalculate(curAugLvl, 15);
        let resources20Html = tooltipCalculate(curAugLvl, 20);

        span.innerHTML = `
        <br/>
        <div id="aug-tooltip-holder-help">
            <span>Hold <strong>CTRL</strong> to see Augment Chances</span>
        </div>
        <div id="aug-tooltip-holder" style="display: none;">
            <br>
            <div>
                <span>Augment Chance (+${curAugLvl} to +${targetAugLvl})<br></span>
                <span class="item-stats" style="grid-template-columns: auto auto; grid-gap: 8px;">
                    ${resourcesHtml}
                </span>
            </div>
            <br>
            <div>
                <span>Augment Chance (+${curAugLvl} to +15)<br></span>
                <span class="item-stats" style="grid-template-columns: auto auto; grid-gap: 8px;">
                    ${resources15Html}
                </span>
            </div>
            <br>
            <div>
                <span>Augment Chance (+${curAugLvl} to +20)<br></span>
                <span class="item-stats" style="grid-template-columns: auto auto; grid-gap: 8px;">
                    ${resources20Html}
                </span>
            </div>
        </div>`;

        return span;

    }

    function startModifierKeyListeners() {
        document.addEventListener("keydown", function _keydown(e) {
            listeners.push({ type: "keydown", fn: _keydown });
            if (e.key === 'Control') {
                let tooltipsHelp = document.getElementById("aug-tooltip-holder-help");
                tooltipsHelp.style.display = "none";

                let tooltips = document.getElementById("aug-tooltip-holder");
                tooltips.style.display = "block";
            }
        });

        document.addEventListener("keyup", function _keyup(e) {
            listeners.push({ type: "keyup", fn: _keyup });
            if (e.key === 'Control') {
                let tooltipsHelp = document.getElementById("aug-tooltip-holder-help");
                tooltipsHelp.style.display = "block";

                let tooltips = document.getElementById("aug-tooltip-holder");
                tooltips.style.display = "none";
            }
        });
    }


    function onGameReady(callback) {
        const gameContainer = document.getElementsByClassName("play-area-container");
        if(gameContainer.length === 0) {
            setTimeout(function(){onGameReady(callback);}, 250 );
        } else {
            callback();
        }
    }

    onGameReady(() => window.GXandarG.init());
})();