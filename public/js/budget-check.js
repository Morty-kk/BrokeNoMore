(function(){
    // Kurz: Budget-Check (3 Schritte) — Einnahmen, Ausgaben, Ergebnisse.

    function parseGermanNumber(str){
        if (window.utils && window.utils.parseGermanNumber) return window.utils.parseGermanNumber(str);
        if(!str) return 0;
        const cleaned = String(str).replace(/\./g, '').replace(/\s/g,'').replace(/€/g,'').trim();
        const withPoint = cleaned.replace(/,/g, '.');
        const num = parseFloat(withPoint);
        return Number.isFinite(num) ? num : 0;
    }
    function formatGerman(n){
        if (window.utils && window.utils.formatGerman) return window.utils.formatGerman(n);
        return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
    }

    function el(tag, cls, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(html!==undefined) e.innerHTML = html; return e; }

    function mount(root){
        const state = { incomes: {}, expenses: {}, totals: {} };

        function render(){
            root.innerHTML = '';
            renderStepIncomes(root);
        }

        function renderCard(title, stepLabel){
            const card = el('div','budget-card');
            const head = el('div','budget-card__head');
            const h = el('div','','<div class="budget-progress">'+stepLabel+'</div><h2>'+title+'</h2>');
            head.appendChild(h);
            card.appendChild(head);
            return card;
        }

        function makeInput(name, label, placeholder){
            const wrap = el('div','budget-field');
            const lab = el('label','',''+label);
            const input = el('input');
            input.type='text';
            input.placeholder = placeholder || '0,00 €';
            // keep fields empty by default; placeholder shows `0,00 €`
            input.value = '';
            input.dataset.key = name;
                // on blur: always normalize to formatted German number (0 treated as 0)
                input.addEventListener('blur', ()=>{
                    const raw = (input.value || '').trim();
                    if(raw === ''){ // leave empty visually; logic treats empty as 0
                        input.value = '';
                        return;
                    }
                    const v = parseGermanNumber(input.value);
                    input.value = formatGerman(v);
                });
                input.addEventListener('focus', ()=>{
                    // remove formatting to allow easy editing; if value is zero, clear it for convenience
                    const cleaned = input.value.replace(/\s|€/g,'').replace(/\./g,'').replace(/,/g,'.').trim();
                    if(cleaned === '0') input.value = '';
                    else input.value = cleaned;
                });
            wrap.appendChild(lab);
            wrap.appendChild(input);
            return {wrap,input};
        }

        function renderStepIncomes(container){
            const box = renderCard('Deine monatlichen Einnahmen','Schritt 1 von 3');
            const form = el('div','budget-form');
            const fields = [
                ['salary','Lohn / Gehalt netto'],
                ['bafoeg','BAföG'],
                ['social','Sozialleistungen'],
                ['child','Kindergeld'],
                ['other','Sonstige Einnahmen']
            ];
            const inputs = {};
            fields.forEach(f=>{
                const {wrap,input} = makeInput(f[0], f[1]);
                inputs[f[0]] = input;
                form.appendChild(wrap);
            });
            box.appendChild(form);
            // helper note: monthly averages and empty fields
            const hint = el('div','hint muted','Leere Felder werden als 0 € gewertet. Trage Monatsdurchschnitte ein, Schätzungen reichen zur Orientierung.');
            box.appendChild(hint);
            const actions = el('div','budget-actions');
            const next = el('button','btn btn--gold','Weiter');
            next.type='button';
            actions.appendChild(next);
            box.appendChild(actions);
            const wrapOuter = el('div','budget-wrap');
            wrapOuter.appendChild(el('div','budget-root-inner'));
            wrapOuter.querySelector('.budget-root-inner').appendChild(box);
            container.appendChild(wrapOuter);

            next.addEventListener('click', ()=>{
                // read values
                const incomes = {};
                let total = 0;
                Object.keys(inputs).forEach(k=>{
                    const v = parseGermanNumber(inputs[k].value);
                    incomes[k]=v;
                    total += v;
                });
                state.incomes = incomes;
                state.totals.income = total;
                renderStepExpenses(container);
            });
        }

        function renderStepExpenses(container){
            container.innerHTML = '';
            const box = renderCard('Deine monatlichen Ausgaben','Schritt 2 von 3');
            const form = el('div','budget-form');
            const fields = [
                ['fixed','Fixe Ausgaben (z. B. Miete, Verträge, Versicherungen)'],
                ['variable','Variable Ausgaben (z. B. Lebensmittel, Freizeit, Shopping)'],
                ['savings','Sparrate (optional)']
            ];
            const inputs = {};
            fields.forEach(f=>{
                const {wrap,input} = makeInput(f[0], f[1]);
                inputs[f[0]] = input;
                form.appendChild(wrap);
            });
            box.appendChild(form);
            const hint = el('div','hint muted','Leere Felder werden als 0 € gewertet. Werte sind Monatsdurchschnitte; es geht um Orientierung, nicht um Perfektion.');
            box.appendChild(hint);
            const actions = el('div','budget-actions');
            const back = el('button','btn btn--ghost','Zurück');
            const next = el('button','btn btn--gold','Weiter');
            back.type = next.type = 'button';
            actions.appendChild(back); actions.appendChild(next);
            box.appendChild(actions);
            const wrapOuter = el('div','budget-wrap');
            wrapOuter.appendChild(el('div','budget-root-inner'));
            wrapOuter.querySelector('.budget-root-inner').appendChild(box);
            container.appendChild(wrapOuter);

            back.addEventListener('click', ()=>{ container.innerHTML=''; renderStepIncomes(container); });

            next.addEventListener('click', ()=>{
                const expenses = {};
                let total = 0;
                Object.keys(inputs).forEach(k=>{
                    const v = parseGermanNumber(inputs[k].value);
                    expenses[k]=v;
                    total += v;
                });
                state.expenses = expenses;
                state.totals.expenses = total;
                renderStepResults(container);
            });
        }

        function renderStepResults(container){
            container.innerHTML='';
            const box = renderCard('Dein Budget-Check','Schritt 3 von 3');

            const income = state.totals.income||0;
            const expenses = state.totals.expenses||0;
            const fixed = state.expenses.fixed||0;
            const savings = state.expenses.savings||0;
            const cashflow = income - expenses;
            const fixRatio = income>0 ? (fixed / income) : 0;
            const saveRatio = income>0 ? (savings / income) : 0;

            // --- Derive plan state (5-step approach) ---
            // 1) Einnahmen erfassen -> done (income)
            // 2) Ausgaben ordnen -> fixed vs variable available
            // 3) Plan definieren (derive): classify overall budget
            let planStatus = 'im Rahmen';
            if(income <= 0) planStatus = 'ungenügend';
            else if(cashflow < 0) planStatus = 'angespannt';
            else if(cashflow === 0) planStatus = 'knapp';
            else if(cashflow > 0 && cashflow < income * 0.05) planStatus = 'knapp';
            else planStatus = 'im Rahmen';

            // 4) Puffer erkennen (derive): small heuristic
            // consider there is a sensible buffer if monthly surplus >= 5% of income
            const hasBuffer = income>0 && cashflow >= (income * 0.05);

            // 5) Nächste Gewohnheiten will be derived below based on planStatus

            // Status determination
            let statusIcon='🟢', statusTitle='Dein Budget ist stabil', statusText='Du hast aktuell finanziellen Spielraum.';
            if(income<=0){ statusIcon='🔴'; statusTitle='Keine Einnahmen ermittelt'; statusText='Bitte trage deine Einnahmen ein, damit wir berechnen können.'; }
            else if(cashflow < 0){ statusIcon='🔴'; statusTitle='Dein Budget ist angespannt'; statusText='Deine Ausgaben übersteigen deine Einnahmen, prüfe Fixkosten und variable Ausgaben.'; }
            else if(cashflow === 0){ statusIcon='🟡'; statusTitle='Dein Budget ist ausgeglichen'; statusText='Du kommst zurecht, hast aber kaum finanziellen Puffer.'; }
            else if(cashflow < income * 0.10){ statusIcon='🟡'; statusTitle='Dein Budget ist ausgeglichen'; statusText='Du hast etwas Spielraum, aber noch wenig Puffer.'; }

            const content = el('div');

            // small note about inputs
            content.appendChild(el('div','hint muted','Hinweis: Leere Felder wurden als 0 € gewertet. Angegebene Werte sind Monatsdurchschnitte.'));

            // Status header
            const statusWrap = el('div','result-status');
            statusWrap.appendChild(el('div','icon',statusIcon));
            const st = el('div');
            st.appendChild(el('div','status-title',statusTitle));
            st.appendChild(el('div','status-desc',statusText));
            statusWrap.appendChild(st);
            content.appendChild(statusWrap);

            // Layout: big cashflow, then income/expenses, then small metrics
            const layout = el('div','result-layout');

            const cashClass = cashflow>=0 ? 'metric-large badge-good' : 'metric-large badge-bad';
            const cashLabel = cashflow>=0 ? 'Monatlicher Überschuss' : 'Monatliches Defizit';
            const cashEl = el('div',cashClass,'<div>'+cashLabel+'</div><div style="font-size:1.6rem;">'+formatGerman(Math.abs(cashflow))+'</div>');
            layout.appendChild(cashEl);

            const incEl = el('div','metric-medium','<div><strong>Einnahmen</strong></div><div class="muted">'+formatGerman(income)+'</div>');
            const expEl = el('div','metric-medium','<div><strong>Ausgaben</strong></div><div class="muted">'+formatGerman(expenses)+'</div>');
            layout.appendChild(incEl); layout.appendChild(expEl);

            // small metrics with interpretation
            const fixText = income>0 ? Math.round(fixRatio*100)+' %' : '—';
            let fixNote = 'im normalen Bereich.'; let fixBadge='badge-good';
            let saveText = income>0 ? Math.round(saveRatio*100)+' %' : '—';
            let saveNote='gut'; let saveBadge='badge-good';

            // If there's a deficit, prioritise resolving it: no green indicators
            const fixPct = income>0 ? Math.round(fixRatio*100) : '—';
            if(cashflow < 0){
                // show neutral 0 % for displayed sparquote during deficit
                if(income>0) saveText = '0 %';
                // Special case: fix costs >= 100%
                if(fixRatio >= 1){
                    fixNote = 'Fixkostenquote ' + (fixPct === '—' ? '—' : fixPct + ' %') + ', deine festen Ausgaben binden dein gesamtes Einkommen.';
                    fixBadge = 'badge-bad';
                } else if(fixRatio>0.6){
                    fixNote = 'hoch und trägt derzeit zum Defizit bei, prüfe Miet‑ und Vertragskosten.'; fixBadge = 'badge-bad';
                } else if(fixRatio>0.4){
                    fixNote = 'im Rahmen, tragen aber aktuell zum Defizit bei.'; fixBadge = 'badge-warn';
                } else {
                    fixNote = 'relativ niedrig, kann aber aktuell zum Defizit beitragen.'; fixBadge = 'badge-warn';
                }

                // Sparquote shouldn't be promoted when in deficit, show percentage but neutral messaging
                if(saveRatio<=0){
                    // no entered savings or zero
                    saveNote = 'Sparquote 0 % – Du hast derzeit kein Budget zum Sparen; gleiche zuerst das Defizit aus.';
                    saveBadge = 'badge-neutral';
                } else {
                    // entered savings exist — show entered value in parentheses but display 0% as neutral guidance
                    const entered = Math.round(saveRatio * 100) + ' %';
                    saveNote = 'Sparquote 0 % (eingetragen: ' + entered + ') , Sparen ist aktuell nicht ratsam; stabilisiere zuerst dein Budget.';
                    saveBadge = 'badge-neutral';
                }
            } else {
                // no deficit: evaluate normally
                if(fixRatio >= 1){
                    fixNote = 'Fixkostenquote ' + (fixPct === '—' ? '—' : fixPct + ' %') + ', deine festen Ausgaben binden dein gesamtes Einkommen.'; fixBadge = 'badge-bad';
                } else if(fixRatio>0.6){ fixNote='hoch, wenig Flexibilität, prüfe Miete & Verträge.'; fixBadge='badge-bad'; }
                else if(fixRatio>0.4){ fixNote='moderat, achte auf wiederkehrende Posten.'; fixBadge='badge-warn'; }
                else { fixNote='im normalen Bereich.'; fixBadge='badge-good'; }

                if(saveRatio==0){ saveNote='keine Sparrate erfasst, ein kleiner Start hilft.'; saveBadge='badge-warn'; }
                else if(saveRatio<0.05){ saveNote='klein, aber ein Anfang'; saveBadge='badge-warn'; }
                else if(saveRatio<0.10){ saveNote='angemessen'; saveBadge='badge-good'; }
                else { saveNote='sehr gut, du sparst aktiv'; saveBadge='badge-good'; }
            }

            // Add short clarifiers explaining what the ratios mean
            fixNote += ' (Fixkostenquote = Fixkosten ÷ Einnahmen × 100)';
            if(!saveNote.includes('Sparquote')) saveNote += ' (Sparquote basiert auf deiner eingegebenen Sparrate).';

            // create fixcost element with hoverable percent
            const fixEl = el('div','metric-small');
            const fixLabelRow = el('div');
            fixLabelRow.appendChild(el('strong','','Fixkostenquote'));
            const fixPercent = el('span', fixBadge, fixText);
            fixPercent.classList.add('percent-hover');
            fixPercent.dataset.type = 'fix';
            fixPercent.dataset.numerator = fixed;
            fixPercent.dataset.denominator = income;
            fixPercent.setAttribute('tabindex','0');
            // native tooltip fallback (will show the calculation or reason)
            if(income <= 0){
                fixPercent.title = 'Berechnung nicht möglich: Einnahmen = 0 €';
            } else {
                const pct = Math.round((fixed / income) * 100);
                fixPercent.title = 'Berechnung: Fixkosten ÷ Einnahmen × 100, ' + formatGerman(fixed) + ' ÷ ' + formatGerman(income) + ' × 100 = ' + pct + ' %';
            }
            fixLabelRow.appendChild(fixPercent);
            fixEl.appendChild(fixLabelRow);
            fixEl.appendChild(el('div','muted',fixNote));

            // create savings element with hoverable percent
            const saveEl = el('div','metric-small');
            const saveLabelRow = el('div');
            saveLabelRow.appendChild(el('strong','','Sparquote'));
            const savePercent = el('span', saveBadge, saveText);
            savePercent.classList.add('percent-hover');
            savePercent.dataset.type = 'save';
            savePercent.dataset.numerator = savings;
            savePercent.dataset.denominator = income;
            savePercent.setAttribute('tabindex','0');
            if(income <= 0){
                savePercent.title = 'Berechnung nicht möglich: Einnahmen = 0 €';
            } else {
                const pctS = Math.round((savings / income) * 100);
                const entered = Math.round(saveRatio * 100) + ' %';
                savePercent.title = 'Berechnung: Sparrate ÷ Einnahmen × 100, ' + formatGerman(savings) + ' ÷ ' + formatGerman(income) + ' × 100 = ' + pctS + ' % (eingetragen: ' + entered + ')';
            }
            saveLabelRow.appendChild(savePercent);
            saveEl.appendChild(saveLabelRow);
            saveEl.appendChild(el('div','muted',saveNote));

            // attach hover listeners for calculation tooltip
            function attachCalcTooltip(root){
                const items = root.querySelectorAll('.percent-hover');
                items.forEach(it => {
                    let tip = null;
                    const show = (ev)=>{
                        const num = Number(it.dataset.numerator) || 0;
                        const den = Number(it.dataset.denominator) || 0;
                        tip = document.createElement('div');
                        tip.className = 'calc-tooltip';
                        if(den <= 0){
                            tip.innerHTML = '<div class="calc-line">Berechnung nicht möglich: Einnahmen = 0 €</div>';
                        } else {
                            if(it.dataset.type === 'fix'){
                                const pct = Math.round((num/den)*100);
                                tip.innerHTML = '<div class="calc-line">Berechnung: Fixkosten ÷ Einnahmen × 100</div>'+
                                                '<div class="calc-line">'+formatGerman(num)+' ÷ '+formatGerman(den)+' × 100 = '+pct+' %</div>';
                            } else {
                                const pct = Math.round((num/den)*100);
                                tip.innerHTML = '<div class="calc-line">Berechnung: Sparrate ÷ Einnahmen × 100</div>'+
                                                '<div class="calc-line">'+formatGerman(num)+' ÷ '+formatGerman(den)+' × 100 = '+pct+' %</div>';
                            }
                        }
                        document.body.appendChild(tip);
                        const r = it.getBoundingClientRect();
                        tip.style.position = 'absolute';
                        tip.style.left = (r.left + window.scrollX) + 'px';
                        tip.style.top = (r.bottom + window.scrollY + 8) + 'px';
                    };
                    const hide = ()=>{ if(tip && tip.parentNode) tip.parentNode.removeChild(tip); tip=null; };
                    it.addEventListener('mouseenter', show);
                    it.addEventListener('focus', show);
                    it.addEventListener('mouseleave', hide);
                    it.addEventListener('blur', hide);
                });
            }

            layout.appendChild(fixEl); layout.appendChild(saveEl);

            content.appendChild(layout);

            // Personalized recommendation text derived from planStatus and buffer
            const rec = el('div','recommendations');
            const recHead = el('h3','','Was du tun kannst');
            rec.appendChild(recHead);
            const recList = el('ul');

            // Prioritise: stabilise budget before saving
            if(planStatus === 'angespannt' || planStatus === 'ungenügend'){
                recList.appendChild(el('li','','Dein Budget ist aktuell angespannt. Prüfe zuerst variable Ausgaben (Lebensmittel, Freizeit) und setze dort kurzfristig Prioritäten.'));
                recList.appendChild(el('li','','Schaue gezielt nach wiederkehrenden Kosten (Miete, Abos, Versicherungen) und prüfe, wo du kurzfristig sparen kannst.'));
                recList.appendChild(el('li','','Kurzfristiges Ziel: Ausgaben so anpassen, dass Einnahmen und Ausgaben sich ausgleichen.'));
            } else if(planStatus === 'knapp'){
                recList.appendChild(el('li','','Du hast nur wenig Puffer. Kleine Maßnahmen helfen: reduziere variable Ausgaben und probiere eine Mini‑Sparrate von 5 % ein.'));
                recList.appendChild(el('li','','Automatisiere kleine Sparbeträge (z. B. 5–10 € pro Woche), um einen Notgroschen zu starten.'));
            } else {
                // im Rahmen
                if(hasBuffer){
                    recList.appendChild(el('li','','Guter Überschuss, baue schrittweise einen Notgroschen auf (Ziel: 3 Monatsausgaben).'));
                    recList.appendChild(el('li','','Lege eine regelmäßige Sparrate fest (z. B. 5–10 %), automatisiert per Dauerauftrag.'));
                } else {
                    recList.appendChild(el('li','','Positiver Überschuss, aber noch wenig Puffer, starte mit kleinen, regelmäßigen Sparbeträgen.'));
                }
            }

            // gentle tips always useful
            if(fixRatio>0.5) recList.appendChild(el('li','','Tipp: Ein Abo‑Check kann schnell Luft verschaffen. Prüfe besonders Miet‑ und Versicherungsbeiträge.'));

            rec.appendChild(recList);
            content.appendChild(rec);

            // Next step
            const nextBox = el('div','next-step');
            nextBox.appendChild(el('strong','','Nächster sinnvoller Schritt:'));
            let nextText = 'Budget in einem Monat erneut prüfen.';
            if(cashflow < 0) nextText = 'Variable Ausgaben prüfen und Fixkosten reduzieren.';
            else if(saveRatio < 0.05) nextText = 'Mini‑Sparrate von 5–10 % festlegen.';
            else if(fixRatio>0.6) nextText = 'Fixkosten analysieren (Miete/Verträge).';
            nextBox.appendChild(el('div','','<div class="muted">'+nextText+'</div>'));
            content.appendChild(nextBox);

            // attach tooltip listeners for percent calculations
            attachCalcTooltip(container);

            // Actions
            const actions = el('div','budget-actions');
            const again = el('button','btn btn--ghost','Nochmal');
            const toHome = el('a','btn btn--primary','Zur Startseite');
            toHome.href = '/index.html';
            again.addEventListener('click', ()=>{ container.innerHTML=''; renderStepIncomes(container); });
            actions.appendChild(again); actions.appendChild(toHome);

            box.appendChild(content);
            box.appendChild(actions);
            const wrapOuter = el('div','budget-wrap');
            wrapOuter.appendChild(el('div','budget-root-inner'));
            wrapOuter.querySelector('.budget-root-inner').appendChild(box);
            container.appendChild(wrapOuter);
        }

        render();
    }

    document.addEventListener('DOMContentLoaded', ()=>{
        const root = document.getElementById('budget-root');
        if(root) mount(root);
    });
})();
