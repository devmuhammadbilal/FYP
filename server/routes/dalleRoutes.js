import express from 'express';
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const router = express.Router();

// CONFIG: Initialize OpenAI client with the secret API Key from .env
const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
});

// ROUTE: Simple health check to verify connection to this endpoint
router.route('/').get((req, res) => {
    res.send("Hello From DALL-E");
});

// ROUTE: Handle the actual Image Generation request
router.route('/').post(async (req, res) => {
    try {
        const { prompt } = req.body;

        // LOGIC: Send the text prompt to OpenAI's DALL-E 3 model
        const aiResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt,
            n: 1, // Generate 1 image
            size: '1024x1024',
            response_format: 'b64_json', // Return image as Base64 string (data), not a URL
        });

        // LOGIC: Extract the Base64 string from the API response object
        const image = aiResponse.data[0].b64_json;

        // LOGIC: Send the image data back to the frontend to be displayed
        res.status(200).json({ photo: image });
    } catch (error) {
        console.error(error);
        res.status(500).send(error?.response?.data?.error?.message || 'An error occurred');
    }
});

export default router;
