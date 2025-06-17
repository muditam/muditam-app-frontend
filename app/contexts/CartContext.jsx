import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userPhone, setUserPhone] = useState(null);

  // ✅ Helper: Validate product before adding
  const isValidProduct = (product) => {
    return (
      product &&
      typeof product.id !== 'undefined' &&
      typeof product.first_variant_id !== 'undefined' &&
      product.first_variant_id !== null &&
      product.first_variant_id !== 0
    );
  };

  // ✅ Load cart + user phone from AsyncStorage or backend
  useEffect(() => {
    const loadCart = async () => {
      try {
        const [storedUser, storedCart] = await Promise.all([
          AsyncStorage.getItem('userDetails'),
          AsyncStorage.getItem('cartItems'),
        ]);

        const phone = JSON.parse(storedUser || '{}')?.phone;
        if (phone) setUserPhone(phone);

        let parsedCart = [];
        if (storedCart) {
          parsedCart = JSON.parse(storedCart).filter(isValidProduct);
        }

        if (!phone) {
          console.warn('Phone number not found in AsyncStorage.');
          setCartItems(parsedCart);
          return;
        }

        const res = await fetch(`http://192.168.1.32:3001/api/cart/${phone}`);
        const data = await res.json();

        if (res.ok && Array.isArray(data.items)) {
          const filtered = data.items.filter(isValidProduct);
          setCartItems(filtered);
        } else {
          setCartItems(parsedCart);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
      }
    };

    loadCart();
  }, []);

  // ✅ Sync cart to backend + AsyncStorage when changed
  useEffect(() => {
    if (!userPhone || cartItems.length === 0) return;

    const syncCart = async () => {
      try {
        const validItems = cartItems.filter(isValidProduct);

        await fetch(`http://192.168.1.32:3001/api/cart/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: userPhone, items: validItems }),
        });

        await AsyncStorage.setItem('cartItems', JSON.stringify(validItems));
      } catch (e) {
        console.error('Error syncing cart to backend:', e);
      }
    };

    syncCart();
  }, [cartItems, userPhone]);

  // ✅ Add product to cart
  const addToCart = (product) => {
    if (!isValidProduct(product)) {
      console.warn('Invalid product cannot be added to cart:', product);
      return;
    }

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

  // ✅ Decrement or remove item
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
      value={{
        cartItems,
        addToCart,
        incrementItem,
        decrementItem,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
