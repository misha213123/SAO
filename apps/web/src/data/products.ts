import type { ShopProduct } from '../types/shop';

export const products: ShopProduct[] = [
  { id: 'night-runner', title: 'Куртка ночного бегуна', category: 'outfit', gender: 'boy', rarity: 'epic', price: 1280, emoji: '🧥', description: 'Уличный образ с неоновыми вставками.', accent: '#3f9fc9' },
  { id: 'sky-idol', title: 'Комплект небесной идолки', category: 'outfit', gender: 'girl', rarity: 'legendary', price: 1650, emoji: '👗', description: 'Лёгкий сценический костюм с сияющими деталями.', accent: '#55b7d9' },
  { id: 'moon-blade', title: 'Лунный клинок', category: 'weapon', gender: 'unisex', rarity: 'legendary', price: 1450, emoji: '🗡️', description: 'Декоративный клинок с анимированным следом.', accent: '#60a5fa' },
  { id: 'void-wings', title: 'Крылья пустоты', category: 'effect', gender: 'unisex', rarity: 'epic', price: 1300, emoji: '🪽', description: 'Эффект крыльев для профиля и лобби.', accent: '#66c8e8' },
  { id: 'shadow-cat', title: 'Теневой котёнок', category: 'pet', gender: 'unisex', rarity: 'rare', price: 800, emoji: '🐈‍⬛', description: 'Маленький спутник, который реагирует на эмоции.', accent: '#22d3ee' },
  { id: 'pixel-hair', title: 'Пиксельная причёска', category: 'hair', gender: 'unisex', rarity: 'rare', price: 620, emoji: '💇', description: 'Причёска в стиле виртуального города.', accent: '#34d399' },
];
