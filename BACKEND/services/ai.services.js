const { GoogleGenAI } = require('@google/genai');

const getAIClient = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('Missing GOOGLE_API_KEY in environment.');
  }
  return new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
};

const MODEL_NAME = 'gemini-3.5-flash';

async function generateStudyPlan({ subject, timeline, text }) {
  const ai = getAIClient();

  const prompt = `
Create a day-by-day study plan for the subject below. The student has ${timeline} to prepare.
Use only reference pages, chapters, and other study resources as the output. Do not provide daily task checklists.

Subject: ${subject}
Timeline: ${timeline}
Reference notes:
${text || 'No notes given — build a general plan covering the main topics in this subject.'}

Output ONLY raw JSON with this structure (no markdown, no explanation):
{
  "title": "Plan title",
  "timeline": "${timeline}",
  "estimatedHoursPerDay": 2,
  "schedule": [
    {
      "day": 1,
      "topic": "Topic name",
      "focusAreas": ["area 1", "area 2"],
      "resources": ["book chapter / page / website / video"]
    }
  ],
  "generalTips": ["tip 1", "tip 2"]
}
`;

  const res = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(res.text);
}

async function generateQuiz({ subject, difficulty, questionCount, text }) {
  const ai = getAIClient();
  const count = parseInt(questionCount, 10) || 5;

  const prompt = `
Write a ${difficulty}-level multiple choice quiz on "${subject}" with exactly ${count} questions.
${text ? `Use this as reference material:\n${text}` : 'No reference text — use standard textbook knowledge.'}

Do not include answer explanations in the response.

Output ONLY raw JSON (no markdown):
{
  "title": "Quiz title",
  "topic": "${subject}",
  "questions": [
    {
      "id": 1,
      "question": "Question here?",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 0
    }
  ],
  "studyAdvice": "One concrete tip on what to revise after this quiz."
}
`;

  const res = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(res.text);
}

async function generateMnemonics({ subject, text }) {
  const ai = getAIClient();

  const prompt = `
Come up with memory tricks (acronyms, word associations) to help a student remember key concepts in "${subject}".
Use general core topics from the subject and avoid requiring a specific focus concept.
${text ? `Notes:\n${text}` : 'No notes — pick the most commonly memorised facts or formulas in this subject.'}

Output ONLY raw JSON (no markdown):
{
  "title": "Session title",
  "mnemonics": [
    {
      "concept": "What needs memorising",
      "mnemonic": "The acronym or phrase",
      "memoryAid": "How each letter/word maps back to the concept"
    }
  ]
}
`;

  const res = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(res.text);
}

module.exports = {
  generateStudyPlan,
  generateQuiz,
  generateMnemonics,
};
