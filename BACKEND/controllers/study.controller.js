const pdfParse = require('pdf-parse');
const aiServices = require('../services/ai.services');

async function generateResource(req, res) {
  try {
    const { type, subject, timeline, difficulty, questionCount } = req.body;
    let text = String(req.body.text || '');

    if (req.file) {
      try {
        const parsed = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
        text = parsed.text || '';
      } catch (e) {
        console.error('PDF parse failed:', e.message);
        return res.status(400).json({ message: 'Could not read the uploaded PDF.' });
      }
    }

    if (!subject) return res.status(400).json({ message: 'Subject is required.' });
    if (!type) return res.status(400).json({ message: 'Type is required.' });

    let generatedData;
    let title = `${subject} ${type.replace('-', ' ')}`;

    if (type === 'study-plan') {
      generatedData = await aiServices.generateStudyPlan({ subject, timeline: timeline || '7 days', text });
    } else if (type === 'quiz') {
      generatedData = await aiServices.generateQuiz({ subject, difficulty: difficulty || 'Medium', questionCount: questionCount || 5, text });
    } else if (type === 'mnemonic') {
      generatedData = await aiServices.generateMnemonics({ subject, text });
    } else {
      return res.status(400).json({ message: 'Unknown resource type.' });
    }

    title = generatedData.title || title;

    const resource = {
      title,
      type,
      subject,
      text: String(text || '').substring(0, 10000),
      generatedData,
    };

    return res.status(200).json({ message: 'Done!', resource });
  } catch (err) {
    console.error('generateResource error:', err.message);
    return res.status(500).json({ message: 'Generation failed.', error: err.message });
  }
}

module.exports = { generateResource };
