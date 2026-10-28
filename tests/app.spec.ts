import {test,expect} from '@playwright/test';
test('create, correct, delete a match and persist the dashboard',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'Euer Scorer Battle.'})).toBeVisible();
 await page.getByRole('button',{name:'Spiel erfassen',exact:true}).click();
 await page.getByLabel('Gegner',{exact:true}).fill('FC Browser-Test');await page.getByLabel('Tore',{exact:true}).fill('2');await page.getByLabel('Vorlagen',{exact:true}).fill('1');await page.getByRole('button',{name:'Spiel speichern'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('.big-score').first()).toContainText('27');await page.reload();await expect(page.locator('.big-score').first()).toContainText('27');
 await page.getByRole('button',{name:'Spiel gegen FC Browser-Test bearbeiten'}).click();await page.getByLabel('Tore',{exact:true}).fill('3');await page.getByRole('button',{name:'Spiel speichern'}).click();await expect(page.locator('.big-score').first()).toContainText('28');
 await page.getByRole('button',{name:'Spiel gegen FC Browser-Test bearbeiten'}).click();page.once('dialog',d=>d.accept());await page.locator('.delete-button').click();await expect(page.locator('.big-score').first()).toContainText('24');
});
test('target update, season close, reopen and retained result',async({page})=>{
 page.on('dialog',d=>d.accept());await page.goto('/');await page.getByRole('button',{name:'Profil & Ziel',exact:true}).click();await page.getByRole('button',{name:'Ziel ändern'}).click();await page.getByLabel('Scorerziel').fill('20');await page.getByRole('button',{name:'Ziel bestätigen'}).click();await expect(page.locator('.change')).toContainText('30 → 20');
 await page.getByRole('button',{name:'Übersicht',exact:true}).click();await expect(page.locator('.progress-title').first()).toContainText('120');await expect(page.locator('.lead-banner')).toContainText('Spieler 1 hat die Nase vorn');
 await page.getByRole('button',{name:'Saison',exact:true}).click();await page.getByRole('button',{name:'Saison abschließen',exact:true}).click();await page.getByRole('button',{name:'Verbindlich abschließen'}).click();await expect(page.getByRole('button',{name:'Spiel erfassen',exact:true})).toBeDisabled();await expect(page.locator('.change')).toContainText('Spieler 1 gewinnt mit 120 %');
 await page.getByRole('button',{name:'Saison wieder öffnen'}).click();await page.getByRole('button',{name:'Wiederöffnung bestätigen'}).click();await expect(page.getByRole('button',{name:'Spiel erfassen',exact:true})).toBeEnabled();await expect(page.locator('.change')).toContainText('Spieler 1 gewinnt mit 120 %');
});
test('mobile layout does not overflow',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/');await expect(page.getByRole('heading',{name:'Euer Scorer Battle.'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:'/tmp/scorer-mobile.png',fullPage:true});});

test('save works when crypto.randomUUID is unavailable',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window.crypto,'randomUUID',{value:undefined,configurable:true}));
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.getByRole('button',{name:'Spiel erfassen',exact:true}).click();
 await page.getByLabel('Spieldatum',{exact:true}).fill('2026-10-28');
 await page.getByLabel('Gegner',{exact:true}).fill('SC GW Varensell II');
 await page.getByLabel('Vorlagen',{exact:true}).fill('1');
 await page.getByRole('button',{name:'Spiel speichern'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('.big-score').first()).toContainText('25');
 await page.reload();await expect(page.locator('.big-score').first()).toContainText('25');
 expect(errors).toEqual([]);
});
