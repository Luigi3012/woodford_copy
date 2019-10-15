
window.addEventListener('DOMContentLoaded', async () => {
    setTimeout(async () => {
        [...document.querySelectorAll('.ul-header')].map(async item => item.addEventListener('click', async event => {
            let selector = null;;
            let selFolder = document.querySelector('#selected-folder');
            if (selFolder) {
                selFolder.id = "";
            }
            if (!event.target.classList.contains('collapse-list-icon')) {
                event.target.id = 'selected-folder';
            }
            try {
                selector = event.target.querySelector('.text-container').innerHTML;
            } catch (err) {
                selector = event.target.parentNode.querySelector('.text-container').innerHTML;
            }
            let files = store.getState().data.files
            let filesToShow = [];
            for (file in files) {
                if (file.includes(selector + "/")) { //change this selector when implementing seeing all files functionality
                    filesToShow.push(files[file]);
                }
            }
            await store.dispatch({ type: "SET_SELECTED_FILES", data: filesToShow });
            renderCurrentItems();
        }));
    }, 100);
});

function renderCurrentItems() {
    let files = store.getState().selectedFiles;
    [...document.querySelector('#current-items-section').children].map(child => {
        if (!child.classList.contains('placeholder')) {
            child.parentNode.removeChild(child);
        }
    });
    for (let i = 1; i < files.length; i++) {
        let file = files[i];
        let base64 = _arrayBufferToBase64(file['_data'].compressedContent);
        createFileElement(base64, file.name);
    }
    if (files.length == 0) {
        document.querySelector('#current-items-section').querySelector('.placeholder').hidden = false;
    }
}

function createFileElement(imgData, name) {
    let filesWrapperEl = document.querySelector('#current-items-section');
    let placeholderEl = filesWrapperEl.querySelector('.placeholder');
    let containerEl = document.createElement('DIV');
    let textContainerEl = document.createElement('P');

    textContainerEl.classList.add('text-container');
    textContainerEl.innerHTML = name.slice(name.lastIndexOf('/') + 1, name.lastIndexOf('@'));
    placeholderEl.hidden = true;
    containerEl.classList.add('current-items-grid-item');
    containerEl.setAttribute('reference-name', name);
    containerEl.style.backgroundImage = "url('data:image/png;base64," + imgData + "')";

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
