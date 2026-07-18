export type CharacterGender = 'boy' | 'girl';
export type ProductCategory = 'outfit' | 'hair' | 'accessory' | 'weapon' | 'pet' | 'effect';
export type ProductRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopProduct {
  id: string;
  title: string;
  category: ProductCategory;
  gender: CharacterGender | 'unisex';
  rarity: ProductRarity;
  price: number;
  emoji: string;
  description: string;
  accent: string;
}
