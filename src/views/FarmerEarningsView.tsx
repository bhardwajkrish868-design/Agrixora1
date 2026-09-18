import React from 'react';
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
  ArrowLeft
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
  const { currentUser, orders, navigateBack } = useAgri();

  const myOrders = orders.filter(o => o.farmerId === currentUser.id);

  const settledEarnings = myOrders
    .filter(o => o.paymentStatus === 'disbursed_to_farmer')
    .reduce((sum, o) => sum + o.farmerPayout, 0);

  const lockedInEscrow = myOrders
    .filter(o => o.paymentStatus === 'escrow_locked')
    .reduce((sum, o) => sum + o.farmerPayout, 0);

  const monthlyPayouts = [
    { month: 'Apr 26', amount: 145000 },
    { month: 'May 26', amount: 210000 },
    { month: 'Jun 26', amount: 185000 },
    { month: 'Jul 26', amount: 320000 },
    { month: 'Aug 26', amount: settledEarnings || 331500 },
  ];

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
                  <span className="font-semibold">{currentUser.name}</span>
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
            onClick={() => alert('Bank statements downloaded for tax and kisan credit card verification.')}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
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
              {myOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.transactionId}</td>
                  <td className="py-3.5 px-4 font-medium">{order.orderNumber}</td>
                  <td className="py-3.5 px-4">{order.cropName} ({order.quantity} {order.unit})</td>
                  <td className="py-3.5 px-4 font-semibold">₹{(order.produceAmount || (order.quantity * order.pricePerUnit)).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-slate-500">-₹{order.platformFee.toLocaleString('en-IN')}</td>
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
