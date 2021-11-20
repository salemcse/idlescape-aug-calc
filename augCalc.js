class augCalc {
    constructor() {
        this.extensions = {};
    }

    loadExtensions() {
        this.extensions.augTooltips = new augTooltips(this);
    }
}