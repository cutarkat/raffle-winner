const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());

// Configure this to your images folder path
const IMAGES_FOLDER = './employee-photos';

// Endpoint to get all employees with their photos
app.get('/api/employees', async (req, res) => {
    try {
        // Read all files from the images folder
        const files = await fs.readdir(IMAGES_FOLDER);
        
        // Filter for image files only
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png)$/i.test(file)
        );

        // Create employee data from image files
        const employees = imageFiles.map(file => ({
            id: path.parse(file).name, // Use filename without extension as ID
            name: path.parse(file).name.replace(/-/g, ' '), // Convert filename to name
            image: `/${file}`
        }));

        res.json(employees);
    } catch (error) {
        console.error('Error reading employee photos:', error);
        res.status(500).json({ error: 'Failed to load employee data' });
    }
});

// Serve static images
app.use('/images', express.static(IMAGES_FOLDER));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});