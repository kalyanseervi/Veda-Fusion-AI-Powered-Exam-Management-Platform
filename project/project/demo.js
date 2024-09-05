const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize GoogleGenerativeAI with your API key
const genAI = new GoogleGenerativeAI('AIzaSyCwzeQSB_vybOUwMvF_GBIDujIGIv_TXKI');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = 'Please generate a comprehensive exam paper for Class 10th Mathematics. The exam should cover the following topics: Algebra, Trigonometry, and Statistics. If available, you may include content from a provided PDF file, but this is optional. The exam should include a variety of question types: 10 multiple-choice questions (MCQs) each worth 2 marks, 8 short answer questions each worth 3 marks, 4 long answer questions each worth 6 marks, 4 yes/no questions each worth 4 marks, and 4 fill-in-the-blank questions each worth 1 mark. Ensure that the questions are distributed according to difficulty levels, with 40% being easy, 40% medium, and 20% difficult. The total marks for the exam should be 100. The questions should align with State/Country curriculum standards and incorporate real-world relevance where possible. Additionally, include visual aids or diagrams to enhance understanding. The entire exam should be designed to be completed within 90 minutes.';

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
