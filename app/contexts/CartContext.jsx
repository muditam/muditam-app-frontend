import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userPhone, setUserPhone] = useState(null);

  // ✅ Load phone and cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userDetails');
        const storedCart = await AsyncStorage.getItem('cartItems');
        const phone = JSON.parse(storedUser || '{}')?.phone;

        if (!phone) {
          console.warn('Phone number not found in AsyncStorage. Set userDetails properly.');
          if (storedCart) {
            setCartItems(JSON.parse(storedCart));
          }
          return;
        }

        setUserPhone(phone);

        const res = await fetch(`http://192.168.1.15:3001/api/cart/${phone}`);
        const data = await res.json();

        if (res.ok && Array.isArray(data.items)) {
          setCartItems(data.items);
        } else if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
      }
    };

    loadCart();
  }, []);

  // ✅ Sync to backend + AsyncStorage when cart or phone changes
  useEffect(() => {
    AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));
    const syncCart = async () => {
      if (!userPhone) return;

      try {
        await fetch(`http://192.168.1.15:3001/api/cart/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: userPhone, items: cartItems }),
        });
      } catch (e) {
        console.error('Error syncing cart to backend:', e);
      }
    };

    if (cartItems.length > 0) {
      syncCart();
    }
  }, [cartItems, userPhone]);

  // ✅ Add to Cart
  const addToCart = (product) => {
    const exists = cartItems.find((item) => String(item.id) === String(product.id));
    if (exists) {
      setCartItems((prev) =>
        prev.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems((prev) => [...prev, { ...product, quantity: 1 }]);
    }
  };

  // ✅ Increment quantity
  const incrementItem = (productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(productId)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // ✅ Decrement quantity or remove
  const decrementItem = (productId, forceRemove = false) => {
    setCartItems((prev) =>
      forceRemove
        ? prev.filter((item) => String(item.id) !== String(productId))
        : prev.map((item) =>
            String(item.id) === String(productId)
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item
          )
    );
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, incrementItem, decrementItem, setCartItems }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
