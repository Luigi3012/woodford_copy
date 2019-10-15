
var eventCached = null;
var viewModel = null;

window.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem('favorite-items', JSON.stringify([]));
    getColorsData(); //data saved in localStorage
    viewModel = new AppViewModel();
    ko.applyBindings(viewModel);
    [...document.querySelectorAll('.color-container')].map(color => color.addEventListener('click', onColorContainerClick));
})

function onColorContainerClick(event) {
    eventCached = event;
    // console.log(JSON.parse(localStorage.getItem('favorite-items')));
    let isNav = event.target.parentNode.nodeName == "NAV" ? true : false;
    var colorPicker = new ColorPicker.Default(event.target, {
        color: event.target.style.backgroundColor,
        customClass: "colorpicker-custom",
        anchor: {
            hidden: false,
            cssProperty: "none"
        },
        history: {
            hidden: false,
            colors: JSON.parse(localStorage.getItem('favorite-items'))
        },
        placement: (event.target.parentNode.parentNode.nodeName == "LI") ? 'left' : (event.target.getBoundingClientRect().top > document.body.clientHeight / 2) ? 'top-center' : 'bottom-center'
    });
    colorPicker.on('change', color => {
        let referenceName = eventCached.target.getAttribute('reference');
        viewModel['reference_color_' + referenceName](color.rgba);
    });
    let colorPickerEl = document.querySelector(colorPicker.cssId);
    let base = "";
    if (isNav) {
        base = event.target.parentNode.parentNode.parentNode.querySelector('.section-header').innerHTML.split(" ");
    } else {
        base = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.section-header').innerHTML.split(" ");
    }
    let containerEl = document.createElement('div');
    containerEl.classList.add('colorpicker-text-container');
    let res = event.target.getAttribute('reference').split('_');
    res.splice(base.length, 0, '/');
    let text = '';
    res.map(string => {
        text += string.charAt(0).toUpperCase() + string.slice(1) + " "
    });
    containerEl.innerHTML = text;
    colorPickerEl.insertBefore(containerEl, colorPickerEl.firstChild);

    dragula([colorPickerEl.querySelector('.colorpicker-default__history')], {
        moves: function (el, source, handle, sibling) {
            return el.classList.contains('is-add-new') ? false : true;
        },
        accepts: function (el, target, source, sibling) {
            return target.classList.contains('is-add-new') ? false : true;
        },
        revertOnSpill: true,
        direction: 'horizontal'
    });

    colorPickerEl.querySelector('.colorpicker-default__history').addEventListener('dblclick', event => {
        if (event.target.classList.contains('has-color')) {
            $(event.target).remove();
            // colorPickerEl.querySelector('.colorpicker-default__history').innerHTML += '<div class="colorpicker-default__history-item is-empty" data-history-color=""></div>';
        }
    });

    colorPicker.show();
    var refreshIntervalId = setInterval(() => {
        if (!colorPickerEl.classList.contains('is-opened')) {
            let favoriteColorsEls = [...colorPickerEl.querySelector('.colorpicker-default__history').children];
            let favoriteColors = [];
            favoriteColorsEls.map(color => {
                if (color.classList.contains('has-color')) {
                    favoriteColors.push(color.style.backgroundColor);
                }
            });
            localStorage.setItem('favorite-items', JSON.stringify(favoriteColors));
            colorPicker.destroy();
            clearInterval(refreshIntervalId);
        }
    }, 100);

}


function getColorsData() {
    Promise.all([
        fetch('./src/template_colors_data.json').then(response => response.json())
    ]).then(responses => {
        data = responses[0];
    }).then(() => {
        mergeData(data);
    });
}

function mergeData(data) {
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        let matchFound = false;
        for (let reference in localStorage) {
            if (!reference.includes('reference_color')) continue;
            if (obj.reference_name == reference) {
                matchFound = true;
                break;
            }
        }
        if (!matchFound) {
            localStorage.setItem(obj.reference_name, obj.color)
        }
    }
}

class AppViewModel {
    constructor() {
        for (let reference in localStorage) {
            if (!reference.includes('reference_color')) continue;
            this[reference] = ko.observable(localStorage[reference]);
        }
    }
}
