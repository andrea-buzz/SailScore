class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

class PersonSingleton {
  constructor() {
    if (!PersonSingleton.instance) {
      PersonSingleton.instance = this;
    }
    return PersonSingleton.instance;
  }

  createPerson(name, age) {
    const person = new Person(name, age);
    this.savePerson(person);
    return person;
  }

  savePerson(person) {
    const request = window.indexedDB.open("PersonDB", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      db.onerror = (event) => {
        console.log( "Error loading database.");
      };
      const objectStore = db.createObjectStore("people", { keyPath: "id", autoIncrement: true } ); 
      objectStore.createIndex("id", "id", { unique: true });
      objectStore.createIndex("name", "name", { unique: false });
    }
    
    request.onerror = function(event) {
      console.log("Errore nell'apertura del database: " + event.target.errorCode);
    };
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["people"], "readwrite");  //  people
      const store = transaction.objectStore("people");  //  people
      store.add(person);
      console.log("Persona salvata con successo nel database.");
    };
  }
}

const personSingleton = new PersonSingleton();

const person1 = personSingleton.createPerson("Mario", 30);
const person2 = personSingleton.createPerson("Luigi", 35);

console.log(person1);  // Person {name: "Mario", age: 30}
console.log(person2);  // Person {name: "Luigi", age: 35}
