const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize GoogleGenerativeAI with your API key
const genAI = new GoogleGenerativeAI('AIzaSyCwzeQSB_vybOUwMvF_GBIDujIGIv_TXKI');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


let question = 'explain the difference between direct and indirect methods of preparing the statement of cash flow'
let answer = 'The indirect method begins with your net income. Alternatively, the direct method begins with the cash amounts received and paid out by your business'

const prompt = `Evaluate the following response and assign a score from 0 to 2 based on correctness. Also explain where marks were deducted if any: Question: ${question}, Answer: ${answer}.`;

async function generateContent() {
    try {
        // Generate content
        const result = await model.generateContent(prompt);
        
        // Print the generated content
        console.log(result.response.text); // Assuming text is a property of response

    } catch (error) {
        console.error('Error generating questions:', error.message);
    }
}

// Call the async function
generateContent();
