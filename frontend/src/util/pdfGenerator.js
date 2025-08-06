// pdfGenerator.js - Final Version with Arabic Support
// Dynamic imports to handle missing dependencies
let jsPDF = null;

const loadDependencies = async () => {
  try {
    if (!jsPDF) {
      const jsPDFModule = await import("jspdf");
      jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    }

    // Try to load autotable plugin (optional)
    try {
      await import("jspdf-autotable");
    } catch (autoTableError) {
      console.warn("jspdf-autotable not available, will use manual tables");
    }

    return true;
  } catch (error) {
    console.error("Failed to load PDF dependencies:", error);
    return false;
  }
};

// Arabic font data (base64 encoded Cairo font)
const arabicFontData = {
  normal: "data:font/woff2;base64,d09GMgABAAAAAA...", // This would be the actual font data
  bold: "data:font/woff2;base64,d09GMgABAAAAAA...", // This would be the actual font data
};

// Function to add Arabic font to jsPDF
const addArabicFont = (doc) => {
  try {
    // Add Arabic font support using built-in fonts that support Arabic
    // For now, we'll use a fallback approach
    return false;
  } catch (error) {
    console.warn("Arabic font not available, using fallback");
    return false;
  }
};

// Function to check if text contains Arabic characters
const containsArabic = (text) => {
  if (!text) return false;
  const arabicRegex =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

// Advanced PDF Generator using jsPDF with Arabic Support
export const generateOrderPDF = async (order) => {
  try {
    // Check if dependencies are loaded
    const dependenciesLoaded = await loadDependencies();
    if (!dependenciesLoaded) {
      throw new Error("PDF dependencies not available");
    }

    if (!jsPDF) {
      throw new Error("jsPDF not available");
    }

    const doc = new jsPDF("p", "mm", "a5"); // Changed from a4 to a5

    // Check if order data exists
    if (!order) {
      throw new Error("Order data not available");
    }

    // Since jsPDF has issues with Arabic fonts, we'll use the HTML fallback
    // This ensures proper Arabic rendering
    console.warn(
      "jsPDF Arabic support limited, using HTML fallback for better Arabic rendering"
    );
    return generateSimplePDF(order);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw to be caught by fallback
  }
};

// Simple fallback PDF generator without external dependencies
export const generateSimplePDF = (order) => {
  try {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getStatusText = (status) => {
      switch (status?.toLowerCase()) {
        case "pending":
          return "في الانتظار";
        case "in_transit":
          return "قيد النقل";
        case "picked_up":
          return "تم الاستلام";
        case "delivered":
          return "تم التوصيل";
        case "cancelled":
          return "ملغي";
        case "returned":
          return "مرتجع";
        default:
          return status || "غير محدد";
      }
    };

    // Create a printable HTML page with proper Arabic font embedding
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("يرجى السماح للنوافذ المنبثقة لتتمكن من طباعة المستند");
      return false;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>طلب ${order.orderNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@200;300;400;500;600;700;800;900&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Cairo', 'Noto Naskh Arabic', 'Amiri', 'Arial', sans-serif;
            margin: 10px;
            direction: rtl;
            text-align: right;
            color: #333;
            line-height: 1.3;
            font-size: 11px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            max-width: 148mm; /* A5 width */
            margin: 10px auto;
          }
          .header {
            background: #c19a5b;
            color: white;
            padding: 10px;
            text-align: center;
            margin: -10px -10px 15px -10px;
            border-radius: 0;
          }
          .header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 10px;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          .order-info {
            border-bottom: 2px solid #c19a5b;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .order-info h2 {
            color: #c19a5b;
            margin-bottom: 5px;
            font-size: 16px;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
            font-weight: bold;
          }
          .order-info p {
            margin: 2px 0;
            font-size: 11px;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          .section {
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          .section h3 {
            background: #f5f5f5;
            padding: 6px 8px;
            margin: 0 0 8px 0;
            color: #333;
            font-size: 13px;
            border-right: 2px solid #c19a5b;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
            font-weight: bold;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .info-box {
            border: 1px solid #ddd;
            padding: 8px;
            border-radius: 4px;
            background: #fafafa;
          }
          .info-box h4 {
            color: #c19a5b;
            margin: 0 0 5px 0;
            font-size: 11px;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
            font-weight: bold;
          }
          .info-box p {
            margin: 2px 0;
            font-size: 10px;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          .collection-box {
            border: 2px solid #22c55e;
            background: #f0fdf4;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            color: #22c55e;
            font-size: 12px;
            font-weight: bold;
            margin: 8px 0;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 8px;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 6px 0;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 5px 6px;
            text-align: right;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
            font-size: 9px;
          }
          th {
            background-color: #c19a5b;
            color: white;
            font-weight: bold;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .detail-item {
            margin: 4px 0;
            padding: 4px;
            background: #f9f9f9;
            border-radius: 3px;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          .detail-label {
            font-weight: bold;
            color: #c19a5b;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          .buttons {
            text-align: center;
            margin: 15px 0;
            gap: 8px;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            font-weight: bold;
            transition: background-color 0.3s;
            min-width: 80px;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          .btn-print {
            background: #c19a5b;
            color: white;
          }
          .btn-print:hover {
            background: #a87c4a;
          }
          .btn-close {
            background: #666;
            color: white;
          }
          .btn-close:hover {
            background: #555;
          }
          .creator-info {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 8px;
            margin-top: 10px;
          }
          .creator-info h4 {
            color: #c19a5b;
            margin: 0 0 5px 0;
            font-size: 11px;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
            font-weight: bold;
          }
          .creator-info p {
            margin: 2px 0;
            font-size: 9px;
            font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
          }
          @media print {
            body { 
              margin: 0;
              font-size: 9px;
              font-family: 'Cairo', 'Noto Naskh Arabic', sans-serif;
              max-width: 148mm;
              width: 148mm;
              height: 210mm;
            }
            .no-print { 
              display: none !important;
            }
            .header {
              margin: 0;
              padding: 8px;
            }
            .section {
              page-break-inside: avoid;
              margin-bottom: 10px;
            }
            .info-grid {
              display: block;
            }
            .info-box {
              margin-bottom: 6px;
            }
            .header h1 {
              font-size: 16px;
            }
            .order-info h2 {
              font-size: 14px;
            }
            .section h3 {
              font-size: 11px;
              padding: 4px 6px;
            }
            .collection-box {
              font-size: 10px;
              padding: 6px;
            }
            .info-box h4 {
              font-size: 9px;
            }
            .info-box p {
              font-size: 8px;
            }
            .creator-info p {
              font-size: 8px;
            }
            table th, table td {
              font-size: 7px;
              padding: 3px 4px;
            }
          }
          @media (max-width: 768px) {
            .info-grid {
              grid-template-columns: 1fr;
            }
            .buttons {
              flex-direction: column;
              align-items: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تفاصيل الطلب</h1>
          <p>تاريخ الطباعة: ${formatDate(new Date())}</p>
        </div>
        
        <div class="order-info">
          <h2>رقم الطلب: ${order.orderNumber}</h2>
          <p><strong>الحالة:</strong> ${getStatusText(order.status)}</p>
          <p><strong>تاريخ الإنشاء:</strong> ${formatDate(order.createdAt)}</p>
        </div>
        
        <div class="section">
          <h3>بيانات المرسل والمستلم</h3>
          <div class="info-grid">
            <div class="info-box">
              <h4>المرسل</h4>
              <p><strong>الاسم:</strong> ${order.senderName || "غير محدد"}</p>
              <p><strong>الهاتف:</strong> ${order.senderPhone || "غير محدد"}</p>
            </div>
            <div class="info-box">
              <h4>المستلم</h4>
              <p><strong>الاسم:</strong> ${order.receiverName || "غير محدد"}</p>
              <p><strong>الهاتف:</strong> ${
                order.receiverPhone || "غير محدد"
              }</p>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>تفاصيل الشحنة</h3>
          ${
            order.packageType ||
            order.weight ||
            order.address ||
            order.packageDescription ||
            order.notes
              ? `
            <table>
              ${
                order.packageType
                  ? `<tr><th>نوع الشحنة</th><td>${order.packageType}</td></tr>`
                  : ""
              }
              ${
                order.weight
                  ? `<tr><th>الوزن</th><td>${order.weight} كجم</td></tr>`
                  : ""
              }
              ${
                order.address
                  ? `<tr><th>العنوان</th><td>${order.address}</td></tr>`
                  : ""
              }
              ${
                order.packageDescription
                  ? `<tr><th>وصف الشحنة</th><td>${order.packageDescription}</td></tr>`
                  : ""
              }
              ${
                order.notes
                  ? `<tr><th>ملاحظات</th><td>${order.notes}</td></tr>`
                  : ""
              }
            </table>
          `
              : "<p>لا توجد تفاصيل إضافية للشحنة</p>"
          }
        </div>
        
        ${
          order.isCollection && order.collectionPrice
            ? `
          <div class="section">
            <h3>تفاصيل التحصيل</h3>
            <div class="collection-box">
              مبلغ التحصيل: ${parseFloat(order.collectionPrice).toFixed(2)} ج.م
            </div>
          </div>
        `
            : ""
        }
        
        ${
          order.User
            ? `
          <div class="section">
            <h3>معلومات منشئ الطلب</h3>
            <div class="creator-info">
              <h4>البيانات الشخصية</h4>
              <p><strong>الاسم:</strong> ${order.User.name || "غير محدد"}</p>
              <p><strong>البريد الإلكتروني:</strong> ${
                order.User.email || "غير محدد"
              }</p>
              <p><strong>رقم الهاتف:</strong> ${
                order.User.phone || "غير محدد"
              }</p>
              ${
                order.User.address
                  ? `<p><strong>العنوان:</strong> ${order.User.address}</p>`
                  : ""
              }
            </div>
          </div>
        `
            : ""
        }
        
        <div class="footer">
          <p>تم إنشاء هذا المستند تلقائياً من نظام إدارة الطلبات</p>
          <p>© ${new Date().getFullYear()} - جميع الحقوق محفوظة</p>
        </div>
        
        <div class="no-print buttons">
          <button class="btn btn-print" onclick="window.print()">
            طباعة / حفظ كـ PDF
          </button>
          <button class="btn btn-close" onclick="window.close()">
            إغلاق النافذة
          </button>
        </div>
        
        <script>
          // Auto focus on print button
          window.onload = function() {
            document.querySelector('.btn-print').focus();
          };
          
          // Print shortcut
          document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'p') {
              e.preventDefault();
              window.print();
            }
          });
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Auto print after a short delay
    setTimeout(() => {
      try {
        printWindow.print();
      } catch (printError) {
        console.warn("Auto print failed:", printError);
      }
    }, 1000);

    return true;
  } catch (error) {
    console.error("Error generating simple PDF:", error);
    alert("حدث خطأ أثناء إنشاء المستند للطباعة");
    return false;
  }
};

// Test function to verify Arabic support
export const testArabicSupport = () => {
  const testOrder = {
    orderNumber: "ORD-TEST-123",
    status: "pending",
    createdAt: new Date().toISOString(),
    senderName: "أحمد محمد علي",
    senderPhone: "0123456789",
    receiverName: "فاطمة أحمد حسن",
    receiverPhone: "0987654321",
    address: "شارع النيل، القاهرة، مصر",
    packageType: "طرد صغير",
    weight: "2.5",
    notes: "ملاحظات خاصة بالشحنة",
    isCollection: true,
    collectionPrice: "150.00",
    User: {
      name: "محمد أحمد",
      email: "mohamed@example.com",
      phone: "01123456789",
    },
  };

  console.log("Testing Arabic PDF generation...");
  return generateOrderPDFWithFallback(testOrder);
};

// Enhanced error handling for Arabic text
const handleArabicTextError = (error, fallbackFunction) => {
  console.error("Arabic text rendering error:", error);

  // If the main PDF generation fails due to Arabic font issues,
  // automatically fall back to HTML version
  if (error.message.includes("font") || error.message.includes("Arabic")) {
    console.warn("Arabic font issue detected, using HTML fallback");
    return fallbackFunction();
  }

  throw error;
};

// Main export function with enhanced fallback
export const generateOrderPDFWithFallback = async (order) => {
  if (!order) {
    alert("بيانات الطلب غير متوفرة");
    return false;
  }

  try {
    // Since jsPDF has issues with Arabic fonts, we'll use the HTML fallback directly
    // This ensures proper Arabic rendering
    return generateSimplePDF(order);
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("حدث خطأ أثناء إنشاء المستند. يرجى المحاولة مرة أخرى.");
    return false;
  }
};

// Individual exports for specific use cases
export const generateAdvancedPDF = generateOrderPDF;
export const generatePrintablePDF = generateSimplePDF;

// Default export
export default generateOrderPDFWithFallback;
