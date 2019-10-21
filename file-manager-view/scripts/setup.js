
let initialState = {
    selectedFolder: null,
    selectedFiles: [],
    data: null,
    cachedState: null,
    currentView: 'grid'
}

lastDispatchIsCache = false;

window.addEventListener('DOMContentLoaded', () => {
    let { createStore } = window.Redux;
    function reducer(state = initialState, action) {
        switch (action.type) {
            case "SET_STATE":
                return {
                    ...state,
                    data: action.data
                };
            case "CACHE_STATE":
                lastDispatchIsCache = true;
                return {
                    ...state,
                    cachedState: {
                        ...state
                    }
                }
            case "SET_SELECTED_FOLDER":
                if (action.data.resetSelectedFolder) {
                    return {
                        ...state,
                        selectedFolder: null
                    }
                } else {
                    return {
                        ...state,
                        selectedFolder: {
                            element: action.data.clickedFolderElement,
                            name: action.data.clickedFolderName
                        }
                    }
                }
            case "SET_FILE_TO_SELECTED_FILES":
                return {
                    ...state,
                    selectedFiles: [action.data]
                }
            case "ADD_FILE_TO_SELECTED_FILES":
                return {
                    ...state,
                    selectedFile: null,
                    selectedFiles: [...state.selectedFiles, action.data]
                }
            case "REMOVE_FILE_FROM_SELECTED_FILES":
                return {
                    ...state,
                    selectedFiles: [...action.data]
                }
            case "CHANGE_CURRENT_VIEW":
                return {
                    ...state,
                    currentView: action.data
                }
            // case "CHANGE_COLORIZE_OF_FILE":
            // // return {
            // //     ...state,
            // //     selectedFile: {
            // //         ...state.selectedFile,
            // //         colorized: action.data
            // //     }
            // // }
            default:
                return {
                    ...state
                }
        }
    }
    store = createStore(reducer);
    store.subscribe(onStateChange);
    //redux ready

    fetchData();
});

function fetchData() {
    JSZipUtils.getBinaryContent('./src/FileManager.zip', function (err, data) {
        if (err) {
            throw err;
        }
        JSZip.loadAsync(data, { base64: true }).then(function (zip) {
            store.dispatch({ type: "SET_STATE", data: zip });
        });
    });
}

function onStateChange() {
    if (lastDispatchIsCache) {
        lastDispatchIsCache = false;
        return;
    }
    let state = store.getState();
    if (!state.cachedState) {
        getColorizeData(state.data)
        renderApp(state);
        store.dispatch({ type: "CACHE_STATE" });
    } else {
        compareStates(state, state.cachedState);
        store.dispatch({ type: "CACHE_STATE" });
    }
}

function getColorizeData(data) {
    let { files } = data;
    for (file in files) {
        let fileData = _arrayBufferToBase64(files[file]['_data'].compressedContent);
        if (fileData.includes('u0Pl8Q')) {
            files[file].colorised = true;
        } else {
            files[file].colorised = false;
        }
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
                case "selectedFolder":
                    rerenderSelectedFolder(state);
                    break;
                case "selectedFiles":
                    rerenderSelectedFiles(state);
                    break;
                case "currentView":
                    changeCurrentView(state);
                    break;
            }
        }
    }
}

function changeCurrentView(state) {
    let containerEl = document.querySelector('#current-items-section');
    let gridViewEl = containerEl.querySelector('.grid-view');
    let listViewEl = containerEl.querySelector('.list-view');
    if (state.selectedFolder) {
        updateCurrentFiles(state.selectedFolder.name);
    }
    resetSelectAllButton();
}

