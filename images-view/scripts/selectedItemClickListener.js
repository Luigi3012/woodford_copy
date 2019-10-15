function setSelectedItemClickListener() {
    let selectedItemSection = document.querySelector('#selected-item-info-section');
    selectedItemSection.addEventListener('click', event => {
        let cls = event.target.classList;
        switch (true) {
            case cls.contains('checkbox'):
                onColorizeCheckboxClick(event.target);
                break;
            default:
                break;
        }
    });
}

function onColorizeCheckboxClick(checkboxEl) {
    let { selectedFile, selectedFiles, selectedFolder, data } = store.getState();
    if (selectedFile) {
        for (file in data.files) {
            if (file == selectedFile) {
                data.files[file].colorised = checkboxEl.checked;
                break;
            }
        }
        updateCurrentFiles(selectedFolder.name);
    } else if (selectedFiles) {
        for (file in data.files) {
            if (selectedFiles.includes(file)) {
                data.files[file].colorised = checkboxEl.checked;
            }
        }
        updateCurrentFiles(selectedFolder.name);
    }
}   