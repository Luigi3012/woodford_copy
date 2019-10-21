
var reference = null;
let timeOut = false;

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#screens-container').addEventListener('click', onScreenContainerClick);
});

function onScreenContainerClick(event) {
    let { target } = event;
    let referenceAttribute = target.getAttribute('data-bind');
    if (!referenceAttribute) return;
    var res = referenceAttribute.slice(referenceAttribute.indexOf('{'), referenceAttribute.length);
    if (!timeOut) {
        reference = res.slice(res.indexOf(':') + 1, res.indexOf('}')).trim();
        reference = reference.slice(16, reference.length);
        timeOut = true;
    }
    else
        return;
    setTimeout(() => {
        timeOut = false;
    }, 100);
    let els = document.querySelectorAll(`span[reference='${reference}']`);
    for (let i = 0; i < els.length; i++) {
        let el = els[i];
        if (!el.parentNode.parentNode.classList.contains('hidden') && !el.parentNode.parentNode.parentNode.classList.contains('hidden')) {
            console.log(el);
            $(el).click();
            $('#colors-side-menu').animate({
                scrollTop: ($(el).offset().top)
            }, 200);
        }
    }
}
