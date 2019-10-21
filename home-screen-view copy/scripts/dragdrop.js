
let drake;
let elCache;
let sourceCache;

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.section-header').addEventListener('click', () => console.log(store.getState()));
    let entitiesList = document.querySelector('.entities-list');
    let specialList = document.querySelector('.special-items-list');
    let editorList = document.querySelector('.editor-list');
    let bannerList = document.querySelector('.banner-list');
    let editorFolders = Array.from(document.querySelectorAll('.folder-list'));
    drake = dragula([entitiesList, specialList, editorList, bannerList].concat(editorFolders), { //
        accepts: function (el, target, source, sibling) {
            if ((el.classList.contains('section') || el.classList.contains('editor-folder')) && (target == document.querySelector('.entities-list') || target == document.querySelector('.special-items-list'))) {
                return false;
            }
            if ((el.classList.contains('draggable-list-item') || el.classList.contains('section') || el.classList.contains('editor-folder')) && target.classList.contains('banner-list')) {
                if (!el.classList.contains('editor-banner')) {
                    return false;
                }
            }
            if (source.classList.contains('editor-list') && target.classList.contains('special-items-list')) {
                return false;
            }
            if (source.classList.contains('entities-list') && target.classList.contains('special-items-list')) {
                return false;
            }
            if (el.classList.contains('editor-banner') && !target.classList.contains('banner-list')) {
                return false;
            }
            return true;
        },
        moves: function (el, source, handle, sibling) {
            if (el.classList.contains('disabled')) {
                return false;
            }
            if (el.classList.contains('empty-folder-placeholder')) {
                return false;
            }
            if (el.classList.contains('remove-button')) {
                return false;
            }
            if (el.classList.contains('editor-banner') && source.classList.contains('banner-list')) {
                return false;
            }
            return true;
        },
        copy: function (el, source) {
            if (source.classList.contains('special-items-list')) {
                return true;
            }
            return false;
        },
        revertOnSpill: true,
    });
    drake.on('drop', (el, target, source, sibling) => {
        //new folder dragged to editor
        if (el && el.classList.contains('editor-folder') && source.classList.contains('special-items-list')) {
            el.querySelector('.empty-folder-placeholder').classList.remove('hidden');
            drake.containers.push(el.querySelector('.folder-list'));
        }
        if (target.classList.contains('folder-list')) {
            [...target.children].map(item => {
                if (item.classList.contains('empty-folder-placeholder')) {
                    item.classList.add('hidden');
                }
            })
        }
        if (el.classList.contains('editor-banner') && target.classList.contains('banner-list')) {
            target.classList.remove('collapsed');
            target.classList.remove('highlight');
            el.style.fontSize = 0;
            [...el.children].map(child => {
                let cls = child.classList;
                if (cls.contains('icon-drag')) {
                    child.outerHTML = "";
                }
            });
            let specialItemsEl = document.querySelector('.special-items-list');
            let bannerListEl = specialItemsEl.getElementsByClassName('draggable-list-item editor-banner')[0];
            bannerListEl.classList.add('disabled');
        }
    });
    drake.on('drag', (el, source) => {
        if (source.classList.contains('folder-list') && source.children.length <= 3) {
            source.querySelector('.empty-folder-placeholder').classList.remove('hidden');
            elCache = el;
            sourceCache = source;
            $(document).on('mouseup', () => {
                if (elCache.parentNode == sourceCache) {
                    sourceCache.querySelector('.empty-folder-placeholder').classList.add('hidden');
                }
                $(document.body).off('mouseup');
            });
        }
        if (el.classList.contains('editor-banner') && source.classList.contains('special-items-list')) {
            let bannerListEl = document.querySelector('.banner-list');
            bannerListEl.classList.add('highlight');
            $(document.body).mouseup(function () {
                bannerList.classList.add('collapsed');
                bannerList.classList.remove('highlight');
                $(document.body).off('mouseup');
            });
        }
    });
    document.querySelector('.editor-component').addEventListener('click', onEditorClick);
});

function onEditorClick(event) {
    let { target } = event;
    let cls = target.classList;
    switch (true) {
        case cls.contains('remove-entity-icon'):
            removeEntity(target.parentNode.parentNode);
            break;
        default:
            break;
    }
}

function removeEntity(entity) {
    let containerEl;
    if (entity.parentNode.children.length <= 2) {
        [...entity.parentNode.children].map(item => {
            if (item.classList.contains('empty-folder-placeholder')) {
                item.classList.remove('hidden');
            }
        });
    }
    switch (true) {
        case entity.classList.contains('section'):
            entity.outerHTML = "";
            break;
        case entity.classList.contains('draggable-list-item'):
            containerEl = document.querySelector('.entities-list');
            containerEl.appendChild(entity);
            break;
        case entity.classList.contains('editor-folder'):
            removeFolderRecursive(entity);
            break;
    }
}

function removeFolderRecursive(folderEl) {
    let ulEl = folderEl.querySelector('.folder-list');
    let containerEl = document.querySelector('.entities-list');
    [...ulEl.children].map(child => {
        if (child.classList.contains('editor-folder')) {
            removeFolderRecursive(child);
        }
        if (child.classList.contains('draggable-list-item') && !child.classList.contains('section') && !child.classList.contains('folder-header') && !child.classList.contains('empty-folder-placeholder')) {
            if (child.parentNode.children.length <= 3) {
                child.parentNode.querySelector('.empty-folder-placeholder').classList.remove('hidden');
            }
            containerEl.appendChild(child);
        }
    });
    // if (folderEl.parentNode.classList.contains('folder-list')) {
    //     [...folderEl.parentNode.children].map(item => {
    //         if (item.classList.contains('empty-folder-placeholder')) {
    //             item.classList.remove('hidden');
    //         }
    //     });
    // }
    folderEl.outerHTML = "";
}