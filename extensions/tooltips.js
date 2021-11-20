class augTooltips {
    constructor(augCalc) {
        this.augCalc = augCalc;
        this.observers = [];
        this.listeners = [];
    }

    enable() {
        let waitInterval = setInterval(() => {
            if (typeof window.IdlescapeData !== "undefined") {
                clearInterval(waitInterval);
            }
        }, 150);

        this.setupObservers();
        this.startObservers();
        // this.startModifierKeyListeners();
    }

    disable() {
        this.stopObservers();
        // this.stopModifierKeyListeners();
        this.observers = [];
    }

    setupObservers() {
        this.setupItemTooltipObserver();
    }

    startObservers() {
        this.observers.forEach((o) => {
            o.observer.observe(o.target, o.options);
        });
    }

    stopObservers() {
        this.observers.forEach((o) => {
            o.observer.disconnect();
        });
    }

    startModifierKeyListeners() {
        let self = this;
        document.addEventListener("keydown", function _keydown(e) {
            self.listeners.push({ type: "keydown", fn: _keydown });
            // if (self.augCalc.getOption("tooltips.useModifierKey") && e.key === self.augCalc.getOption("tooltips.modifierKey")) {
                let tooltips = document.getElementsByClassName("aug-calc-tooltip-container");
                for (let el in tooltips) {
                    if (!tooltips.hasOwnProperty(el)) continue;
                    tooltips[el].style.display = "inline";
                }
            // }
        });

        document.addEventListener("keyup", function _keyup(e) {
            self.listeners.push({ type: "keyup", fn: _keyup });
            // if (self.augCalc.getOption("tooltips.useModifierKey") && e.key === self.augCalc.getOption("tooltips.modifierKey")) {
                let tooltips = document.getElementsByClassName("aug-calc-tooltip-container");
                for (let el in tooltips) {
                    if (!tooltips.hasOwnProperty(el)) continue;
                    tooltips[el].style.display = "none";
                }
            // }
        });
    }

    stopModifierKeyListeners() {
        this.listeners.forEach((l) => {
            document.removeEventListener(l.type, l.fn);
        });
    }

    setupItemTooltipObserver() {
        let self = this;
        let observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length !== 1) return;

                let container = mutation.addedNodes[0];
                if (container.className !== "react-tiny-popover-container") return;

                let tooltip = undefined;
                let itemName = undefined;
                let itemQuantity = undefined;
                // give time for the dom to render the tooltip
                let tooltipTimeout = setTimeout(() => {}, 100);
                try {
                    tooltip = container.getElementsByClassName("item-tooltip")[0];
                    let nameContainer = tooltip.querySelector("span > i")
                        ? tooltip.querySelector("span > i")
                        : tooltip.querySelector("span > span");
                    itemName = nameContainer.firstChild.textContent;
                    itemQuantity = tooltip
                        .getElementsByClassName("tooltip-text-image left")[0]
                        .innerText.match(/Quantity: ([0-9,]+)/)[1]
                        .replace(/,/g, "");
                    clearTimeout(tooltipTimeout);
                } catch (error) {
                    // ignore, probably quickly moving the mouse over items without intending to read tooltip
                }
                let item = window.IdlescapeData.items.getByName(itemName);
                if (!item) {
                    return;
                }

                let augmentHtml = self.buildAugmentDataHTML(item);
                let extraDataContainer = document.createElement("span");
                extraDataContainer.className = "aug-calc-tooltip-container";
                extraDataContainer.style.display = self.augCalc.getOption("tooltips.useModifierKey") ? "none" : "inline";

                if (augmentHtml) {
                    extraDataContainer.append(self.menuSeparator());
                    extraDataContainer.append(augmentHtml);
                }

                if (extraDataContainer.hasChildNodes()) {
                    tooltip.append(extraDataContainer);
                }
            }
        });

        this.observers.push({
            observer: observer,
            target: document.querySelector("body"),
            options: { attributes: true, childList: true, subtree: false },
        });
    }

    buildAugmentDataHTML(item) {
        let augCost = item.getAugmentCost();
        let augStats = item.getAugmentStats();
        if (!augCost && !augStats) return undefined;

        let resourcesHtml = ``;
        if (augCost) {
            Object.values(augCost).forEach((v) => {
                resourcesHtml += `<span class="item-stat">${v.cost}x ${v.name}</span>`;
            });
        }

        let augmentStatsHtml = ``;
        if (augStats) {
            for (const type in augStats.stats) {
                let style = augStats.isScroll ? `grid-column: 1/3;` : ``;
                let stats = `<span class="item-stat" style="width: 95%; ${style}"><span style="font-weight: bold">${type}</span><br/>`;
                for (const stat of augStats.stats[type].values()) {
                    stats += `${stat.stat} <span style="float: right">+${stat.value}</span><br/>`;
                }
                stats += `</span>`;
                augmentStatsHtml += stats;
            }
        }

        let span = document.createElement("span");
        span.innerHTML = `
            <div>
                <span>Augmentation Cost<br></span>
                <span class="item-stats" style="grid-template-columns: auto auto; grid-gap: 8px;">
                    ${resourcesHtml}
                </span>
                <br>
                <span>Augmentation Stats<br></span>
                <span class="item-stats" style="grid-template-columns: auto auto; grid-gap: 8px;">
                    ${augmentStatsHtml}
                </span>
            </div>`;

        return span;
    }

    menuSeparator() {
        let separator = document.createElement("span");
        separator.append(document.createElement("hr"));
        separator.append(document.createElement("br"));
        return separator;
    }
}