// supabase/functions/analyze-food/index.ts
//
// Analizza una foto di cibo o una descrizione testuale usando Google Gemini
// e restituisce una stima strutturata dei valori nutrizionali.
// La chiave GEMINI_API_KEY viene letta da un secret di Supabase (mai esposta al client).
//
// Deploy: Supabase Dashboard -> Edge Functions -> Deploy a new function -> Via Editor
// Secret richiesto: GEMINI_API_KEY (Edge Functions -> Secrets)

const MODEL = 'gemini-2.5-flash'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

const PROMPT = `Sei un nutrizionista esperto. Analizza il cibo descritto o mostrato nella foto e stima con la massima precisione possibile:
- il nome dell'alimento o del piatto, in italiano
- la marca del prodotto, SOLO se visibile chiaramente nella foto o esplicitamente indicata nel testo (altrimenti usa null)
- la quantità/porzione stimata e la sua unità di misura (preferisci i grammi "g" quando ha senso; se è un piatto composto o un numero di pezzi tipo "10 chicchi", stima comunque il peso totale in grammi)
- calorie, proteine, carboidrati, grassi, fibre, zuccheri e sale, TUTTI riferiti alla quantità stimata (non per 100g)

Se riconosci una marca specifica di un prodotto confezionato, usa la ricerca web per trovare i valori nutrizionali ufficiali riportati sulla confezione o sul sito del produttore, e preferiscili alle tue stime generiche.
Se non riconosci una marca, stima i valori nutrizionali standard per quell'alimento in base a fonti nutrizionali affidabili.

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido, senza testo prima o dopo, in questo formato esatto:
{
  "food_name": "string",
  "brand": "string oppure null",
  "quantity": number,
  "unit": "string",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "sugar_g": number,
  "salt_g": number,
  "confidence": "alta" | "media" | "bassa",
  "notes": "breve nota, es. se hai usato dati web per una marca specifica, o se la stima è approssimativa"
}`

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Metodo non consentito' }, 405)

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    return json({ error: 'Chiave GEMINI_API_KEY non configurata su Supabase. Aggiungila in Edge Functions -> Secrets.' }, 500)
  }

  let payload: { imageBase64?: string; mimeType?: string; text?: string }
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Corpo della richiesta non valido.' }, 400)
  }

  const { imageBase64, mimeType, text } = payload
  if (!imageBase64 && !text?.trim()) {
    return json({ error: 'Fornisci una foto oppure una descrizione testuale.' }, 400)
  }

  const parts: Record<string, unknown>[] = [{ text: PROMPT }]
  if (text?.trim()) parts.push({ text: `Descrizione fornita dall'utente: "${text.trim()}"` })
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } })
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.2 }
        })
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      return json({ error: `Errore dal servizio IA (${geminiRes.status}): ${errText.slice(0, 300)}` }, 502)
    }

    const data = await geminiRes.json()
    const textOut: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text)
        .filter(Boolean)
        .join('') ?? ''

    const jsonMatch = textOut.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return json({ error: "Non sono riuscito a interpretare la risposta dell'IA. Riprova con una descrizione più chiara." }, 502)
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return json({ error: "Risposta dell'IA non valida. Riprova." }, 502)
    }

    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
    const result = {
      food_name: typeof parsed.food_name === 'string' ? parsed.food_name : '',
      brand: typeof parsed.brand === 'string' ? parsed.brand : null,
      quantity: num(parsed.quantity) || 100,
      unit: typeof parsed.unit === 'string' ? parsed.unit : 'g',
      calories: num(parsed.calories),
      protein_g: num(parsed.protein_g),
      carbs_g: num(parsed.carbs_g),
      fat_g: num(parsed.fat_g),
      fiber_g: num(parsed.fiber_g),
      sugar_g: num(parsed.sugar_g),
      salt_g: num(parsed.salt_g),
      confidence: typeof parsed.confidence === 'string' ? parsed.confidence : 'media',
      notes: typeof parsed.notes === 'string' ? parsed.notes : ''
    }

    return json({ result }, 200)
  } catch (err) {
    return json({ error: 'Errore interno: ' + (err instanceof Error ? err.message : 'sconosciuto') }, 500)
  }
})
