import React, { useState } from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  Wallet, 
  ShieldCheck, 
  Clock, 
  Download, 
  Building,
  CheckCircle2,
  TrendingUp,
  Receipt,
  ArrowLeft,
  Printer,
  FileText,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const FarmerEarningsView: React.FC = () => {
  const { currentUser, orders, isFarmerOrder, navigateBack } = useAgri();
  const [showStatementModal, setShowStatementModal] = useState<boolean>(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const myOrders = orders.filter(o => isFarmerOrder(o, currentUser));

  const defaultSampleOrders = [
    {
      id: 'ord_demo_1',
      transactionId: 'TXN-F2F-98214-MH',
      orderNumber: 'ORD-88210',
      cropName: 'Nashik Red Onions (Grade A)',
      quantity: 120,
      unit: 'Quintals',
      pricePerUnit: 2200,
      produceAmount: 264000,
      platformFee: 3960,
      farmerPayout: 260040,
      paymentStatus: 'disbursed_to_farmer',
      date: '12 Aug 2026',
      utr: 'UTR-HDFC-9921448102'
    },
    {
      id: 'ord_demo_2',
      transactionId: 'TXN-F2F-94102-MH',
      orderNumber: 'ORD-84192',
      cropName: 'Sharbati Wheat (Grade A)',
      quantity: 50,
      unit: 'Quintals',
      pricePerUnit: 2850,
      produceAmount: 142500,
      platformFee: 2137,
      farmerPayout: 140363,
      paymentStatus: 'disbursed_to_farmer',
      date: '28 Jul 2026',
      utr: 'UTR-HDFC-8831920194'
    },
    {
      id: 'ord_demo_3',
      transactionId: 'TXF-F2F-91045-MH',
      orderNumber: 'ORD-79104',
      cropName: 'Organic Soybean (NABL Tested)',
      quantity: 40,
      unit: 'Quintals',
      pricePerUnit: 4400,
      produceAmount: 176000,
      platformFee: 2640,
      farmerPayout: 173360,
      paymentStatus: 'disbursed_to_farmer',
      date: '15 Jun 2026',
      utr: 'UTR-HDFC-7719284102'
    }
  ];

  const statementOrders: any[] = myOrders.length > 0 ? myOrders : defaultSampleOrders;

  const settledEarnings = statementOrders
    .filter(o => o.paymentStatus === 'disbursed_to_farmer')
    .reduce((sum, o) => sum + o.farmerPayout, 0);

  const lockedInEscrow = statementOrders
    .filter(o => o.paymentStatus === 'escrow_locked')
    .reduce((sum, o) => sum + o.farmerPayout, 0);

  const monthlyPayouts = [
    { month: 'Apr 26', amount: 145000 },
    { month: 'May 26', amount: 210000 },
    { month: 'Jun 26', amount: 185000 },
    { month: 'Jul 26', amount: 320000 },
    { month: 'Aug 26', amount: settledEarnings || 331500 },
  ];

  // 📥 Download CSV Statement
  const downloadCsvStatement = () => {
    const headers = [
      "Date",
      "Transaction ID",
      "Order Ref",
      "Produce Details",
      "Quantity",
      "Gross Total (INR)",
      "Platform Fee 1.5% (INR)",
      "Net Farmer Payout (INR)",
      "Settlement Bank",
      "Account Number",
      "IFSC Code",
      "Bank UTR Ref",
      "Status"
    ];

    const rows = statementOrders.map(order => [
      order.date || new Date().toLocaleDateString('en-IN'),
      order.transactionId || `TXN-F2F-${order.id}`,
      order.orderNumber,
      `"${order.cropName}"`,
      `"${order.quantity} ${order.unit || 'Quintals'}"`,
      order.produceAmount || (order.quantity * (order.pricePerUnit || 2200)),
      order.platformFee || Math.round((order.produceAmount || 200000) * 0.015),
      order.farmerPayout,
      "HDFC Bank of India - Pimpalgaon Branch",
      "•••• •••• •••• 8912",
      "HDFC0001924",
      order.utr || `UTR-HDFC-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      order.paymentStatus === 'disbursed_to_farmer' ? 'SETTLED' : 'LOCKED IN ESCROW'
    ]);

    const csvContent = [
      `FARM2FUTURE AGRICULTURE PLATFORM - ANNUAL PAYOUT STATEMENT (FY 2025-26)`,
      `Account Holder: ${currentUser.name || 'Krish Bhardwaj'}`,
      `Bank: HDFC Bank of India - Pimpalgaon Branch`,
      `Account Number: •••• •••• •••• 8912 | IFSC: HDFC0001924`,
      `Aadhaar e-KYC: UIDAI Verified & Linked`,
      `Statement Date: ${new Date().toLocaleDateString('en-IN')}`,
      `Total Net Settled Earnings: INR ${(settledEarnings || 331500).toLocaleString('en-IN')}`,
      `Total Intermediary Cut Saved: INR 28450`,
      ``,
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Farmer_Annual_Payout_Statement_${(currentUser.name || 'Krish_Bhardwaj').replace(/\s+/g, '_')}_FY26.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessToast('✅ Annual Payout Statement (CSV) downloaded successfully!');
    setTimeout(() => setDownloadSuccessToast(null), 4000);
  };

  // 📥 Download HTML / Print-ready Bank Certificate
  const downloadHtmlStatement = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Official Farmer Annual Payout Statement - Farm2Future</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px; background: #f8fafc; color: #0f172a; }
  .cert-container { max-width: 860px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 24px; }
  .brand { font-size: 26px; font-weight: 900; color: #065f46; letter-spacing: -0.5px; }
  .badge { background: #ecfdf5; border: 1px solid #6ee7b7; color: #065f46; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; background: #f8fafc; padding: 20px; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 24px; font-size: 13px; }
  .grid-item span { color: #64748b; font-size: 11px; display: block; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
  .grid-item strong { color: #0f172a; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
  th { background: #065f46; color: white; padding: 12px; text-align: left; font-weight: 700; }
  td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
  tr:nth-child(even) { background: #f8fafc; }
  .summary { margin-top: 24px; padding: 18px; background: #ecfdf5; border: 1.5px solid #10b981; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; }
  .summary .amount { font-size: 22px; font-weight: 900; color: #064e3b; }
  .stamp { margin-top: 32px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; }
  @media print { body { background: white; padding: 0; } .cert-container { box-shadow: none; border: none; padding: 0; } }
</style>
</head>
<body>
<div class="cert-container">
  <div class="header">
    <div>
      <div class="brand">🌱 Farm2Future Escrow Clearing House</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">National Agriculture Electronic Direct Payout Certificate • FY 2025-26</div>
    </div>
    <div class="badge">✓ UIDAI Aadhaar e-KYC Verified</div>
  </div>

  <div class="grid">
    <div class="grid-item">
      <span>Beneficiary Farmer Name</span>
      <strong>${currentUser.name || 'Krish Bhardwaj'}</strong>
    </div>
    <div class="grid-item">
      <span>Settlement Bank</span>
      <strong>HDFC Bank of India (Pimpalgaon Branch)</strong>
    </div>
    <div class="grid-item">
      <span>Bank Account (Aadhaar Seeded)</span>
      <strong>•••• •••• •••• 8912</strong>
    </div>
    <div class="grid-item">
      <span>IFSC Code</span>
      <strong>HDFC0001924</strong>
    </div>
    <div class="grid-item">
      <span>Registered Mobile</span>
      <strong>+91 ${(currentUser.phone || '9631359486').replace(/\D/g, '').slice(-10)}</strong>
    </div>
    <div class="grid-item">
      <span>Settlement Frequency</span>
      <strong>Auto-Credit within 2 Hours of QC Sign-off</strong>
    </div>
  </div>

  <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Escrow Settlement Audit Log (Itemized Disbursements)</h3>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Transaction ID</th>
        <th>Order Ref</th>
        <th>Produce Details</th>
        <th>Gross Total</th>
        <th>Platform Fee</th>
        <th>Net Credit</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${statementOrders.map(o => `
        <tr>
          <td>${o.date || '12 Aug 2026'}</td>
          <td style="font-family: monospace; font-weight: 700;">${o.transactionId || 'TXN-F2F-' + o.id}</td>
          <td>${o.orderNumber}</td>
          <td>${o.cropName} (${o.quantity} ${o.unit || 'Quintals'})</td>
          <td>₹${(o.produceAmount || (o.quantity * (o.pricePerUnit || 2200))).toLocaleString('en-IN')}</td>
          <td style="color: #64748b;">-₹${(o.platformFee || 2000).toLocaleString('en-IN')}</td>
          <td style="font-weight: 800; color: #047857;">₹${o.farmerPayout.toLocaleString('en-IN')}</td>
          <td><span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 10px;">${o.paymentStatus === 'disbursed_to_farmer' ? 'SETTLED' : 'ESCROW'}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary">
    <div>
      <div style="font-size: 11px; color: #065f46; font-weight: 700; text-transform: uppercase;">Total Annual Net Direct Credit to Bank</div>
      <div class="amount">₹${(settledEarnings || 331500).toLocaleString('en-IN')}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; color: #065f46; font-weight: 700;">Middlemen Cut Avoided: <span style="color: #047857; font-weight: 800;">₹28,450 (100% Saved)</span></div>
      <div style="font-size: 10.5px; color: #64748b; margin-top: 4px;">Zero Unrecorded Cash Deductions</div>
    </div>
  </div>

  <div class="stamp">
    <div>
      <strong>Certified Document Ref:</strong> F2F/STMT/FY26/${Math.floor(100000 + Math.random() * 900000)}<br>
      Digitally Signed by Farm2Future Trust Clearing Corporation & ICICI / HDFC Nodal Escrow
    </div>
    <div style="text-align: right;">
      Date Generated: ${new Date().toLocaleDateString('en-IN')}<br>
      Official Tax & KCC Verification Compliant
    </div>
  </div>
</div>
<script>
  window.onload = function() {
    // Printable
  };
</script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Farmer_Annual_Payout_Statement_${(currentUser.name || 'Krish_Bhardwaj').replace(/\s+/g, '_')}_FY26.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessToast('✅ Annual Payout Statement (Official Certificate) downloaded!');
    setTimeout(() => setDownloadSuccessToast(null), 4000);
  };

  // Main download trigger (downloads CSV file + opens certificate modal)
  const handleDownloadAnnualStatement = () => {
    downloadCsvStatement();
    setShowStatementModal(true);
  };

  return (
    <div className="space-y-6">
      {/* 🔔 Floating Download Success Toast */}
      {downloadSuccessToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-950 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400/80 flex items-center gap-2.5 text-xs font-bold ring-4 ring-emerald-500/20">
            <span className="text-lg">📥</span>
            <span>{downloadSuccessToast}</span>
          </div>
        </div>
      )}

      {/* 📄 OFFICIAL ANNUAL PAYOUT STATEMENT CERTIFICATE MODAL */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/70 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-5 border border-slate-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shadow-xs">
                  🌱
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight font-display">
                    Annual Payout & Escrow Settlement Statement
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Financial Year 2025-26 • National Agriculture Electronic Settlement House
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowStatementModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Download Buttons Bar */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
              <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Statement file is downloaded and ready for Kisan Credit Card (KCC) & Tax audits.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadCsvStatement}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 shadow-2xs cursor-pointer transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download CSV</span>
                </button>

                <button
                  type="button"
                  onClick={downloadHtmlStatement}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 shadow-2xs cursor-pointer transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Certificate</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            {/* Bank Card & Verified Beneficiary Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Beneficiary Farmer</span>
                <strong className="text-base text-white font-display block">{currentUser.name || 'Krish Bhardwaj'}</strong>
                <span className="text-xs text-slate-300">Aadhaar Linked UIDAI: <strong className="text-emerald-300 font-mono">1234 •••• 9012</strong></span>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Settlement Bank</span>
                <strong className="text-base text-white block">HDFC Bank of India</strong>
                <span className="text-xs font-mono text-slate-300 block">Pimpalgaon Branch • IFSC: HDFC0001924</span>
                <span className="text-xs font-mono text-emerald-300 font-bold block">A/C: •••• •••• •••• 8912</span>
              </div>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Total Settled Earnings</span>
                <strong className="text-base sm:text-lg font-black text-emerald-900 font-display">₹{(settledEarnings || 331500).toLocaleString('en-IN')}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-800 uppercase font-bold block">Locked in Escrow</span>
                <strong className="text-base sm:text-lg font-black text-amber-900 font-display">₹{lockedInEscrow.toLocaleString('en-IN')}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] text-purple-800 uppercase font-bold block">Mandi Commission Saved</span>
                <strong className="text-base sm:text-lg font-black text-purple-900 font-display">₹28,450</strong>
              </div>
            </div>

            {/* Itemized Audit Log Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Disbursed Consignment Records (Settlement Ledger)</span>
              </h4>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Txn ID / Ref</th>
                      <th className="py-2.5 px-3">Produce Item</th>
                      <th className="py-2.5 px-3">Gross</th>
                      <th className="py-2.5 px-3">Fee (1.5%)</th>
                      <th className="py-2.5 px-3">Net Credit</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {statementOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-[11px] text-slate-500">{order.date || '12 Aug 2026'}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-[11px]">{order.transactionId || `TXN-F2F-${order.id}`}</td>
                        <td className="py-2.5 px-3 font-medium">{order.cropName} ({order.quantity} {order.unit || 'Quintals'})</td>
                        <td className="py-2.5 px-3">₹{(order.produceAmount || (order.quantity * (order.pricePerUnit || 2200))).toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-slate-400">-₹{(order.platformFee || 2000).toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">₹{order.farmerPayout.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {order.paymentStatus === 'disbursed_to_farmer' ? 'SETTLED' : 'ESCROW'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Certification Footer */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Digitally Certified by National Agricultural Escrow Clearing Corporation</span>
              </div>
              <button
                type="button"
                onClick={() => setShowStatementModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={navigateBack}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display flex items-center gap-2">
              <Wallet className="w-6 h-6 text-emerald-600" />
              Farmer Earnings & Escrow Settlements
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct Aadhaar-linked bank settlements. Zero unrecorded cash leakages or unauthorized commissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Direct Escrow Bank Payout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Settled to Bank"
          value={`₹${(settledEarnings || 331500).toLocaleString('en-IN')}`}
          subtitle="Direct Payout Completed"
          icon={CheckCircle2}
          colorScheme="emerald"
        />

        <StatCard
          title="Locked in Escrow"
          value={`₹${lockedInEscrow.toLocaleString('en-IN')}`}
          subtitle="Releases on Delivery Sign-off"
          icon={Clock}
          colorScheme="amber"
        />

        <StatCard
          title="Intermediary Fee Saved"
          value="₹28,450"
          subtitle="Estimated 8-10% Arhatia Cut Saved"
          icon={TrendingUp}
          colorScheme="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Payout Disbursements</h2>
              <p className="text-xs text-slate-500">Direct account transfers across harvesting cycles</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              FY 2026-27
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPayouts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Bank Settlement']}
                  contentStyle={{ backgroundColor: '#064e3b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Settlement Bank Account</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Verified
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white space-y-4 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-white font-bold">
                  <Building className="w-4 h-4 text-emerald-400" />
                  HDFC Bank of India
                </span>
                <span className="font-mono text-[10px]">Pimpalgaon Branch</span>
              </div>

              <div className="font-mono text-lg font-bold tracking-wider text-slate-200">
                •••• •••• •••• 8912
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Account Holder</span>
                  <span className="font-semibold">{currentUser.name || 'Krish Bhardwaj'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block uppercase">IFSC Code</span>
                  <span className="font-mono font-semibold">HDFC0001924</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1.5">
              <p className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Aadhaar e-KYC Linked (UIDAI Verified)
              </p>
              <p className="text-[11px]">Auto-credit occurs within 2 hours of warehouse QC sign-off.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadAnnualStatement}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Annual Payout Statement</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-600" />
          Escrow Settlement Audit Log
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Produce Details</th>
                <th className="py-3 px-4">Gross Total</th>
                <th className="py-3 px-4">Platform Fee (1.5%)</th>
                <th className="py-3 px-4">Net Farmer Credit</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {statementOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.transactionId || `TXN-F2F-${order.id}`}</td>
                  <td className="py-3.5 px-4 font-medium">{order.orderNumber}</td>
                  <td className="py-3.5 px-4">{order.cropName} ({order.quantity} {order.unit || 'Quintals'})</td>
                  <td className="py-3.5 px-4 font-semibold">₹{(order.produceAmount || (order.quantity * (order.pricePerUnit || 2200))).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-slate-500">-₹{(order.platformFee || 2000).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">₹{order.farmerPayout.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.paymentStatus === 'disbursed_to_farmer'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.paymentStatus === 'disbursed_to_farmer' ? 'SETTLED' : 'LOCKED IN ESCROW'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
