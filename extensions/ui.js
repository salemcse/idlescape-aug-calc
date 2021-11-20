class augUI {
    constructor(augCalc) {
        this.augCalc = augCalc;
        this.observers = [];
        this.listeners = [];

        this.addUIButton();
    }

    addUIButton() {
        const buttonId = "aug_calculator";
        const imageButtonHtml = `<img src="/images/enchanting/enchanting_logo.png" id="${buttonId}" alt="Augment Calculator" class="header-league-icon">`;
        document.getElementById('usersOnline').insertAdjacentHTML('beforeend', imageButtonHtml);
        let imageButton = document.getElementById(buttonId);

        imageButton.addEventListener("click", function(){
            showSummary();
        },false);
    }
}