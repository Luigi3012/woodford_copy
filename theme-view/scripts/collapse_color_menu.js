
window.addEventListener('DOMContentLoaded', () => {
    [...document.querySelectorAll('.collapse-icon')].map(icon => icon.addEventListener('click', onCollapseIconClick));
})

function onCollapseIconClick(event) {
    let navEl = event.target.parentNode.parentNode.querySelector('.collapsed-colors-container');
    let ulEl = event.target.parentNode.parentNode.querySelector('.uncollapsed-colors-list');
    if(navEl.classList.contains('hidden') && !ulEl.classList.contains('hidden')) {
        event.target.style.transform = "rotate(0deg)";
        ulEl.classList.add('hidden');
        navEl.classList.remove('hidden');
        setTimeout(() => {
            ulEl.classList.add('animation-back');
            navEl.classList.remove('animation-back');
        }, 300)
    } else {
        event.target.style.transform = "rotate(90deg)";
        ulEl.classList.remove('hidden');
        navEl.classList.add('hidden');
        setTimeout(() => {
            navEl.classList.add('animation-back');
            ulEl.classList.remove('animation-back');
        }, 300)
    }
}
