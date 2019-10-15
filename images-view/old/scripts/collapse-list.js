
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {

        [...document.querySelectorAll('.collapse-list-icon')].map(item => item.addEventListener('click', event => {
            if (event.target.parentNode.parentNode.classList.contains('collapsed')) {
                event.target.parentNode.parentNode.classList.remove('collapsed');
            } else {
                event.target.parentNode.parentNode.classList.add('collapsed');
            }
        }));
    }, 100);

});
