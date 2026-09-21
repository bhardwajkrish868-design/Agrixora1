import React, { useState } from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  CreditCard, 
  Lock, 
  Download, 
  CheckCircle2, 
  Clock, 
  Receipt,
  ShieldCheck,
  Building,
  ArrowLeft,
  QrCode,
  Printer,
  X,
  Copy,
  CheckCheck
} from 'lucide-react';
import { StatCard } from '../components/StatCard';

export const BuyerPaymentsView: React.FC = () => {
  const { currentUser, orders, navigateBack } = useAgri();
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<any>(null);
  const [copiedTxn, setCopiedTxn] = useState(false);

  const myOrders = orders.filter(o => o.buyerId === currentUser.id);

  const totalSpent = myOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const inEscrow = myOrders.filter(o => o.paymentStatus === 'escrow_locked').reduce((sum, o) => sum + o.totalAmount, 0);
  const settled = myOrders.filter(o => o.paymentStatus === 'disbursed_to_farmer').reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
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
              <CreditCard className="w-6 h-6 text-emerald-600" />
              Buyer Payments & Escrow Ledger
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete transaction breakdown, platform fee receipts, and escrow settlement status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Multi-Tier Escrow Vault</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Procurement"
          value={`₹${totalSpent.toLocaleString('en-IN')}`}
          subtitle="All Orders"
          icon={CreditCard}
          colorScheme="blue"
        />

        <StatCard
          title="Locked in Escrow"
          value={`₹${inEscrow.toLocaleString('en-IN')}`}
          subtitle="Awaiting Delivery Verification"
          icon={Lock}
          colorScheme="amber"
        />

        <StatCard
          title="Settled to Farmers"
          value={`₹${settled.toLocaleString('en-IN')}`}
          subtitle="Completed Deliveries"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Payment Transactions & Transparent Invoices
          </h2>

          <button
            onClick={() => alert('All procurement GST invoices downloaded in ZIP format.')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All Invoices</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Farmer Base Amount</th>
                <th className="py-3 px-4">QC & Hub Fee</th>
                <th className="py-3 px-4">Logistics Fee</th>
                <th className="py-3 px-4">Total Paid (Escrow)</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Escrow QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {myOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No payment transactions yet. When you place orders on the marketplace, your payments and escrow ledger will appear here.
                  </td>
                </tr>
              ) : (
                myOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.transactionId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{order.orderNumber}</td>
                    <td className="py-3.5 px-4">₹{(order.produceAmount || (order.quantity * order.pricePerUnit)).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-slate-500">₹{(order.collectionFee || Math.round(order.totalAmount * 0.01)).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-slate-500">₹{(order.logisticsFee ?? 40).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                        {order.paymentMethod?.toLowerCase().includes('upi') || order.paymentMethod?.toLowerCase().includes('qr') ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200 flex items-center gap-1 text-[11px]">
                            <QrCode className="w-3 h-3 text-purple-600" />
                            UPI QR
                          </span>
                        ) : (
                          <span className="text-slate-600">{order.paymentMethod || 'Escrow Transfer'}</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.paymentStatus === 'disbursed_to_farmer'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.paymentStatus === 'disbursed_to_farmer' ? 'SETTLED' : 'ESCROW LOCKED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                        title="View Escrow QR Receipt"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        <span>QR Pass</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🧾 Official Escrow QR & Digital Payment Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Official Escrow Payment Receipt</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Ref: {selectedReceiptOrder.orderNumber}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Escrow Status Banner */}
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="font-extrabold text-emerald-950 block">ICICI Bank Smart Escrow Vault</span>
                  <span className="text-[10px] text-emerald-800">Funds 100% Protected & Segregated</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-mono font-extrabold text-[10px]">
                {selectedReceiptOrder.paymentStatus === 'disbursed_to_farmer' ? 'SETTLED' : 'LOCKED'}
              </span>
            </div>

            {/* Dynamic Verification QR Code */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=${encodeURIComponent(
                  `https://farm2future.gov.in/verify/escrow/${selectedReceiptOrder.orderNumber}`
                )}`}
                alt="Escrow Verification QR"
                className="w-36 h-36 rounded-xl bg-white p-1.5 shadow-sm border border-slate-200"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Digital Escrow Payment Pass
                </span>
                <span className="text-[10px] text-slate-500">
                  Scan to verify authentic escrow lock & GST invoice on Govt Nodal Gateway
                </span>
              </div>
            </div>

            {/* Itemized Breakdown */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Transaction ID:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                  <span>{selectedReceiptOrder.transactionId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedReceiptOrder.transactionId);
                      setCopiedTxn(true);
                      setTimeout(() => setCopiedTxn(false), 2000);
                    }}
                    className="text-slate-400 hover:text-emerald-600"
                  >
                    {copiedTxn ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="font-semibold text-slate-800">{selectedReceiptOrder.paymentMethod || 'UPI QR'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Produce Cost:</span>
                <span className="font-semibold text-slate-800">₹{(selectedReceiptOrder.produceAmount || (selectedReceiptOrder.quantity * selectedReceiptOrder.pricePerUnit)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Buyer Delivery Fee:</span>
                <span className="font-semibold text-emerald-700">₹{selectedReceiptOrder.logisticsFee || 35}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Escrow Locked:</span>
                <span className="text-emerald-700 font-extrabold">₹{selectedReceiptOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
