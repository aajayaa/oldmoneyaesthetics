const fs = require('fs');
const PDFDocument = require('pdfkit');

function generateInvoice(order, path) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(path));

  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text(`Customer: ${order.shippingInfo.fullName}`);
  doc.text(`Email: ${order.email || 'Not Provided'}`);
  doc.moveDown();

  doc.text('Items:');
  order.items.forEach(item => {
    doc.text(`${item.name} - ${item.quantity} x $${item.price}`);
  });

  doc.moveDown();
  doc.text(`Total: $${(order.total / 100).toFixed(2)}`);
  doc.end();
}

module.exports = generateInvoice;
