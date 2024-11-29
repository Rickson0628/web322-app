const Sequelize = require('sequelize');

var sequelize = new Sequelize("postgresql://neondb_owner:BGU8qf3yhbVn@ep-raspy-king-a5tf3o25.us-east-2.aws.neon.tech/neondb?sslmode=require", {
    host: 'host',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

const Item = sequelize.define('Item', {
    body: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    itemDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    featureImage: {
        type: Sequelize.STRING
    },
    published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    }
}, {
    timestamps: false
});

const Category = sequelize.define('Category', {
    category: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

Item.belongsTo(Category, { foreignKey: 'category' });

module.exports = {
    initialize() {
        return new Promise((resolve, reject) => {
            sequelize.sync()
                .then(() => resolve())
                .catch((error) => reject("Unable to sync the database: " + error));
        });
    },

    getAllItems() {
        return new Promise((resolve, reject) => {
            Item.findAll()
                .then((data) => {
                    if (data.length > 0) {
                        resolve(data);
                    } else {
                        reject("No results returned");
                    }
                })
                .catch((error) => reject("Error fetching items: " + error));
        });
    },
    getAllCategories() {
        return new Promise((resolve, reject) => {
            Category.findAll()  // Fetch all categories from the database
                .then((data) => {
                    if (data.length > 0) {
                        resolve(data);  // Return the list of categories
                    } else {
                        reject("No categories found");
                    }
                })
                .catch((error) => reject("Error fetching categories: " + error));
        });
    },
    getItemsByCategory(category) {
        return new Promise((resolve, reject) => {
            Item.findAll({ where: { category: category } })
                .then((data) => {
                    if (data.length > 0) {
                        resolve(data);
                    } else {
                        reject("No results returned");
                    }
                })
                .catch((error) => reject("Error fetching items by category: " + error));
        });
    },

    getItemsByMinDate(minDateStr) {
        const { gte } = Sequelize.Op;
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: {
                    itemDate: {
                        [gte]: new Date(minDateStr)
                    }
                }
            })
                .then((data) => {
                    if (data.length > 0) {
                        resolve(data);
                    } else {
                        reject("No results returned");
                    }
                })
                .catch((error) => reject("Error fetching items by date: " + error));
        });
    },

    getItemById(id) {
        return new Promise((resolve, reject) => {
            Item.findAll({ where: { id: id } })
                .then((data) => {
                    if (data.length > 0) {
                        resolve(data[0]);
                    } else {
                        reject("No results returned");
                    }
                })
                .catch((error) => reject("Error fetching item by id: " + error));
        });
    },

    addItem(itemData) {
        return new Promise((resolve, reject) => {
            itemData.published = itemData.published ? true : false;
    
            for (let key in itemData) {
                if (itemData[key] === "") itemData[key] = null;
            }
    
            itemData.itemDate = new Date();
            itemData.categoryId = itemData.category;
            
            Item.create(itemData)
                .then(() => resolve())
                .catch(() => reject("unable to create item"));
        });
},


    getPublishedItems() {
        return new Promise((resolve, reject) => {
            Item.findAll({ where: { published: true } })
                .then((data) => {
                    if (data.length > 0) {
                        resolve(data);
                    } else {
                        reject("No results returned");
                    }
                })
                .catch((error) => reject("Error fetching published items: " + error));
        });
    },

    getPublishedItemsByCategory(category) {
        return new Promise((resolve, reject) => {
            Item.findAll({ where: { published: true, category: category } })
                .then((data) => {
                    if (data.length > 0) {
                        resolve(data);
                    } else {
                        reject("No results returned");
                    }
                })
                .catch((error) => reject("Error fetching published items by category: " + error));
        });
    },

    getCategories() {
        return new Promise((resolve, reject) => {
            Category.findAll()
                .then((data) => {
                    if (data.length > 0) {
                        resolve(data);
                    } else {
                        reject("No results returned");
                    }
                })
                .catch((error) => reject("Error fetching categories: " + error));
        });
    },

    // Add Category
    addCategory(categoryData) {
        return new Promise((resolve, reject) => {
            // Replace empty strings with null
            for (let prop in categoryData) {
                if (categoryData[prop] === "") {
                    categoryData[prop] = null;
                }
            }

            Category.create(categoryData)
                .then(() => resolve())
                .catch((error) => reject("Unable to create category: " + error));
        });
    },

    // Delete Category by ID
    deleteCategoryById(id) {
        return new Promise((resolve, reject) => {
            Category.destroy({ where: { id: id } })
                .then((deletedCount) => {
                    if (deletedCount > 0) {
                        resolve();
                    } else {
                        reject("No category found to delete");
                    }
                })
                .catch((error) => reject("Unable to delete category: " + error));
        });
    },

    // Delete Item by ID
    deleteItemById(id) {
        return new Promise((resolve, reject) => {
            Item.destroy({ where: { id: id } })
                .then((deletedCount) => {
                    if (deletedCount > 0) {
                        resolve();
                    } else {
                        reject("No item found to delete");
                    }
                })
                .catch((error) => reject("Unable to delete item: " + error));
        });
    }
};
