
let screenState = "phone";

window.addEventListener('DOMContentLoaded', () => {
    let tabBar = document.querySelector('.tab-bar');
    tabBar.addEventListener('click', event => {
        if(event.target.classList.contains('active')) return;
        if(screenState == "phone")
            setScreenStateTablet();
        else
            setScreenStatePhone();
    });
});

function setScreenStateTablet() {
    let tabBarItems = document.querySelectorAll('.tab-bar-item');
    for(let i = 0; i < tabBarItems.length; i++) {
        let item = tabBarItems[i];
        if(item.classList.contains('active')) {
            item.classList.remove('active');
        } else {
            item.classList.add('active');
        }
    }
    let screensContainer = document.querySelector('#screens-container');
    for(let i = 0; i < screensContainer.children.length; i++) {
        let child = screensContainer.children[i];
        if(child.classList.contains('phone-screen')) {
            child.style.opacity = 0;
            setTimeout(() => {
                child.classList.add("hidden");
            }, 200);
        }
    }
    setTimeout(() => {
        document.querySelector('.tablet-screen').classList.remove('hidden');
        document.querySelector('.tablet-screen').style.opacity = 1;
    }, 200);
    
    screenState = "tablet";
}

function setScreenStatePhone() {
    let tabBarItems = document.querySelectorAll('.tab-bar-item');
    for(let i = 0; i < tabBarItems.length; i++) {
        let item = tabBarItems[i];
        if(item.classList.contains('active')) {
            item.classList.remove('active');
        } else {
            item.classList.add('active');
        }
    }
    document.querySelector('.tablet-screen').style.opacity = 0;
    setTimeout(() => {
        console.log(1);
        document.querySelector('.tablet-screen').classList.add('hidden');
        let screensContainer = document.querySelector('#screens-container');
        for(let i = 0; i < screensContainer.children.length; i++) {
            let child = screensContainer.children[i];
            if(child.classList.contains('phone-screen')) {
                child.classList.remove("hidden");
                child.style.opacity = 1;
            }
        }
        screenState = "phone";
    }, 200);
}
