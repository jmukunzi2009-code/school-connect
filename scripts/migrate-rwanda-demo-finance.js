const fs = require('fs');
const { Client } = require('pg');

if (fs.existsSync('.env.local')) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 0) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const expectedInvoices = Array.from({ length: 5 }, (_, index) =>
  `INV-KHIA-2026-${String(index + 1).padStart(3, '0')}`
);

async function migrate() {
  await client.connect();
  await client.query('BEGIN');

  try {
    const schoolRes = await client.query(
      `SELECT id FROM schools WHERE slug = 'kigali-heights' AND country = 'Rwanda' FOR UPDATE`
    );
    if (schoolRes.rows.length !== 1) {
      throw new Error('Expected exactly one Kigali Heights Rwanda demo school.');
    }

    const schoolId = schoolRes.rows[0].id;
    const invoicesRes = await client.query(
      `SELECT id, invoice_number, total_amount, amount_paid, balance, status
       FROM invoices
       WHERE school_id = $1 AND invoice_number LIKE 'INV-KHIA-2026-%'
       ORDER BY invoice_number
       FOR UPDATE`,
      [schoolId]
    );
    const invoices = invoicesRes.rows;
    if (
      invoices.length !== expectedInvoices.length ||
      invoices.some((invoice, index) => invoice.invoice_number !== expectedInvoices[index])
    ) {
      throw new Error('Demo invoices do not match the expected five-record fixture; no records were changed.');
    }

    const invoiceIds = new Set(invoices.map((invoice) => invoice.id));
    const validInvoice = (invoice) => {
      const oldAmounts = Number(invoice.total_amount) === 450 &&
        Number(invoice.amount_paid) === 200 &&
        Number(invoice.balance) === 250;
      const rwandanAmounts = Number(invoice.total_amount) === 450000 &&
        Number(invoice.amount_paid) === 200000 &&
        Number(invoice.balance) === 250000;
      return invoice.status === 'partially_paid' && (oldAmounts || rwandanAmounts);
    };
    if (invoices.some((invoice) => !validInvoice(invoice))) {
      throw new Error('Demo invoice amounts do not match the expected old or RWF fixture; no records were changed.');
    }

    const paymentsRes = await client.query(
      `SELECT p.id, p.receipt_number, p.amount, p.invoice_id, i.invoice_number
       FROM payments p
       JOIN invoices i ON i.id = p.invoice_id
       WHERE i.school_id = $1
         AND i.invoice_number LIKE 'INV-KHIA-2026-%'
         AND p.receipt_number LIKE 'REC-KHIA-2026-%'
       ORDER BY p.receipt_number
       FOR UPDATE OF p`,
      [schoolId]
    );
    const payments = paymentsRes.rows;
    const validPayment = (payment) => {
      const expectedReceipt = `REC-${payment.invoice_number.slice(4)}`;
      const oldAmount = Number(payment.amount) === 200;
      const rwandanAmount = Number(payment.amount) === 200000;
      return invoiceIds.has(payment.invoice_id) &&
        payment.receipt_number === expectedReceipt &&
        (oldAmount || rwandanAmount);
    };
    if (
      payments.length !== expectedInvoices.length ||
      new Set(payments.map((payment) => payment.invoice_id)).size !== expectedInvoices.length ||
      payments.some((payment) => !validPayment(payment))
    ) {
      throw new Error('Demo payments do not match the expected five-record fixture; no records were changed.');
    }

    let invoiceUpdates = 0;
    for (const invoice of invoices) {
      if (Number(invoice.total_amount) === 450) {
        await client.query(
          `UPDATE invoices
           SET total_amount = 450000, amount_paid = 200000, balance = 250000
           WHERE id = $1`,
          [invoice.id]
        );
        invoiceUpdates += 1;
      }
    }

    let paymentUpdates = 0;
    for (const payment of payments) {
      if (Number(payment.amount) === 200) {
        await client.query(
          `UPDATE payments SET amount = 200000 WHERE id = $1`,
          [payment.id]
        );
        paymentUpdates += 1;
      }
    }

    await client.query('COMMIT');
    console.log(`Rwanda demo finance migration complete: ${invoiceUpdates} invoices and ${paymentUpdates} payments updated.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

migrate()
  .catch((error) => {
    console.error('Rwanda demo finance migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
