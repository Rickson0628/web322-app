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

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories
};
