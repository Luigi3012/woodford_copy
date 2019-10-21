
let initialState = {
    homeEntity: null,
    selectedEntity: null,
    cachedState: null,
    bannerSelected: false
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
                    selectedEntity: state.selectedEntity == action.data ? null : action.data
                }
            case "SELECT_BANNER":
                return {
                    ...state,
                    selectedEntity: action.data ? null : state.selectedEntity,
                    bannerSelected: action.data
                }
            case "RESET_SELECTED":
                return {
                    ...state,
                    selectedEntity: null,
                    bannerSelected: false
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
                case "bannerSelected":
                    rerenderSelectedBanner(state.bannerSelected);
                    return;
                case "selectedEntity":
                    renderSelectedEntity(state.selectedEntity);
                    break;
            }
        }
    }
}

function rerenderSelectedBanner(render) {
    let bannerEl = document.querySelector('.banner-list').querySelector('.editor-banner');
    let propertiesEl = document.querySelector('.banner-properties-component');
    if (!render) {
        console.log(1);
        propertiesEl.classList.add('hidden');
        return;
    }

    bannerEl.classList.add('selected');
    let currentLabel = document.querySelector('.draggable-list-item-label');
    if (currentLabel) currentLabel.outerHTML = "";
    let labelEl = document.createElement('DIV');
    labelEl.classList.add('draggable-list-item-label');
    labelEl.innerHTML = "Banner";
    bannerEl.appendChild(labelEl);

    let bannerData = retrieveBannerData(bannerEl);
    fillBannerProperties(bannerData);
}

function fillBannerProperties(bannerData) {
    let propertiesEl = document.querySelector('.banner-properties-component');
    let heightInputEl = propertiesEl.querySelector('.banner-height');
    let colorEl = propertiesEl.querySelector('.color-placeholder');

    colorEl.style.backgroundColor = bannerData.backgroundColor;
    heightInputEl.value = bannerData.height;
    propertiesEl.classList.remove('hidden');
}

function retrieveBannerData(bannerEl) {
    let heightPx = $(bannerEl).css('height');
    return {
        height: heightPx.slice(0, heightPx.indexOf('px')),
        backgroundColor: $(bannerEl).css('background-color')
    }
}

function renderSelectedEntity(entity) {
    //reset current selectedEntity
    if (entity && entity.classList.contains('editor-banner')) return;
    let currentSelectedEl = document.getElementsByClassName('draggable-list-item selected')[0];
    let currentLabel = document.querySelector('.draggable-list-item-label');
    if (currentLabel) currentLabel.outerHTML = "";
    if (currentSelectedEl) {
        currentSelectedEl.classList.remove('selected');
    }
    let propertiesComponent = document.querySelector('.entity-properties-component');
    let propertiesBannerComponent = document.querySelector('.banner-properties-component');
    if (!entity) {
        propertiesComponent.classList.add('hidden');
        let imagesContainer = document.querySelector('.images-container');
        let currentSelected = imagesContainer.querySelector('.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        return;
    }
    entity.classList.add('selected');
    propertiesComponent.classList.remove('hidden');
    propertiesBannerComponent.classList.add('hidden');
    let labelEl = document.createElement('DIV');
    labelEl.classList.add('draggable-list-item-label');
    labelEl.innerHTML = entity.innerText;
    entity.appendChild(labelEl);

    let entityData = retrieveEntityInformation(entity);
    selectPropertiesImage(entityData.iconName);
    fillProperties(entityData);
}

function fillProperties(entityData) {
    let propertiesComponent = document.querySelector('.properties-section');
    let rowHeightInput = propertiesComponent.querySelector('.row-height');
    let textSizeInput = propertiesComponent.querySelector('.text-size');
    let textBoldButton = propertiesComponent.querySelector('.bold-button');
    let iconHeightInput = propertiesComponent.querySelector('.icon-height');
    let iconWidthInput = propertiesComponent.querySelector('.icon-width');


    rowHeightInput.value = entityData.height;
    textSizeInput.value = entityData.fontSize;
    entityData.fontWeight <= 400 ? null : textBoldButton.classList.add('selected');
    iconHeightInput.value = Math.ceil(entityData.iconHeight);
    iconWidthInput.value = Math.ceil(entityData.iconWidth);
}

function selectPropertiesImage(imageName) {
    let imagesContainer = document.querySelector('.images-container');
    let currentSelected = imagesContainer.querySelector('.selected');
    if (currentSelected) {
        currentSelected.classList.remove('selected');
    }
    if (imageName) {
        let imageEl = imagesContainer.querySelector('.' + imageName);
        imageEl.classList.add('selected');
    }
}

function retrieveEntityInformation(entity) {
    let backgroundImage = $(entity.querySelector('.entity-icon')).css('background-image');
    let res = backgroundImage.slice(backgroundImage.indexOf('images') + 7, backgroundImage.indexOf('.png'));
    let fontSizePx = $(entity).css('font-size');
    let iconWidthPx = $(entity.querySelector('.entity-icon')).css('width');
    let iconHeightPx = $(entity.querySelector('.entity-icon')).css('height');
    let entityData = {
        height: $(entity).outerHeight(),
        fontSize: fontSizePx.slice(0, fontSizePx.indexOf('px')),
        fontWeight: $(entity).css('font-weight'),
        iconWidth: iconWidthPx.slice(0, iconWidthPx.indexOf('px')),
        iconHeight: iconHeightPx.slice(0, iconHeightPx.indexOf('px')),
        iconName: "l" + res
    }
    return entityData;
}

function updateHomeEntity(state) {
    let currentHomeEl = document.getElementsByClassName('set-home-icon selected')[0];
    if (currentHomeEl) {
        currentHomeEl.classList.remove('selected');
    }
    if (!state.homeEntity) return;
    state.homeEntity.querySelector('.set-home-icon').classList.add('selected');
}
