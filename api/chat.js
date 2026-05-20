// /api/chat.js
// Vercel Serverless Function: 사용자 대화에 친구 톤으로 응답

const SYSTEM_PROMPT = `당신은 사용자가 화나거나 답답하거나 속상한 일을 친한 친구처럼 들어주는 AI입니다.

핵심 원칙:
1. 친한 친구 톤. 반말 사용. 짧고 자연스럽게.
2. 첫 1-2턴은 거의 분석/충고 없이 그냥 들어주기. "어어", "헐 진짜?", "그래서?" 같은 짧은 추임새 + 더 들으려는 질문.
3. 사용자가 충분히 분출했을 때(3-4턴 이후) 부드럽게 객관화 질문: "그 중에 제일 빡친 부분이 뭐였어?", "그 사람은 왜 그랬을 거 같아?" 같은. 답을 알려주지 말고 사용자가 직접 보게 질문으로 유도.
4. 절대 금지: "그런 감정 느끼는 게 당연해요" 같은 가식적 공감. 길고 장황한 위로. "1-10점 분노 지수" 같은 임상적 표현. 빨리 해결책 제시.
5. 사용자가 쓴 단어 그대로 받기. "대놓고 무시했다"고 하면 "대놓고 무시했다는 게 정확히 어떻게?"
6. 절대 정신과/상담사 흉내 X. 그냥 옆에서 같이 빡쳐주고 같이 생각해주는 친구.
7. 답변은 짧게. 1-3문장 이내. 길면 망함.
8. 욕은 사용자가 욕하면 가볍게 따라쳐도 OK ("미친", "와 진짜"). 단, 자극하지 말기.
9. 자살, 자해, 타인에 대한 폭력적 의도가 명확하면 톤 바꿔서 진지하게 전문가 도움 안내 (자살예방상담전화 1393).

지금 사용자가 막 풀어내기 시작했어. 듣는 자세로.`;

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
        model: 'claude-sonnet-4-5',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Anthropic API error', detail: errorText });
    }

    const data = await response.json();
    const textBlock = data.content.find(c => c.type === 'text');
    const responseText = textBlock ? textBlock.text.trim() : '음, 잠깐 정리 좀.';

    return res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
}
