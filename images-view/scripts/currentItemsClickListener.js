
function setCurrentItemsClickListener() {
    let currentItemsContainer = document.querySelector('#current-items-section');
    currentItemsContainer.addEventListener('click', event => {
        let { target } = event;
        let cls = target.classList;
        switch (true) {
            case (cls.contains('checkbox') || cls.contains('select-checkbox')):
                addFileToSelectedFiles(target.parentNode, true, event);
                break;
            case (cls.contains('current-items-grid-item') || cls.contains('current-items-list-item')):
                addFileToSelectedFiles(target, false, event);
                break;
            case cls.contains('change-view-icon'):
                changeView(target);
                break;
            case cls.contains('select-all-icon'):
                selectAllFiles(target);
                break;
            case cls.contains('colorize-file-icon'):
                colorizeFile(target);
                break;
            case cls.contains('grid-view') || cls.contains('list-view'):
                store.dispatch({ type: 'REMOVE_FILE_FROM_SELECTED_FILES', data: [] });
                break;
            default:
                break;
        }
    });
}

function colorizeFile(iconEl) {
    let { selectedFolder, data } = store.getState();
    let selector = iconEl.parentNode.getAttribute('reference-name');
    var colorise;
    if (iconEl.innerHTML == "check_box_outline_blank") {
        colorise = true;
    } else {
        colorise = false;
    }
    var fileTemp;
    for (file in data.files) {
        if (file == selector) {
            fileTemp = data.files[file];
            data.files[file].colorised = colorise;
            break;
        }
    }
    updateCurrentFiles(selectedFolder.name);
    fillSelectedItemInfo(fileTemp);
}

function selectAllFiles(target) {
    if (target.innerHTML == 'check_box_outline_blank') {
        if (store.getState().currentView == "grid") {
            var files = document.getElementsByClassName('current-items-grid-item');
        } else {
            var files = document.getElementsByClassName('current-items-list-item');
        }
        if (files.length == 0) return;
        let references = [];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let fileReference = file.getAttribute('reference-name');
            references.push(fileReference);
        }
        store.dispatch({ type: 'REMOVE_FILE_FROM_SELECTED_FILES', data: references });
        target.innerHTML = 'check_box_outline_selected';
    } else {
        store.dispatch({ type: 'REMOVE_FILE_FROM_SELECTED_FILES', data: [] });
        target.innerHTML = 'check_box_outline_blank';
    }

}

function resetSelectAllButton() {
    let target = document.querySelector('.select-all-icon');
    target.innerHTML = 'check_box_outline_blank';
}

function changeView(changeViewIcon) {
    if (changeViewIcon.getAttribute('current-view') == 'grid') {
        store.dispatch({ type: 'CHANGE_CURRENT_VIEW', data: 'list' })
        changeViewIcon.setAttribute('current-view', 'list');
    } else {
        store.dispatch({ type: 'CHANGE_CURRENT_VIEW', data: 'grid' })
        changeViewIcon.setAttribute('current-view', 'grid');
    }

}

function addFileToSelectedFiles(file, checkClicked, event) {
    let state = store.getState();
    let { ctrlKey, shiftKey } = event;
    if (checkClicked) {
        if (state.selectedFiles.includes(file.getAttribute('reference-name'))) {
            let newArr = [...state.selectedFiles];
            newArr.splice(newArr.indexOf(file.getAttribute('reference-name')), 1);
            store.dispatch({ type: 'REMOVE_FILE_FROM_SELECTED_FILES', data: newArr });
        } else {
            store.dispatch({ type: 'ADD_FILE_TO_SELECTED_FILES', data: file.getAttribute('reference-name') });
        }
    } else {
        if (state.selectedFiles.includes(file.getAttribute('reference-name'))) {
            if (state.selectedFiles.length == 1) {
                store.dispatch({ type: 'REMOVE_FILE_FROM_SELECTED_FILES', data: [] });
            } else {
                if (ctrlKey) {
                    let newArr = [...state.selectedFiles];
                    newArr.splice(newArr.indexOf(file.getAttribute('reference-name')), 1);
                    store.dispatch({ type: 'REMOVE_FILE_FROM_SELECTED_FILES', data: newArr });
                } else {
                    store.dispatch({ type: 'SET_FILE_TO_SELECTED_FILES', data: file.getAttribute('reference-name') });
                }
            }
        } else {
            if (ctrlKey) {
                store.dispatch({ type: 'ADD_FILE_TO_SELECTED_FILES', data: file.getAttribute('reference-name') });
            } else if (shiftKey && state.selectedFiles.length > 0) {
                let elementsToSelect = getElementsToSelect(state, event.target);
                store.dispatch({ type: 'REMOVE_FILE_FROM_SELECTED_FILES', data: elementsToSelect });
            } else {
                store.dispatch({ type: 'SET_FILE_TO_SELECTED_FILES', data: file.getAttribute('reference-name') });
            }
        }
    }
}

function getElementsToSelect(state, target) {
    let elementsToSelect = [];
    let { selectedFiles, currentView } = state
    let containerEl = currentView == 'grid' ? document.querySelector('.grid-view') : document.querySelector('.list-view');
    let children = Array.from(containerEl.children);
    let indexes = [children.indexOf(target)];
    for (let i = 0; i < selectedFiles.length; i++) {
        let selectedFile = selectedFiles[i];
        var fileEl = currentView == 'grid' ? document.querySelector(`div[reference-name="${selectedFile}"]`) : document.querySelector(`li[reference-name="${selectedFile}"]`);
        indexes.push(children.indexOf(fileEl))
    }
    indexes.sort(numberSort);
    for (let i = indexes[0]; i <= indexes[indexes.length - 1]; i++) {
        if (children[i].getAttribute('reference-name')) {
            elementsToSelect.push(children[i].getAttribute('reference-name'));
        }
    }
    return elementsToSelect;
}

numberSort = function (a, b) {
    return a - b;
};
