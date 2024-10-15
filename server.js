const express = require('express');
const path = require('path');
const storeService = require('./store-service');

const app = express();

app.use(express.static('public'));


const PORT = process.env.PORT || 8080;

// Redirect the root route to /about
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Serve the about.html page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/about.html'));
});

// Route to get published items
// Route for /shop to return published items as JSON
app.get('/shop', (req, res) => {
  storeService.getPublishedItems()
      .then((items) => res.json(items))
      .catch((err) => res.status(500).json({ message: err }));
});

// Route to get all items
app.get('/items', (req, res) => {
  storeService.getAllItems()
      .then((items) => res.json(items))
      .catch((err) => res.status(500).json({ message: err }));
});

// Route to get all categories
app.get('/categories', (req, res) => {
  storeService.getCategories()
      .then((categories) => res.json(categories))
      .catch((err) => res.status(500).json({ message: err }));
});

// Handle unmatched routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '/views/error.html')); 
});


// Start the server
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(`Unable to start the server: ${err}`);
    });