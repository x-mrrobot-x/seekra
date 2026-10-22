import { t } from '../../core/i18n.js';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const httpError = (status) => {
  const hints = { 400: t('gemini.badRequest'), 429: t('gemini.rateLimit') };
  return new Error(`HTTP ${status}${hints[status] || ''}`);
};

const generateJson = async ({ apiKey, model, systemInstruction, prompt }) => {
  const response = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (!response.ok) throw httpError(response.status);
  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text.replace(/```json|```/g, '').trim());
};

const checkModel = async ({ apiKey, model }) => {
  const response = await fetch(`${BASE_URL}/${model}?key=${apiKey}`);
  if (!response.ok) throw httpError(response.status);
};

export { generateJson, checkModel };
