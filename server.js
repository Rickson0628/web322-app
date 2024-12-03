/*********************************************************************************
WEB322 – Assignment 06
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or
distributed to other students.
Name: Rickson Bozar
Student ID: 167549237
Date: 2024-12-03
Vercel Web App URL: https://web322-ejouxka4r-rickson-bozars-projects.vercel.app/
GitHub Repository URL: https://github.com/Rickson0628/web322-app.git
*********************************************************************************/
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const authData = require('./auth-service'); // Import authData for authentication service
const stripJs = require('strip-js');
const clientSessions = require('client-sessions'); // Import client-sessions for session management

const app = express();
const exphbs = require('express-handlebars');

// Configure Handlebars as the view engine with custom helpers
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li class="nav-item' + 
                ((url == app.locals.activeRoute) ? ' active' : '') + '">' +
                '<a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3) {
                throw new Error("Handlebars Helper 'equal' needs 2 parameters");
            }
            return (lvalue != rvalue) ? options.inverse(this) : options.fn(this);
        },
        safeHTML: function (context) {
            return stripJs(context);
        },
        formatDate: function (dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
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

// Middleware to track active route and parse URL-encoded bodies
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});
app.use(express.urlencoded({ extended: true })); // Middleware for parsing form data
app.use(express.static('public')); // Serve static files

// Define the port
const PORT = process.env.PORT || 8080;

// Root route redirects to /about
app.get('/', (req, res) => res.redirect('/about'));

// About route
app.get('/about', (req, res) => res.render('about', { title: 'About Us' }));

// Categories route
app.get('/categories', (req, res) => {
    storeService.getAllCategories()
        .then((data) => {
            if (data.length > 0) {
                res.render("categories", { categories: data });
            } else {
                res.render("categories", { message: "no results" });
            }
        })
        .catch(() => res.render("categories", { message: "no results" }));
});

// Add category form route
app.get('/categories/add', (req, res) => {
    res.render('addCategory', { title: 'Add Category' });
});

// Add category POST route
app.post('/categories/add', (req, res) => {
    storeService.addCategory(req.body) // Pass the category data from the form
        .then(() => res.redirect('/categories')) // Redirect to categories page after adding
        .catch((err) => {
            console.error("Failed to add category:", err);
            res.status(500).send("Unable to add category");
        });
});

// Delete category by ID
app.get('/categories/delete/:id', (req, res) => {
    storeService.deleteCategoryById(req.params.id)
        .then(() => res.redirect('/categories'))
        .catch((err) => {
            console.error("Failed to delete category:", err);
            res.status(500).send("Unable to Remove Category / Category not found");
        });
});

// Shop route (updated)
app.get('/shop', async (req, res) => {
    let viewData = {};
    console.log("Category ID: ", req.query.category); // Log category ID for debugging
    try {
        let items = [];
        if (req.query.category) {
            // Fetch items by category if category is provided
            items = await storeService.getPublishedItemsByCategory(req.query.category);
            console.log("Items fetched for category:", items); // Log the fetched items
        } else {
            // Fetch all published items if no category is provided
            items = await storeService.getPublishedItems();
            console.log("Items fetched: ", items); // Log the fetched items
        }

        if (items.length === 0) {
            viewData.message = "No items found for the selected category";
        }

        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
        viewData.items = items;
        viewData.item = items[0]; // Latest item if any

    } catch (err) {
        viewData.message = "No items found";
        console.error("Error fetching items:", err);
    }

    try {
        viewData.categories = await storeService.getAllCategories();
    } catch (err) {
        viewData.categoriesMessage = "No categories available";
        console.error("Error fetching categories:", err);
    }

    res.render("shop", { data: viewData });
});

// Items route
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
            .catch(() => res.render("items", { message: "no results" }));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then((data) => {
                if (data.length > 0) {
                    res.render("items", { items: data });
                } else {
                    res.render("items", { message: "no results" });
                }
            })
            .catch(() => res.render("items", { message: "no results" }));
    } else {
        storeService.getAllItems()
            .then((data) => {
                if (data.length > 0) {
                    res.render("items", { items: data });
                } else {
                    res.render("items", { message: "no results" });
                }
            })
            .catch(() => res.render("items", { message: "no results" }));
    }
});

// Add item route
app.get('/items/add', (req, res) => {
    storeService.getAllCategories()
        .then((data) => {
            res.render('addItem', { categories: data });
        })
        .catch(() => {
            res.render('addItem', { categories: [] });
        });
});

// Delete item by ID
app.get('/items/delete/:id', (req, res) => {
    storeService.deleteItemById(req.params.id)
        .then(() => res.redirect('/items'))
        .catch((err) => {
            console.error("Failed to delete item:", err);
            res.status(500).send("Unable to Remove Item / Item not found");
        });
});

// Image upload and item addition route
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

// Start the server after initializing the store service and authentication service
storeService.initialize()
    .then(authData.initialize)  // Add this line to initialize the authentication service
    .then(() => {
        app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('Failed to initialize data:', err);
    });

// Set up session middleware
app.use(clientSessions({
    cookieName: 'session', 
    secret: 'YOUR_SECRET_KEY', 
    duration: 24 * 60 * 60 * 1000, 
    activeDuration: 1000 * 60 * 60, 
    httpOnly: true, 
    secure: false, 
    ephemeral: true
}));

// Add session to all views
app.use(function(req, res, next) {
    res.locals.session = req.session; 
    next();
});

// ensureLogin middleware
function ensureLogin(req, res, next) {
    if (!req.session.userName) {
        return res.redirect('/login');
    }
    next();
}

// Use ensureLogin on routes that require authentication
app.get('/items', ensureLogin, (req, res) => {
    // Route code here
});

app.get('/categories', ensureLogin, (req, res) => {
    // Route code here
});
// Register Route (GET)
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

// Register Route (POST)
app.post('/register', (req, res) => {
    const userData = req.body;
    authData.registerUser(userData)
        .then(() => {
            res.render('register', { successMessage: "User created" });
        })
        .catch((err) => {
            res.render('register', { errorMessage: err, userName: req.body.userName });
        });
});

// Login Route (GET)
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// Login Route (POST)
app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            };
            res.redirect('/items');
        })
        .catch((err) => {
            res.render('login', { errorMessage: err, userName: req.body.userName });
        });
});

// Logout Route (GET)
app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});


// User History Route (GET)
app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory', { title: 'User History', user: req.session.user });
});
