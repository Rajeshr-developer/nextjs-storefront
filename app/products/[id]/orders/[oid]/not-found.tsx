import Link from 'next/link';

export default function OrderNotFound() {
  return (
    <div className="not-found">
      <div className="not-found-icon">🛒</div>
      <div className="not-found-title">Order Not Found</div>
      <div className="not-found-subtitle">
        This order doesn't exist or doesn't belong to this product
      </div>
      <Link href="/orders" className="btn btn-primary">
        ← Back to Orders
      </Link>
    </div>
  );
}
