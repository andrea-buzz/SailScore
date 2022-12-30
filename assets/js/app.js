/* DATABASE */
class SailScoreDB {
  constructor() {
    this.dbName = 'SailScoreDB';
    this.conn = this.openDB();
    return this;
  }
  
  openDB(){
    const request = window.indexedDB.open( this.dbName, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      db.onerror = (event) => {
        console.log( "Error loading database.");
      };
      this.createClubStore(db);
      this.createRegattasStore(db);
      this.createCompetitorsStore(db);
      this.createRacesStore(db);
      this.createBoatClassesStore(db);
      this.createSailorsStore(db);
    };
    
    request.onerror = function(event) {
      console.log("Errore nell'apertura del database: " + event.target.errorCode);
    };
    return request;
  }
  createClubStore(db){
    const objectStore = db.createObjectStore("Club", { keyPath: "id", autoIncrement: true } ); 
    objectStore.createIndex("id", "id", { unique: true });
    objectStore.createIndex("name", "name", { unique: false });
  }
  createRegattasStore(db){
    const objectStore = db.createObjectStore("Regattas", { keyPath: "id", autoIncrement: true } ); 
    objectStore.createIndex("id", "id", { unique: true });
    objectStore.createIndex("name", "name", { unique: false });
  }
  createRacesStore(db){
    const objectStore = db.createObjectStore("Races", { keyPath: "id", autoIncrement: true } ); 
    objectStore.createIndex("id", "id", { unique: true });
    objectStore.createIndex("name", "name", { unique: false });
  }
  createCompetitorsStore(db){
    const objectStore = db.createObjectStore("Competitors", { keyPath: "id", autoIncrement: true } ); 
    objectStore.createIndex("id", "id", { unique: true });
    objectStore.createIndex("name", "name", { unique: false });
  }
  createBoatClassesStore(db){
    const objectStore = db.createObjectStore("BoatClasses", { keyPath: "id", autoIncrement: true } ); 
    objectStore.createIndex("id", "id", { unique: true });
    objectStore.createIndex("name", "name", { unique: false });
  }
  createSailorsStore(db){
    const objectStore = db.createObjectStore("Sailors", { keyPath: "id", autoIncrement: true } ); 
    objectStore.createIndex("id", "id", { unique: true });
    objectStore.createIndex("fiv", "fiv", { unique: false });
    objectStore.createIndex("firstname", "firstname", { unique: false });
    objectStore.createIndex("lastname", "lastname", { unique: false });
    //objectStore.createIndex("fullname", ["firstname", "lastname", birtDate], { unique: true });
  }
}
const sailScoreDB = new SailScoreDB(); 


/* ENTITIES */

class Club {
  constructor(name, location, id = null) {
    if(id) this.id = new Number(id);
    this.name = stripHtml(name);
    this.location = stripHtml(location);
  }
}

class Sailor {
  
  constructor(s = {firstname:'',lastname:'',fiv:null}) {
    
    if(s.id) this.id =  new Number(s.id);
    this.firstname = s.firstname ? stripHtml(s.firstname):'';
    this.lastname = s.lastname?stripHtml(s.lastname):'';
    this.fiv = 0;
    this.fivNumber = s.fiv?s.fiv:0;
    this.birthdate = 0;
    this.birthDate = s.birthdate?s.birthdate:0;
    if(('object' === typeof s) && ('number' === typeof s.length)){
      this.#setFromArray(s);
    }
  };
  
  get fullName(){
    return this.firstname + ' ' + this.lastname; 
  };
    get birthDate(){
    return ( 0 === this.birthdate)?'':new Date( this.birthdate ).toLocaleDateString();
  }
  set birthDate(d){
    this.birthdate = (typeof d === 'number')? new Date(d): Date.parse(d);
  }
  get fivNumber(){
    return 0 === this.fiv ?'':Number(this.fiv);
  }
  set fivNumber(f){
    this.fiv = Number(f);
  }
  getMyProperties(){
    console.table(this.entries());
  }
  #setFromArray = function(s){
    var T = this;
    s.forEach(function(i){
      if('id' === i.name && !isNaN(i.value) && i.value !==''){
          T.id = Number(i.value);
      }else{
        if(T.hasOwnProperty(i.name.toString())){
            T[i.name.toString()] = i.value;
        }
      }
    });
  }
}

