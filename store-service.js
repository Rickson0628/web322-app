const fs = require('fs');
const path = require('path');
// empty arrays
let items = [];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
       
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                reject('Unable to read items.json file');
                return;
            }

            items = JSON.parse(data);

           
            fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                if (err) {
                    reject('Unable to read categories.json file');
                    return;
                }

                categories = JSON.parse(data);
                resolve(); 
            });
        });
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject('No published items found');
        }
    });
}


function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.published === true && item.category === parseInt(category, 10));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject(`No published items found for category ${category}`);
        }
    });
}


function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject('No items found');
        }
    });
}


function getAllCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject('No categories found');
        }
    });
}


function addItem(itemData) {
    return new Promise((resolve, reject) => {
        try {
   
            itemData.published = itemData.published ? true : false;

            itemData.id = items.length + 1;

          
            const currentDate = new Date();
            itemData.itemDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

            
            items.push(itemData);

          
            fs.writeFile(path.join(__dirname, 'data', 'items.json'), JSON.stringify(items, null, 2), 'utf8', err => {
                if (err) {
                    reject('Error writing to items.json file');
                } else {
                    resolve(itemData); 
                }
            });
        } catch (err) {
            reject('Error adding item: ' + err.message);
        }
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === parseInt(category, 10));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject(`No items found for category ${category}`);
        }
    });
}


function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject(`No items found with post date on or after ${minDateStr}`);
        }
    });
}


function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id === parseInt(id, 10));
        if (item) {
            resolve(item);
        } else {
            reject(`No item found with ID ${id}`);
        }
    });
}


module.exports = {
    initialize,
    getPublishedItems,
    getPublishedItemsByCategory,
    getAllItems,
    getAllCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};