function rerenderSelectedFile(state) {
    let { selectedFile, data, currentView } = state;
    if (currentView == "grid") {
        var selectedFileEl = document.getElementsByClassName('current-items-grid-item selected')[0];
    } else {
        var selectedFileEl = document.getElementsByClassName('current-items-list-item selected')[0];
    }
    if (selectedFileEl) {
        selectedFileEl.classList.remove('selected');
        resetSelectedItemInfo();
    }
    if (selectedFile) {
        if (currentView == "grid") {
            var fileEl = document.querySelector(`div[reference-name="${selectedFile}"]`);
        } else {
            var fileEl = document.querySelector(`li[reference-name="${selectedFile}"]`);
        }
        fileEl.classList.add('selected');
        for (entry in data.files) {
            if (entry == selectedFile) {
                fillSelectedItemInfo(data.files[entry]);
            }
        }
    }
}

function resetSelectedItemInfo() {
    let titleEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-name');
    titleEl.innerHTML = "Title...";

    let imgEl = document.querySelector('#selected-item-info-section').querySelector('.image-placeholder');
    let imgPlaceholderEl = imgEl.querySelector('.image-placeholder-icon');
    let imgPlaceholderTextEl = imgEl.querySelector('.file-type-placeholder');
    imgPlaceholderTextEl.innerHTML = "";
    imgPlaceholderEl.style.display = 'block';
    imgEl.style.backgroundImage = "";

    let typeEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-type').querySelector('span');
    typeEl.innerHTML = "..."

    let sizeEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-size').querySelector('span');
    sizeEl.innerHTML = "..."

    let colorizeEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-colorize').querySelector('.colorize-button');
    colorizeEl.classList.remove('checked');
}

function fillSelectedItemInfo(file) {
    let { name } = file;
    let fileType = name.slice(name.lastIndexOf('.') + 1, name.length).toUpperCase();

    let titleEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-name');

    let imgEl = document.querySelector('#selected-item-info-section').querySelector('.image-placeholder');
    let imgPlaceholderEl = imgEl.querySelector('.image-placeholder-icon');
    imgPlaceholderEl.style.display = 'none';


    let typeEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-type').querySelector('span');
    typeEl.innerHTML = file.name.slice(file.name.lastIndexOf('.') + 1, file.name.length).toUpperCase();

    let sizeEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-size').querySelector('span');
    sizeEl.innerHTML = formatBytes(file['_data'].uncompressedSize, 2);

    let colorizeEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-colorize').querySelector('.colorize-button');
    if (file.colorised) {
        colorizeEl.classList.add('checked');
    } else {
        colorizeEl.classList.remove('checked');
    }

    switch (fileType) {
        case "PNG":
            titleEl.innerHTML = name.slice(file.name.lastIndexOf('/') + 1, file.name.lastIndexOf('@'));
            let imgData = _arrayBufferToBase64(file['_data'].compressedContent);
            imgEl.style.backgroundImage = "url('data:image/png;base64," + imgData + "')";
            colorizeEl.disabled = false;
            break;
        default:
            titleEl.innerHTML = name.slice(name.lastIndexOf('/') + 1, name.length);
            colorizeEl.disabled = true;
            imgEl.querySelector('.file-type-placeholder').innerHTML = fileType;
            break;
    }
}

function rerenderSelectedFiles(state) {
    let { selectedFiles, selectedFile, data, currentView } = state;
    if (currentView == "grid") {
        var activeCheckboxes = document.getElementsByClassName('checkbox selected');
    } else {
        var activeCheckboxes = document.getElementsByClassName('select-checkbox selected');
    }
    [...activeCheckboxes].map(item => {
        item.classList.remove('selected');
        item.parentNode.classList.remove('selected');
        if (currentView == "grid") {
            item.innerHTML = "radio_button_unchecked";
        } else {
            item.innerHTML = "check_box_outline_blank";
        }
    });
    if (currentView == "grid") {
        for (let i = 0; i < selectedFiles.length; i++) {
            let el = document.querySelector(`div[reference-name="${selectedFiles[i]}"]`);
            if (!el) return;
            if (selectedFiles.length == 1) {
                el.classList.add('selected');
            }
            el.querySelector('.checkbox').classList.add('selected');
            el.querySelector('.checkbox').innerHTML = "radio_button_checked";
        }
    } else {
        for (let i = 0; i < selectedFiles.length; i++) {
            let el = document.querySelector(`li[reference-name="${selectedFiles[i]}"]`);
            if (!el) return;
            if (selectedFiles.length == 1) {
                el.classList.add('selected');
            }
            el.querySelector('.select-checkbox').classList.add('selected');
            el.querySelector('.select-checkbox').innerHTML = "check_box";
        }
    }
    if (selectedFiles.length > 1) {
        rerenderSelectedFilesInfo(selectedFiles);
    } else if (selectedFiles.length == 1) {
        for (entry in data.files) {
            if (entry == selectedFiles[0]) {
                fillSelectedItemInfo(data.files[entry]);
            }
        }
    } else {
        resetSelectedItemInfo();
    }
    resetSelectAllButton();
}

