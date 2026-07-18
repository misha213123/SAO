import { useState } from 'react';
import type { CharacterGender } from '../types/shop';

export function CharacterPage() {
  const [gender, setGender] = useState<CharacterGender>('boy');
  return (
    <section className="page character-page">
      <header className="page-header"><span>Твой аватар</span><strong>Персонаж</strong></header>
      <div className="gender-switch">
        <button className={gender === 'boy' ? 'selected' : ''} onClick={() => setGender('boy')}>Парень</button>
        <button className={gender === 'girl' ? 'selected' : ''} onClick={() => setGender('girl')}>Девушка</button>
      </div>
      <div className={`character-stage ${gender}`}>
        <div className="character-silhouette">{gender === 'boy' ? '🧑🏻‍🎤' : '👩🏻‍🎤'}</div>
        <span className="floating-tag tag-one">Базовый образ</span>
        <span className="floating-tag tag-two">0 предметов</span>
      </div>
      <div className="character-actions">
        <button type="button">Случайный образ</button>
        <button type="button" className="primary-button">Сохранить</button>
      </div>
    </section>
  );
}
