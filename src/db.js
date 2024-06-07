// db.js

const fs = require('fs');
const path = require('path');

class Database {
    constructor(databaseName) {
        this.databaseName = databaseName.split('/').pop();
        this.databasePath = databaseName;
        this.ensureDatabaseExists();
    }

    ensureDatabaseExists() {
        if (!fs.existsSync(this.databasePath)) {
            fs.mkdirSync(this.databasePath);
        }
    }

    load(collectionName) {
        const collectionPath = path.join(this.databasePath, `${collectionName}.json`);
        return new Collection(collectionPath);
    }
}

class Collection {
    constructor(collectionPath) {
        this.collectionPath = collectionPath;
        this.data = this.loadData();
    }

    loadData() {
        try {
            const rawData = fs.readFileSync(this.collectionPath);
            return JSON.parse(rawData);
        } catch (error) {
            // If file doesn't exist, create an empty array
            return [];
        }
    }

    saveData() {
        fs.writeFileSync(this.collectionPath, JSON.stringify(this.data, null, 2));
    }

    add(record) {
        this.data.push(record);
        this.saveData();
    }

    update(query, newData) {
        this.data.forEach((record) => {
            for (const key in query) {
                if (record[key] === query[key]) {
                    Object.assign(record, newData);
                    this.saveData();
                    return;
                }
            }
        });
    }

    search(query) {
        return this.data.filter((record) => {
            for (const key in query) {
                if (record[key] !== query[key]) {
                    return false;
                }
            }
            return true;
        });
    }

    remove(query) {
        this.data = this.data.filter((record) => {
            for (const key in query) {
                if (record[key] !== query[key]) {
                    return true;
                }
            }
            return false;
        });
        this.saveData();
    }

    dir() {
        return this.data;
    }
}

module.exports = Database;
