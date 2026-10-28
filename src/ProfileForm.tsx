import {useRef, useState} from 'react';
import {Check, ImagePlus, Trash2} from 'lucide-react';
import type {Player} from './data';
import {prepareProfileImage} from './profile-image';
export type ProfileValues = {name: string; team: string; photoURL: string};
export function Avatar({player, className = ''}: {player: Pick<Player, 'name' | 'initials' | 'photoURL'>; className?: string}) {
 const [failedUrl, setFailedUrl] = useState('');
 return <span className={`avatar ${className}`}>{player.photoURL && player.photoURL !== failedUrl
  ? <img src={player.photoURL} alt={`Profilbild von ${player.name}`} onError={() => setFailedUrl(player.photoURL!)}/>
  : player.initials}</span>;
}
export function ProfileForm({player, busy, onSave}: {player: Player; busy: boolean; onSave: (values: ProfileValues) => Promise<boolean>}) {
 const [photo, setPhoto] = useState<string | null>(null);
 const [processing, setProcessing] = useState(false);
 const [error, setError] = useState('');
 const [saveError, setSaveError] = useState('');
 const selection = useRef(0);
 const fileInput = useRef<HTMLInputElement>(null);
 const currentPhoto = photo ?? player.photoURL ?? '';
 return <form onSubmit={async e => {
  e.preventDefault(); if (processing || busy) return;
  setSaveError('');
  const data = new FormData(e.currentTarget);
  const ok = await onSave({name: String(data.get('name')).trim(), team: String(data.get('team')).trim(), photoURL: currentPhoto});
  if (!ok) setSaveError('Dein Profil konnte nicht gespeichert werden. Bitte prüfe die Verbindung und die Fehlermeldung.');
 }}>
  <div className="profile-photo-editor">
   <Avatar player={{...player, photoURL: currentPhoto}} className="profile-photo-preview"/>
   <div className="profile-photo-controls">
    <button type="button" className="secondary" disabled={busy || processing} onClick={() => fileInput.current?.click()}><ImagePlus size={16}/>{processing ? 'Bild wird vorbereitet …' : 'Bild auswählen'}</button>
    <input ref={fileInput} className="photo-file-input" type="file" accept="image/*" aria-label="Profilbild auswählen" disabled={busy || processing} onChange={async e => {
     const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; if (!file) return;
     const request = ++selection.current; setError(''); setProcessing(true);
     try { const result = await prepareProfileImage(file); if (request === selection.current) setPhoto(result); }
     catch (err) { if (request === selection.current) setError((err as Error).message); }
     finally { if (request === selection.current) setProcessing(false); }
    }}/>
    {currentPhoto && <button type="button" className="text-button" disabled={busy || processing} onClick={() => { selection.current++; setPhoto(''); setError(''); }}><Trash2 size={14}/>Bild entfernen</button>}
   </div>
  </div>
  <p className="photo-help">Wähle ein Foto aus deiner Galerie oder deinen Dateien. Es wird mittig zugeschnitten und verkleinert. Mit „Profil speichern“ übernimmst du die Änderung.</p>
  {error && <p className="form-error" role="alert">{error}</p>}
  <label>Name<input name="name" defaultValue={player.name} required maxLength={40} pattern=".*\S.*"/></label>
  <label>Verein / Mannschaft<input name="team" defaultValue={player.team} maxLength={80}/></label>
  {saveError && <p className="form-error" role="alert">{saveError}</p>}
  <button className="primary" disabled={busy || processing}>{busy ? 'Wird gespeichert …' : 'Profil speichern'}<Check size={16}/></button>
 </form>;
}
