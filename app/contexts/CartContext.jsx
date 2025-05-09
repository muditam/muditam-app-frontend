import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    const exists = cartItems.find((item) => item.id === product.id);
    if (exists) {
      setCartItems(prev =>
        prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const incrementItem = (productId) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementItem = (productId, forceRemove = false) => {
    setCartItems(prev =>
      forceRemove
        ? prev.filter(item => item.id !== productId)
        : prev.map(item =>
            item.id === productId
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item
          )
    );
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, incrementItem, decrementItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
