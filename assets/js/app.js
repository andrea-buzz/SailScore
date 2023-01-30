/* DATABASE */
class SailScoreDB {
  
  constructor() {
    Object.defineProperty(this, '_cached', {value: {}, writable: true, enumerable: false, configurable: true });
    this.objectStoreNames = {};
    this.dbName = 'SailScoreDB';
    this.conn = this.openDB();
    this.cached = true;
    this.entities = { Club: 'Club', Sailor: 'Sailor', Regatta: 'Regatta', Race: 'Race', 
                      Competitor:'Competitor', BoatClass:'BoatClass', Result:'Result' };
    const objList = Object.keys(this.entities).map((i) => this.entities[i]);
    const actionList = ['Delete', 'Save', 'Get', 'GetAll'];
    this.eventList = [];
    objList.forEach( (o) => actionList.forEach( (a) => this.eventList.push('on' + o + a) ) );
    this.events = {};
    this.eventList.forEach((i) => this.events[i] = new Event(i, {"bubbles":true, "cancelable":false} ));
    this.renewAllCached();
    return this;
  }
  
  openDB(){
    const r = window.indexedDB.open( this.dbName, 1);
    r.onupgradeneeded = (e) => {
      const db = e.target.result;

      db.onerror = (e) => {
        console.log( "Error loading database.");
      };
      this.createClubStore(db);
      this.createRegattaStore(db);
      this.createCompetitorStore(db);
      this.createRaceStore(db);
      this.createBoatClassStore(db);
      this.createSailorStore(db);
      this.createResultStore(db);
    };
    
    r.onerror = function(e) {
      console.log("Error opening database: " + e.target.errorCode);
    };
    r.onsuccess = (e) => this.objectStoreNames = [...e.target.result.objectStoreNames];
    return r;
  }
  deleteDatabase( force = false){
    if(force){
      const r = window.indexedDB.deleteDatabase(this.dbName);
      r.onerror = (e) => {
        console.error("Error deleting database.");
      };
      r.onsuccess = (e) => {
        console.log("Database deleted successfully");
        console.log(e.result); // should be undefined
      };
    }else{
      console.log("use force=true if you really want delete Database " + this.dbName);
    }
  }
  createClubStore(db = this.conn.result){
    const o = db.createObjectStore(this.entities.Club, { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("name", "name", { unique: false });
  }
  
  createRegattaStore(db){
    const o = db.createObjectStore(this.entities.Regatta, { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("name", "name", { unique: false });
  }
  
  createResultStore(db){
    const o = db.createObjectStore(this.entities.Result, { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("regatta_id", "regatta_id", { unique: false });
    o.createIndex("name", "name", { unique: false });
  }
  
  createRaceStore(db){
    const o = db.createObjectStore(this.entities.Race, { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("regatta_id", "regatta_id", { unique: false });
    o.createIndex("name", "name", { unique: false });
  }
  
  createCompetitorStore(db){
    const o = db.createObjectStore(this.entities.Competitor, { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("regatta_id", "regatta_id", { unique: false });
    o.createIndex("name", "name", { unique: false });
  }
  
  createSailorStore(db){
    const o = db.createObjectStore(this.entities.Sailor, { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("fiv", "fiv", { unique: false });
    o.createIndex("firstname", "firstname", { unique: false });
    o.createIndex("lastname", "lastname", { unique: false });
    //  o.createIndex("fullname", ["firstname", "lastname", birtDate], { unique: true });
  }
  
  createBoatClassStore(db){
    const o = db.createObjectStore(this.entities.BoatClass, { keyPath: "id", autoIncrement: true } ); 
    o.createIndex("id", "id", { unique: true });
    o.createIndex("name", "name", { unique: false });
    if('function' === typeof importPortsmouthYardstick) importPortsmouthYardstick(false);
  }
  
  saveIDBObjectArray(osName, arr=[], fn = null){
    const r = this.openDB();
    r.onerror = function(e) {
      console.log("Error opening database: " + e.target.errorCode);
    };
    r.onsuccess = (e)=>{
      const db = e.target.result;
      const t = db.transaction([osName], "readwrite");
      const s = t.objectStore(osName);
      let rr = null;
      const q = arr.length - 1;
      arr.forEach((o, i) => { let r = s.put(o); if( (i===q) && fn){r.onsuccess = fn;}} );
      
      if(fn){
        //rr.onsuccess = fn;
      }
      //this.renewCached(osName);
      //document.dispatchEvent( sailScoreDB.events['on' + osName + 'Save'] );
    };
  }
  
  
  saveIDBObject(osName, obj, fn = null){
    const r = this.openDB();
    r.onerror = function(e) {
      console.log("Error opening database: " + e.target.errorCode);
    };
    r.onsuccess = (e)=>{
      const db = e.target.result;
      const t = db.transaction([osName], "readwrite");
      const s = t.objectStore(osName);
      const q = s.put(obj);
      if(fn){
        q.onsuccess = fn;
      }
      this.renewCached(osName);
      document.dispatchEvent( sailScoreDB.events['on' + osName + 'Save'] );
    };
  }
  
  deleteIDBObject(osName, id, fn = null){
    const r = this.openDB();
    r.onerror = function(e) {
      console.log("Error opening database: " + e.target.errorCode);
    };
    r.onsuccess = (e)=>{
      const db = e.target.result;
      const t = db.transaction([osName], "readwrite");
      const s = t.objectStore(osName);
      const q = s.delete(id);
      if(fn){
        q.onsuccess = fn;
      }
      this.renewCached(osName);
      document.dispatchEvent( sailScoreDB.events['on' + osName + 'Delete'] );
    };
  }
  
  getIDBObject(osName, id, fn = null){
    const r = this.openDB();
    r.onerror = function(e) {
      console.log("Error opening database: " + e.target.errorCode);
    };
    r.onsuccess = (e)=>{
      const db = e.target.result;
      const t = db.transaction([osName], "readwrite");
      const s = t.objectStore(osName);
      const q = s.get(id);
      if(fn){
        q.onsuccess = fn;
      }
      document.dispatchEvent( sailScoreDB.events['on' + osName + 'Get'] );
    };
  }
  
  getAllIDBObject(osName, fn = null){
    const r = this.openDB();
    r.onerror = function(e) {
      console.log("Error opening database: " + e.target.errorCode);
    };
    r.onsuccess = (e)=>{
      const db = e.target.result;
      const t = db.transaction([osName], "readonly");
      const s = t.objectStore(osName);
      const q = s.getAll();
      if(fn){
        q.onsuccess = fn;
      }
      document.dispatchEvent( sailScoreDB.events['on' + osName + 'GetAll'] );
    };
  }

  clearObjectStore(osName, fn = null ){
    const db = this.conn.result;
    const t = db.transaction([osName], "readwrite");
    const s = t.objectStore(osName);
    if(['competitor', 'race', 'result'].indexOf(osName.toLowerCase()) > -1){
      //  s.createIndex("regatta_id", "regatta_id", { unique: false });
    }
    const q = s.clear();
    if(fn){
      q.onsuccess = fn;
    }
  }
  clearStoreBoatClass(fn = null ){
    let osName = this.entities.BoatClass;
    this.clearObjectStore(osName, fn );
  }
  clearStoreClub(fn = null ){
    let osName = this.entities.Club;
    this.clearObjectStore(osName, fn );
  }
  clearStoreSailor(fn = null ){
    let osName = this.entities.Sailor;
    this.clearObjectStore(osName, fn );
  }
  clearStoreRegatta(fn = null ){
    let osName = this.entities.Regatta;
    this.clearObjectStore(osName, fn );
  }
  clearStoreRace(fn = null ){
    let osName = this.entities.Race;
    this.clearObjectStore(osName, fn );
  }
  clearStoreCompetitor(fn = null ){
    let osName = this.entities.Competitor;
    this.clearObjectStore(osName, fn );
  }
  clearStoreResult(fn = null ){
    let osName = this.entities.Result;
    this.clearObjectStore(osName, fn );
  }
  /* Cached data */
  renewAllCached(){
    const ons = this.entities;//this.objectStoreNames;
    Object.keys(this.entities).forEach(
            (k) => Object.keys(ons).includes(k)?
            this.renewCached(k)
            :null);
  }
  renewCached(osName){
    try{
      this.getAllIDBObject(osName, 
        (e) => this._cached[osName.toLowerCase()] = e.target.result.map(
          (i) => Function( 'o', 'return new ' + osName + '(o);' )(i) ) );
    }
    catch(e){
      console.log(e.message);
    }
  }
  set cached( c ){
    if(0 === Object.keys(this._cached).length){
      this._cached = {club:[], regatta:[], sailor:[], competitor:[], race:[], boatclass:[]};
    }
  }
  get cached(){
    const _c = this._cached; 
    return { 
      sailor: function(s){ 
        return _c.sailor.filter( (x) => 
        x.fullName.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
        x.fiv.toString().indexOf(s) > -1 );},
      boatclass: function(s){ 
        return _c.boatclass.filter( (x) => x.name.toLowerCase().indexOf(s.toLowerCase()) > -1 );},
      competitor: function(s){ 
        return _c.competitor.filter( (x) => x.fullName.toLowerCase().indexOf(s.toLowerCase()) > -1 );},
      club: function(s){ 
        return _c.club.filter( (x) => x.name.toLowerCase().indexOf(s.toLowerCase()) > -1 );}
    };
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
//sailScoreDB.eventList.forEach((i) => document.addEventListener(i, (e) => console.log(e.type + ' fired')));

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
  constructor(c = {name:'', address:'', location:'', id: null}) {
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
  
  constructor(s = {firstname:'', lastname:'', fiv:'', club:''}) {
    super(s);
    this.firstname = s.firstname ? stripHtml(s.firstname):'';
    this.lastname = s.lastname?stripHtml(s.lastname):'';
    this.fiv = 0;
    this.fivNumber = s.fiv?s.fiv:'';
    this.birthDate = s.birthdate?s.birthdate:0;
    this.club = s.club?stripHtml(s.club):'';
    this.gender = s.gender==='F'?s.gender:'M';
  };
  
  get fullName(){
    return this.firstname + ' ' + this.lastname; 
  };
  
  get birthDate(){
    return ( 0 === this.birthdate)?'':new Date( this.birthdate ).toLocaleDateString();
  }
  set birthDate(d){
    let dd = (typeof d === 'number')? new Date(d): new Date(Date.parse(d));
    this.birthdate = dd.toISOString().substr(0,dd.toISOString().indexOf('T'));
  }
  get fivNumber(){
    return 0 === this.fiv ?'':Number(this.fiv);
  }
  set fivNumber(f){
    this.fiv = Number(f);
  }
}

class Competitor extends entity {
  constructor(c = {regatta_id: 0, helm_id: 0, crew:[], crew_ids:[], boat_id:null, sailNumber:'', id: null}) {
    super(c);
    //this.defineProperty = {_data: {value: {}, writable: true, enumerable: true, configurable: true}};
    this.regatta_id = c.regatta_id;
    this.helm_id = c.helm_id;
    this.crew_ids = c.crew_ids;
    this.sailNumber = stripHtml(c.sailNumber);
    this.Helm = c.helm;
    this.Crew = c.crew || [];
    this.boatclass = c.boatclass;
    
  }
  set Helm(o){
    this.helm = (o instanceof Sailor)?o:new Sailor(o);
    this.helm_id = this.helm.id; 
  }
  get Helm(){
    return this.helm;
  }
  set Crew(o){
    this.crew = o.map( (s) => (s instanceof Sailor)?s:new Sailor(s) );
    this.crew_ids = this.crew.map((s) => s.id);
  }
  get Crew(){
    return this.crew;
  }
  get HelmFullName(){
    return this.helm.fullName;
  }
  get Boat(){
    return this.boatclass?this.boatclass.name:'';
  }
  get PY(){
    return this.boatclass?this.boatclass.rating:null;
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

class Regatta extends entity{
  constructor(b = {name:'', startdate: new Date(), enddate: new Date(), usePY:false, club: {}, competitors: [], id: null}) {
    super(b);
    //  s.birthdate?s.birthdate:0;
    this.name = stripHtml(b.name);
    this.startDate = b.startdate?b.startdate:0;
    this.endDate = b.enddate?b.enddate:0;
    this.UsePY = b.usePY;
    this.Club = b.club;
    this.maxraces = b.maxraces;
    this.DiscardPattern = b.discardpattern;
    this.Competitors = b.competitors?b.competitors:[];
    this.races = b.races?b.races:[];
    this.results = b.results?b.results:[];
  }
  get startDate(){
    return ( 0 === this.startdate)?'':new Date( this.startdate ).toLocaleDateString();
  }
  set startDate(d){
    let dd = (typeof d === 'number')? new Date(d): new Date(Date.parse(d));
    this.startdate = dd.toISOString().substr(0,dd.toISOString().indexOf('T'));
  }
  get endDate(){
    return ( 0 === this.enddate)?'':new Date( this.enddate ).toLocaleDateString();
  }
  set endDate(d){
    let dd = (typeof d === 'number')? new Date(d): new Date(Date.parse(d));
    this.enddate = dd.toISOString().substr(0,dd.toISOString().indexOf('T'));
  }
  set Club(c) {
    let o = {};
    try{
      o = ('string' === typeof c)? JSON.parse(c): c;
    }
    catch(e){
      console.log(e.message);
      o.name = c;
    }
    finally{
      this.club = (o instanceof Club)? o: new Club(o);
    }
  }
  get Club() {
    return this.club;
  }
  get clubName() {
    return ('string' === typeof this.club)? this.club: this.Club.name;
  }
  set Competitors(c) {
    let o = [];
    
    try{
      if(Array.isArray(c)){
        o = c.map((i)=> i instanceof Competitor?i: new Competitor(i));
      }else{
        o = ('string' === typeof c)? JSON.parse(c): c;  
      }
    }
    catch(e){
      console.log(e.message);
    }
    finally{
      this.competitors = o;
    }
  }
  get Competitors() {
    return this.competitors;
  }
  set UsePY(o){
    if ('string' === typeof o){
      this.usePY = Boolean(o === 'true');
    }else{
      this.usePY = Boolean(o === true);
    }
  }
  set MaxRaces(o){
    !isNaN(o)?Number(o):2;
  }
  set DiscardPattern(o){
    let d = [];
    if ('string' === typeof o){
       d = o.split(/\D/).map((i) => parseInt(i));
    }else if('undefined' === typeof o ){
      
    }else{
      d = o.length?o.map((i) => parseInt(i)):[];
    }
    this.discardpattern = d;
  }
}

class Race extends entity {
  constructor(b = {}){
    super(b);
    this.timeStart = b.timestart;
    this.timeEnd = b.timeend;
    this.Competitors = b.competitors;
  }
  get scoringcodes(){
    return [{AP: this.average}, {DSQ: this.dsqscore}, {BFD: this.dsqscore}, {DNS: this.dsqscore}, 
      {DNC: this.dsqscore}, {DNF: this.dsqscore}, {OCS: this.dsqscore}];
  }
  get average(){
    return Math.ceil( this.competitorscount / 2 );
  }
  get dsqscore(){
    return this.competitorscount + 1;
  }
  set timeStart(t) {
    if ('undefined' === typeof t)return;
    this.timestart = new Date(t);
  }
  set timeEnd(t) {
    if ('undefined' === typeof t)return;
    this.timeend = new Date(t);
  }
  get nowToLocalTimeZone(){
    //  non usare
    let n = new Date(Date.now());
    //n.setMinutes(n.getMinutes() - n.getTimezoneOffset());
    return n;
  }
  set Competitors( o ){
    let a = Array.isArray(o)?o.map((i)=> i instanceof Competitor?i: new Competitor(i)):[];
    this.competitors = a;
  }
}

/* SINGLETONS */

class ClubSingleton{
  
  constructor() {
    if (!ClubSingleton.instance) {
      ClubSingleton.instance = this;
    }
    return ClubSingleton.instance;
  }
  osName(){
    return sailScoreDB.entities.Club;
  }
  create(o) {
    const c = new Club(o);
    this.save(c);
    return c;
  }
  save(c, fn = null ) {
    sailScoreDB.saveIDBObject(this.osName(), c, fn);
    // () => {pop.notify('BoatClass', 'Data succesfully saved');}
  }
  get (id, fn = null) {
    sailScoreDB.getIDBObject(this.osName(), id, fn);
  }
  delete(id, fn = null){
    sailScoreDB.deleteIDBObject(this.osName(), id, fn);
  }
  getAll( fn = null ){
    const iDBObjectName = this.osName();
    const onsuccess = (e) => {
    //sailScoreDB.club = e.target.result.map((b) => new Club(b));
      
      if(fn){
        fn(e);
      }
    };
    sailScoreDB.getAllIDBObject(this.osName(), onsuccess);
  }
}

const clubSingleton = new ClubSingleton();

class RegattaSingleton{
   constructor() {
    if (!RegattaSingleton.instance) {
      RegattaSingleton.instance = this;
    }
    return RegattaSingleton.instance;
  }
  osName(){
    return sailScoreDB.entities.Regatta;
  }
  create(o) {
    const c = new Regatta(o);
    this.save(c);
    return c;
  }
  save(c, fn = null ) {
    sailScoreDB.saveIDBObject(this.osName(), c, fn);
  }
  get (id, fn = null) {
    sailScoreDB.getIDBObject(this.osName(), id, fn);
  }
  delete(id, fn = null){
    sailScoreDB.deleteIDBObject(this.osName(), id, fn);
  }
  getAll( fn = null ){
    const iDBObjectName = this.osName();
    const onsuccess = (e) => {
      //sailScoreDB.regatta = e.target.result.map((b) => new Regatta(b));
      
      if(fn){
        fn(e);
      }
    };
    sailScoreDB.getAllIDBObject(this.osName(), onsuccess);
  }
}

const regattaSingleton = new RegattaSingleton();

class CompetitorSingleton{
  constructor() {
    if (!CompetitorSingleton.instance) {
      CompetitorSingleton.instance = this;
    }
    return CompetitorSingleton.instance;
  }
  
  osName(){
    return sailScoreDB.entities.Competitor;
  }
  
  create(o) {
    const c = new Competitor(o);
    this.save(c);
    return c;
  }

  save(c, fn = null ) {
    sailScoreDB.saveIDBObject(this.osName(), c, fn);
  }
  get (id, fn = null) {
    sailScoreDB.getIDBObject(this.osName(), id, fn);
  }
  delete(id, fn = null){
    sailScoreDB.deleteIDBObject(this.osName(), id, fn);
  }
  getAll(fn = null){
    const onsuccess = (e) => {
      //sailScoreDB.competitor = e.target.result.map((b) => new Competitor(b));
      
      if(fn){
        fn(e);
      }
    };
    sailScoreDB.getAllIDBObject(this.osName(), onsuccess);
  }
}

const competitorSingleton = new CompetitorSingleton();

class BoatClassSingleton {
  
  constructor() {
    if (!BoatClassSingleton.instance) {
      BoatClassSingleton.instance = this;
    }
    return BoatClassSingleton.instance;
  }
  
  osName(){
    return sailScoreDB.entities.BoatClass;
  }
  
  create(o) {
    const c = new BoatClass(o);
    this.save(c);
    return c;
  }

  save(c, fn = null ) {
    sailScoreDB.saveIDBObject(this.osName(), c, fn);
  }
  get (id, fn = null) {
    sailScoreDB.getIDBObject(this.osName(), id, fn);
  }
  delete(id, fn = null){
    sailScoreDB.deleteIDBObject(this.osName(), id, fn);
  }
  getAll(fn = null){
    const onsuccess = (e) => {
      //sailScoreDB.boatclass = e.target.result.map((b) => new BoatClass(b));
      
      if(fn){
        fn(e);
      }
    };
    sailScoreDB.getAllIDBObject(this.osName(), onsuccess);
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
  osName(){
    return sailScoreDB.entities.Sailor;
  }
  create(o) {
    const c = new Sailor(o);
    this.save(c);
    return c;
  }
  save(c, fn = null ) {
    sailScoreDB.saveIDBObject(this.osName(), c, fn);
  }
  get (id, fn = null) {
    sailScoreDB.getIDBObject(this.osName(), id, fn);
    console.log("Sailor recuperato con successo.");
  }
  delete(id, fn = null){
    sailScoreDB.deleteIDBObject(this.osName(), id, fn);
  }
  
  getAll(fn = null){
    const onsuccess = (e) => {
      //sailScoreDB.sailor = e.target.result.map((b) => new Sailor(b));
      
      if(fn){
        fn(e);
      }
    };
    sailScoreDB.getAllIDBObject(this.osName(), onsuccess);
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
function dropDatabase( confirm = false ){
  if(confirm){
    pop.confirm('Drop Database', 'Do you really want drop database? All data will be lost!');
    pop.fn_yes = () => sailScoreDB.deleteDatabase(true);
  }else{
    sailScoreDB.deleteDatabase(true);
    pop.notify('Drop Database', 'Database dropped successfully');
  }
}
function clearCacheStorage(){
  caches.delete('SailScore-v1');
}
function importPortsmouthYardstick(confirm = false){
  const url = 'https://andrea-buzz.github.io/SailScore/data/py-list.json';
  var xhr = new XMLHttpRequest();
  xhr.onerror = function(){ pop.notify('Error', 'Import Failed! Error: ' + xhr.status); };
  xhr.onreadystatechange = function( e ) {
    if(xhr.readyState === 4 && xhr.status === 200){
      const data = JSON.parse( xhr.responseText );
      if(data.length){
        //data.forEach( b => boatClassSingleton.create(b) );
        let cb = null;
        if(confirm){
          cb = function(){
            showBoatClasses();
            pop.notify('Import Portsmouth Yardstick', 'data imported successfully');
          };
        }
        sailScoreDB.saveIDBObjectArray( sailScoreDB.entities.BoatClass, data, cb );
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
      console.log("Error opening database: " + e1.target.errorCode);
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
    let isDone = (undone.filter((e )=> e === false).length === 0);
    if(isDone){
      exportAsJSON();
    }
  }
  function exportAsJSON(){
    const j = JSON.stringify(data);
    downloadString(j, 'json', 'SailScoreAllData.json');
  }
  return this;
}

function importAllData(){
  const fs = document.createElement('input');
  let data = {};
  fs.type = "file";
  fs.addEventListener('change', readFile);
  fs.click();
  function readFile(e){
    const mf = e.currentTarget.files[0];
    const r = new FileReader();
    r.addEventListener("load", loadJSON);
    r.readAsBinaryString(mf);
  }
  function loadJSON(e){
    let fc;
    try {
      fc = e.target.result;
      data = JSON.parse(fc);
      importData(data);
    }
    catch(e) {
      pop.alert("Import data Error", e.message);
    }
  }
  function importData(d){
    const keys = Object.keys(d).filter( (k) => sailScoreDB.objectStoreNames.includes(k) );
    let kl = keys.length - 1; 
    keys.forEach( (k, i) => { 
        let cb =  (i === kl)? notifyEnd: null;
        sailScoreDB.saveIDBObjectArray(k, d[k], cb);
      } );
  }
  function notifyEnd(){
    sailScoreDB.renewAllCached();
    pop.notify('Import all data', 'Import succesfully done!');
    
  }
}

/* FRONT END CLASSES */

function selectActivateSearch(theForm){
  theForm.querySelectorAll('.search-select').forEach(function(ss){
    ss.addEventListener('keyup',(e) =>{
      const c = e.currentTarget;
      const s = c.nextSibling;
      var i = s.selectedIndex;
      let el;
      switch(e.keyCode){
        case 40:
          el = [...s.options]
              .find( (o) => o.index > s.selectedIndex && o.innerText.toLowerCase().includes(c.value.toLowerCase()) );
          if(el){
            el.selected = true;
            s.selectedIndex = el.index;
          }
          
          break;
        case 38:
          el = [...s.options]
                  .findLast( (o) => o.index < s.selectedIndex && o.innerText.toLowerCase().includes(c.value.toLowerCase()) );
          if(el){
            el.selected = true;
            s.selectedIndex = el.index;
          }
          break;
        default:
          if(c.value.length){
            [...s.options].forEach((o) => { 
              if( o.innerText.toLowerCase().includes(c.value.toLowerCase()) === false ) { 
                o.setAttribute('disabled', 'disabled'); 
              } 
            });
            let opt = [...s.options].find((o) => o.innerText.toLowerCase().includes(c.value.toLowerCase()) );
            if(opt){
              opt.selected = true;
              s.selectedIndex = opt.index;
            }
          }          
      }
    });
    ss.addEventListener('blur',(e) => {
      const c = e.currentTarget;
      const s = c.nextSibling;
      setTimeout(function(e, c){
        [...s.options].forEach( (o) => o.removeAttribute('disabled'));
      }, 5000);
      c.value = '';
      s.focus();
    });
  });
}

class MultiChoice{
  constructor(tag, values, availables, template){
    this.Tag = tag;
    this.Values = values;
    this.Availables = availables;
    this.Template = template?template:'<li data-id="${c.id}"><span>${c.helm.fullName}</span> <strong>${c.sailNumber}</strong> <i>${c.boatclass.name}</i></li>';
    this.createList();
    this.populateList();
    
  }
  set Template(c){
    this.template = c;
  }
  renderTemplate (c){
    return Function( 'c', 'return `' + this.template + '`;' )(c);
  }
  set Tag(s){
    this.tag = (s instanceof HTMLInputElement)? s: null;
  }
  set Values(a){
    this.values = a;
    this.Checkbox = this.values.length;
  }
  set Checkbox(checked){
    const cb = this.tag.parentNode.querySelector('input[type="checkbox"]');
    if(cb)cb.checked = Boolean(checked);
  }
  set Availables(a){
    this.availables = a;
  }
  createList(){
    const wrap = document.createElement('div');
    wrap.classList.add('wrap-multichoice');
    const ula = document.createElement('ul');
    ula.classList.add('avail');
    this.ula = ula;
    
    const uli = document.createElement('ul');
    uli.classList.add('included');
    this.uli = uli;
    wrap.appendChild(ula);
    wrap.appendChild(uli);
    this.tag.after(wrap);
    this.tag.addEventListener('keyup', (c) => this.filter(c.currentTarget.value.toLowerCase()) );
    
  }
  populateList(){
    const c96 = String.fromCharCode(96);
    const T = this.Template;
    
    this.availables.forEach((c) => this.ula.insertAdjacentHTML('beforeEnd', this.renderTemplate(c)  )); //  '`' + tmpl + '`'
    this.ula.querySelectorAll('li').forEach((l) => l.addEventListener('click', (e) => {
      const nd = e.currentTarget;
      if(false === nd.classList.contains('disabled')){
        const nc = nd.cloneNode(true);
        nc.addEventListener('click', (n) => { 
          n.currentTarget.remove(); 
          nd.classList.remove('disabled');
          this.setDataset();
          //this.Values = this.included;
          this.removeFilter(); 
        });
        this.uli.append(nc);
        this.setDataset();
        //this.Values = this.included;
        nd.classList.add('disabled');
      }
      this.removeFilter();
    }));
    this.values.forEach((c)=> {
      this.uli.insertAdjacentHTML('beforeEnd', this.renderTemplate(c) );
      this.ula.querySelector(`[data-id="${c.id}"]`).classList.add('disabled');
      });
    this.uli.querySelectorAll('li').forEach((l) => l.addEventListener('click',(e) => {
        const t = e.currentTarget;
        const id = t.dataset.id;
        t.remove();
        this.ula.querySelector(`[data-id="${id}"].disabled`).classList.remove('disabled');
      }));
  }
  filter (t){
    this.ula.childNodes.forEach((l) => l.style.display = l.innerText.toLowerCase().includes(t)?'':'none');
  }
  removeFilter() {
    this.ula.childNodes.forEach((l) => l.style.display = this.tag.value = ''); 
  }
  setDataset() { 
    this.included = [...this.uli.querySelectorAll('.included > li')]
    .map((l) => this.availables.find( (i) => i.id === parseInt(l.dataset.id) ) ); 
    this.tag.dataset.value=JSON.stringify(this.included);
  };
}


/* FRONT END FUNCTIONS */

const event_input = new Event('input', {
        bubbles: true,
        cancelable: true
    });

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

function renderTable(target, proto = Object, data, useActions = false, fields=null, fn = null){
  this.target = target;
  this.object_name = proto.name.toLowerCase();
  this.keys = [];
  let flds = fields;
  if(0 === data.length) {
    this.target.innerHTML = `<div>Sorry, nothing to show!</div>`;
  }else{
    let res = data;
    this.keys = Object.keys(new proto(res[0]));
    let rows = [];
    if(flds){
      
    }else{
      flds = this.keys.map((f) => ({label:f, field:f}) );
    }
    rows = res.map(
          (d) => {
            let b = new proto(d);
            const object_name = this.object_name;
            let td = flds.map((h) => `<span class="td ${h.field.toLowerCase()}">${b[h.field]}</span>`).join('');
            let td_actions = useActions?`<span class="td actions">
        <button type="button" data-role="edit_${object_name}" data-id="${b.id}"> &#9998; </button>
        <button type="button" data-role="delete_${object_name}" data-id="${b.id}"> &#128465;&#65039; </button>
      </span>`:'';
            return `<div class="tr">${td}${td_actions}</div>`;});
    let headers = flds.map((h) => `<span class="th ${h.field.toLowerCase()}">${h.label}</span>`).join('');
    let th_actions = useActions?'<span class="th actions"></span>':'';
    rows.unshift(`<div class="tr thead">${headers}${th_actions}</div>`);
    this.target.innerHTML = `<div class="data-table tbl-${object_name}">` + rows.join('\n') + `</div>`;
    if(useActions){
      document.querySelectorAll(`[data-role="edit_${object_name}"]`).forEach(b => b.addEventListener('click', window[`edit_${object_name}`]));
      document.querySelectorAll(`[data-role="delete_${object_name}"]`).forEach(b => b.addEventListener('click', window[`delete_${object_name}`]));
    }
  }
}

/* SAILORS */

function showSailors(){
  
  const onsuccess = (e) => {
    let tag_sailors = document.querySelector('[data-list="sailor"]');
    const fields = [{label:'id', field:'id'}, {label:'Full Name', field:'fullName'}, 
      {label:'Birth Date', field:'birthDate'}, {label:'FIV n°', field:'fiv'}];
    renderTable(tag_sailors, Sailor, e.target.result, true, fields);
  };
  sailorSingleton.getAll( onsuccess );
  
  /*
   let tag_sailors = document.querySelector('[data-list="sailor"]');
  const fields = [{label:'id', field:'id'}, {label:'Full Name', field:'fullName'}, 
                  {label:'Birth Date', field:'birthDate'}, {label:'FIV n°', field:'fiv'}];
  renderTable(tag_sailors, Sailor, e.target.result, true, fields);
*/ 
  
  /*
  let tag_sailors = document.querySelector('[data-list="sailor"]');
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
  */
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
      <div class="field-group">
        <label>Gender</label> <div class="form-control"><select name="gender">
        <option value="M"> Male </option>
        <option value="F"> Female </option>
        </select></div>
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
    sailorSingleton.delete(sailor_id, showSailors);
  });
};

function edit_sailor(e) {
  sailorSingleton.get(Number(e.currentTarget.getAttribute('data-id')), function(ev){
    const title = 'Edit Sailor';
    let s = new Sailor(ev.currentTarget.result);
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
      <div class="field-group">
        <label>Gender</label> <div class="form-control"><select name="gender">
        <option value="M" ${s.gender==='M'?'selected':''}> Male </option>
        <option value="F"${s.gender==='F'?'selected':''}> Female </option>
        </select></div>
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
  sailorSingleton.save(sailor);
  showSailors();
  removeFromPopup();
}

/* BoatClasses */

function showBoatClasses(){
  const onsuccess = (e) => {
    const fields = [{label:'id', field:'id'}, {label:'Boat Class', field:'name'}, 
                  {label:'Rating', field:'rating'}];
    renderTable(document.querySelector('[data-list="boatclass"]'), BoatClass, e.target.result, true, fields );
  };
  boatClassSingleton.getAll( onsuccess );
}

//showBoatClasses();
document.querySelector('[data-role="add_boatclass"]').addEventListener('click', add_boatclass);

function add_boatclass(e) {
  const title = 'Add Boat Class';
  const form = `<form data-role="form-sailor">
      <div class="field-group">
        <label>Name</label> <div class="form-control"><input type="text" name="name" /></div>
      </div>
      <div class="field-group">
        <label>Rating</label> <div class="form-control"><input type="number" name="rating" /></div>
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
    let s = new BoatClass(ev.currentTarget.result);
    const form = `<form data-role="form-boatclass">
      <div class="field-group">
        <label>Name</label> <div class="form-control"><input type="text" name="name" value="${s.name}" /></div>
      </div>
      <div class="field-group">
        <label>Rating</label> <div class="form-control"><input type="number" name="rating" value="${s.rating}" /></div>
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
      boatClassSingleton.delete(item_id, function(){
          boatClassSingleton.getAll(showBoatClasses);
        });
    });
};

function save_boatclass(e){
  const fields = e.currentTarget.parentElement.parentElement.querySelectorAll('input[name]');
  const ff = [...fields].map(f => ({name: f.name, value: f.value}));
  const boatClass = new BoatClass();
  boatClass._setFromArray = ff;
  boatClassSingleton.save(boatClass);
  showBoatClasses();
  removeFromPopup();
}

/* Club */

function showClub(){
  const onsuccess = (e) => {
    const fields = [{label:'id', field:'id'}, {label:'Name', field:'name'}, 
                  {label:'Address', field:'address'}, {label:'Location', field:'location'}];
    renderTable(document.querySelector('[data-list="Club"]'), Club, e.target.result, true, fields );
  };
  clubSingleton.getAll( onsuccess );
}

showClub();
document.querySelector('[data-role="add_club"]').addEventListener('click', add_club);

function add_club(e) {
  const title = 'Add Club';
  const form = `<form data-role="form-club">
      <div class="field-group">
        <label>Name</label> <div class="form-control"><input type="text" name="name" /></div>
      </div>
      <div class="field-group">
        <label>Address</label> <div class="form-control"><input type="text" name="address" /></div>
      </div>
      <div class="field-group">
        <label>Location</label> <div class="form-control"><input type="text" name="location" /></div>
      </div>
      <div class="form-buttons">
        <input type="hidden" name="id" />
        <button type="reset">Reset</button> <button type="button" data-role="save_club">Save</button>
      </div>
    </form>`;
  addToPopup(title, form);
  document.querySelector('[data-role="save_club"]').addEventListener('click', save_club);
}

function edit_club(e) {
  clubSingleton.get(Number(e.currentTarget.getAttribute('data-id')), function(ev){
    const title = 'Edit Club';
    let s = new Club(ev.currentTarget.result);
    const form = `<form data-role="form-club">
      <div class="field-group">
        <label>Name</label> <div class="form-control"><input type="text" name="name" value="${s.name}" /></div>
      </div>
      <div class="field-group">
        <label>Address</label> <div class="form-control"><input type="text" name="address" value="${s.address}" /></div>
      </div>
      <div class="field-group">
        <label>Location</label> <div class="form-control"><input type="text" name="location" value="${s.location}" /></div>
      </div>
      <div class="form-buttons">
        <input type="hidden" name="id" value="${s.id}" />
        <button type="reset">Reset</button> <button type="button" data-role="save_club">Save</button>
      </div>
    </form>`;
    addToPopup(title, form);
    document.querySelector('[data-role="save_club"]').addEventListener('click', save_club);
  });
}

function delete_club(e){
  const item_id = Number(e.currentTarget.getAttribute('data-id'));  
  pop.confirm('Delete Club', 'Really want delete the record?',
    function(){
      clubSingleton.delete(item_id, function(){
          clubSingleton.getAll(showClub);
        });
    });
};

function save_club(e){
  const fields = e.currentTarget.parentElement.parentElement.querySelectorAll('input[name]');
  const ff = [...fields].map(f => ({name: f.name, value: f.value}));
  const club = new Club();
  club._setFromArray = ff;
  clubSingleton.save(club);
  clubSingleton.getAll(showClub);
  removeFromPopup();
}

/* Regatta */

function showRegatta(){
  const onsuccess = (e) => {
    const fields = [{label:'id', field:'id'}, {label:'Name', field:'name'}, {label:'Start Date', field:'startDate'}, 
                  {label:'End Date', field:'endDate'}, {label:'Club', field:'clubName'}];
    renderTable(document.querySelector('[data-list="regatta"]'), Regatta, e.target.result, true, fields );
  };
  regattaSingleton.getAll( onsuccess );
}

showRegatta();
document.querySelector('[data-role="add_regatta"]').addEventListener('click', add_regatta);

function add_regatta(e) {
  const title = 'Add Regatta';
  const form = `<form data-role="form-regatta">
      <div class="field-group">
        <label>Name</label> <div class="form-control"><input type="text" name="name" /></div>
      </div>
      <div class="field-group">
        <label>Start Date</label> <div class="form-control"><input type="date" name="startdate" /></div>
      </div>
      <div class="field-group">
        <label>End Date</label> <div class="form-control"><input type="date" name="endate" /></div>
      </div>
      <div class="field-group">
        <label>Use PY</label> <div class="form-control"><input type="checkbox" name="usePY" value="false" onclick="this.value=this.checked" /></div>
      </div>
      <div class="field-group">
        <label>Club</label> <div class="form-control"><select name="club"></select></div>
      </div>
      <div class="field-group">
        <label>Max Races</label> <div class="form-control"><input type="number" name="maxraces" min="1" max="99" value="2" /></div>
      </div>  
      <div class="field-group">
        <label>Discard Pattern</label> <div class="form-control"><input type="text" name="discardpattern" value="0 0 0 1 1 1 2 2 2 3 3 3 4 4 4" /></div>
      </div>  
      <div class="field-group">
        <label>Competitors</label> <div class="form-control"><input class="multichoice" type="text" name="competitors"/></div>
      </div>
      <div class="form-buttons">
        <input type="hidden" name="id" />
        <button type="reset">Cancel</button> <button type="button" data-role="save_regatta">Save</button>
      </div>
    </form>`;
  //  addToPopup(title, form);
    const fc = document.querySelector('[data-block="regatta"] [data-role="form-container"]');
    fc.insertAdjacentHTML('beforeEnd', form);
    const theForm = fc.querySelector('form:last-child');
    theForm.regatta = new Regatta();
    theForm.querySelector('button[type="reset"]')
            .addEventListener('click', (e) => theForm.remove());
    const tag_club = document.querySelector('form[data-role="form-regatta"] select[name="club"]');
    tag_club.innerHTML = sailScoreDB._cached.club.map((s) => `<option value="${s.id}">${s.name}</option>` ).join('');
    tag_club.addEventListener('input', function(e){
          let t = e.currentTarget;
          let club = sailScoreDB._cached.club.find((c) => c.id === parseInt(t.value));
          t.dataset.value = JSON.stringify(club);
      }, { passive: true });
    tag_club.dispatchEvent(event_input);
    const tcmp = theForm.querySelector('input[name="competitors"]');
    const template = '<li data-id="${c.id}"><span>${c.helm.fullName}</span> <strong>${c.sailNumber}</strong> <i>${c.boatclass.name}</i></li>';
    const mc = new MultiChoice(tcmp, theForm.regatta.competitors, sailScoreDB._cached.competitor, template);
    
     
     
     
  document.querySelector('[data-role="save_regatta"]').addEventListener('click', save_regatta);
}
competitorSingleton.getAll();
function edit_regatta(e) {
  regattaSingleton.get(Number(e.currentTarget.getAttribute('data-id')), function(ev){
    const title = 'Edit Regatta';
    const s = new Regatta( ev.currentTarget.result );
    let usePYchecked = s.usePY?'checked=="checked"':'';
    let UsePY = s.usePY.toString();
    const form = `<form data-role="form-regatta">
      <div class="field-group">
        <label>Name</label> <div class="form-control"><input type="text" name="name" value="${s.name}" /></div>
      </div>
      <div class="field-group">
        <label>Start Date</label> <div class="form-control"><input type="date" name="startdate" value="${s.startdate}" /></div>
      </div>
      <div class="field-group">
        <label>End Date</label> <div class="form-control"><input type="date" name="endate" value="${s.enddate}"  /></div>
      </div>
      <div class="field-group">
        <label>Use PY</label> <div class="form-control"><input type="checkbox" name="usePY" ${usePYchecked} value="${UsePY}" onclick="this.value=this.checked" /></div>
      </div>
      <div class="field-group">
        <label>Club</label> <div class="form-control"><select name="club"></select></div>
      </div>
      <div class="field-group">
        <label>Max Races</label> <div class="form-control"><input type="number" name="maxraces" min="1" max="99" value="${s.maxraces}" /></div>
      </div> 
      <div class="field-group">
        <label>Discard Pattern</label> <div class="form-control"><input type="text" name="discardpattern" value="${s.discardpattern.join(' ')}" /></div>
      </div>  
      <div class="field-group">
        <label>Competitors</label> <div class="form-control"><input class="multichoice" type="text" name="competitors"/></div>
      </div>
      <div class="form-buttons">
        <input type="hidden" name="id" value="${s.id}" />
        <button type="reset">Cancel</button> <button type="button" data-role="save_regatta">Save</button>
      </div>
    </form>`;
    //addToPopup(title, form);
    const fc = document.querySelector('[data-block="regatta"] [data-role="form-container"]');
    fc.insertAdjacentHTML('beforeEnd', form);
    const theForm = fc.querySelector('form:last-child');
    theForm.querySelector('button[type="reset"]').addEventListener('click', (e) => 
            e.currentTarget.parentElement.parentElement.remove());
    theForm.querySelector('[data-role="save_regatta"]').addEventListener('click', save_regatta);
    theForm.regatta = s;
    const tag_club = theForm.querySelector('select[name="club"]');
    tag_club.dataset.value = JSON.stringify(s.Club);
    tag_club.innerHTML = sailScoreDB._cached.club.map((s) => `<option value="${s.id}">${s.name}</option>` ).join('');
    tag_club.value = s.Club.id;
    tag_club.addEventListener('input', function(e){
          let t = e.currentTarget;
          let club = sailScoreDB._cached.club.find((c) => c.id === parseInt(t.value));
          t.dataset.value = JSON.stringify(club);
      }, { passive: true });
    tag_club.dispatchEvent(event_input);
    const tcmp = theForm.querySelector('input[name="competitors"]');
    const template = '<li data-id="${c.id}"><span>${c.helm.fullName}</span> <strong>${c.sailNumber}</strong> <i>${c.boatclass.name}</i></li>';
    const mc = new MultiChoice(tcmp, theForm.regatta.competitors, sailScoreDB._cached.competitor, template);
    theForm.querySelector('input[name="competitors"]').dataset = {value: JSON.stringify(s.competitors)};
    
  });
}


function delete_regatta(e){
  const item_id = Number(e.currentTarget.getAttribute('data-id'));  
  pop.confirm('Delete regatta', 'Really want delete the record?',
    function(){
      regattaSingleton.delete(item_id, function(){
          regattaSingleton.getAll(showRegatta);
        });
    });
};

function save_regatta(e){
  const theForm = e.currentTarget.form;
  const fields = theForm.querySelectorAll('input[name]');
  const f_club = theForm.querySelector('[name="club"]');
  const f_competitors = theForm.querySelector('[name="competitors"]');
  const regatta = theForm.regatta;
  const ff = [...fields].map(f => ({name: f.name, value: f.value}));
  
  regatta._setFromArray = ff;
  regatta.UsePY = regatta.usePY;
  if(f_club.dataset.value){
    const c = JSON.parse(f_club.dataset.value);
    regatta.Club = c;
  }
  if(f_competitors.dataset.value){
    const c = JSON.parse(f_competitors.dataset.value);
    regatta.Competitors = c;
  }
  regattaSingleton.save(regatta);
  regattaSingleton.getAll(showRegatta);
  //removeFromPopup();
  document.querySelector('[data-role="form-regatta"]').remove();
  //document.querySelector('[data-block="regatta"] [data-role="form-container"]').innerHTML = '';
}

/* competitor */
function showCompetitor(){
  const onsuccess = (e) => {
    const fields = [{label:'id', field:'id'}, {label:'Helm', field:'HelmFullName'},
      {label: 'Sail n°', field: 'sailNumber'}, {label:'Boat Class', field:'Boat'}, {label:'P.Y. n°', field:'PY'}];
    renderTable(document.querySelector('[data-list="competitor"]'), Competitor, e.target.result, true, fields );
  };
  competitorSingleton.getAll( onsuccess );
}

showCompetitor();
document.querySelector('[data-role="add_competitor"]').addEventListener('click', add_competitor);

function add_competitor(e) {
  const title = 'Add Competitor';
  const form = `<form data-role="form-competitor">
      <div class="field-group">
        <label>Helm</label> <div class="form-control"><input type="text" class="search-select"/><select name="helm"></select></div>
      </div>
      <div class="field-group">
        <label>Crew</label> <div class="form-control"><input type="checkbox" class="mc-toggle" /><input class="multichoice mc-collapse" type="text" name="crew" /></div>
      </div>
      <div class="field-group">
        <label>Sail Number</label> <div class="form-control"><input type="text" name="sailNumber" /></div>
      </div>
      <div class="field-group">
        <label>Boat Class</label> <div class="form-control"><select name="boatClass"></select></div>
      </div>
      <div class="form-buttons">
        <input type="hidden" name="id" />
        <button type="reset">Reset</button> <button type="button" data-role="save_competitor">Save</button>
      </div>
    </form>`;
  addToPopup(title, form);
  
  const s = new Competitor();

  const theForm = document.querySelector('.popup-fixed form');
  theForm.competitor = s;
  selectActivateSearch(theForm);
  const sel_helm = theForm.querySelector('select[name="helm"]');
  sel_helm.innerHTML = sailScoreDB._cached.sailor.sort((a,b) => {return a.fullName === b.fullName?0:( a.fullName>b.fullName?1:-1 );})
          .map((s) => `<option value="${s.id}">${s.fullName}</option>` ).join('\n');
  sel_helm.addEventListener('input', (e) => {
        let t = e.currentTarget;
        let helm = sailScoreDB._cached.sailor.find( (s) => s.id === parseInt(t.value ));
        t.dataset.value = JSON.stringify(helm);
        s.Helm = helm;
      }, { passive: true });
  sel_helm.dispatchEvent(event_input);
  
  const sel_boat = theForm.querySelector('select[name="boatClass"]');
  sel_boat.innerHTML = sailScoreDB._cached.boatclass.map((s) => `<option value="${s.id}">${s.name}</option>` ).join('\n');
  sel_boat.addEventListener('input', (e) => { 
        let t = e.currentTarget;
        let boat = sailScoreDB._cached.boatclass.find((s) => s.id === parseInt(t.value ));
        t.dataset.value = JSON.stringify(boat);
        s.boatclass = boat;
      });
  sel_boat.dispatchEvent(event_input);
  
  theForm.querySelector('[name="sailNumber"]').addEventListener('change', (e) => theForm.competitor.sailNumber = e.currentTarget.value);
  
  theForm.querySelector('[data-role="save_competitor"]').addEventListener('click', save_competitor);
  const tcmp = theForm.querySelector('input[name="crew"]');
  const template = '<li data-id="${c.id}"><i>${c.fullName}</i> <strong>${c.fiv}</strong></li>';
  const mc = new MultiChoice(tcmp, theForm.competitor.Crew, sailScoreDB._cached.sailor, template);
}

function edit_competitor(e) {
  competitorSingleton.get(Number(e.currentTarget.getAttribute('data-id')), function(ev){
    const title = 'Edit Competitor';
    let s = new Competitor(ev.currentTarget.result);
     const form = `<form data-role="form-competitor">
      <div class="field-group">
        <label>Helm</label> <div class="form-control"><input type="text" class="search-select"/><select name="helm"></select></div>
      </div>
      <div class="field-group">
        <label>Crew</label> <div class="form-control"><input type="checkbox" class="mc-toggle" /><input class="multichoice mc-collapse" type="text" name="crew" /></div>
      </div>
      <div class="field-group">
        <label>Sail Number</label> <div class="form-control"><input type="text" name="sailNumber" value="${s.sailNumber}" /></div>
      </div>
      <div class="field-group">
        <label>Boat Class</label> <div class="form-control"><select name="boatClass"></select></div>
      </div>
      <div class="form-buttons">
        <input type="hidden" name="id" />
        <button type="reset">Reset</button> <button type="button" data-role="save_competitor">Save</button>
      </div>
    </form>`;
    addToPopup(title, form);
    
    const theForm = document.querySelector('.popup-fixed form');
    theForm.competitor = s;
    selectActivateSearch(theForm);
    const sel_helm = theForm.querySelector('select[name="helm"]');
  sel_helm.innerHTML = sailScoreDB._cached.sailor.sort((a,b) => {return a.fullName === b.fullName?0:( a.fullName>b.fullName?1:-1 );})
          .map((s) => `<option value="${s.id}">${s.fullName}</option>` ).join('\n');
  sel_helm.addEventListener('input', (e) => {
        let t = e.currentTarget;
        let helm = sailScoreDB._cached.sailor.find( (s) => s.id === parseInt(t.value ));
        t.dataset.value = JSON.stringify(helm);
        s.Helm = helm;
      }, { passive: true });
  sel_helm.value = s.Helm?s.Helm.id:null;
  sel_helm.dispatchEvent(event_input);
  
  const sel_boat = theForm.querySelector('select[name="boatClass"]');
  sel_boat.innerHTML = sailScoreDB._cached.boatclass.map((s) => `<option value="${s.id}">${s.name}</option>` ).join('\n');
  sel_boat.addEventListener('input', (e) => { 
        let t = e.currentTarget;
        let boat = sailScoreDB._cached.boatclass.find((s) => s.id === parseInt(t.value ));
        t.dataset.value = JSON.stringify(boat);
        s.boatclass = boat;
      });
  sel_boat.value = s.boatclass?s.boatclass.id:null;
  sel_boat.dispatchEvent(event_input);
    
    
    sel_boat.dispatchEvent(event_input);

    theForm.querySelector('[name="sailNumber"]').addEventListener('change', (e) => s.sailNumber = e.currentTarget.value);

    theForm.querySelector('[data-role="save_competitor"]').addEventListener('click', save_competitor);
    const tcmp = theForm.querySelector('input[name="crew"]');
    const template = '<li data-id="${c.id}"><i>${c.fullName}</i> <strong>${c.fiv}</strong></li>';
    const mc = new MultiChoice(tcmp, theForm.competitor.Crew, sailScoreDB._cached.sailor, template);
    document.querySelector('[data-role="save_competitor"]').addEventListener('click', save_competitor);
  });
}

function delete_competitor(e){
  const item_id = Number(e.currentTarget.getAttribute('data-id'));  
  pop.confirm('Delete Competitor', 'Really want delete the record?',
    function(){
      competitorSingleton.delete(item_id, function(){
          competitorSingleton.getAll(showCompetitor);
        });
    });
};

function save_competitor(e){
  const theForm = e.currentTarget.form;
  const f_crew = theForm.querySelector('[name="crew"]');
  const competitor = theForm.competitor;
  if(f_crew.dataset.value){
    const c = JSON.parse(f_crew.dataset.value);
    competitor.Crew = c;
  }
  competitorSingleton.save(competitor);
  competitorSingleton.getAll(showCompetitor);
  removeFromPopup();
}

/* POP */

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
  },
  alert: function(tit='', msg=''){
    pop.title = tit;
    let html = `<div class="confirm"><div class="confirm-question">${msg}</div></div><div class="popup-buttons center">
        <button type="button" onclick="pop.response(true)"> ok </button>
      </div>`;
    pop.fn_yes = removeFromPopup;
    addToPopup(pop.title, html);
   
  },
  notify: function(tit='', msg='', time=1500){
    pop.title = tit;
    let html = `<div class="confirm"><div class="confirm-question">${msg}</div></div>`;
    addToPopup(pop.title, html);
    setTimeout(removeFromPopup, time);
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

//showSailors();
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
  let competitors = sailScoreDB._cached.competitor || [
    {HelmFullName: "Lorenzo Serretti", sailNumber: "205262", boat_class: "ILCA 6"},
    {HelmFullName: "Giovanna Pagnini", sailNumber: "197000", boat_class: "ILCA 6"},
    {HelmFullName: "Gaia Cinquepalmi", sailNumber: "210505", boat_class: "ILCA 6"},
    {HelmFullName: "Danilo Monticelli", sailNumber: "210000", boat_class: "ILCA 7"},
    {HelmFullName: "Stefano Melone", sailNumber: "218765", boat_class: "ILCA 7"},
    {HelmFullName: "Andrea Bazzani", sailNumber: "219081", boat_class: "ILCA 7"},
    {HelmFullName: "Francesca Carlotti", sailNumber: "180321", boat_class: "ILCA 6"},
    {HelmFullName: "Guido Rocchi", sailNumber: "209111", boat_class: "ILCA 7"},
    {HelmFullName: "Max Cinquepalmi", sailNumber: "183555", boat_class: "ILCA 7"}
  ];
  let tag_competitors = document.querySelector('[data-list="racing-competitor"]');
  competitors.forEach(c => tag_competitors.insertAdjacentHTML('afterBegin',`
<div class="competitor" data-status="started"> 
  <button type="button" data-role="pull-top">&#8679;</button> 
  <span class="crew">${c.HelmFullName}</span> 
  <span class="sail-number">${c.sailNumber}</span> 
  <span class="boat-class">${c.Boat}</span> 
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
setTimeout(show_started_competitors, 300);

/* INSTALL WEB APP */

// Initialize deferredPrompt for use later to show browser install prompt.
var deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  
  // Optionally, send analytics event that PWA install promo was shown.
  const callback = function(){
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  };
  const tag_inc = document.querySelector('.install-container');
  const b = document.createElement('button');
  b.innerText = 'Install offline version';
  b.classList.add('btn');
  b.type = 'button';
  tag_inc.appendChild(b);
  b.addEventListener('click', callback);
  console.log(`'beforeinstallprompt' event was fired.`);
  //pop.confirm("Install PWA", "Do you want add a Home shortcut?", callback);
});



window.addEventListener('appinstalled', () => {
  // Hide the app-provided install promotion
  pop.notify("Install PWA", "App installed succesfully");
  // Clear the deferredPrompt so it can be garbage collected
  deferredPrompt = null;
  // Optionally, send analytics event to indicate successful install
  console.log('PWA was installed');
});

/* WORKER */
if ("serviceWorker" in navigator) {
  if(location.origin !== 'file://'){
    navigator.serviceWorker.register("./sw.js");
  }else{
    document.querySelector('link[rel="manifest"]').remove();
  }
}
