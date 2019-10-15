
let initialState = {
    appRendered: false,
    data: null
}

window.addEventListener('DOMContentLoaded', () => {
    let { createStore } = window.Redux;
    function reducer(state = initialState, action) {
        switch (action.type) {
            case "SET_STATE":
                return {
                    ...state,
                    data: action.data
                };
            case "APP_RENDERED":
                return {
                    ...state,
                    appRendered: true
                }
            case "SET_SELECTED_FILES":
                return {
                    ...state,
                    selectedFiles: action.data
                }
            default:
                return {
                    ...state
                }
        }
    }
    store = createStore(reducer);
    store.subscribe(onStateChange);
    //redux ready

    fetchData(() => {
        renderApp();
    });
});

function fetchData(resolve) {
    JSZipUtils.getBinaryContent('./src/icons.zip', function (err, data) {
        if (err) {
            throw err;
        }
        JSZip.loadAsync(data).then(function (zip) {
            store.dispatch({ type: "SET_STATE", data: zip });
        }).then(() => resolve());
    });
}

function renderApp() {
    let state = store.getState();
    renderHierarchyTree(state.data);
    store.dispatch({ type: "APP_RENDERED" });
}

function renderHierarchyTree(data) {
    for (entry in data.files) {
        let entryData = data.files[entry];
        let hierarchyArr = entry.split('/');
        if (hierarchyArr[hierarchyArr.length - 1] == "") {
            createFolder(hierarchyArr, entryData);
        } else {
            // createFile(hierarchyArr, entryData);
        }
    }

    function createFolder(hierarchyArr, entryData) {
        let hierarchyTreeEl = document.querySelector('#hierarchy-tree-section');
        let currentFolder = hierarchyTreeEl;
        let tempFolder = null;

        for (let i = 0; i < hierarchyArr.length; i++) {
            if (hierarchyArr[i] == "") break;
            tempFolder = document.getElementById(`folder-${hierarchyArr[i]}`);
            if (!tempFolder) {
                let ulEl = document.createElement('UL');
                let headerEl = document.createElement('LI');
                ulEl.classList.add('hierarchy-tree-list', 'collapsed');
                headerEl.classList.add('ul-header');
                ulEl.id = `folder-${hierarchyArr[i]}`;
                if (hierarchyArr[i + 1] != "") {
                    let collapseIconEl = document.createElement('I');
                    collapseIconEl.classList.add('material-icons', 'collapse-list-icon');
                    collapseIconEl.innerHTML = "arrow_drop_down";
                    headerEl.appendChild(collapseIconEl);
                }
                if (!entryData.name.includes('.png')) {
                    let folderIconEl = document.createElement('I');
                    folderIconEl.classList.add('material-icons', 'folder-icon');
                    folderIconEl.innerHTML = "folder";
                    headerEl.appendChild(folderIconEl);
                }

                let ellipsisIconEl = document.createElement('I');
                ellipsisIconEl.classList.add('ellipsis-icon');

                let textContainerEl = document.createElement('SPAN');
                textContainerEl.classList.add('text-container');
                textContainerEl.innerHTML = hierarchyArr[i];
                headerEl.appendChild(textContainerEl);

                headerEl.appendChild(ellipsisIconEl);
                ulEl.appendChild(headerEl);
                currentFolder.appendChild(ulEl);
                currentFolder = ulEl;
            } else {
                currentFolder = tempFolder;
            }
        }
    }
}

function onStateChange() {
    //on State change, update changes...
    let state = store.getState();
    if (!state.appRendered) return;
    console.log(state);
}
