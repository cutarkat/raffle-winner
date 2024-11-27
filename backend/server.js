const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());

// Configure this to your images folder path
const PARTICIPANTS_FOLDER = './images/participants';
const PLACEHOLDERS_FOLDER = './images/placeholders';

// Endpoint to get all participants with their photos
app.get('/api/participants', async (req, res) => {
    try {
        // Read all files from the images folder
        const files = await fs.readdir(PARTICIPANTS_FOLDER);
        
        // Filter for image files only
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png)$/i.test(file)
        );

        // Create employee data from image files
        const participants = imageFiles.map(file => ({
            id: path.parse(file).name, // Use filename without extension as ID
            name: path.parse(file).name.replace(/-/g, ' '), // Convert filename to name
            image: `/${file}`
        }));

        res.json(participants);
    } catch (error) {
        console.error('Error reading employee photos:', error);
        res.status(500).json({ error: 'Failed to load employee data' });
    }
});

// Endpoint to get a random employee photo
app.get('/api/random-placeholder', async (req, res) => {
    try {
        const files = await fs.readdir(PLACEHOLDERS_FOLDER);
        if (files.length === 0) {
            return res.status(404).json({ error: 'No placeholder images found' });
        }
        const randomFile = files[Math.floor(Math.random() * files.length)];
        res.json({ image: randomFile });
    } catch (error) {
        console.error('Error reading placeholder photos:', error);
        res.status(500).json({ error: 'Failed to load placeholder image' });
    }
});

// Serve static images
app.use('/participants', express.static(PARTICIPANTS_FOLDER));
app.use('/placeholders', express.static(PLACEHOLDERS_FOLDER));

const PORT = process.env.PORT || 3001;
const APP_URL = process.env.APP_URL || 'http://localhost';
app.listen(PORT, () => {
    console.log(`Server running on ${APP_URL} with port ${PORT}. To access the API server, use ${APP_URL}:${PORT}`);
});