function rerenderSelectedFilesInfo(files) {
    let state = store.getState();
    let titleEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-name');
    if (files.length > 1) {
        titleEl.innerHTML = files.length + " files selected";
    } else {
        titleEl.innerHTML = files.length + " file selected";
    }

    let size = 0;
    let filesData = "";
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        size += state.data.files[file]['_data'].uncompressedSize;
        let imgData = _arrayBufferToBase64((state.data.files[file]['_data'].compressedContent));
        filesData += "url('data:image/png;base64," + imgData + "'), "
        if (files.length == i + 1) {
            filesData += "url('data:image/png;base64," + imgData + "')"
        }
    }

    let imgEl = document.querySelector('#selected-item-info-section').querySelector('.image-placeholder');
    let imgPlaceholderEl = imgEl.querySelector('.image-placeholder-icon');
    imgPlaceholderEl.style.display = 'none';
    imgEl.style.backgroundImage = filesData;

    let sizeEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-size').querySelector('span');
    sizeEl.innerHTML = formatBytes(size, 2);

    let colorizeEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-colorize').querySelector('.colorize-button');
    colorizeEl.disabled = false;
}

function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Bytes';
    var k = 1024,
        dm = decimals <= 0 ? 0 : decimals || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function rerenderSelectedFolder(state) {
    if (!state.selectedFolder) {
        let selectedFolder = document.querySelector('#selected');
        selectedFolder.id = "";
        let placeholderEl = document.querySelector('#current-items-section').querySelector('.placeholder');
        placeholderEl.hidden = false;
    } else {
        let folderEl = state.selectedFolder.element;
        var folderName = state.selectedFolder.name;
        try {
            let selectedFolder = document.querySelector('#selected');
            selectedFolder.id = "";
        } catch (err) { }
        folderEl.id = "selected";
        let placeholderEl = document.querySelector('#current-items-section').querySelector('.placeholder');
        placeholderEl.hidden = true;
    }
    updateCurrentFiles(folderName);
    resetSelectedItemInfo();
    store.dispatch({ type: "CACHE_STATE" });
    store.dispatch({ type: "REMOVE_FILE_FROM_SELECTED_FILES", data: [] });
}

// async function updateCurrentFiles(folderName) {
//     let state = store.getState();
//     let containerEl = document.querySelector('#current-items-section');
//     let gridViewEl = containerEl.querySelector('.grid-view');
//     let listViewEl = containerEl.querySelector('.list-view');

//     if (state.currentView == 'grid') {
//         listViewEl.classList.add('hidden');
//         gridViewEl.classList.remove('hidden');
//         let files = [];
//         [...gridViewEl.children].map(child => {
//             child.parentNode.removeChild(child);
//         });
//         if (!folderName) return;
//         for (entry in state.data.files) {
//             if (entry.includes(folderName + "/")) {
//                 files.push(state.data.files[entry]);
//             }
//         }
//         for (let i = 0; i < files.length; i++) {
//             let file = files[i];
//             var textArr = file.name.split('/');
//             // let base64 = _arrayBufferToBase64(file['_data'].compressedContent); //some files have compressed content, some dont. Leads to bug where some icons dont show up.
//             // console.log(file);
//             var promises = [];
//             if (file['_data'].compressedContent) {
//                 // createFileGridElement(base64, file.name, gridViewEl);
//                 let k = file.async('base64').then(base64 => createFileGridElement(base64, file.name, gridViewEl));
//                 promises.push(k);
//                 console.log(promises);

