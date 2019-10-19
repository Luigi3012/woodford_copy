
var colorpicker;

window.addEventListener('DOMContentLoaded', () => {
    let editorComponentEl = document.querySelector('.editor-component');
    let editorSectionEl = document.querySelector('.editor-section');
    let propertiesComponentEl = document.querySelector('.entity-properties-component');
    setPropertiesChangeListener();
    setBannerClickListener();
    editorComponentEl.addEventListener('click', event => {
        let { target } = event;
        let cls = target.classList;
        switch (true) {
            case cls.contains('set-home-icon'):
                store.dispatch({ type: "SET_ENTITY_HOME", data: target.parentNode.parentNode });
                break;
            case cls.contains('draggable-list-item'):
                if (target.classList.contains('section')) break;
                store.dispatch({ type: "SET_SELECTED_ENTITY", data: target });
                break;
        }
    });
    editorSectionEl.addEventListener('click', event => {
        let { target } = event;
        if (target.classList.contains('editor-section')) {
            store.dispatch({ type: "RESET_SELECTED" });
        }
    });
    propertiesComponentEl.addEventListener('click', event => {
        let { target } = event;
        let cls = target.classList;
        switch (true) {
            case cls.contains('properties-link'):
                let iframeEl = parent.document.querySelector('iframe');
                let homeScreenToolbar = parent.document.querySelector('.home-screen-toolbar-addon');
                let themeViewToolbar = parent.document.querySelector('.theme-toolbar-addon');
                let listItemTheme = parent.document.querySelector('.items-container').querySelectorAll('.list-item')[1];
                let listItemHome = parent.document.querySelector('.items-container').querySelectorAll('.list-item')[0];
                iframeEl.src = "theme-view";
                homeScreenToolbar.classList.add('hidden');
                themeViewToolbar.classList.remove('hidden');
                listItemHome.classList.remove('selected');
                listItemTheme.classList.add('selected');

                break;
            case cls.contains('colorize-button'):
                if (cls.contains('selected')) {
                    cls.remove('selected');
                } else {
                    cls.add('selected');
                }
                break;
            case cls.contains('image'):
                changeEntityIcon(target);
                break;
        }
    });
});

function setBannerClickListener() {
    let bannerContainerEl = document.querySelector('.banner-list');
    bannerContainerEl.addEventListener('click', event => {
        let { target } = event;
        let cls = target.classList;
        switch (true) {
            case cls.contains('editor-banner'):
                onBannerClick(target);
                break;
            case cls.contains('remove-button'):
                removeBanner(target);
                break;
        }
    });
}

function onBannerClick(target) {
    if (target.classList.contains('selected')) {
        store.dispatch({ type: "SELECT_BANNER", data: false });
    } else {
        store.dispatch({ type: "SELECT_BANNER", data: false });
        store.dispatch({ type: "SELECT_BANNER", data: true });
    }
}

function removeBanner(target) {
    store.dispatch({ type: "RESET_SELECTED" });
    target.parentNode.classList.add('collapsed');
    [...target.parentNode.children].map(item => {
        if (item.classList.contains('editor-banner')) {
            item.outerHTML = "";
            return;
        }
    });
    let specialItemsEl = document.querySelector('.special-items-list');
    let bannerListEl = specialItemsEl.getElementsByClassName('draggable-list-item disabled')[0];
    bannerListEl.classList.remove('disabled');
}

function setPropertiesChangeListener() {
    let propertiesContainer = document.querySelector('.properties-section');
    let inputs = propertiesContainer.querySelectorAll('.number-input');
    [...inputs].map(input => {
        $(input).on("change", onInputChange);
    });
    let boldButton = propertiesContainer.querySelector('.bold-button');
    boldButton.addEventListener('click', event => {
        let { target } = event;
        if (target.classList.contains('selected')) {
            changeEntitiesBoldness(400);
            target.classList.remove('selected');
        } else {
            changeEntitiesBoldness(500);
            target.classList.add('selected');
        }
    });
    setBannerPropertiesChangeListener();
}

