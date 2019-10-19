
function setHierarchyTreeClickListener() {
    let hierarchyTreeSection = document.querySelector('#hierarchy-tree-section');
    hierarchyTreeSection.addEventListener('click', event => {
        let cls = event.target.classList;
        switch (true) {
            case cls.contains('ul-header'):
                onFolderClick(event.target);
                break;
            case cls.contains('ellipsis-icon'):
                console.log(2);
                break;
            default:
                break;
        }
    });
}

function onFolderClick(folderEl) {
    let closeFolderBool = folderEl.parentNode.classList.contains('collapsed') ? false : true;
    if (!closeFolderBool) { //open Folder
        folderEl.parentNode.classList.remove('collapsed');

        store.dispatch({
            type: "SET_SELECTED_FOLDER", data: {
                resetSelectedFolder: false,
                clickedFolderName: folderEl.querySelector('.text-container').innerHTML,
                clickedFolderElement: folderEl
            }
        });
    } else { //close Folder
        if (folderEl.children[1].classList.contains('collapse-list-icon')) {
            folderEl.parentNode.classList.add('collapsed');
            store.dispatch({
                type: "SET_SELECTED_FOLDER", data: {
                    resetSelectedFolder: true,
                    clickedFolderName: folderEl.querySelector('.text-container').innerHTML,
                    clickedFolderElement: folderEl
                }
            });
        } else {
            if (store.getState().selectedFolder && store.getState().selectedFolder.name == folderEl.querySelector('.text-container').innerHTML) {
                store.dispatch({
                    type: "SET_SELECTED_FOLDER", data: {
                        resetSelectedFolder: true,
                        clickedFolderName: folderEl.querySelector('.text-container').innerHTML,
                        clickedFolderElement: folderEl
                    }
                });
            } else {
                store.dispatch({
                    type: "SET_SELECTED_FOLDER", data: {
                        resetSelectedFolder: false,
                        clickedFolderName: folderEl.querySelector('.text-container').innerHTML,
                        clickedFolderElement: folderEl
                    }
                });
            }
        }
    }
}