/*********************************************************************************
WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or
distributed to other students.
Name: Rickson Bozar
Student ID: 167549237
Date: 2024-11-15
Vercel Web App URL: https://web322-ejouxka4r-rickson-bozars-projects.vercel.app/
GitHub Repository URL: https://github.com/Rickson0628/web322-app.git
*********************************************************************************/
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const stripJs = require('strip-js');

const app = express();
const exphbs = require('express-handlebars');
app.use(express.urlencoded({ extended: true }));


app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li class="nav-item' + 
                ((url == app.locals.activeRoute) ? ' active' : '') + '">' +
                '<a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3) {
                throw new Error("Handlebars Helper 'equal' needs 2 parameters");
            }
            return (lvalue != rvalue) ? options.inverse(this) : options.fn(this);
        },
        safeHTML: function(context) {  
            return stripJs(context);    
        },
        formatDate: function(dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }
}));

app.set('view engine', '.hbs');

cloudinary.config({
    cloud_name: 'WEB322',
    api_key: '833133686597987',
    api_secret: 'LdCTRSg1SY1HvQ8I0eRFlVY0r8Y',
    secure: true,
});

const upload = multer();

// Middleware to track active route
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


app.use(express.static('public'));

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => res.redirect('/shop'));


app.get('/about', (req, res) => res.render('about', { title: 'About Us' }));


app.get('/shop', async (req, res) => {
    let viewData = {};

    try {
        let items = [];
        if (req.query.category) {
            items = await storeService.getPublishedItemsByCategory(req.query.category);
        } else {
            items = await storeService.getPublishedItems();
        }

        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
        viewData.items = items;
        viewData.item = items[0]; 
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        viewData.categories = await storeService.getAllCategories();
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    res.render("shop", { data: viewData });
});




app.get('/shop/:id', async (req, res) => {
    let viewData = {};

    try {
        let item = await storeService.getItemById(req.params.id);
        viewData.item = item;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let items = [];
        if (req.query.category) {
            items = await storeService.getPublishedItemsByCategory(req.query.category);
        } else {
            items = await storeService.getPublishedItems();
        }
        viewData.items = items;
    } catch (err) {
        viewData.items = [];
    }

    try {
        viewData.categories = await storeService.getAllCategories();
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    res.render('shop', { data: viewData });
});


app.get('/items', (req, res) => {
    const { category, minDate } = req.query;

    if (category) {
        storeService.getItemsByCategory(category)
            .then((data) => {
                if (data.length > 0) {
                    res.render("items", { items: data });
                } else {
                    res.render("items", { message: "no results" });
                }
            })
            .catch((err) => res.render("items", { message: "Error fetching items" }));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then((data) => {
                if (data.length > 0) {
                    res.render("items", { items: data });
                } else {
                    res.render("items", { message: "no results" });
                }
            })
            .catch((err) => res.render("items", { message: "Error fetching items" }));
    } else {
        storeService.getAllItems()
            .then((data) => {
                if (data.length > 0) {
                    res.render("items", { items: data });
                } else {
                    res.render("items", { message: "no results" });
                }
            })
            .catch((err) => res.render("items", { message: "Error fetching items" }));
    }
});


app.get('/categories', (req, res) => {
    storeService.getAllCategories()
        .then((data) => {
            if (data.length > 0) {
                res.render("categories", { categories: data });
            } else {
                res.render("categories", { message: "no results" });
            }
        })
        .catch((err) => res.render("categories", { message: "Error fetching categories" }));
});

app.get('/item/:value', (req, res) => {
    storeService.getItemById(req.params.value)
        .then((item) => res.json(item))
        .catch((err) => res.status(500).json({ message: err }));
});

app.get('/categories/add', (req, res) => {
    res.render('addCategories', { title: 'Add Category' });
});
app.post('/categories/add', (req, res) => {
    storeService.addCategory(req.body)
        .then(() => res.redirect('/categories'))
        .catch((err) => {
            console.error('Failed to add category:', err);
            res.status(500).send('Failed to add category');
        });
});
app.get('/categories/delete/:id', (req, res) => {
    storeService.deleteCategoryById(req.params.id)
        .then(() => res.redirect('/categories'))
        .catch((err) => {
            console.error('Unable to remove category:', err);
            res.status(500).send('Unable to remove category / Category not found');
        });
});
app.get('/items/delete/:id', (req, res) => {
    storeService.deleteItemById(req.params.id)
        .then(() => res.redirect('/items'))
        .catch((err) => {
            console.error('Unable to remove item:', err);
            res.status(500).send('Unable to remove item / Item not found');
        });
});



// Route for adding a new item
app.get('/items/add', (req, res) => {
    // Fetch categories from the database
    storeService.getAllCategories()
        .then((categories) => {
            res.render('addItem', { title: 'Add Item', categories: categories });
        })
        .catch((err) => {
            console.error('Error fetching categories:', err);
            res.render('addItem', { title: 'Add Item', categories: [] });
        });
});



app.use((req, res) => res.status(404).render('error', { title: 'Page Not Found' }));


app.post('/items/add', upload.single('featureImage'), (req, res) => {
    const processItem = (imageUrl) => {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)  
            .then(() => res.redirect('/items'))
            .catch((err) => {
                console.error('Failed to add item:', err);
                res.status(500).send('Failed to add item');
            });
    };

    if (req.file) {
        const streamUpload = (req) => new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream((error, result) => {
                if (result) resolve(result);
                else reject(error);
            });
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        streamUpload(req)
            .then((uploaded) => processItem(uploaded.url))
            .catch((err) => {
                console.error('Image upload failed:', err);
                res.status(500).send('Image upload failed');
            });
    } else {
        processItem('');
    }
});


app.get('/shop/delete/:id', (req, res) => {
    storeService.deleteItemById(req.params.id)
        .then(() => res.redirect('/shop'))  // Redirect back to the shop page after deletion
        .catch((err) => {
            res.status(500).send('Unable to Remove Item: ' + err);  // Return error message if deletion fails
        });
});


storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('Failed to initialize data:', err);
    });
