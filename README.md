# FitDay 🏃‍♂️

App personale per la gestione quotidiana di fitness, alimentazione, salute e abitudini.
React + TypeScript + Vite + Tailwind CSS + Supabase. Installabile come app (PWA) su iPhone/Android.

---

## 1. Stato del progetto

FitDay è un **diario quotidiano semplice** con quattro sezioni:
- **Alimentazione**: diario pasti con più alimenti/bevande per pasto, macronutrienti, analisi IA da foto o testo
- **Acqua**: aggiunta rapida, storico, grafico orario
- **Allenamenti**: creazione, storico, filtri per tipo
- **Peso e corpo**: peso, massa grassa, circonferenze, pressione, grafici andamento

Più: Profilo, Impostazioni (tema chiaro/scuro/sistema, notifiche, esportazione dati), pulsante rapido "+" globale, PWA installabile.

*(In precedenza l'app includeva anche anelli di attività, conteggio passi, sonno, abitudini, calendario e obiettivi — rimossi su richiesta per mantenere l'app semplice e focalizzata. Le relative tabelle rimangono nel database ma non sono più usate dall'interfaccia; possono essere reintrodotte in futuro se servono.)*

**Database Supabase completo per tutte le 20+ tabelle**, incluse quelle non ancora sfruttate al 100% dall'interfaccia: esercizi/serie nel dettaglio allenamento, ricette, pasti salvati, achievement, notifiche.

**Non incluso in questa fase** (fuori scope ragionevole per un'app personale, ma l'architettura dati è pronta): ricerca in un database alimenti esterno, gestione ricette con ingredienti step-by-step, sistema di notifiche push reali, integrazioni Apple Health / Google Fit / Garmin / Strava / Fitbit (richiedono SDK nativi non disponibili in una web app).

---

## 1.1 Correzioni recenti
- Risolto testo invisibile nel tema chiaro (card, interruttori, pannello di personalizzazione)
- I campi numerici (proteine, carboidrati, grassi, peso, ecc.) ora accettano valori decimali con la virgola
- Risolta la sovrapposizione dell'intestazione con la barra di stato del telefono nella PWA installata

---

## 2. Setup Supabase

1. Crea un progetto su [supabase.com](https://supabase.com)
2. Vai su **SQL Editor** → incolla ed esegui tutto il contenuto di `supabase/schema.sql`
3. Esegui anche `supabase/migrations/002_dashboard_customization.sql` (una nuova query, stesso procedimento) — aggiunge la colonna necessaria per la personalizzazione della Dashboard
4. Vai su **Project Settings → API** e copia:
   - `Project URL`
   - `anon public key`
5. Vai su **Authentication → Providers** e verifica che "Email" sia abilitato
6. (Facoltativo ma consigliato) In **Authentication → URL Configuration**, imposta il tuo dominio Netlify come Site URL una volta fatto il deploy

---

## 3. Setup dell'analisi alimenti con IA (facoltativo ma consigliato)

Questa funzione richiede una piccola "Edge Function" su Supabase, che chiama Google Gemini in modo sicuro (la chiave non è mai esposta nel browser). Si fa tutta da browser, senza CLI:

1. Vai su **[aistudio.google.com](https://aistudio.google.com)** → **Get API key** → **Create API key** → copia la chiave (è gratuita, nessuna carta richiesta)
2. Su Supabase, vai su **Edge Functions** (menu a sinistra) → **Manage secrets** (o **Secrets**) → aggiungi:
   - Nome: `GEMINI_API_KEY`
   - Valore: la chiave copiata al punto 1
3. Sempre in **Edge Functions**, clicca **Deploy a new function → Via Editor**
4. Nome della funzione: `analyze-food`
5. Cancella il codice di esempio e incolla tutto il contenuto del file `supabase/functions/analyze-food/index.ts` (incluso nello zip)
6. Clicca **Deploy**

Fatto: la funzione è live su `https://TUO-PROGETTO.supabase.co/functions/v1/analyze-food` e l'app la chiama automaticamente. Non serve nessuna variabile d'ambiente aggiuntiva su Netlify per questa funzione.

---

## 4. Setup locale

```bash
npm install
cp .env.example .env.local
# apri .env.local e incolla VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

L'app sarà su `http://localhost:5173`.

---

## 5. Pubblicazione su GitHub

```bash
git init
git add .
git commit -m "FitDay - Fase 1"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/fitday.git
git push -u origin main
```

---

## 6. Deploy su Netlify

1. Vai su [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Collega il repository GitHub appena creato
3. Netlify rileverà automaticamente `netlify.toml` (build command e redirect già configurati)
4. In **Site settings → Environment variables**, aggiungi:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Il redirect SPA e il manifest PWA sono già pronti.

---

## 7. Installazione come app sul telefono

Una volta online su Netlify (richiede HTTPS, che Netlify fornisce automaticamente):

- **iPhone (Safari):** apri il sito → pulsante Condividi → "Aggiungi a Home"
- **Android (Chrome):** apri il sito → menu ⋮ → "Installa app" / "Aggiungi a schermata Home"

L'app si aprirà a schermo intero, senza barra del browser, come un'app nativa.

---

## 8. Verifiche già effettuate

- ✅ `npx tsc -b` → **0 errori**
- ✅ `npx vite build` → build di produzione completata senza errori
- ✅ Row Level Security attiva su tutte le tabelle (ogni utente vede solo i propri dati)
- ✅ Redirect SPA per Netlify configurato
- ✅ Manifest PWA + Service Worker generati

---

## 9. Possibili estensioni future

L'architettura è già pronta per:
1. Ricerca in un database alimenti esterno (servizio astratto già predisposto in `src/hooks/useFoodEntries.ts`, facilmente estendibile)
2. Ricette con ingredienti step-by-step (tabelle `recipes` e `recipe_ingredients` già pronte nello schema)
3. Notifiche push reali (tabella `notifications` pronta, richiede un servizio di push come OneSignal o Web Push API)
4. Integrazione con Apple Health / Google Fit / Garmin / Strava / Fitbit (richiede SDK nativi o un'app companion — non possibile da una web app pura)
5. Assistente IA per il riepilogo giornaliero: sostituire `generateDailyInsights()` in `src/lib/insights.ts` con una chiamata a Gemini o OpenAI, mantenendo la stessa interfaccia