//             } else if (textArr[textArr.length - 1] == "") {
//                 // promises.push(new Promise(() => {
//                 //     // createGridSplitter(gridViewEl, textArr[textArr.length - 2]);
//                 //     // console.log('sad');
//                 // }))
//             }
//         }
//         console.log(promises);
//         // Promise.all(promises);
//         if (state.selectedFile) {
//             var fileEl = document.querySelector(`div[reference-name="${state.selectedFile}"]`);
//             if (!fileEl) return;
//             fileEl.classList.add('selected');
//         } else if (state.selectedFiles) {
//             rerenderSelectedFiles(state);
//         }
//     } else {
//         gridViewEl.classList.add('hidden');
//         listViewEl.classList.remove('hidden');
//         let files = [];
//         [...listViewEl.children].map(child => {
//             child.parentNode.removeChild(child);
//         });
//         if (!folderName) return;
//         for (entry in state.data.files) {
//             if (entry.includes(folderName + "/")) {
//                 files.push(state.data.files[entry]);
//             }
//         }
//         createSortByBar(listViewEl);
//         for (let i = 0; i < files.length; i++) {
//             let file = files[i];
//             let textArr = file.name.split('/');
//             let base64 = _arrayBufferToBase64(file['_data'].compressedContent); //some files have compressed content, some dont. Leads to bug where some icons dont show up.
//             if (file['_data'].compressedContent) {
//                 createFileListElement(base64, file.name, listViewEl, file.colorised);
//             } else if (textArr[textArr.length - 1] == "") {
//                 createListSplitter(listViewEl, textArr[textArr.length - 2]);
//             }
//         }
//         if (state.selectedFile) {
//             var fileEl = document.querySelector(`li[reference-name="${state.selectedFile}"]`);
//             if (!fileEl) return;
//             fileEl.classList.add('selected');
//         } else if (state.selectedFiles) {
//             rerenderSelectedFiles(state);
//         }
//     }
// }

async function updateCurrentFiles(folderName, isColorize) {
    let state = store.getState();
    let containerEl = document.querySelector('#current-items-section');
    let gridViewEl = containerEl.querySelector('.grid-view');
    let listViewEl = containerEl.querySelector('.list-view');

    if (state.currentView == 'grid') {
        if (isColorize) {
            return;
        }
        listViewEl.classList.add('hidden');
        gridViewEl.classList.remove('hidden');
        let files = [];
        [...gridViewEl.children].map(child => {
            child.parentNode.removeChild(child);
        });
        if (!folderName) return;
        for (entry in state.data.files) {
            if (entry.includes(folderName + "/")) {
                files.push(state.data.files[entry]);
            }
        }

        var items = await Promise.all(files.map(async (file) => {
            return {
                zipObject: file,
                base64: await file.async('base64')
            };
        }));
        items.forEach(item => {
            if (item.base64) {
                createFileGridElement(item.base64, item.zipObject.name, gridViewEl);
            } else {
                textArr = item.zipObject.name.split('/');
                createGridSplitter(gridViewEl, textArr[textArr.length - 2]);
            }
        });

        if (state.selectedFile) {
            var fileEl = document.querySelector(`div[reference-name="${state.selectedFile}"]`);
            if (!fileEl) return;
            fileEl.classList.add('selected');
        } else if (state.selectedFiles) {
            rerenderSelectedFiles(state);
        }
    } else {
        if (isColorize) {
            let { files } = state.data;
            for (file in files) {

            }
            return;
        }
        gridViewEl.classList.add('hidden');
        listViewEl.classList.remove('hidden');
        let files = [];
        [...listViewEl.children].map(child => {
            child.parentNode.removeChild(child);
        });
        if (!folderName) return;
        for (entry in state.data.files) {
            if (entry.includes(folderName + "/")) {
                files.push(state.data.files[entry]);
            }
        }
        createSortByBar(listViewEl);

        var items = await Promise.all(files.map(async (file) => {
            return {
                zipObject: file,
                base64: await file.async('base64')
            };
        }));
        items.forEach(item => {
            if (item.base64) {
                createFileListElement(item.base64, item.zipObject.name, listViewEl, item.zipObject.colorised);
            } else {
                textArr = item.zipObject.name.split('/');
                createListSplitter(listViewEl, textArr[textArr.length - 2]);
            }
        });

        if (state.selectedFile) {
            var fileEl = document.querySelector(`li[reference-name="${state.selectedFile}"]`);
            if (!fileEl) return;
            fileEl.classList.add('selected');
        } else if (state.selectedFiles) {
            rerenderSelectedFiles(state);
        }
    }
}

