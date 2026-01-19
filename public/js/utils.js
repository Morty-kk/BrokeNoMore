// Kurz: Gemeinsame Hilfsfunktionen für Frontend‑Skripte (Zahlen, DOM, Format).
// Ziel: Duplizierte Helfer zentral bereitstellen, keine Logik verändern.
(function(){
    window.utils = window.utils || {};

    window.utils.parseGermanNumber = window.utils.parseGermanNumber || function(value){
        if (value === undefined || value === null) return 0;
        const raw = String(value).trim();
        if (!raw) return 0;
        const cleaned = raw.replace(/[^0-9,\-\.]/g, "");
        const normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
        const num = Number(normalized);
        return Number.isFinite(num) ? num : 0;
    };

    window.utils.formatGerman = window.utils.formatGerman || function(n){
        try{
            return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n)) + ' €';
        }catch(e){
            return String(n) + ' €';
        }
    };

    window.utils.el = window.utils.el || function(tag, cls, html){
        const e = document.createElement(tag);
        if(cls) e.className = cls;
        if(html !== undefined) e.innerHTML = html;
        return e;
    };
})();
