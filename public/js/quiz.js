(// Kurz: Quiz zu Finanzmythen (Frontend‑Logik, Fragen & Auswertung))
// Quiz logic for Finanzmythen quiz
(function(){
    const QUESTIONS = [
        {
            q: 'Sparen lohnt sich erst, wenn man genug verdient.',
            answers: [
                { t: 'Erst mit festem Job sinnvoll', correct: false },
                { t: 'Erst nach dem Studium relevant', correct: false },
                { t: 'Nur bei großen Beträgen effektiv', correct: false },
                { t: 'Unter 2.000 Euro Einkommen unnötig', correct: false },
                { t: 'Auch kleine Beträge können langfristig viel bewirken', correct: true }
            ]
        },
        {
            q: 'Kartenzahlung ist günstiger als Barzahlung.',
            answers: [
                { t: 'Kartenzahlung ist immer kostenfrei', correct: false },
                { t: 'Nur im Ausland entstehen Gebühren', correct: false },
                { t: 'Nur Kreditkarten verursachen Kosten', correct: false },
                { t: 'Barzahlung ist grundsätzlich teurer', correct: false },
                { t: 'Kartenzahlung kann unbemerkte Zusatzkosten verursachen', correct: true }
            ]
        },
        {
            q: 'Für Budgetplanung braucht man viel Zeit.',
            answers: [
                { t: 'Ohne Excel nicht machbar', correct: false },
                { t: 'Nur mit Finanzberater sinnvoll', correct: false },
                { t: 'Unter einer Stunde pro Woche bringt nichts', correct: false },
                { t: 'Erst bei hohem Einkommen notwendig', correct: false },
                { t: 'Schon wenige Minuten pro Woche können ausreichen', correct: true }
            ]
        },
        {
            q: 'Sparziele müssen groß sein, sonst bringen sie nichts.',
            answers: [
                { t: 'Nur Ziele ab 1.000 Euro lohnen sich', correct: false },
                { t: 'Kleine Ziele motivieren nicht', correct: false },
                { t: 'Nur langfristige Sparziele zählen', correct: false },
                { t: 'Nur beim Investieren sinnvoll', correct: false },
                { t: 'Kleine, erreichbare Ziele motivieren dauerhaft', correct: true }
            ]
        },
        {
            q: 'Budgetieren schränkt die Lebensqualität ein.',
            answers: [
                { t: 'Man darf sich dann nichts mehr gönnen', correct: false },
                { t: 'Budgetieren ist nur für Menschen mit Schulden', correct: false },
                { t: 'Nur ältere Generationen profitieren davon', correct: false },
                { t: 'Budgetieren macht den Alltag komplizierter', correct: false },
                { t: 'Ein gutes Budget schafft Überblick und innere Ruhe', correct: true }
            ]
        }
    ];

    function el(html){ const tmp=document.createElement('div'); tmp.innerHTML=html.trim(); return tmp.firstChild; }

    function renderQuiz(root){
        let idx = 0;
        let score = 0;

        const main = document.createElement('div');
        main.className = 'quiz-card quiz-main-card quiz-main-card enter';

        const header = document.createElement('div'); header.className='quiz-header';
        const progress = document.createElement('div'); progress.className='quiz-progress';
        const label = document.createElement('div'); label.className='quiz-progress-label';
        progress.appendChild(label);

        const qbox = document.createElement('div'); qbox.className='quiz-question';

        const answers = document.createElement('div'); answers.className='answers';

        const actionsWrap = document.createElement('div'); actionsWrap.className='quiz-actions';
        const nextBtn = document.createElement('button'); nextBtn.className='btn btn--gold'; nextBtn.textContent='Weiter'; nextBtn.disabled = true;

        actionsWrap.appendChild(nextBtn);

        header.appendChild(progress);
        main.appendChild(header);
        main.appendChild(qbox);
        main.appendChild(answers);
        main.appendChild(actionsWrap);

        root.appendChild(main);

        function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} }

        function loadQuestion(i){
            const item = QUESTIONS[i];
            label.textContent = `${i+1} von ${QUESTIONS.length}`;
            qbox.textContent = item.q;
            answers.innerHTML = '';
            nextBtn.disabled = true;
            main.classList.remove('enter'); main.classList.remove('exit'); void main.offsetWidth; main.classList.add('enter');

            // clone answers array and shuffle
            const choices = item.answers.map(a=>Object.assign({},a));
            shuffle(choices);

            choices.forEach((c, ai)=>{
                const ael = document.createElement('div');
                ael.className='answer-card';
                ael.textContent = c.t;
                ael.dataset.correct = c.correct ? '1' : '0';
                ael.addEventListener('click', ()=> onSelect(ael));
                answers.appendChild(ael);
            });
        }

        function onSelect(ael){
            if(ael.classList.contains('correct')) return; // already solved
            const correct = ael.dataset.correct === '1';
            if(correct){
                // mark this as correct, mark others disabled
                Array.from(answers.children).forEach(ch=>{ ch.style.pointerEvents='none'; if(ch===ael){ ch.classList.add('correct'); } });
                score++;
                nextBtn.disabled = false;
                // add progress green briefly
            } else {
                // mark wrong, but allow further clicks
                ael.classList.add('wrong');
            }
        }

        function goNext(){
            main.classList.remove('enter'); main.classList.add('exit');
            setTimeout(()=>{
                if(idx < QUESTIONS.length -1){ idx++; loadQuestion(idx); }
                else { showResult(); }
            }, 300);
        }

        function showResult(){
            root.innerHTML = '';
            const fcard = document.createElement('div'); fcard.className='quiz-card final-card';
            const h = document.createElement('h2'); h.textContent = 'Glückwunsch, Du bist vorbereitet auf Finanzmythen!';
            const p = document.createElement('p'); p.textContent = `Für detaillierte Infos geh zu den Finanzfallen.`;

            const actions = document.createElement('div'); actions.className = 'final-actions';

            const again = document.createElement('a');
            again.className='btn';
            again.textContent='Nochmal';
            again.href='#';
            again.addEventListener('click',(e)=>{ e.preventDefault(); root.innerHTML=''; renderQuiz(root); });

            const toFinanz = document.createElement('a');
            toFinanz.className = 'btn btn--gold';
            toFinanz.textContent = 'Jetzt zu den Finanzfallen';
            toFinanz.href = '/pages/finanzfallen.html';

            actions.appendChild(again);
            actions.appendChild(toFinanz);

            fcard.appendChild(h);
            fcard.appendChild(p);
            fcard.appendChild(actions);
            root.appendChild(fcard);
        }

        nextBtn.addEventListener('click', ()=>{
            goNext();
        });

        // start
        loadQuestion(idx);
    }

    // mount
    document.addEventListener('DOMContentLoaded', ()=>{
        const root = document.getElementById('quiz-root');
        if(root) renderQuiz(root);
    });

})();
