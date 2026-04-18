import wadapav from "@/assets/item-wadapav.jpg";
import bhel from "@/assets/item-bhel.jpg";
import bhaji from "@/assets/item-bhaji.jpg";
import tea from "@/assets/item-tea.jpg";
import water from "@/assets/item-water.jpg";
import colddrink from "@/assets/item-colddrink.jpg";
import pan from "@/assets/item-pan.jpg";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  description: string;
};

export const menuItems: MenuItem[] = [
  {
    id: "wadapav",
    name: "Wadapav",
    price: 13,
    originalPrice: 15,
    image: wadapav,
    badge: "🔥 Special Offer",
    description: "Crispy vada in soft pav with chutney",
  },
  { id: "bhel", name: "Bhel", price: 40, image: bhel, description: "Tangy puffed-rice chaat" },
  { id: "bhaji", name: "Pav Bhaji", price: 80, image: bhaji, description: "Spicy mashed veggies with butter pav" },
  { id: "tea", name: "Cutting Chai", price: 12, image: tea, description: "Hot masala tea, glass cutting" },
  { id: "water", name: "Water Bottle", price: 20, image: water, description: "Chilled mineral water 1L" },
  { id: "colddrink", name: "Cold Drink", price: 30, image: colddrink, description: "Assorted soft drinks 250ml" },
  { id: "pan", name: "Sweet Paan", price: 25, image: pan, description: "Classic meetha paan" },
];
