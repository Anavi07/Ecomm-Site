import React from 'react';
import { useParams } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();
  return (
    <main style={{maxWidth:900, margin:'20px auto', padding:'0 16px'}}>
      <h2>Product Detail</h2>
      <p>Showing product for id: {id}</p>
    </main>
  );
}
