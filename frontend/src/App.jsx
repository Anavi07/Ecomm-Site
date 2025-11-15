import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <h1>E-Commerce Store</h1>
      {loading ? <p>Loading...</p> : (
        <div className="products">
          {products.length === 0 ? (
            <p>No products available</p>
          ) : (
            products.map(product => (
              <div key={product._id} className="product-card">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Price: ${product.price}</p>
                <p>Stock: {product.stock}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default App
