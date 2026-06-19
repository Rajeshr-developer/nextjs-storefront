import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="not-found">
      <div className="not-found-icon">📦</div>
      <div className="not-found-title">Product Not Found</div>
      <div className="not-found-subtitle">
        This product doesn't exist or has been removed
      </div>
      <Link href="/products" className="btn btn-primary">
        ← Back to Products
      </Link>
    </div>
  );
}
