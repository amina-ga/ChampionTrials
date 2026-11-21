
const express = require("express");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "20kb" }));
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
    try {
        const messages = req.body.messages;

        if (!Array.isArray(messages) || messages.length > 10) {
            return res.status(400).json({
                error: "Invalid messages."
            });
        }

        const response = await client.responses.create({
            model: "gpt-6.2-sol",

            instructions: `
                You are Forma Assistant.

                You help users with studying,
                planning, productivity and motivation.

                Be friendly, positive and supportive.
                Give simple and helpful answers.
            `,

            input: messages.map(message => {
                if (
                    !["user", "assistant"].includes(message.role) ||
                    typeof message.content !== "string" ||
                    message.content.length > 3000
                ) {
                    throw new Error("Invalid message.");
                }

                return {
                    role: message.role,
                    content: message.content
                };
            })
        });

        res.json({
            reply: response.output_text
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Something went wrong."
        });
    }
});

app.listen(3000, () => {
    console.log("Forma is running at http://localhost:3000");
});