class Competitor {
  constructor(helm, crew, boat, sailNumber, id = null) {
    if(id) this.id = new Number(id);
    this.helm = helm;
    this.crew = crew;
    this.sailNumber = stripHtml(sailNumber);
  }
}

class BoatClass{
  constructor(name, py, id = null) {
    if(id) this.id = new Number(id);
    this.name = stripHtml(name);
    this.py = py;
  }
}

/* SINGLETONS */

class BoatClassSingleton {
  constructor() {
    if (!BoatClassSingleton.instance) {
      BoatClassSingleton.instance = this;
    }
    return BoatClassSingleton.instance;
  }

  createBoatClass(name, py = 1000, id) {
    const bc = new BoatClass(name, py);
    this.saveBoatClass(bc);
    return bc;
  }

  saveBoatClass(boatClass) {
    const request = sailScoreDB.openDB();
    
    request.onerror = function(event) {
      console.log("Errore nell'apertura del database: " + event.target.errorCode);
    };
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["BoatClasses"], "readwrite");
      const store = transaction.objectStore("BoatClasses");
      store.put(boatClass);
      console.log("boatClass salvata con successo nel database.");
    };
  }
  getAll(fn){
    const request = sailScoreDB.openDB();

    request.onerror = function(event) {
      console.log("Errore nell'apertura del database: " + event.target.errorCode);
    };
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["BoatClasses"], "readonly");
      const store = transaction.objectStore("BoatClasses");
      const res = store.getAll();
      if (fn){
        res.onsuccess = fn;
      }
    };
  }
}

const boatClassSingleton = new BoatClassSingleton();

class SailorSingleton {
  constructor() {
    if (!SailorSingleton.instance) {
      SailorSingleton.instance = this;
    }
    return SailorSingleton.instance;
  }

  createSailor(sailor) {
    const s = new Sailor(sailor);
    this.saveSailor(s);
    return s;
  }

  saveSailor(sailor) {
    const request = sailScoreDB.openDB();

    request.onerror = function(event) {
      console.log("Errore nell'apertura del database: " + event.target.errorCode);
    };
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["Sailors"], "readwrite");
      const store = transaction.objectStore("Sailors");
      store.put(sailor);
      console.log("Sailor salvato con successo nel database.");
    };
  }
  get(id, fn){
    const request = sailScoreDB.openDB();
      request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["Sailors"], "readonly");
      const store = transaction.objectStore("Sailors");
      const res = store.get(id);
      
      if (fn){
        res.onsuccess = fn;
      }
      console.log("Sailor recuperato con successo.");
    };

  };
  deleteSailor(id, fn){
    const request = sailScoreDB.openDB();
      request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["Sailors"], "readwrite");
      const store = transaction.objectStore("Sailors");
      const res = store.delete(id);
      
      if (fn){
        res.onsuccess = fn;
      }
      console.log("Sailor eliminato con successo.");
    };
    
  }
  getAll(fn){
    const request = sailScoreDB.openDB();

    request.onerror = function(event) {
      console.log("Errore nell'apertura del database: " + event.target.errorCode);
    };
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["Sailors"], "readonly");
      const store = transaction.objectStore("Sailors");
      const res = store.getAll();
      /*fn = function (e){
        console.table(e.currentTarget.result);
      };*/
      if (fn){
        res.onsuccess = fn;
      }
      console.log("Sailors recuperati con successo.");
    };
  }
}

const sailorSingleton = new SailorSingleton();


/* UTILITY FUNCTIONS */

function stripHtml(str){
  let strc = String(str).replace(/(<([^>]+)>)/gi, " ");
  strc = strc.replace(/\t\t/gi, ' ');
  strc = strc.replace(/\r/gi, ' ');
  strc = strc.replace(/\n/gi, ' ');
  strc = strc.replace(/\s\s\s\s\s/gi, ' ');
  strc = strc.replace(/\s\s\s\s/gi, ' ');
  strc = strc.replace(/\s\s\s/gi, ' ');
  strc = strc.replace(/\s\s/gi, ' ');
  strc = strc.replace(/^\s(.*)\s$/gi, '$1');
  return strc;
}

