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
      this.createBoatClassesStore(db);
      this.createSailorsStore(db);
    }
    
    request.onerror = function(event) {
      console.log("Errore nell'apertura del database: " + event.target.errorCode);
    };
    return request;
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
    if(id) this.id = parseInt(id, 10);
    this.name = name;
    this.location = location;
  }
}

class Sailor {
  constructor(firstname, lastname, fiv, id = null) {
    if(id) this.id = parseInt(id, 10);
    this.firstname = stripHtml(firstname);
    this.lastname = stripHtml(lastname);
    this.fiv = parseInt(fiv, 10);
  }
}

class Competitor {
  constructor(helm, crew, boat, sailNumber, id = null) {
    if(id) this.id = parseInt(id, 10);
    this.helm = helm;
    this.crew = crew;
    this.sailNumber = stripHtml(sailNumber);
  }
}

class BoatClass{
  constructor(name, py, id = null) {
    if(id) this.id = parseInt(id, 10);
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

  createSailor(firstname, lastname, fiv, id) {
    const s = new Sailor(firstname, lastname, fiv);
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
      console.log("Sailor salvato con successo nel database.");
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
  competitors.forEach(c => tag_competitors.insertAdjacentHTML('afterBegin',`<div class="competitor" data-status="started"> <button type="button" data-role="pull-top">&#8679;</button> <span>${c.name}</span> <span>${c.sail_number}</span> <span>${c.boat_class}</span> <button type="button" data-role="set-arrived">&#9201;</button></div>`));
  document.querySelectorAll('[data-role="pull-top"]').forEach(b => b.addEventListener('click', pull_top));
  function pull_top (e){
    let c = e.currentTarget.parentNode; 
    c.style.order --;
  }
}
show_started_competitors();

function showSailors(e){
  let tag_sailors = document.querySelector('[data-list="sailors"]');
  let sailors = e.currentTarget.result;
  sailors.forEach(s => tag_sailors.insertAdjacentHTML('afterBegin',`<div class="sailor">
      <span class="firstname">${s.firstname}</span> <span class="lastname">${s.lastname}</span> <span class="fiv">FIV: ${s.fiv}</span> 
    </div>`));
}
sailorSingleton.getAll(showSailors);