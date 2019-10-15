
window.addEventListener('DOMContentLoaded', () => {
    let editorComponentEl = document.querySelector('.editor-component');
    editorComponentEl.addEventListener('click', event => {
        let { target } = event;
        let cls = target.classList;
        switch (true) {
            case cls.contains('set-home-icon'):
                store.dispatch({ type: "SET_ENTITY_HOME", data: target.parentNode.parentNode });
                break;
            case cls.contains('edit-entity-icon'):
                store.dispatch({ type: "SET_SELECTED_ENTITY", data: target.parentNode.parentNode });
                break;
        }
    })
});