function createSortByBar(container) {
    let barEl = document.createElement('LI');
    barEl.classList.add('sort-by-bar');

    let sortNameEl = document.createElement('SPAN');
    sortNameEl.classList.add('sort-name');
    sortNameEl.innerHTML = "Name A-Z";

    let sortTypeEl = document.createElement('SPAN');
    sortTypeEl.classList.add('sort-type');
    sortTypeEl.innerHTML = "File Type A-Z";

    let sortColorizeEl = document.createElement('SPAN');
    sortColorizeEl.classList.add('sort-colorize');
    sortColorizeEl.innerHTML = "Colorize";

    barEl.appendChild(sortNameEl);
    barEl.appendChild(sortTypeEl);
    barEl.appendChild(sortColorizeEl);
    container.appendChild(barEl);
}

function createFileListElement(imgData, name, filesWrapperEl, colorised) {
    let fileType = name.slice(name.lastIndexOf('.') + 1, name.length).toUpperCase();

    let liEl = document.createElement('LI');
    liEl.classList.add('current-items-list-item');
    liEl.setAttribute('reference-name', name);

    let selectCheckboxEl = document.createElement('I');
    selectCheckboxEl.classList.add('material-icons', 'select-checkbox');
    selectCheckboxEl.innerHTML = 'check_box_outline_blank';

    let fileIconEl = document.createElement('I');
    fileIconEl.classList.add('material-icons', 'file-icon');
    fileIconEl.innerHTML = 'image';

    let fileNameEl = document.createElement('SPAN');
    fileNameEl.classList.add('file-name');
    switch (fileType) {
        case "PNG":
            fileNameEl.innerHTML = name.slice(name.lastIndexOf('/') + 1, name.lastIndexOf('@'));
            break;
        default:
            fileNameEl.innerHTML = name.slice(name.lastIndexOf('/') + 1, name.length);
            break;
    }

    let fileTypeEl = document.createElement('SPAN');
    fileTypeEl.classList.add('file-name');
    fileTypeEl.innerHTML = fileType;

    let colorizeFileEl = document.createElement('I');
    colorizeFileEl.classList.add('material-icons', 'colorize-file-icon');
    colorizeFileEl.innerHTML = colorised ? 'check_box' : 'check_box_outline_blank';

    liEl.appendChild(selectCheckboxEl);
    liEl.appendChild(fileIconEl);
    liEl.appendChild(fileNameEl);
    liEl.appendChild(fileTypeEl);
    liEl.appendChild(colorizeFileEl);
    filesWrapperEl.appendChild(liEl);
}

function createListSplitter(containerEl, folderName) {
    let splitter = document.createElement('P');
    splitter.classList.add('list-splitter');
    splitter.innerHTML = folderName;
    containerEl.appendChild(splitter);
}

function createGridSplitter(containerEl, folderName) {
    let splitter = document.createElement('P');
    splitter.classList.add('grid-splitter');
    splitter.innerHTML = folderName;
    containerEl.appendChild(splitter);
}


