import express from 'express';
import * as dotenv from 'dotenv'
import {OpenAI} from 'openai';

dotenv.config();

const router = express.Router();;
// Instantiate the OpenAI object
const openai = new OpenAI({
    apiKey : process.env.OPEN_AI_KEY,

})

router.route('/').get((req, res) => {
    res.send("Hello From DALL-E");
});

router.route('/').post(async (req, res) => {
    try {
        const { prompt } = req.body;

        // Call the OpenAI API for image generation
        const aiResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json',
        });

        // Extract the image from the response
        const image = aiResponse.data[0].b64_json;

        // Respond with the image
        res.status(200).json({ photo: image });
    } catch (error) {
        console.error(error);
        res.status(500).send(error?.response?.data?.error?.message || 'An error occurred');
    }
});

export default router;