import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMK(amount: number): string {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency: "MWK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildReceiptHTML(sale: {
  id: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  items: Array<{ productName: string; qty: number; unitPrice: number }>;
  businessName: string;
}): string {
  const date = new Date(sale.createdAt);
  const dateStr = date.toLocaleDateString("en-MW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-MW", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemRows = sale.items
    .map(
      (i) => `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#3d2b1f;">${i.productName}</td>
        <td style="padding:6px 0;font-size:13px;color:#6b5b4f;text-align:center;">x${i.qty}</td>
        <td style="padding:6px 0;font-size:13px;color:#3d2b1f;text-align:right;font-weight:500;">MK ${(i.unitPrice * i.qty).toLocaleString()}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Receipt - ${sale.businessName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: #faf7f2;
      display: flex;
      justify-content: center;
      padding: 24px;
    }
    .receipt {
      width: 320px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 16px rgba(93,64,55,0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #c7493a 0%, #a83a2e 100%);
      padding: 24px 20px;
      text-align: center;
    }
    .header h1 {
      color: #fff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .header p {
      color: rgba(255,255,255,0.8);
      font-size: 11px;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .body {
      padding: 20px;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #8b7b6f;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px dashed #e8e0d8;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table th {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #8b7b6f;
      font-weight: 600;
      text-align: left;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0ebe5;
    }
    table th:last-child { text-align: right; }
    table th:nth-child(2) { text-align: center; }
    .divider {
      border: none;
      border-top: 1px dashed #e8e0d8;
      margin: 16px 0;
    }
    .totals {
      margin-top: 4px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #6b5b4f;
    }
    .total-row.grand {
      font-size: 18px;
      font-weight: 700;
      color: #3d2b1f;
      padding-top: 10px;
      margin-top: 6px;
      border-top: 2px solid #3d2b1f;
    }
    .payment {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: #f8f4ef;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 12px;
      color: #6b5b4f;
    }
    .payment span:last-child {
      font-weight: 600;
      text-transform: capitalize;
      color: #3d2b1f;
    }
    .footer {
      text-align: center;
      padding: 20px;
      border-top: 1px solid #f0ebe5;
    }
    .footer p {
      font-size: 12px;
      color: #8b7b6f;
    }
    .footer .brand {
      font-size: 16px;
      font-weight: 700;
      color: #c7493a;
      margin-top: 4px;
    }
    .footer .tagline {
      font-size: 10px;
      color: #b8a898;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    @media print {
      body { padding: 0; background: none; display: block; }
      .receipt { box-shadow: none; border-radius: 0; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>${sale.businessName}</h1>
      <p>Transaction Receipt</p>
    </div>
    <div class="body">
      <div class="meta">
        <span>${dateStr}</span>
        <span>${timeStr}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      <hr class="divider" />
      <div class="totals">
        <div class="total-row">
          <span>Subtotal (${sale.items.reduce((s, i) => s + i.qty, 0)} items)</span>
          <span>MK ${sale.total.toLocaleString()}</span>
        </div>
        <div class="total-row grand">
          <span>Total</span>
          <span>MK ${sale.total.toLocaleString()}</span>
        </div>
      </div>
      <div class="payment">
        <span>Payment Method</span>
        <span>${sale.paymentMethod}</span>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for your purchase!</p>
      <div class="brand">Lorencia</div>
      <div class="tagline">Cafe & Gift Shop</div>
    </div>
  </div>
</body>
</html>`;
}
