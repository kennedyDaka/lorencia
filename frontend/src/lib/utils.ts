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
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
        h2 { text-align: center; margin: 0; }
        .line { display: flex; justify-content: space-between; margin: 4px 0; }
        .total { border-top: 1px dashed #000; margin-top: 8px; padding-top: 8px; font-weight: bold; }
        .footer { text-align: center; margin-top: 16px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h2>${sale.businessName}</h2>
      <p style="text-align:center;font-size:12px;">${new Date(sale.createdAt).toLocaleString()}</p>
      <hr/>
      ${sale.items.map(i => `
        <div class="line">
          <span>${i.productName} x${i.qty}</span>
          <span>MWK ${(i.unitPrice * i.qty).toLocaleString()}</span>
        </div>
      `).join("")}
      <div class="line total">
        <span>TOTAL</span>
        <span>MWK ${sale.total.toLocaleString()}</span>
      </div>
      <div class="line">
        <span>Payment</span>
        <span>${sale.paymentMethod}</span>
      </div>
      <div class="footer">Thank you!</div>
    </body>
    </html>
  `;
}
