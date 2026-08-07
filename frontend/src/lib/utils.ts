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

interface WeeklySaleRow {
  id: string;
  date: string;
  customer: string;
  paymentMethod: string;
  total: number;
  itemCount: number;
  items: Array<{ productName: string; qty: number; unitPrice: number; lineTotal: number }>;
}

export function buildWeeklySalesReportHTML(
  cafeSales: { sales: WeeklySaleRow[]; totalRevenue: number; totalSales: number; totalItems: number },
  giftShopSales: { sales: WeeklySaleRow[]; totalRevenue: number; totalSales: number; totalItems: number },
  fromDate: string,
  toDate: string,
): string {
  const fmt = (n: number) => new Intl.NumberFormat("en-MW", { style: "currency", currency: "MWK", minimumFractionDigits: 0 }).format(n);
  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  function renderTable(sales: WeeklySaleRow[]): string {
    if (sales.length === 0) {
      return '<p style="text-align:center;color:#8b7b6f;padding:20px;">No sales for this period.</p>';
    }
    const rows = sales.map((s) => {
      const itemLines = s.items.map((i) => `${i.productName} x${i.qty}`).join(", ");
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ebe5;font-size:13px;color:#3d2b1f;">${fmtDate(s.date)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ebe5;font-size:13px;color:#6b5b4f;">${s.customer}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ebe5;font-size:13px;color:#6b5b4f;text-transform:capitalize;">${s.paymentMethod}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ebe5;font-size:12px;color:#8b7b6f;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${itemLines}">${itemLines}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ebe5;font-size:13px;color:#3d2b1f;text-align:right;font-weight:600;">${fmt(s.total)}</td>
      </tr>`;
    }).join("");
    return `<table style="width:100%;border-collapse:collapse;">
      <thead><tr>
        <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8b7b6f;border-bottom:2px solid #e8e0d8;font-weight:600;">Date</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8b7b6f;border-bottom:2px solid #e8e0d8;font-weight:600;">Customer</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8b7b6f;border-bottom:2px solid #e8e0d8;font-weight:600;">Payment</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8b7b6f;border-bottom:2px solid #e8e0d8;font-weight:600;">Items</th>
        <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8b7b6f;border-bottom:2px solid #e8e0d8;font-weight:600;">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function renderSection(title: string, icon: string, data: { sales: WeeklySaleRow[]; totalRevenue: number; totalSales: number; totalItems: number }): string {
    return `
    <div style="margin-bottom:32px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="font-size:20px;">${icon}</span>
        <h2 style="font-size:18px;font-weight:700;color:#3d2b1f;margin:0;">${title}</h2>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:16px;">
        <div style="background:#f8f4ef;border-radius:8px;padding:12px 16px;flex:1;">
          <div style="font-size:11px;color:#8b7b6f;text-transform:uppercase;letter-spacing:1px;">Total Sales</div>
          <div style="font-size:20px;font-weight:700;color:#3d2b1f;">${data.totalSales}</div>
        </div>
        <div style="background:#f8f4ef;border-radius:8px;padding:12px 16px;flex:1;">
          <div style="font-size:11px;color:#8b7b6f;text-transform:uppercase;letter-spacing:1px;">Items Sold</div>
          <div style="font-size:20px;font-weight:700;color:#3d2b1f;">${data.totalItems}</div>
        </div>
        <div style="background:#f0f7f2;border-radius:8px;padding:12px 16px;flex:1;">
          <div style="font-size:11px;color:#8b7b6f;text-transform:uppercase;letter-spacing:1px;">Revenue</div>
          <div style="font-size:20px;font-weight:700;color:#2d7a3a;">${fmt(data.totalRevenue)}</div>
        </div>
      </div>
      ${renderTable(data.sales)}
    </div>`;
  }

  const combinedRevenue = cafeSales.totalRevenue + giftShopSales.totalRevenue;
  const combinedSales = cafeSales.totalSales + giftShopSales.totalSales;
  const combinedItems = cafeSales.totalItems + giftShopSales.totalItems;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Weekly Sales Report - Lorencia</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; background: #faf7f2; padding: 32px; color: #3d2b1f; }
    @media print {
      body { padding: 0; background: #fff; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <button onclick="window.print()" class="no-print" style="position:fixed;top:16px;right:16px;background:#c7493a;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
    Print Report
  </button>

  <div style="max-width:900px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:700;color:#c7493a;letter-spacing:0.5px;">Lorencia</h1>
      <p style="font-size:12px;color:#8b7b6f;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">Cafe &amp; Gift Shop</p>
      <div style="margin-top:16px;padding:12px;background:#f8f4ef;border-radius:8px;display:inline-block;">
        <span style="font-size:14px;font-weight:600;color:#3d2b1f;">Weekly Sales Report</span>
        <span style="font-size:13px;color:#6b5b4f;margin-left:8px;">${fmtDate(fromDate)} &ndash; ${fmtDate(toDate)}</span>
      </div>
    </div>

    <div style="display:flex;gap:16px;margin-bottom:24px;">
      <div style="flex:1;background:#fff;border:1px solid #e8e0d8;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:11px;color:#8b7b6f;text-transform:uppercase;letter-spacing:1px;">Combined Revenue</div>
        <div style="font-size:24px;font-weight:700;color:#2d7a3a;">${fmt(combinedRevenue)}</div>
      </div>
      <div style="flex:1;background:#fff;border:1px solid #e8e0d8;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:11px;color:#8b7b6f;text-transform:uppercase;letter-spacing:1px;">Total Sales</div>
        <div style="font-size:24px;font-weight:700;color:#3d2b1f;">${combinedSales}</div>
      </div>
      <div style="flex:1;background:#fff;border:1px solid #e8e0d8;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:11px;color:#8b7b6f;text-transform:uppercase;letter-spacing:1px;">Total Items</div>
        <div style="font-size:24px;font-weight:700;color:#3d2b1f;">${combinedItems}</div>
      </div>
    </div>

    <div style="background:#fff;border:1px solid #e8e0d8;border-radius:12px;padding:24px;">
      ${renderSection("Lorencia Cafe", "\u2615", cafeSales)}
      <hr style="border:none;border-top:2px solid #f0ebe5;margin:24px 0;" />
      ${renderSection("Lorencia Gift Shop", "\uD83C\uDF81", giftShopSales)}
    </div>

    <div style="text-align:center;margin-top:24px;font-size:11px;color:#b8a898;">
      Generated on ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
    </div>
  </div>
</body>
</html>`;
}
