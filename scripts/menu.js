
var store;

window.addEventListener('DOMContentLoaded', () => {
    setupRedux(() => {
        document.querySelector('.items-container').addEventListener('click', onMenuItemClick);
    });
});

function setupRedux(Resolve) {
    var defaultState = {
        currentView: null
    }
    let { createStore } = window.Redux;
    function reducer(state = defaultState, action) {
        switch (action.type) {
            case "CHANGE_CURRENT_VIEW":
                return {
                    ...state,
                    currentView: action.data
                }
            default:
                return {
                    ...state
                }
        }
    }
    store = createStore(reducer);
    store.subscribe(onStateChange);
    Resolve();
}

function onStateChange() {
    let state = store.getState();
    rerenderApp(state);
}

function onMenuItemClick(event) {
    let { target } = event;
    let state = store.getState();
    if (state.currentView == target.getAttribute('selector')) {
        store.dispatch({ type: 'CHANGE_CURRENT_VIEW', data: null });
    } else {
        store.dispatch({ type: 'CHANGE_CURRENT_VIEW', data: target.getAttribute('selector') });
    }
}

function rerenderApp(state) {
    resetApp();
    updateApp(state);
}

function updateApp(state) {
    let { currentView } = state;
    var toSelectItem = document.querySelector(`div[selector=${currentView}]`);
    if (toSelectItem) {
        currentView = currentView.replace("-list-item", "");
        toSelectItem.classList.add('selected');
        let toolbarAddon = document.querySelector(`.${currentView}-toolbar-addon`);
        toolbarAddon.classList.remove('hidden');
        document.querySelector('.main-content').querySelector('iframe').src = `${currentView}-view`;
    }
}

function resetApp() {
    let selectedItem = document.getElementsByClassName('list-item selected')[0];
    if (selectedItem) {
        selectedItem.classList.remove('selected');
    }
    let toolbarAddons = document.querySelectorAll('.toolbar-addon');
    for (let i = 0; i < toolbarAddons.length; i++) {
        let toolbarAddon = toolbarAddons[i]
        if (!toolbarAddon.classList.contains('hidden')) {
            toolbarAddon.classList.add('hidden');
        }
    }
    document.querySelector('.main-content').querySelector('iframe').src = ""
}


// function updatePage() {
//     let selectedItem = document.getElementsByClassName('list-item selected')[0];
//     if (!selectedItem) {
//         document.querySelector('.main-content').innerHTML = "Here will be displayed no content...";
//         return;
//     }
//     let selectedName = selectedItem.innerText;
//     document.querySelector('.main-content').innerHTML = "Here will be displayed " + selectedName + " content...";
// }
