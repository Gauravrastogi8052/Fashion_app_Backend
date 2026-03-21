import PDFDocument from "pdfkit";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { Product } from "../models/Products.js";
import { Op } from "sequelize";

// ============ GENERATE ORDERS REPORT PDF ============
export const generateOrdersReport = async (req, res) => {
  try {
    const { period } = req.query;
    let whereClause = {};
    let reportTitle = "Orders Report";

    const now = new Date();

    // Filter by period
    if (period === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      whereClause = { createdAt: { [Op.between]: [startOfDay, endOfDay] } };
      reportTitle = "Today's Orders Report";
    } else if (period === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      whereClause = { createdAt: { [Op.gte]: startOfWeek } };
      reportTitle = "Weekly Orders Report";
    } else if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      whereClause = { createdAt: { [Op.gte]: startOfMonth } };
      reportTitle = `${now.toLocaleString("en-IN", { month: "long", year: "numeric" })} Orders Report`;
    }

    // Fetch orders with filter
    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          include: [{ model: Product, attributes: ["name", "price", "category"] }]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="orders-report-${period}.pdf"`);
    doc.pipe(res);

    // Title
    doc.fontSize(24).font("Helvetica-Bold").text(reportTitle, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica").text(`Generated on: ${new Date().toLocaleString("en-IN")}`, { align: "center" });
    doc.moveDown(1);

    // Summary
    const totalAmount = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const statusCounts = {
      pending: orders.filter(o => o.status === "pending").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      delivered: orders.filter(o => o.status === "delivered").length,
      cancelled: orders.filter(o => o.status === "cancelled").length
    };

    doc.fontSize(12).font("Helvetica-Bold").text("Summary", { underline: true });
    doc.fontSize(10).font("Helvetica");
    doc.text(`Total Orders: ${orders.length}`);
    doc.text(`Total Revenue: ₹${totalAmount.toFixed(2)}`);
    doc.text(`Pending: ${statusCounts.pending} | Shipped: ${statusCounts.shipped} | Delivered: ${statusCounts.delivered} | Cancelled: ${statusCounts.cancelled}`);
    doc.moveDown(1);

    // Table Header
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 120;
    const col3 = 200;
    const col4 = 280;
    const col5 = 380;

    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Order ID", col1, tableTop);
    doc.text("User ID", col2, tableTop);
    doc.text("Amount", col3, tableTop);
    doc.text("Status", col4, tableTop);
    doc.text("Date", col5, tableTop);

    // Draw line
    doc.moveTo(col1 - 10, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Table rows
    let currentY = tableTop + 30;
    doc.fontSize(9).font("Helvetica");

    orders.forEach((order, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      doc.text(`#${order.id}`, col1, currentY);
      doc.text(`User ${order.userId}`, col2, currentY);
      doc.text(`₹${parseFloat(order.totalAmount).toFixed(2)}`, col3, currentY);
      doc.text(order.status, col4, currentY);
      doc.text(new Date(order.createdAt).toLocaleDateString("en-IN"), col5, currentY);

      currentY += 20;
    });

    // Footer
    doc.fontSize(8).text("This is an auto-generated report from Admin Dashboard", 50, 750, { align: "center" });

    doc.end();
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: err.message });
  }
};

// ============ GENERATE REVENUE REPORT PDF ============
export const generateRevenueReport = async (req, res) => {
  try {
    const { period } = req.query;
    let whereClause = { status: "delivered" }; // Only count delivered orders
    let reportTitle = "Revenue Report";

    const now = new Date();

    // Filter by period
    if (period === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      whereClause.createdAt = { [Op.between]: [startOfDay, endOfDay] };
      reportTitle = "Today's Revenue Report";
    } else if (period === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      whereClause.createdAt = { [Op.gte]: startOfWeek };
      reportTitle = "Weekly Revenue Report";
    } else if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      whereClause.createdAt = { [Op.gte]: startOfMonth };
      reportTitle = `${now.toLocaleString("en-IN", { month: "long", year: "numeric" })} Revenue Report`;
    }

    // Fetch orders
    const orders = await Order.findAll({
      where: whereClause,
      attributes: ["id", "totalAmount", "createdAt", "status"]
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="revenue-report-${period}.pdf"`);
    doc.pipe(res);

    // Title
    doc.fontSize(24).font("Helvetica-Bold").text(reportTitle, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica").text(`Generated on: ${new Date().toLocaleString("en-IN")}`, { align: "center" });
    doc.moveDown(1);

    // Summary
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const avgRevenue = orders.length > 0 ? totalRevenue / orders.length : 0;

    doc.fontSize(12).font("Helvetica-Bold").text("Revenue Summary", { underline: true });
    doc.fontSize(10).font("Helvetica");
    doc.text(`Total Orders: ${orders.length}`);
    doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
    doc.text(`Average Per Order: ₹${avgRevenue.toFixed(2)}`);
    doc.moveDown(1);

    // Table Header
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 150;
    const col3 = 280;

    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Order ID", col1, tableTop);
    doc.text("Amount", col2, tableTop);
    doc.text("Date", col3, tableTop);

    doc.moveTo(col1 - 10, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Table rows
    let currentY = tableTop + 30;
    doc.fontSize(9).font("Helvetica");

    orders.forEach((order) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      doc.text(`#${order.id}`, col1, currentY);
      doc.text(`₹${parseFloat(order.totalAmount).toFixed(2)}`, col2, currentY);
      doc.text(new Date(order.createdAt).toLocaleDateString("en-IN"), col3, currentY);

      currentY += 20;
    });

    doc.fontSize(8).text("This is an auto-generated report from Admin Dashboard", 50, 750, { align: "center" });

    doc.end();
  } catch (err) {
    console.error("Error generating revenue report:", err);
    res.status(500).json({ error: err.message });
  }
};
