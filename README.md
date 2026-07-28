# FitDay 🏃‍♂️

App personale per la gestione quotidiana di fitness, alimentazione, salute e abitudini.
React + TypeScript + Vite + Tailwind CSS + Supabase. Installabile come app (PWA) su iPhone/Android.

---

## 1. Stato del progetto — COMPLETO

**Tutte le sezioni funzionano davvero, con CRUD reale su Supabase:**
- Autenticazione (registrazione, login, recupero password)
- Onboarding guidato
- Dashboard con Activity Rings animati (cliccabili, aprono il dettaglio)
- Attività (storico, confronti, grafici)
- Allenamenti (creazione, storico, filtri per tipo)
- Alimentazione (diario pasti, macronutrienti, grafico a torta)
- Acqua (aggiunta rapida, storico, grafico orario)
- **Corpo e misurazioni** (peso, massa grassa, circonferenze, pressione, battito, glicemia, grafici andamento)
- **Sonno** (orari, qualità, energia al risveglio, debito di sonno, grafico settimanale)
- **Abitudini** (streak, record personale, completamento giornaliero)
- **Calendario mensile** (riepilogo colorato per giorno, click per aprire la giornata)
- **Obiettivi** (editor completo per tutti i traguardi giornalieri/settimanali, con storico modifiche)
- Progressi (andamento peso, passi, calorie, filtri per periodo)
- Profilo e Impostazioni (con esportazione dati in JSON, menu di accesso rapido alle sezioni)
- Pulsante rapido "+" globale con 8 tipi di inserimento (pasto, acqua, allenamento, peso, passi, sonno, abitudine, nota)
- PWA installabile, dark mode, responsive mobile/tablet/desktop

**Database Supabase completo per tutte le 20+ tabelle**, incluse quelle non ancora sfruttate al 100% dall'interfaccia: esercizi/serie nel dettaglio allenamento, ricette, pasti salvati, achievement, notifiche.

**Non incluso in questa fase** (fuori scope ragionevole per un'app personale, ma l'architettura dati è pronta): ricerca in un database alimenti esterno, gestione ricette con ingredienti step-by-step, sistema di notifiche push reali, integrazioni Apple Health / Google Fit / Garmin / Strava / Fitbit (richiedono SDK nativi non disponibili in una web app).

---

## 2. Setup Supabase

1. Crea un progetto su [supabase.com](https://supabase.com)
2. Vai su **SQL Editor** → incolla ed esegui tutto il contenuto di `supabase/schema.sql`
3. Vai su **Project Settings → API** e copia:
   - `Project URL`
   - `anon public key`
4. Vai su **Authentication → Providers** e verifica che "Email" sia abilitato
5. (Facoltativo ma consigliato) In **Authentication → URL Configuration**, imposta il tuo dominio Netlify come Site URL una volta fatto il deploy

---

## 3. Setup locale

```bash
npm install
cp .env.example .env.local
# apri .env.local e incolla VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

L'app sarà su `http://localhost:5173`.

---

## 4. Pubblicazione su GitHub

```bash
git init
git add .
git commit -m "FitDay - Fase 1"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/fitday.git
git push -u origin main
```

---

## 5. Deploy su Netlify

1. Vai su [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Collega il repository GitHub appena creato
3. Netlify rileverà automaticamente `netlify.toml` (build command e redirect già configurati)
4. In **Site settings → Environment variables**, aggiungi:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Il redirect SPA e il manifest PWA sono già pronti.

---

## 6. Installazione come app sul telefono

Una volta online su Netlify (richiede HTTPS, che Netlify fornisce automaticamente):

- **iPhone (Safari):** apri il sito → pulsante Condividi → "Aggiungi a Home"
- **Android (Chrome):** apri il sito → menu ⋮ → "Installa app" / "Aggiungi a schermata Home"

L'app si aprirà a schermo intero, senza barra del browser, come un'app nativa.

---

## 7. Verifiche già effettuate

- ✅ `npx tsc -b` → **0 errori**
- ✅ `npx vite build` → build di produzione completata senza errori
- ✅ Row Level Security attiva su tutte le tabelle (ogni utente vede solo i propri dati)
- ✅ Redirect SPA per Netlify configurato
- ✅ Manifest PWA + Service Worker generati

---

## 8. Possibili estensioni future

L'architettura è già pronta per:
1. Ricerca in un database alimenti esterno (servizio astratto già predisposto in `src/hooks/useFoodEntries.ts`, facilmente estendibile)
2. Ricette con ingredienti step-by-step (tabelle `recipes` e `recipe_ingredients` già pronte nello schema)
3. Notifiche push reali (tabella `notifications` pronta, richiede un servizio di push come OneSignal o Web Push API)
4. Integrazione con Apple Health / Google Fit / Garmin / Strava / Fitbit (richiede SDK nativi o un'app companion — non possibile da una web app pura)
5. Assistente IA per il riepilogo giornaliero: sostituire `generateDailyInsights()` in `src/lib/insights.ts` con una chiamata a Gemini o OpenAI, mantenendo la stessa interfaccia
