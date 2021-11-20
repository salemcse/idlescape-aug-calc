class EnragedRobot {
    constructor() {
        this.extensions = {};
    }

    loadExtensions() {
        this.extensions.Tooltips = new augTooltips(this);
    }
}