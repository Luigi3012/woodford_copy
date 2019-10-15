
window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#current-items-section').addEventListener('click', event => {
        let target = event.target;
        if (!target.classList.contains('current-items-grid-item')) return;

        let selFile = document.querySelector('#selected-file');
        if (selFile) {
            selFile.id = "";
        }
        event.target.id = 'selected-file';

        let currentFiles = store.getState().selectedFiles;
        let fileReference = target.getAttribute('reference-name');
        for (let i = 1; i < currentFiles.length; i++) {
            let file = currentFiles[i];
            if (file.name == fileReference) {
                fillSelectedItemInfo(file);
                return
            }
        }
    });
});

function fillSelectedItemInfo(file) {
    let titleEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-name');
    titleEl.innerHTML = file.name.slice(file.name.lastIndexOf('/') + 1, file.name.lastIndexOf('@'));;

    let imgEl = document.querySelector('#selected-item-info-section').querySelector('.image-placeholder');
    let imgPlaceholderEl = imgEl.querySelector('.image-placeholder-icon');
    if (imgPlaceholderEl) {
        imgPlaceholderEl.parentNode.removeChild(imgPlaceholderEl);
    }
    let imgData = _arrayBufferToBase64(file['_data'].compressedContent);
    imgEl.style.backgroundImage = "url('data:image/png;base64," + imgData + "')";

    let typeEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-type').querySelector('span');
    typeEl.innerHTML = file.name.slice(file.name.lastIndexOf('.') + 1, file.name.length).toUpperCase();

    let sizeEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-size').querySelector('span');
    sizeEl.innerHTML = file['_data'].uncompressedSize + " bytes";

    let colorizeEl = document.querySelector('#selected-item-info-section').querySelector('.selected-item-colorize').querySelector('input');
    colorizeEl.disabled = false;
}
