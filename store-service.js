const fs = require('fs').promises;
let items = [];
let categories = [];

async function initialize() {
    try {
        const itemsData = await fs.readFile('./data/items.json', 'utf8');
        items = JSON.parse(itemsData);
        
        const categoriesData = await fs.readFile('./data/categories.json', 'utf8');
        categories = JSON.parse(categoriesData);
    } catch (error) {
        throw new Error('Unable to read file');
    }
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject('No results returned');
        } else {
            resolve(items);
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published);
        if (publishedItems.length === 0) {
            reject('No results returned');
        } else {
            resolve(publishedItems);
        }
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject('No results returned');
        } else {
            resolve(categories);
        }
    });
}

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published !== undefined;
        itemData.id = items.length + 1;
        items.push(itemData);

        fs.writeFile('./data/items.json', JSON.stringify(items, null, 2), 'utf8')
            .then(() => resolve(itemData))
            .catch((err) => reject("Failed to save item: " + err));
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === parseInt(category));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No results returned");
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
            reject("No results returned");
        }
    });
}


function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id === parseInt(id));
        if (item) {
            resolve(item);
        } else {
            reject("No result returned");
        }
    });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};
