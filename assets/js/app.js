/* DATABASE */
class SailScoreDB {
  //#cached = {};
  constructor() {
    Object.defineProperty(this, '_cached', {value: {}, writable: true, enumerable: false, configurable: true });
    this.dbName = 'SailScoreDB';
    this.conn = this.openDB();
    this.cached = true;
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
    const o = db.createObjectStore("Club", { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("name", "name", { unique: false });
  }
  
  createRegattasStore(db){
    const o = db.createObjectStore("Regattas", { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("name", "name", { unique: false });
  }
  
  createRacesStore(db){
    const o = db.createObjectStore("Races", { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("name", "name", { unique: false });
  }
  
  createCompetitorsStore(db){
    const o = db.createObjectStore("Competitors", { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("name", "name", { unique: false });
  }
  
  createSailorsStore(db){
    const o = db.createObjectStore("Sailors", { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("fiv", "fiv", { unique: false });
    o.createIndex("firstname", "firstname", { unique: false });
    o.createIndex("lastname", "lastname", { unique: false });
    //  o.createIndex("fullname", ["firstname", "lastname", birtDate], { unique: true });
  }
  
  createBoatClassesStore(db){
    const o = db.createObjectStore("BoatClasses", { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("name", "name", { unique: false });
    importPotsmouthYardstick();
  }
  
  set cached( c ){
    if(0 === Object.keys(this._cached).length){
      this._cached = {club:[], regatta:[], sailor:[], competitor:[], race:[], boatclass:[]};
    }
  }
  get cached(){
    const _c = this._cached; 
    return { 
      sailor: function(s){ return _c.sailor.filter( (x) => 
              x.fullName.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
              x.fiv.toString().indexOf(s) > -1 )},
      boatclass: function(s){ return _c.boatclass.filter( (x) => x.name.toLowerCase().indexOf(s.toLowerCase()) > -1 )},
      competitor: function(s){ return _c.competitor.filter( (x) => x.fullName.toLowerCase().indexOf(s.toLowerCase()) > -1 )}
    }
  }
  set club( c ){
    this._cached.club = c;
  }
  set regatta( c ){
    this._cached.regatta = c;
  }
  set sailor( c ){
    this._cached.sailor = c;
  }
  set competitor( c ){
    this._cached.competitor = c;
  }
   set race( c ){
    this._cached.race = c;
  }
   set boatclass( c ){
    this._cached.boatclass = c;
  }
}
const sailScoreDB = new SailScoreDB(); 


/* ENTITIES */
class entity {
  constructor(c = {id:null}) {
    if(c.id && null !== c.id && '' !== c.id && !isNaN(c.id)) this.id = Number(c.id);
  };
  set _setFromArray(a){
    var T = this;
    if(('object' === typeof a) && ('number' === typeof a.length)){
      a.forEach(function(i){
        if('id' === i.name && !isNaN(i.value) && i.value !==''){
            T.id = Number(i.value);
        }else{
          if(T.hasOwnProperty(i.name.toString())){
              T[i.name.toString()] = stripHtml(i.value);
          }
        }
      });     
    }
  };
  set defineProperty(o){
    let k = Object.keys(o).toString();
    Object.defineProperty(this, k, o[k]);
  };
}
class Club extends entity {
  constructor(c = {name:'', location:'', id: null}) {
    super(c);
    let PD = {value: null, writable: true, enumerable: true, configurable: false};
    PD.value = stripHtml(c.name);
    this.defineProperty = {name: PD};
    PD.value = stripHtml(c.address);
    this.defineProperty = {address: PD};
    PD.value = stripHtml(c.location);
    this.defineProperty = {location: PD};
  }
}

class Sailor extends entity {
  
  constructor(s = {firstname:'',lastname:'',fiv:null}) {
    super(s);
    this.firstname = s.firstname ? stripHtml(s.firstname):'';
    this.lastname = s.lastname?stripHtml(s.lastname):'';
    this.fiv = 0;
    this.fivNumber = s.fiv?s.fiv:0;
    this.birthDate = s.birthdate?s.birthdate:0;
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
}

class Competitor extends entity {
  constructor(c = {regatta_id: 0, helm_id: 0, crew_ids:[], boat_id:null, sailNumber:'', id: null}) {
    super(c);
    //this.defineProperty = {_data: {value: {}, writable: true, enumerable: true, configurable: true}};
    this['#data'] = {};
    this.regatta_id = c.regatta_id;
    this.helm_id = c.helm_id;
    this.crew_ids = c.crew_ids;
    this.sailNumber = stripHtml(c.sailNumber);
    this.helm = {};
    this.crew = [];
  }
  set _data(o){
    let n = o;
  }
  get _data(){
    const d = Object.assign({}, this['#data']);
    return d;
  }
  set helm(o){
    this['#data'].helm = o;
  }
  get helm(){
    return this['#data'].helm;
  }
  set crew(o){
    this['#data'].crew = o;
  }
  get crew(){
    return this['#data'].crew;
  }
}

class BoatClass extends entity{
  constructor(b = {name:'', rating: 1000, id: null}) {
    super(b);
    //if(id) this.id = new Number(id);
    this.name = stripHtml(b.name);
    this.rating = !isNaN(b.rating)?Number(b.rating):1000;
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

  createBoatClass(b) {
    const bc = new BoatClass(b);
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
  get (id, fn) {
    const request = sailScoreDB.openDB();
      request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["BoatClasses"], "readonly");
      const store = transaction.objectStore("BoatClasses");
      const res = store.get(id);
      
      if (fn){
        res.onsuccess = fn;
      }
      console.log("BoatClass recuperato con successo.");
    }; 
  }
  deleteBoatClass(id, fn){
    const request = sailScoreDB.openDB();
      request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["BoatClasses"], "readwrite");
      const store = transaction.objectStore("BoatClasses");
      const res = store.delete(id);
      
      if (fn){
        res.onsuccess = fn;
      }
      console.log("BoatClass eliminato con successo.");
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
      res.onsuccess = (e) => { 
        sailScoreDB.boatclass = e.target.result.map((b) => new BoatClass(b));
        if(fn){
          fn(e);
        }
        console.log("BoatClass recuperati con successo.");
      };
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
      res.onsuccess = (e) => { 
        sailScoreDB.sailor = e.target.result.map((b) => new Sailor(b));
        if(fn){
          fn(e);
        }
      };

      console.log("Sailors recuperati con successo.");
    };
  }
}

const sailorSingleton = new SailorSingleton();


/* UTILITY FUNCTIONS */

function stripHtml(str){
  switch(typeof str){
    case 'undefined':
      return null;
      break;
    case 'string':
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
      break;
    default:
      return str;
  }
}

/* IMPORT EXPORT FUNCTIONS */

function importPotsmouthYardstick(){
  const url = 'https://andrea-buzz.github.io/SailScore/data/py-list.json';
  var xhr = new XMLHttpRequest();
  xhr.onerror = function(){ alert('Import Failed! Error: ' + xhr.status); };
  xhr.onreadystatechange = function( e ) {
    if(xhr.readyState === 4 && xhr.status === 200){
      const data = JSON.parse( xhr.responseText );
      if(data.length){
        data.forEach( b => boatClassSingleton.createBoatClass(b) ); 
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
  xhr.send();
}

function exportAllData() {
  const r = sailScoreDB.openDB();
  var data = {};
  let tables = [];
  let db;
  r.onsuccess = (e) => {
    db = e.target.result;
    tables = [...e.target.result.objectStoreNames];
    tables.forEach((n) => data[n] = null );
    tables.forEach((n) => getTable(n) );
    
  };
  function getTable(tname){
    const r2 = sailScoreDB.openDB();
    r2.onerror = function(e1) {
      console.log("Errore nell'apertura del database: " + e1.target.errorCode);
    };
    r2.onsuccess = (e2) => {
      const db = e2.target.result;
      const t = db.transaction([tname], "readonly");
      const s = t.objectStore(tname);
      const q = s.getAll();
      q.onsuccess = (e3) => { setData(tname, e3.target.result);};
    };
  }
  function setData(n, o){
    
    data[n] = o;
    let undone = Object.keys(data).map((n) => null !== data[n] );
    let isDone = (undone.filter((e)=> e===false).length === 0);
    if(isDone){
      exportAsJSON();
    }
  }
  function exportAsJSON(){
    const j = JSON.stringify([data]);
    downloadString(j, 'json', 'SailScoreAllData.json');
  }
  return this;
}

function importAllData(){
  alert('Sorry, not implemented yet!');
}

/* FRONT END FUNCTIONS */

function downloadString(text, fileType, fileName) {
  var blob = new Blob([text], { type: fileType });
  var a = document.createElement('a');
  a.download = fileName;
  a.target = '_blank';
  a.href = URL.createObjectURL(blob);
  a.innerText = 'Download CSV';
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
  a.click();
  setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500 );  
}

function onclick_btn3(){
  setTimeout(function() { URL.revokeObjectURL(document.getElementById('btn3').href); document.getElementById('btn3').remove(); }, 1500);  
}

function renderSelectOptions(target, proto = Object, keys = ['id', 'name'], fn){
  this.target = target;
  this.object_name = proto.name.toLowerCase();
  this.keys = keys;
  let p = new Promise(fn);
  
  p.then((e) => {
      let res = e.target.result;
      //  res = [];
      if(0 === res.length) {
        return [``];
      }else{
        return res.map(
          (d) => {
            let b = new proto(d);
            const object_name = this.object_name;
            let k_val = b[this.keys[0]];
            let k_name = b[this.keys[1]];
            let td = `<option value="${k_val}">${k_name}</option>`;
            return `${td}`;
          });
      }
    }).then((bc) => {
      const object_name = this.object_name;
      bc.unshift( `<option value=""> ... </option>` );
      this.target.innerHTML = bc.join('\n');
    });
}

function renderSelectSailor(){
  const target = document.querySelector('select[name="sailor"]');
  if(target){
    renderSelectOptions(target, 
                      Sailor, 
                      ['id', 'fullName'], 
                      sailorSingleton.getAll);
  }
}

function renderTable(target, proto = Object, fn){
  this.target = target;
  this.object_name = proto.name.toLowerCase();
  this.keys = [];
  let p = new Promise(fn);
  
  p.then((e) => {
      let res = e.target.result;
      //  res = [];
      if(0 === res.length) {
        return [`<div>Sorry, nothing to show!</div>`];
      }else{
        this.keys = Object.keys(new proto(res[0]));
        return res.map(
          (d) => {
            let b = new proto(d);
            const object_name = this.object_name;
            let td = this.keys.map((h) => `<span class="td ${h}">${b[h]}</span>`).join('');
            return `<div class="tr">${td}<span class="td actions">
        <button type="button" data-role="edit_${object_name}" data-id="${b.id}"> &#9998; </button>
        <button type="button" data-role="delete_${object_name}" data-id="${b.id}"> &#128465;&#65039; </button>
      </span></div>`;});
      }
    }).then((bc) => {
      const object_name = this.object_name;
      let headers = this.keys.map((h) => `<span class="th ${h}">${h}</span>`).join('');
      bc.unshift(`<div class="tr thead">${headers}<span class="th actions"></span></div>`);
      this.target.innerHTML = '<div class="data-table">' + bc.join('\n') + '</div>';
      document.querySelectorAll(`[data-role="edit_${object_name}"]`).forEach(b => b.addEventListener('click', window[`edit_${object_name}`]));
      document.querySelectorAll(`[data-role="delete_${object_name}"]`).forEach(b => b.addEventListener('click', window[`delete_${object_name}`]));
    });
}

/* SAILORS */

function showSailors(e){
  let tag_sailors = document.querySelector('[data-list="sailors"]');
  let sailors = e.currentTarget.result;
  tag_sailors.innerHTML = '';
  sailors.forEach(d => {const s = new Sailor(d); tag_sailors.insertAdjacentHTML('beforeEnd',`<div class="sailor">
      <span class="fullname">${s.fullName}</span> 
      <span class="birthdate"> ${s.birthDate} </span>
      <span class="fiv">fiv: ${s.fiv}</span>
      <span class="actions">
        <button type="button" data-role="edit_sailor" data-id="${s.id}"> &#9998; </button>
        <button type="button" data-role="delete_sailor" data-id="${s.id}"> &#128465;&#65039; </button>
      </span>
    </div>`);});
  document.querySelectorAll('[data-role="edit_sailor"]').forEach(b => b.addEventListener('click', edit_sailor));
  document.querySelectorAll('[data-role="delete_sailor"]').forEach(b => b.addEventListener('click', delete_sailor));
}


function add_sailor(e) {
  const title = 'Add Sailor';
  const form = `<form data-role="form-sailor">
      <div class="field-group">
        <label>Firstname</label> <div class="form-control"><input type="text" name="firstname" /></div>
      </div>
      <div class="field-group">
        <label>Lastname</label> <div class="form-control"><input type="text" name="lastname" /></div>
      </div>
      <div class="field-group">
        <label>BirthDate</label> <div class="form-control"><input type="date" name="birthdate" /></div>
      </div>
      <div class="field-group">
        <label>FIV num.</label> <div class="form-control"><input type="number" name="fiv" /></div>
      </div>
      <div class="form-buttons">
        <input type="hidden" name="id" />
        <button type="reset">Reset</button> <button type="button" data-role="save_sailor">Save</button>
      </div>
    </form>`;
  
  addToPopup(title, form);
  document.querySelector('[data-role="save_sailor"]').addEventListener('click', save_sailor);
}
function delete_sailor(e){
  const sailor_id = Number(e.currentTarget.getAttribute('data-id'));  
  pop.confirm('Delete Sailor', 'Really want delete the record?', function(){
    sailorSingleton.deleteSailor(sailor_id, function(){sailorSingleton.getAll(showSailors);});
  });
};

function edit_sailor(e) {
  sailorSingleton.get(Number(e.currentTarget.getAttribute('data-id')), function(ev){
    const title = 'Edit Sailor';
    let s = ev.currentTarget.result;
    const form = `<form data-role="form-sailor">
      <div class="field-group">
        <label>Firstname</label> <div class="form-control"><input type="text" name="firstname" value="${s.firstname}" /></div>
      </div>
      <div class="field-group">
        <label>Lastname</label> <div class="form-control"><input type="text" name="lastname" value="${s.lastname}" /></div>
      </div>
      <div class="field-group">
        <label>BirthDate</label> <div class="form-control"><input type="date" name="birthdate" value="${s.birthdate}" /></div>
      </div>
      <div class="field-group">
        <label>FIV num.</label> <div class="form-control"><input type="number" name="fiv" value="${s.fiv}" /></div>
      </div>
      <div class="form-buttons">
        <input type="hidden" name="id" value="${s.id}" />
        <button type="reset">Reset</button> <button type="button" data-role="save_sailor">Save</button>
      </div>
    </form>`;
    addToPopup(title, form);
    document.querySelector('[data-role="save_sailor"]').addEventListener('click', save_sailor);
  });
}

function save_sailor(e){
  const fields = e.currentTarget.parentElement.parentElement.querySelectorAll('input[name]');
  const ff = [...fields].map(f => ({name: f.name, value: f.value}));
  const sailor = new Sailor();
  sailor._setFromArray = ff;
  sailorSingleton.saveSailor(sailor);
  sailorSingleton.getAll(showSailors);
  removeFromPopup();
}

/* BoatClasses */

function showBoatClasses(){
  renderTable(document.querySelector('[data-list="boatclass"]'), BoatClass, boatClassSingleton.getAll);
}

showBoatClasses();
document.querySelector('[data-role="add_boatclass"]').addEventListener('click', add_boatclass);

function add_boatclass(e) {
  const title = 'Add Boat Class';
  const form = `<form data-role="form-sailor">
      <div class="field-group">
        <label>Name</label> <div class="form-control"><input type="text" name="name" /></div>
      </div>
      <div class="field-group">
        <label>Rating</label> <div class="form-control"><input type="text" name="rating" /></div>
      </div>
      <div class="form-buttons">
        <input type="hidden" name="id" />
        <button type="reset">Reset</button> <button type="button" data-role="save_boatclass">Save</button>
      </div>
    </form>`;
  addToPopup(title, form);
  document.querySelector('[data-role="save_boatclass"]').addEventListener('click', save_boatclass);
}

function edit_boatclass(e) {
  boatClassSingleton.get(Number(e.currentTarget.getAttribute('data-id')), function(ev){
    const title = 'Edit Boat Class';
    let s = ev.currentTarget.result;
    const form = `<form data-role="form-sailor">
      <div class="field-group">
        <label>Name</label> <div class="form-control"><input type="text" name="name" value="${s.name}" /></div>
      </div>
      <div class="field-group">
        <label>Rating</label> <div class="form-control"><input type="text" name="rating" value="${s.rating}" /></div>
      </div>
      <div class="form-buttons">
        <input type="hidden" name="id" value="${s.id}" />
        <button type="reset">Reset</button> <button type="button" data-role="save_boatclass">Save</button>
      </div>
    </form>`;
    addToPopup(title, form);
    document.querySelector('[data-role="save_boatclass"]').addEventListener('click', save_boatclass);
  });
}

function delete_boatclass(e){
  const item_id = Number(e.currentTarget.getAttribute('data-id'));  
  pop.confirm('Delete Boat Class', 'Really want delete the record?',
    function(){
      boatClassSingleton.deleteBoatClass(item_id, function(){
          boatClassSingleton.getAll(showBoatClasses);
        });
    });
};

function save_boatclass(e){
  const fields = e.currentTarget.parentElement.parentElement.querySelectorAll('input[name]');
  const ff = [...fields].map(f => ({name: f.name, value: f.value}));
  const boatClass = new BoatClass();
  boatClass._setFromArray = ff;
  boatClassSingleton.saveBoatClass(boatClass);
  boatClassSingleton.getAll(showBoatClasses);
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
  title: '',
  fn_yes: null,
  fn_no: null,
  confirm: function(tit='', msg='', fn_yes, fn_no){
    pop.title = tit;
    let html = `<div class="confirm"><div class="confirm-question">${msg}</div><div class="popup-buttons">
        <button type="button" onclick="pop.response(true)"> Yes </button>
        <button type="button" onclick="pop.response(false)"> No </button>
      </div></div>`;
    if( fn_yes ){
      pop.fn_yes = fn_yes;
    }
    if( fn_no ){
      pop.fn_no = fn_no;
    }
    addToPopup(pop.title, html);
  }  
};

function addToPopup(title, html){
  let w = document.querySelector('.popup-fixed');
  w.querySelector('.popup-title').innerHTML = title;
  w.querySelector('.popup-content').innerHTML = html;
  w.classList.remove('hidden');
}

function removeFromPopup(){
  let w = document.querySelector('.popup-fixed');
  w.querySelector('.popup-content').innerHTML = '';
  w.classList.add('hidden');
}

sailorSingleton.getAll(showSailors);
document.querySelector('[data-role="add_sailor"]').addEventListener('click', add_sailor);
document.querySelector('#global-nav .toggle-menu').addEventListener('click', (e) => {
  const c = document.querySelector('#global-nav > ul');
  if(Boolean(c.getAttribute('aria-expanded')) === false){
    c.setAttribute('aria-expanded', 'true');
    e.currentTarget.classList.add('opened');
  }else{
    c.setAttribute('aria-expanded', '');
    e.currentTarget.classList.remove('opened');
  }
});

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
    let c_order = window.getComputedStyle(c).order - 1;
    c.style.order = c_order;
    setTimeout(function(){c.classList.remove('pulled-top');}, 1000);
  }
}
show_started_competitors();



/* WORKER */
if ("serviceWorker" in navigator) {
  if(location.origin !== 'file://'){
    navigator.serviceWorker.register("./sw.js");
  }
}