/* IMPORT FUNCTIONS */

function importPotsmouthYardstick(){
  const url = 'https://andrea-buzz.github.io/SailScore/data/py-list.json';
  var xhr = new XMLHttpRequest();
  xhr.onerror = function(){ alert('Import Failed! Error: ' + xhr.status); };
  xhr.onreadystatechange = function( e ) {
    if(xhr.readyState === 4 && xhr.status === 200){
      const data = JSON.parse( xhr.responseText );
      if(data.length){
        data.forEach( b => boatClassSingleton.saveBoatClass(b) ); 
      }
    }
    if (xhr.readyState !== 4) {
      return;
    }
    if (xhr.status !== 200) {
      xhr.onerror();
      return;
    }
  };
  xhr.open('GET', url);
  xhr.send()
}


/* FRONT END FUNCTIONS */

function show_started_competitors(){
  let competitors = [
    {name: "Lorenzo Serretti", sail_number: "205262", boat_class: "ILCA 6"},
    {name: "Giovanna Pagnini", sail_number: "197000", boat_class: "ILCA 6"},
    {name: "Gaia Cinquepalmi", sail_number: "210505", boat_class: "ILCA 6"},
    {name: "Danilo Monticelli", sail_number: "210000", boat_class: "ILCA 7"},
    {name: "Stefano Melone", sail_number: "218765", boat_class: "ILCA 7"},
    {name: "Andrea Bazzani", sail_number: "219081", boat_class: "ILCA 7"},
    {name: "Francesca Carlotti", sail_number: "180321", boat_class: "ILCA 6"},
    {name: "Guido Rocchi", sail_number: "209111", boat_class: "ILCA 7"},
    {name: "Max Cinquepalmi", sail_number: "183555", boat_class: "ILCA 7"}
  ];
  let tag_competitors = document.querySelector('[data-list="competitors"]');
  competitors.forEach(c => tag_competitors.insertAdjacentHTML('afterBegin',`
<div class="competitor" data-status="started"> 
  <button type="button" data-role="pull-top">&#8679;</button> 
  <span class="crew">${c.name}</span> 
  <span class="sail-number">${c.sail_number}</span> 
  <span class="boat-class">${c.boat_class}</span> 
  <button type="button" data-role="set-arrived">&#9201;</button>
</div>`));
  document.querySelectorAll('[data-role="pull-top"]').forEach(b => b.addEventListener('click', pull_top));
  function pull_top (e){
    let c = e.currentTarget.parentNode;
    c.classList.add('pulled-top');
    c.style.order --;
    setTimeout(function(){c.classList.remove('pulled-top');}, 500);
  }
}
show_started_competitors();

function showSailors(e){
  let tag_sailors = document.querySelector('[data-list="sailors"]');
  let sailors = e.currentTarget.result;
  tag_sailors.innerHTML = '';
  sailors.forEach(d => {const s = new Sailor(d); tag_sailors.insertAdjacentHTML('beforeEnd',`<div class="sailor">
      <span class="fullname">${s.fullName}</span> 
      <span class="birthdate"> ${s.birthDate} </span>
      <span class="fiv">FIV: ${s.fiv}</span>
      <span class="actions">
        <button type="button" data-role="edit_sailor" data-id="${s.id}"> &#9998; </button>
        <button type="button" data-role="delete_sailor" data-id="${s.id}"> &#128465;&#65039; </button>
      </span>
    </div>`)});
  document.querySelectorAll('[data-role="edit_sailor"]').forEach(b => b.addEventListener('click', edit_sailor));
  document.querySelectorAll('[data-role="delete_sailor"]').forEach(b => b.addEventListener('click', delete_sailor));
}


