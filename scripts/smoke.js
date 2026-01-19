// Kurz: Einfaches Smoke-Test-Skript. Lädt Seiten via HTTP und speichert HTML.
// Verwendung: Lokaler Quickcheck, ob Server Seiten ausliefert.
const http = require('http');
const fs = require('fs');
function fetch(url, out){
  return new Promise((resolve,reject)=>{
    http.get(url, res=>{
      const { statusCode } = res;
      let raw='';
      res.setEncoding('utf8');
      res.on('data', c=> raw += c);
      res.on('end', ()=>{
        try{ fs.writeFileSync(out, raw); }catch(e){}
        resolve(statusCode);
      });
    }).on('error', e=> reject(e));
  });
}
(async()=>{
  try{
    const s1 = await fetch('http://localhost:5600/','page.html');
    console.log('root', s1);
    const s2 = await fetch('http://localhost:5600/pages/budget-check.html','budget.html');
    console.log('budget', s2);
  }catch(e){
    console.error('err', e.message);
    process.exit(2);
  }
})();
