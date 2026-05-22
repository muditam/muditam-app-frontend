// app/_layout.jsx
import { Slot } from 'expo-router';
import { CartProvider } from '../contexts/CartContext';
import { applyGlobalScrollDefaults } from '../utils/scrollDefaults';

applyGlobalScrollDefaults();

export default function RootLayout() {
  return (
    <CartProvider>
      <Slot />
    </CartProvider>
  );
}
 
