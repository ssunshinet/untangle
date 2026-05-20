// /api/summarize.js
// Vercel Serverless Function: 대화를 요약 카드 JSON으로 정리

const SUMMARY_PROMPT = `방금 사용자와 나눈 대화를 바탕으로 요약 카드를 만들어줘. 다음 JSON 형식으로만 응답해. 다른 설명 없이.

{
  "headline": "사용자 말투로 한 줄 제목 (예: '부장이 회식에서 또 그랬다')",
  "emotions": ["감정1", "감정2", "감정3"],
  "quote": "사용자가 실제로 한 말 중 핵심 한 구절 (실제 사용자 발언에서 발췌)",
  "summary": "무슨 일이었는지 객관적으로 2-3문장",
  "insight": "대화하면서 사용자가 깨달은 것 또는 발견한 것. 없으면 빈 문자열.",
  "tags": ["사람이름이나 키워드", "장소나 상황"],
  "resolved": true/false (얼마나 풀린 것 같은지)
}

감정 단어 예시: 무시당함, 억울함, 답답함, 서운함, 무력함, 짜증남, 외로움, 미안함, 지침, 황당함, 배신감, 슬픔 등 상황적이고 구체적으로.
헤드라인은 임상적이지 않고 사용자가 쓸 법한 자연스러운 표현으로.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 800,
        system: SUMMARY_PROMPT,
        messages: [{ role: 'user', content: '위 대화를 JSON으로 요약해줘. ' + JSON.stringify(messages) }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Anthropic API error', detail: errorText });
    }

    const data = await response.json();
    const textBlock = data.content.find(c => c.type === 'text');
    const responseText = textBlock ? textBlock.text.trim() : '{}';

    return res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
}
