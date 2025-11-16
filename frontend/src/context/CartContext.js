import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  APPLY_DISCOUNT: 'APPLY_DISCOUNT',
  SET_SHIPPING: 'SET_SHIPPING'
};

// Initial cart state
const initialCartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  discount: 0,
  discountCode: '',
  shipping: 0,
  tax: 0,
  total: 0,
  appliedDiscounts: []
};

// Cart reducer for state management
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item._id === product._id);
      
      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { ...product, quantity }];
      }
      
      return calculateCartTotals({ ...state, items: newItems });
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const newItems = state.items.filter(item => item._id !== productId);
        return calculateCartTotals({ ...state, items: newItems });
      }
      
      const newItems = state.items.map(item =>
        item._id === productId ? { ...item, quantity } : item
      );
      
      return calculateCartTotals({ ...state, items: newItems });
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const { productId } = action.payload;
      const newItems = state.items.filter(item => item._id !== productId);
      return calculateCartTotals({ ...state, items: newItems });
    }

    case CART_ACTIONS.CLEAR_CART: {
      return { ...initialCartState };
    }

    case CART_ACTIONS.LOAD_CART: {
      const { cartData } = action.payload;
      return calculateCartTotals({ ...state, ...cartData });
    }

    case CART_ACTIONS.APPLY_DISCOUNT: {
      const { discountCode, discountAmount, discountType } = action.payload;
      
      let discount = 0;
      if (discountType === 'percentage') {
        discount = (state.subtotal * discountAmount) / 100;
      } else {
        discount = discountAmount;
      }
      
      // Don't let discount exceed subtotal
      discount = Math.min(discount, state.subtotal);
      
      const newState = {
        ...state,
        discount,
        discountCode,
        appliedDiscounts: [...state.appliedDiscounts, {
          code: discountCode,
          amount: discount,
          type: discountType
        }]
      };
      
      return calculateCartTotals(newState);
    }

    case CART_ACTIONS.SET_SHIPPING: {
      const { shippingAmount } = action.payload;
      return calculateCartTotals({ ...state, shipping: shippingAmount });
    }

    default:
      return state;
  }
};

// Calculate cart totals
const calculateCartTotals = (state) => {
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate tax (8% for demonstration)
  const taxRate = 0.08;
  const tax = (subtotal - state.discount) * taxRate;
  
  const total = subtotal - state.discount + state.shipping + tax;
  
  return {
    ...state,
    totalItems,
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

// Create cart context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: { cartData } });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart state changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartState));
  }, [cartState]);

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, quantity }
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId }
    });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const applyDiscount = (discountCode, discountAmount, discountType = 'fixed') => {
    dispatch({
      type: CART_ACTIONS.APPLY_DISCOUNT,
      payload: { discountCode, discountAmount, discountType }
    });
  };

  const setShipping = (shippingAmount) => {
    dispatch({
      type: CART_ACTIONS.SET_SHIPPING,
      payload: { shippingAmount }
    });
  };

  // Helper functions
  const getItemQuantity = (productId) => {
    const item = cartState.items.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  const isItemInCart = (productId) => {
    return cartState.items.some(item => item._id === productId);
  };

  // Predefined discount codes for demonstration
  const availableDiscounts = {
    'SAVE10': { amount: 10, type: 'percentage', description: '10% off your order' },
    'WELCOME50': { amount: 50, type: 'fixed', description: '₹50 off your first order' },
    'FREESHIP': { amount: 0, type: 'shipping', description: 'Free shipping' }
  };

  const validateDiscountCode = (code) => {
    return availableDiscounts[code.toUpperCase()] || null;
  };

  // Calculate shipping based on total (in Rupees)
  const calculateShipping = (subtotal) => {
    if (subtotal >= 2000) return 0; // Free shipping over ₹2000
    if (subtotal >= 1000) return 100;  // ₹100 shipping ₹1000-₹1999
    return 200; // ₹200 shipping under ₹1000
  };

  const cartValue = {
    // State
    ...cartState,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyDiscount,
    setShipping,
    
    // Helper functions
    getItemQuantity,
    isItemInCart,
    validateDiscountCode,
    calculateShipping,
    
    // Available discounts for UI
    availableDiscounts
  };

  return (
    <CartContext.Provider value={cartValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export { CART_ACTIONS };