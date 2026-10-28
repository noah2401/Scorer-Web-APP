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

test('profile photo can be selected, saved, replaced and removed without changing the other player',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.getByRole('button',{name:'Profil & Ziel',exact:true}).click();
 const input=page.getByLabel('Profilbild auswählen',{exact:true});
 const chooser=page.waitForEvent('filechooser');
 await page.getByRole('button',{name:'Bild auswählen',exact:true}).click();
 await (await chooser).setFiles('public/icon-192.png');
 const preview=page.locator('.profile-photo-preview img');
 await expect(preview).toHaveAttribute('src',/^data:image\/jpeg;base64,/);
 const firstImage=await preview.getAttribute('src');
 expect(firstImage!.length).toBeLessThanOrEqual(64*1024);
 expect(await preview.evaluate((img:HTMLImageElement)=>[img.naturalWidth,img.naturalHeight])).toEqual([320,320]);
 await page.getByRole('button',{name:'Profil speichern',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('Profil gespeichert.');
 await page.reload();
 await expect(page.locator('.card-player').first().locator('img')).toHaveAttribute('src',firstImage!);
 await expect(page.locator('.card-player').nth(1).locator('img')).toHaveCount(0);
 await page.getByRole('button',{name:'Profil & Ziel',exact:true}).click();
 await input.setInputFiles('public/icon-512.png');
 await expect(page.getByRole('button',{name:'Profil speichern',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Profil speichern',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('Profil gespeichert.');
 await page.getByRole('button',{name:'Bild entfernen',exact:true}).click();
 await expect(preview).toHaveCount(0);
 await page.getByRole('button',{name:'Profil speichern',exact:true}).click();
 await page.reload();
 await expect(page.locator('.card-player').first().locator('img')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test('invalid photo files show feedback and keep the existing photo',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Profil & Ziel',exact:true}).click();
 const input=page.getByLabel('Profilbild auswählen',{exact:true});
 await input.setInputFiles('public/icon-192.png');
 const preview=page.locator('.profile-photo-preview img');
 await expect(preview).toBeVisible();
 const previous=await preview.getAttribute('src');
 await input.setInputFiles({name:'document.pdf',mimeType:'application/pdf',buffer:Buffer.from('not an image')});
 await expect(page.getByRole('alert')).toContainText('Bitte wähle eine Bilddatei');
 await expect(preview).toHaveAttribute('src',previous!);
 await input.setInputFiles({name:'broken.png',mimeType:'image/png',buffer:Buffer.from('broken image')});
 await expect(page.getByRole('alert')).toContainText('Dieses Bildformat konnte nicht geöffnet werden');
 await input.setInputFiles({name:'large.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(15*1024*1024+1)});
 await expect(page.getByRole('alert')).toContainText('höchstens 15 MB');
 await expect(preview).toHaveAttribute('src',previous!);
 await expect(page.getByRole('button',{name:'Profil speichern',exact:true})).toBeEnabled();
});
