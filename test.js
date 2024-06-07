// path: /test.js

const database = require('./src/db.js');
const db = new database( __dirname + "/db-test");
const dbTest = db.load("test");

dbTest.add({ "id": 1, "name": "test" });
dbTest.add({ "id": 2, "name": "test2" });
dbTest.add({ "id": 3, "name": "test2" });


console.log(dbTest.dir());// [ [ { id: 1, name: 'test' }, { id: 2, name: 'test2' } ]

dbTest.update({ "id": 1 }, { "name": "test1" });

console.log(dbTest.search({ "id": 1 }));// [ { id: 1, name: 'test1' } ]
console.log(dbTest.search({ "name": "test2" }));// [ { id: 2, name: 'test2' }, { id: 3, name: 'test2' } ]

dbTest.remove({ "id": 1 });

console.log(dbTest.dir());// [ { id: 2, name: 'test2' }, { id: 3, name: 'test2' } ]
console.log(dbTest.search({ "id": 1 }));// []