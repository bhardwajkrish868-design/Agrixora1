import React from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { StatCard } from '../components/StatCard';

export const BuyerPaymentsView: React.FC = () => {
  const { currentUser, orders, navigateBack } = useAgri();

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {myOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
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
                    <td className="py-3.5 px-4 text-slate-500">{order.paymentMethod}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.paymentStatus === 'disbursed_to_farmer'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.paymentStatus === 'disbursed_to_farmer' ? 'SETTLED' : 'ESCROW LOCKED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
