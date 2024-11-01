/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or
distributed to other students.
Name: Rickson Bozar
Student ID: 167549237
Date: 2024-10-14
Vercel Web App URL:
GitHub Repository URL: https://github.com/Rickson0628/web322-app.git
********************************************************************************/

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const express = require('express');
const path = require('path');
const storeService = require('./store-service');

const app = express();

app.use(express.static('public'));

cloudinary.config({
    cloud_name: 'dhits2wux',    
    api_key: '561788259127248',          
    api_secret: 'HSdEzLlIyXCHX26YA5HkVmqgLx0',   
    secure: true
});

const upload = multer(); 

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


app.get('/items', (req, res) => {
    const { category, minDate } = req.query;

    if (category) {
        storeService.getItemsByCategory(category)
            .then((items) => res.json(items))
            .catch((err) => res.status(500).json({ message: err }));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then((items) => res.json(items))
            .catch((err) => res.status(500).json({ message: err }));
    } else {
        storeService.getAllItems()
            .then((items) => res.json(items))
            .catch((err) => res.status(500).json({ message: err }));
    }
});


app.get('/item/:id', (req, res) => {
    storeService.getItemById(req.params.id)
        .then((item) => {
            if (item) {
                res.json(item);
            } else {
                res.status(404).json({ message: "No result returned" });
            }
        })
        .catch((err) => res.status(500).json({ message: err }));
});


app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/addItem.html'));
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


app.post('/items/add', upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

     
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result); 
            return result;
        }

        
        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((error) => {
            console.error("Upload failed:", error);
            res.status(500).send("Error uploading image");
        });
    } else {
        processItem("");
    }


    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        const itemsFilePath = path.join(__dirname, 'data', 'items.json');

        
        fs.readFile(itemsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Server Error");
            }
           
            let items = JSON.parse(data);

            const nextId = items.length > 0 ? items[items.length - 1].id + 1 : 1;

            
            const newItem = {
                id: nextId,
                category: parseInt(req.body.category),
                postDate: new Date().toISOString().split('T')[0], 
                featureImage: imageUrl,
                price: parseFloat(req.body.price),
                title: req.body.title,
                body: req.body.body,
                published: req.body.published === "on" 
            };

            items.push(newItem);

            // Write the updated items array back to items.json
            fs.writeFile(itemsFilePath, JSON.stringify(items, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error("Failed to write to items.json:", err);
                    return res.status(500).send("Server Error");
                }

                // Redirect to /items after successfully saving the new item
                res.redirect('/items');
            });
        });
    }
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