function createFileGridElement(imgData, name, filesWrapperEl) {
    let fileType = name.slice(name.lastIndexOf('.') + 1, name.length).toUpperCase();
    let containerEl = document.createElement('DIV');
    let textContainerEl = document.createElement('P');
    let checkboxEl = document.createElement('I');

    checkboxEl.classList.add('material-icons', 'checkbox');
    checkboxEl.innerHTML = "radio_button_unchecked";

    containerEl.classList.add('current-items-grid-item');
    containerEl.setAttribute('reference-name', name);

    textContainerEl.classList.add('text-container');
    switch (fileType) {
        case "PNG":
            textContainerEl.innerHTML = name.slice(name.lastIndexOf('/') + 1, name.lastIndexOf('@'));
            containerEl.style.backgroundImage = "url('data:image/png;base64," + imgData + "')";
            break;
        default:
            textContainerEl.innerHTML = name.slice(name.lastIndexOf('/') + 1, name.length);
            containerEl.innerHTML = fileType;
            break;
    }

    containerEl.appendChild(checkboxEl);
    containerEl.appendChild(textContainerEl);
    filesWrapperEl.appendChild(containerEl);
}

function _arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function renderApp(state) {
    renderHierarchyTree(state.data);
    setClickListeners();
}

function setClickListeners() {
    setHierarchyTreeClickListener();
    setCurrentItemsClickListener();
    setSelectedItemClickListener();
}

function renderHierarchyTree(data) {
    for (entry in data.files) {
        let entryData = data.files[entry];
        let hierarchyArr = entry.split('/');
        if (hierarchyArr[hierarchyArr.length - 1] == "") {
            if (hierarchyArr.includes("TypeScript")) {
                createFolder(hierarchyArr, entryData, true);
            } else {
                createFolder(hierarchyArr, entryData, false);
            }
        }
    }

    function createFolder(hierarchyArr, entryData, a) {
        let hierarchyTreeEl = document.querySelector('#hierarchy-tree-section');
        let currentFolder = hierarchyTreeEl;
        let tempFolder = null;

        for (let i = 0; i < hierarchyArr.length; i++) {
            if (hierarchyArr[i] == "") break;
            tempFolder = document.getElementById(`folder-${hierarchyArr[i]}`);
            if (!tempFolder) {
                let ulEl = document.createElement('UL');
                let headerEl = document.createElement('LI');
                ulEl.classList.add('hierarchy-tree-list');
                if (i == 0) {
                    ulEl.classList.add('top-layer-folder');
                }
                headerEl.classList.add('ul-header');
                ulEl.id = `folder-${hierarchyArr[i]}`;
                let textContainerEl = document.createElement('SPAN');
                textContainerEl.classList.add('text-container');
                textContainerEl.innerHTML = hierarchyArr[i];
                headerEl.appendChild(textContainerEl);
                if (hierarchyArr[i + 1] != "") {
                    let collapseIconEl = document.createElement('I');
                    collapseIconEl.classList.add('collapse-list-icon');
                    ulEl.classList.add('collapsed', 'collapsable');
                    headerEl.appendChild(collapseIconEl);
                }
                if (!entryData.name.includes('.png')) {
                    let folderIconEl = document.createElement('I');
                    folderIconEl.classList.add('folder-icon');
                    headerEl.appendChild(folderIconEl);
                }
                ulEl.appendChild(headerEl);
                currentFolder.appendChild(ulEl);
                currentFolder = ulEl;
            } else {
                currentFolder = tempFolder;
                if (hierarchyArr[i + 1] != "") {
                    try {
                        let headerEl = document.querySelector(`#folder-${hierarchyArr[i]}`).querySelector('.ul-header');
                        let collapseIconTempEl = headerEl.querySelector('.collapse-list-icon');
                        if (headerEl && !collapseIconTempEl) {
                            let collapseIconEl = document.createElement('I');
                            collapseIconEl.classList.add('collapse-list-icon');
                            headerEl.parentNode.classList.add('collapsed');
                            headerEl.parentNode.classList.add('collapsable');
                            headerEl.insertBefore(collapseIconEl, headerEl.firstChild);
                        }
                    } catch (err) { }
                }
            }
        }
    }
}

