class augCalc {
    constructor() {
        this.extensions = {};
    }

    loadExtensions() {
        // this.extensions.augTooltips = new augTooltips(this);
        this.extensions.augUI = new augUI(this);
    }
}