function setBannerPropertiesChangeListener() {
    let propertiesContainer = document.querySelector('.banner-properties-component');
    let colorEl = propertiesContainer.querySelector('.color-placeholder');
    propertiesContainer.addEventListener('click', event => {
        let { target } = event;
        let cls = target.classList;
        switch (true) {
            case cls.contains('search-button'):
                if (target.classList.contains('selected')) {
                    hideSearchBar();
                    expandBoundaries();
                    target.classList.remove('selected');
                } else {
                    showSearchBar();
                    smallerBoundaries();
                    target.classList.add('selected');
                }
                break;
            case cls.contains('background-image-button'):
                if (target.classList.contains('selected')) {
                    hideBackgroundImage();
                    target.classList.remove('selected');
                } else {
                    showBackgroundImage();
                    target.classList.add('selected');
                }
                break;
            case cls.contains('two-state-button'):
                if (target.classList.contains('selected')) {
                    foregroundText();
                    target.classList.remove('selected');
                } else {
                    foregroundImage();
                    target.classList.add('selected');
                }
                break;
        }
    });
    let inputs = propertiesContainer.querySelectorAll('.text-input');
    [...inputs].map(input => {
        $(input).on("change", onBannerHeaderChange);
    });
    createColorPicker(colorEl);
    setPositionComponentEventListener();
}

function showBackgroundImage() {
    let backgroundImages = document.querySelectorAll('.background-image');
    [...backgroundImages].map(item => {
        item.classList.remove('hidden');
    });
}

function hideBackgroundImage() {
    let backgroundImages = document.querySelectorAll('.background-image');
    [...backgroundImages].map(item => {
        item.classList.add('hidden');
    });
}

function foregroundImage() {
    let foregroundImages = document.querySelectorAll('.banner-header');
    [...foregroundImages].map(item => {
        item.innerText = "";
        item.classList.add('image-show');
    });
}

function foregroundText() {
    let foregroundImages = document.querySelectorAll('.banner-header');
    let text = document.getElementsByClassName('text-input standalone')[0].value;
    [...foregroundImages].map(item => {
        item.innerText = text;
        item.classList.remove('image-show');
    });
}

function smallerBoundaries() {
    let boundariesEls = document.querySelectorAll('.header-boundaries');
    [...boundariesEls].map(item => {
        item.classList.remove('expanded');
    });
}

function expandBoundaries() {
    let boundariesEls = document.querySelectorAll('.header-boundaries');
    [...boundariesEls].map(item => {
        item.classList.add('expanded');
    });
}

function setPositionComponentEventListener() {
    let component = document.querySelector('.position-component');
    component.addEventListener('click', event => {
        let bannerHeaders = document.querySelectorAll('.banner-header');
        let { target } = event;
        let cls = target.classList;
        [...target.classList].map(clss => {
            if (clss.length == 2 && clss.includes('c')) {
                let currentSelected = component.querySelector('.selected');
                if (currentSelected) currentSelected.classList.remove('selected');
                cls.add('selected');
            }
        });
        switch (true) {
            case cls.contains('c1'):
                setBannerHeaderPosition(bannerHeaders, 'c1');
                break;
            case cls.contains('c2'):
                setBannerHeaderPosition(bannerHeaders, 'c2');
                break;
            case cls.contains('c3'):
                setBannerHeaderPosition(bannerHeaders, 'c3');
                break;
            case cls.contains('c4'):
                setBannerHeaderPosition(bannerHeaders, 'c4');
                break;
            case cls.contains('c5'):
                setBannerHeaderPosition(bannerHeaders, 'c5');
                break;
            case cls.contains('c6'):
                setBannerHeaderPosition(bannerHeaders, 'c6');
                break;
            case cls.contains('c7'):
                setBannerHeaderPosition(bannerHeaders, 'c7');
                break;
            case cls.contains('c8'):
                setBannerHeaderPosition(bannerHeaders, 'c8');
                break;
            case cls.contains('c9'):
                setBannerHeaderPosition(bannerHeaders, 'c9');
                break;
        }
    });
}