function add_sailor(e) {
  const form = `<form data-role="form-sailor">
      <div class="field-group">
        <label>Firstname</label> <input type="text" name="firstname" />
      </div>
      <div class="field-group">
        <label>Lastname</label> <input type="text" name="lastname" />
      </div>
      <div class="field-group">
        <label>BirthDate</label> <input type="date" name="birthdate" />
      </div>
      <div class="field-group">
        <label>FIV num.</label> <input type="number" name="fiv" />
      </div>
      <div class="field-group">
        <input type="hidden" name="id" />
        <button type="reset">Reset</button> <button type="button" data-role="save_sailor">Save</button>
      </div>
    </form>`;
  addToPopup(form);
  document.querySelector('[data-role="save_sailor"]').addEventListener('click', save_sailor);
}
function delete_sailor(e){
  const sailor_id = Number(e.currentTarget.getAttribute('data-id'));  
  pop.confirm('Really want delete the record?', function(){
    sailorSingleton.deleteSailor(sailor_id, function(){sailorSingleton.getAll(showSailors);});
  });
};

function edit_sailor(e) {
  sailorSingleton.get(Number(e.currentTarget.getAttribute('data-id')), function(ev){
    s = ev.currentTarget.result;
    const form = `<form data-role="form-sailor">
      <div class="field-group">
        <label>Firstname</label> <input type="text" name="firstname" value="${s.firstname}" />
      </div>
      <div class="field-group">
        <label>Lastname</label> <input type="text" name="lastname" value="${s.lastname}" />
      </div>
      <div class="field-group">
        <label>BirthDate</label> <input type="date" name="birthdate" value="${s.birthdate}" />
      </div>
      <div class="field-group">
        <label>FIV num.</label> <input type="number" name="fiv" value="${s.fiv}" />
      </div>
      <div class="field-group">
        <input type="hidden" name="id" value="${s.id}" />
        <button type="reset">Reset</button> <button type="button" data-role="save_sailor">Save</button>
      </div>
    </form>`;
  addToPopup(form);
  document.querySelector('[data-role="save_sailor"]').addEventListener('click', save_sailor);
  });
}

function save_sailor(e){
  const fields = e.currentTarget.parentElement.parentElement.querySelectorAll('input[name]');
  const ff = [...fields].map(f => ({name: f.name, value: f.value}));
  
  //const vs = [...fields].map(f => [f.name, f.value]);
  //const sailor = Object.fromEntries( new Map(vs));
  const sailor = new Sailor(ff);
  sailorSingleton.saveSailor(sailor);
  sailorSingleton.getAll(showSailors);
  removeFromPopup();
}

var pop = {
  response : function(res){
    if(true === res){
      if('function'=== typeof pop.fn_yes){
        pop.fn_yes();
      }
    }else{
      if('function'=== typeof pop.fn_no){
        pop.fn_no();
      }
    }
    removeFromPopup();
  },
  fn_yes: null,
  fn_no: null,
  confirm : function(msg='', fn_yes, fn_no){
    html = `<div class="confirm"><div class="confirm-question">${msg}</div><div class="confirm-buttons">
        <button type="button" onclick="pop.response(true)"> Yes </button>
        <button type="button" onclick="pop.response(false)"> No </button>
      </div></div>`;
    if( fn_yes ){
      pop.fn_yes = fn_yes;
    }
    if( fn_no ){
      pop.fn_no = fn_no;
    }
    addToPopup(html);
    
  }  
};



function addToPopup(html){
  let w = document.querySelector('.popup-fixed');
  w.querySelector('.popup-content').innerHTML = html;
  w.classList.remove('hidden')
}

function removeFromPopup(){
  let w = document.querySelector('.popup-fixed');
  w.querySelector('.popup-content').innerHTML = '';
  w.classList.add('hidden')
}

sailorSingleton.getAll(showSailors);
document.querySelector('[data-role="add_sailor"]').addEventListener('click', add_sailor);
document.querySelector('#global-nav .toggle-menu').addEventListener('click',function(e){
  
  const c = document.querySelector('#global-nav > ul');
  if(Boolean(c.getAttribute('aria-expanded')) === false){
    c.setAttribute('aria-expanded', 'true');
    e.currentTarget.classList.add('opened');
  }else{
    c.setAttribute('aria-expanded', '');
    e.currentTarget.classList.remove('opened');
  }
});