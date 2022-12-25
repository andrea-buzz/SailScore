const sailors = ['Giovanna', 'Francesca', 'Stefano', 'Danilo', 'Max', 'Guido'];
sailors.forEach(s=> document.querySelector('section').insertAdjacentHTML('afterBegin',`<div> <button type="button">&#8679;</button> <span>${s}</span> <button type="button">&#9201;</button></div>`));
document.querySelector('section').insertBefore(document.querySelector('section > div:last-child'), document.querySelector('section > div:first-child'));