function setBannerHeaderPosition(bannerHeaders, position) {
    [...bannerHeaders].map(item => {
        [...item.classList].map(cls => {
            if (cls.length == 2 && cls.includes('c')) {
                item.classList.remove(cls);
            }
        });
        item.classList.add(position);
    });
}

function onBannerHeaderChange(event) {
    let bannerHeaders = document.querySelectorAll('.banner-header');
    [...bannerHeaders].map(item => {
        item.innerHTML = event.target.value;
    })
}

function showSearchBar() {
    let bannerEls = document.querySelectorAll('.editor-banner');
    [...bannerEls].map(item => {
        item.querySelector('.search-bar').classList.remove('hidden');
    })
}

function hideSearchBar() {
    let bannerEls = document.querySelectorAll('.editor-banner');
    [...bannerEls].map(item => {
        item.querySelector('.search-bar').classList.add('hidden');
    })
}

function createColorPicker(colorEl) {
    colorpicker = new ColorPicker.Default(colorEl, {
        color: $(colorEl).css('background-color'),
        customClass: "colorpicker-custom",
        anchor: {
            hidden: false,
            cssProperty: "background-color"
        },
        placement: 'left'
    });
    colorpicker.on('change', color => {
        let bannerEls = document.querySelectorAll('.editor-banner');
        [...bannerEls].map(item => {
            item.style.backgroundColor = color.rgba;
        });
    });
}

function onInputChange(event) {
    let { target } = event;
    let cls = target.classList;
    switch (true) {
        case cls.contains('row-height'):
            changeEntitiesRowHeight(target.value);
            break;
        case cls.contains('text-size'):
            changeEntitiesFontSize(target.value);
            break;
        case cls.contains('icon-height'):
            changeEntitiesIconHeight(target.value);
            break;
        case cls.contains('icon-width'):
            changeEntitiesIconWidth(target.value);
            break;
        case cls.contains('banner-height'):
            changeBannerHeight(target.value);
            break;
    }
}

function changeBannerHeight(value) {
    let bannerEls = document.querySelectorAll('.editor-banner');
    let bannerList = document.querySelector('.banner-list');
    bannerList.style.height = value;
    [...bannerEls].map(item => {
        item.style.height = value;
    });
}

function changeEntitiesBoldness(value) {
    let listItems = document.querySelectorAll('.draggable-list-item');
    [...listItems].map(item => {
        item.style.fontWeight = value;
    });
}

function changeEntitiesIconHeight(value) {
    let listItems = document.querySelectorAll('.draggable-list-item');
    [...listItems].map(item => {
        let icon = item.querySelector('.entity-icon');
        if (!icon) return;
        icon.style.height = value + "px";
    });
}

function changeEntitiesIconWidth(value) {
    let listItems = document.querySelectorAll('.draggable-list-item');
    [...listItems].map(item => {
        let icon = item.querySelector('.entity-icon');
        if (!icon) return;
        icon.style.width = value + "px";
    });
}


function changeEntitiesRowHeight(value) {
    let listItems = document.querySelectorAll('.draggable-list-item');
    [...listItems].map(item => {
        if (!item.classList.contains('editor-banner')) {
            item.style.height = value;
        }
    })
}

function changeEntitiesFontSize(value) {
    let listItems = document.querySelectorAll('.draggable-list-item');
    [...listItems].map(item => {
        item.style.fontSize = value;
    })
}

function changeEntityIcon(imageEl) {
    let state = store.getState();
    let { selectedEntity } = state;

    let currentSelected = document.getElementsByClassName('image selected')[0];
    if (currentSelected) currentSelected.classList.remove('selected');

    var imgNumber;
    [...imageEl.classList].map(cls => {
        if (cls.length < 4 && cls.includes('l')) {
            imgNumber = cls.slice(cls.indexOf('l') + 1, cls.length);
        }
    });
    let iconEl = selectedEntity.querySelector('.entity-icon');
    iconEl.classList = []
    iconEl.classList.add('entity-icon', `l${imgNumber}`);
    imageEl.classList.add('selected');

}
