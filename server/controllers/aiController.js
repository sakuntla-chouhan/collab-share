const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Process text with Gemini AI
// @route   POST /api/ai/process
// @access  Private
const processWithAI = async (req, res) => {
  try {
    const { action, text } = req.body;

    if (!text || !action) {
      return res.status(400).json({ message: 'Action and text are required' });
    }

    // Default model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = '';
    switch (action) {
      case 'explain_code':
        prompt = `You are a senior developer. Explain the following code clearly and concisely:\n\n${text}`;
        break;
      case 'improve_writing':
        prompt = `You are a technical writer. Improve the following text to make it more professional and clearer. Return ONLY the improved text:\n\n${text}`;
        break;
      case 'generate_readme':
        prompt = `Generate a comprehensive and professional README.md structure based on the following project context or code snippet:\n\n${text}`;
        break;
      case 'generate_docs':
        prompt = `You are a technical documenter. Please generate comprehensive professional documentation (such as API Docs or Architectural overview) for the following code:\n\n${text}`;
        break;
      default:
        prompt = `Process this text: ${text}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    res.json({ result: aiText });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Failed to process with AI' });
  }
};

module.exports = { processWithAI };
