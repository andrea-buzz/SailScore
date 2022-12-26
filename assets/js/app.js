let competitors = [
  {name: "Lorenzo Serretti", sail_number: "205262", boat_class: "ILCA 6"},
  {name: "Giovanna Pagnini", sail_number: "197000", boat_class: "ILCA 6"},
  {name: "Gaia Cinquepalmi", sail_number: "210505", boat_class: "ILCA 6"},
  {name: "Danilo Monticelli", sail_number: "210000", boat_class: "ILCA 7"},
  {name: "Stefano Melone", sail_number: "218765", boat_class: "ILCA 7"},
  {name: "Andrea Bazzani", sail_number: "219081", boat_class: "ILCA 7"},
  {name: "Francesca Carlotti", sail_number: "180321", boat_class: "ILCA 6"},
  {name: "Guido Rocchi", sail_number: "209111", boat_class: "ILCA 6"},
  {name: "Max Cinquepalmi", sail_number: "183555", boat_class: "ILCA 6"},
];
let tag_competitors = document.querySelector('[data-list="competitors"]');
competitors.forEach(c => tag_competitors.insertAdjacentHTML('afterBegin',`<div class="competitor" data-status="started"> <button type="button" data-role="pull-top">&#8679;</button> <span>${c.name}</span> <span>${c.sail_number}</span> <span>${c.boat_class}</span> <button type="button" data-role="set-arrived">&#9201;</button></div>`));
document.querySelectorAll('[data-role="pull-top"]').forEach(b => b.addEventListener('click', pull_top));
function pull_top (e){
  let c = e.currentTarget.parentNode; 
  c.style.order --;
}