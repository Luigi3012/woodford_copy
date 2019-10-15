
let drake;

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.section-header').addEventListener('click', () => console.log(drake.containers));
    let entitiesList = document.querySelector('.entities-list');
    let specialList = document.querySelector('.special-items-list');
    let editorList = document.querySelector('.editor-list');
    let editorFolders = Array.from(document.querySelectorAll('.folder-list'));
    drake = dragula([entitiesList, specialList, editorList].concat(editorFolders), { //
        accepts: function (el, target, source, sibling) {
            if ((el.classList.contains('section') || el.classList.contains('editor-folder')) && (target == document.querySelector('.entities-list') || target == document.querySelector('.special-items-list'))) {
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
            return true;
        },
        copy: function (el, source) {
            if (source.classList.contains('special-items-list')) {
                return true;
            }
            return false;
        }
    });
    drake.on('drop', (el, target, source, sibling) => {
        if (el.classList.contains('editor-folder') && source.classList.contains('special-items-list')) {
            el.querySelector('.empty-folder-placeholder').classList.remove('hidden');
            drake.containers.push(el.querySelector('.folder-list'));
        }
        if (el && el.parentNode.classList.contains('folder-list') && el.parentNode.children.length >= 3) {
            [...el.parentNode.children].map(item => {
                if (item.classList.contains('empty-folder-placeholder')) {
                    item.classList.add('hidden');
                }
            })
        }
        if ([...el.parentNode.children].length == 2 && el.parentNode.classList.contains('editor-list')) {
            [...el.parentNode.children].map(item => {
                if (item.classList.contains('empty-folder-placeholder')) {
                    item.classList.add('hidden');
                }
            });
        }
        return true;
    });
    drake.on('drag', (el, source) => {
        if (source.classList.contains('folder-list') && source.children.length == 3) {
            source.querySelector('.empty-folder-placeholder').classList.remove('hidden');
        }
        return true;
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
    console.log([...entity.parentNode.children].length);
    if ([...entity.parentNode.children].length == 2 && entity.parentNode.classList.contains('editor-list')) {
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
            if ([...entity.parentNode.children].length == 3) {
                entity.parentNode.querySelector('.empty-folder-placeholder').classList.remove('hidden');
            }

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
        if (child.classList.length == 1 && child.classList.contains('draggable-list-item')) {
            if ([...child.parentNode.children].length == 3) {
                child.parentNode.querySelector('.empty-folder-placeholder').classList.remove('hidden');
            }
            containerEl.appendChild(child);
        }
    });
    if (folderEl.parentNode.classList.contains('folder-list')) {
        [...folderEl.parentNode.children].map(item => {
            if (item.classList.contains('empty-folder-placeholder')) {
                item.classList.remove('hidden');
            }
        });
    }
    folderEl.outerHTML = "";
}