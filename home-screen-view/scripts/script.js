
let initialState = {
    homeEntity: null,
    selectedEntity: null,
    cachedState: null
}

let lastDispatchIsCache = false;

window.addEventListener('DOMContentLoaded', () => {
    let { createStore } = window.Redux;
    function reducer(state = initialState, action) {
        switch (action.type) {
            case "SET_ENTITY_HOME":
                return {
                    ...state,
                    homeEntity: state.homeEntity == action.data ? null : action.data
                }
            case "CACHE_STATE":
                lastDispatchIsCache = true;
                return {
                    ...state,
                    cachedState: {
                        ...state
                    }
                }
            case "SET_SELECTED_ENTITY":
                return {
                    ...state,
                    selectedEntity: action.data
                }
            default:
                return {
                    ...state
                }
        }
    }
    store = createStore(reducer);
    store.subscribe(onStateChange);
    store.dispatch({ type: "" });
});

function onStateChange() {
    if (lastDispatchIsCache) {
        lastDispatchIsCache = false;
        return;
    }
    let state = store.getState();
    if (!state.cachedState) {
        store.dispatch({ type: "CACHE_STATE" });
    } else {
        compareStates(state, state.cachedState);
        store.dispatch({ type: "CACHE_STATE" });
    }
}

function compareStates(state, cachedState) {
    let equals;
    for (prop1 in state) {
        equals = true;
        for (prop2 in cachedState) {
            if (prop1 == prop2) {
                equals = _.isEqual(state[prop1], cachedState[prop2]);
                break;
            }
        }
        if (!equals) {
            switch (prop1) {
                case "homeEntity":
                    updateHomeEntity(state);
                    break;
                case "selectedEntity":
                    console.log(state.selectedEntity);
            }
        }
    }
}

function updateHomeEntity(state) {
    let currentHomeEl = document.getElementsByClassName('set-home-icon selected')[0];
    if (currentHomeEl) {
        currentHomeEl.classList.remove('selected');
    }
    if (!state.homeEntity) return;
    state.homeEntity.querySelector('.set-home-icon').classList.add('selected');
}
