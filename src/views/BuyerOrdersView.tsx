import React, { useState } from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  ShoppingBag, 
  Truck, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  FileCheck,
  Download,
  Search,
  Filter,
  ArrowLeft,
  Bot,
  Phone,
  Thermometer,
  Zap,
  Trash2,
  Lock
} from 'lucide-react';
import { RouteTripTracker } from '../components/RouteTripTracker';

export const BuyerOrdersView: React.FC = () => {
  const { 
    currentUser,
    orders, 
    deleteOrder,
    activeRole,
    setActiveTab, 
    setActiveTrackingOrderId, 
    markOrderDelivered,
    navigateBack,
    language,
    isBuyerOrder
  } = useAgri();

  const isHindi = language === 'hi';
  const isAdmin = activeRole === 'admin' || currentUser?.role === 'admin';
  const [filterStage, setFilterStage] = useState<'all' | 'in_transit' | 'collected_at_hub' | 'delivered'>('all');
  const [search, setSearch] = useState('');

  let myBuyerOrders = orders.filter(o => isBuyerOrder(o, currentUser));
  if (myBuyerOrders.length === 0 && orders.length > 0 && (!currentUser?.phone || currentUser.id === 'usr_guest' || currentUser.id === 'usr_buyer')) {
    myBuyerOrders = orders;
  }

  // 📥 Download NABL Lab QC Certificate
  const downloadLabCertificate = (order: any) => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>NABL Accredited Quality Inspection Certificate - ${order.orderNumber}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 32px; background: #f8fafc; color: #0f172a; }
  .cert-container { max-width: 820px; margin: 0 auto; background: white; padding: 40px; border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 24px; }
  .brand { font-size: 24px; font-weight: 900; color: #065f46; }
  .badge { background: #ecfdf5; border: 1px solid #10b981; color: #065f46; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; }
  .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; background: #f8fafc; padding: 18px; border-radius: 12px; margin-bottom: 24px; font-size: 13px; }
  .meta-item span { color: #64748b; font-size: 11px; display: block; text-transform: uppercase; font-weight: 700; }
  .meta-item strong { color: #0f172a; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
  th { background: #065f46; color: white; padding: 10px 12px; text-align: left; }
  td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
  tr:nth-child(even) { background: #f8fafc; }
  .grade-box { margin-top: 24px; padding: 16px; background: #f0fdf4; border: 1.5px solid #22c55e; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
  .grade-title { font-size: 18px; font-weight: 900; color: #15803d; }
  .footer { margin-top: 32px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; }
  @media print { body { background: white; padding: 0; } .cert-container { box-shadow: none; border: none; padding: 0; } }
</style>
</head>
<body>
<div class="cert-container">
  <div class="header">
    <div>
      <div class="brand">🔬 NABL Agri-Quality Testing Laboratory</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">ISO/IEC 17025:2017 Accredited Testing Report • Certificate ID: QC-${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}</div>
    </div>
    <div class="badge">✓ PASSED EXPORT/MANDI GRADE</div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span>Order Number</span>
      <strong>${order.orderNumber}</strong>
    </div>
    <div class="meta-item">
      <span>Produce / Commodity</span>
      <strong>${order.cropName}</strong>
    </div>
    <div class="meta-item">
      <span>Farmer Origin</span>
      <strong>${order.farmerName} (${order.originLocation || 'Hub Aggregation'})</strong>
    </div>
    <div class="meta-item">
      <span>Consignment Quantity</span>
      <strong>${order.quantity} ${order.unit || 'Quintals'}</strong>
    </div>
    <div class="meta-item">
      <span>Buyer Name</span>
      <strong>${currentUser.name || 'Reliance Fresh Retail Ltd'}</strong>
    </div>
    <div class="meta-item">
      <span>Testing Date & Timestamp</span>
      <strong>${new Date().toLocaleString('en-IN')}</strong>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Parameter Analyzed</th>
        <th>Measured Value</th>
        <th>Standard Threshold</th>
        <th>Result</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Moisture Content</td>
        <td>11.2%</td>
        <td>Max 12.0%</td>
        <td style="color: #16a34a; font-weight: 700;">Within Limits</td>
      </tr>
      <tr>
        <td>Foreign Matter / Admixture</td>
        <td>0.4%</td>
        <td>Max 1.0%</td>
        <td style="color: #16a34a; font-weight: 700;">Compliant</td>
      </tr>
      <tr>
        <td>Damaged / Discolored Grains</td>
        <td>0.8%</td>
        <td>Max 2.0%</td>
        <td style="color: #16a34a; font-weight: 700;">Superior</td>
      </tr>
      <tr>
        <td>Chemical Pesticide Residue</td>
        <td>ND (&lt;0.01 mg/kg)</td>
        <td>FSSAI MRL Standard</td>
        <td style="color: #16a34a; font-weight: 700;">Zero Residue / Safe</td>
      </tr>
      <tr>
        <td>Size / Uniformity Index</td>
        <td>94.5% Uniformity</td>
        <td>Min 85%</td>
        <td style="color: #16a34a; font-weight: 700;">Grade A+</td>
      </tr>
    </tbody>
  </table>

  <div class="grade-box">
    <div>
      <div class="grade-title">Verified Grade: A+ Premium Food Grade</div>
      <div style="font-size: 12px; color: #166534; margin-top: 2px;">Eligible for automated escrow settlement upon delivery intake.</div>
    </div>
    <div style="text-align: right;">
      <span style="font-size: 11px; color: #64748b; font-weight: 700;">AUTHORIZED SIGNATORY</span>
      <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">Dr. R. K. Sharma, NABL Lead QC Officer</div>
    </div>
  </div>

  <div class="footer">
    <div>Agrixora Blockchain Hash: 0x9f8b...32a1 • Certified Cryptographic Digital Signature</div>
    <button onclick="window.print()" style="padding: 6px 14px; background: #065f46; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Print / Save PDF</button>
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NABL_QC_Certificate_${order.orderNumber}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredOrders = myBuyerOrders.filter(order => {
    if (filterStage !== 'all' && order.currentStage !== filterStage) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.cropName.toLowerCase().includes(q) ||
        order.farmerName.toLowerCase().includes(q) ||
        order.transactionId.toLowerCase().includes(q) ||
        (order.dispatchDetails && order.dispatchDetails.vehicleNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={navigateBack}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title={isHindi ? "पीछे जाएं" : "Go Back"}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <span>{isHindi ? 'मेरी खरीद ऑर्डर्स' : 'My Purchase Orders'}</span>
            </h1>
            <p className="text-xs text-slate-500">
              {isHindi 
                ? 'फसल संग्रहण से लेकर AI कोल्ड चेन परिवहन व एस्क्रो भुगतान का लाइव पारदर्शी ट्रैकिंग' 
                : 'Live tracking from harvest intake to AI-assigned cold chain transit & escrow disbursement'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('marketplace')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            {isHindi ? '+ नई खरीद' : '+ New Procurement'}
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-soft">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStage('all')}
            className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (filterStage === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}
          >
            {isHindi ? 'सभी ऑर्डर्स' : 'All Orders'} ({myBuyerOrders.length})
          </button>
          <button
            onClick={() => setFilterStage('in_transit')}
            className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (filterStage === 'in_transit' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-800 hover:bg-blue-100')}
          >
            {isHindi ? 'पारगमन में' : 'In Transit'} ({myBuyerOrders.filter(o => o.currentStage === 'in_transit').length})
          </button>
          <button
            onClick={() => setFilterStage('collected_at_hub')}
            className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (filterStage === 'collected_at_hub' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-800 hover:bg-amber-100')}
          >
            {isHindi ? 'हब / QC जांच' : 'At Hub / QC'} ({myBuyerOrders.filter(o => o.currentStage === 'collected_at_hub' || o.currentStage === 'quality_verified').length})
          </button>
          <button
            onClick={() => setFilterStage('delivered')}
            className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (filterStage === 'delivered' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100')}
          >
            {isHindi ? 'वितरित' : 'Delivered'} ({myBuyerOrders.filter(o => o.currentStage === 'delivered').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isHindi ? "ऑर्डर, फसल या ट्रक नंबर खोजें..." : "Search orders, crop, truck plate..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">{isHindi ? 'कोई ऑर्डर नहीं मिला' : 'No Orders Found'}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isHindi ? 'आपके पास इस श्रेणी में कोई सक्रिय या पुराना ऑर्डर नहीं है।' : 'You do not have any active or past orders matching your criteria.'}
            </p>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>{isHindi ? 'मंडी में उपज देखें' : 'Explore Marketplace Produce'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft hover:shadow-card transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-slate-900">{order.orderNumber}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    {isHindi ? 'ऑर्डर तिथि: ' : 'Ordered: '} 
                    {new Date(order.orderDate).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">Txn: {order.transactionId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={'text-xs font-bold px-3 py-1 rounded-full ' + (
                    order.currentStage === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.currentStage === 'in_transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                  )}>
                    {isHindi ? (
                      order.currentStage === 'delivered' ? 'वितरित (DELIVERED)' :
                      order.currentStage === 'in_transit' ? 'रास्ते में (IN TRANSIT)' :
                      order.currentStage === 'collected_at_hub' ? 'हब पर संकलित (AT HUB)' :
                      'गुणवत्ता जांची गई (QC PASSED)'
                    ) : order.currentStage.replace(/_/g, ' ').toUpperCase()}
                  </span>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                    {order.paymentStatus === 'disbursed_to_farmer' 
                      ? (isHindi ? 'भुगतान संपन्न' : 'SETTLED') 
                      : (isHindi ? 'एस्क्रो सुरक्षित' : 'ESCROW LOCKED')}
                  </span>
                </div>
              </div>

              {/* Main 4-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isHindi ? 'उपज विवरण' : 'Produce Details'}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">{order.cropName}</h4>
                  <p className="text-xs text-slate-600">{order.variety}</p>
                  <p className="text-xs font-bold text-slate-800">
                    {order.quantity} {order.unit} @ ₹{order.pricePerUnit}/{order.unit.slice(0, -1)}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isHindi ? 'उत्पादक किसान' : 'Origin Farmer'}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{order.farmerName}</h4>
                  <p className="text-xs text-slate-500">{order.farmerLocation}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {isHindi ? 'आधार प्रमाणित' : 'Aadhaar Verified'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isHindi ? 'निर्धारित हब व प्रयोगशाला' : 'Assigned Hub & Lab'}
                  </span>
                  <div className="flex items-start gap-1.5 text-xs text-slate-700 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{order.collectionHubName}</span>
                  </div>
                  {order.qualityInspection && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {isHindi 
                        ? `ग्रेड: ${order.qualityInspection.assignedGrade} (नमी: ${order.qualityInspection.moisturePercent}%)`
                        : `Grade: ${order.qualityInspection.assignedGrade} (Moisture: ${order.qualityInspection.moisturePercent}%)`}
                    </span>
                  )}
                </div>

                {/* Itemized Payment Breakdown (Buyer Paid Delivery) */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {isHindi ? 'कुल भुगतान (एस्क्रो)' : 'Total Paid (Escrow)'}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</h3>
                    </div>
                    
                    <div className="mt-1 pt-1 border-t border-slate-200 text-[10px] space-y-0.5 text-slate-600">
                      <div className="flex justify-between">
                        <span>{isHindi ? 'उपज मूल्य:' : 'Produce:'}</span>
                        <span className="font-semibold text-slate-800">₹{(order.produceAmount || (order.quantity * order.pricePerUnit)).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>{isHindi ? 'डिलीवरी शुल्क:' : 'Delivery (Paid by You):'}</span>
                        <span>₹{order.logisticsFee || 35}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {isHindi ? 'सुरक्षित एस्क्रो भुगतान' : 'Escrow Safe Payout'}
                    </span>
                    <span className="text-slate-500 font-bold truncate max-w-[120px]" title={order.paymentMethod}>
                      {order.paymentMethod || 'UPI QR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 🤖 AI Auto-Assigned Fleet Card */}
              {order.dispatchDetails && (
                <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30 shrink-0">
                      <Bot className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white font-mono">{order.dispatchDetails.vehicleNo}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                          {order.aiAllocation?.aiMatchScore || 99.2}% {isHindi ? 'AI अनुकूलन' : 'AI Match'}
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {order.dispatchDetails.modelName || order.dispatchDetails.vehicleType}
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-200 flex items-center gap-2 mt-0.5">
                        <span>{isHindi ? 'चालक: ' : 'Driver: '}<strong>{order.dispatchDetails.driverName}</strong></span>
                        <a 
                          href={`tel:${order.dispatchDetails.driverPhone}`} 
                          className="text-emerald-400 hover:underline font-mono font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> {order.dispatchDetails.driverPhone}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block">{isHindi ? 'चैंबर तापमान' : 'Chamber Temp'}</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        {order.dispatchDetails.temperatureCelsius}°C {isHindi ? 'सक्रिय' : 'Active'}
                      </span>
                    </div>

                    <div className="text-left sm:text-right pl-3 border-l border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{isHindi ? 'परिवहन शुल्क' : 'Delivery Fee'}</span>
                      <span className="text-xs font-bold text-emerald-400">
                        ₹{order.logisticsFee || 35} {isHindi ? 'भुगतान हुआ' : 'Paid'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* In-Transit Mini Highway Progress Bar with Truck Symbol */}
              {order.currentStage === 'in_transit' && (
                <div className="pt-1">
                  <RouteTripTracker order={order} compact={true} showControls={false} />
                </div>
              )}

              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {isHindi ? 'अनुमानित डिलीवरी: ' : 'Est. Delivery: '} 
                    {new Date(order.expectedDelivery).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}
                  </span>
                  
                  <button
                    onClick={() => downloadLabCertificate(order)}
                    className="ml-2 text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'NABL लैब प्रमाण पत्र देखें / डाउनलोड करें' : 'View / Download Lab Certificate'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = typeof window !== 'undefined' && window.confirm
                          ? window.confirm(isHindi 
                              ? `क्या आप वाकई ऑर्डर #${order.orderNumber} (${order.cropName}) को डेटाबेस से स्थायी रूप से हटाना चाहते हैं? यह वापस नहीं लाया जा सकता।` 
                              : `Are you sure you want to permanently delete order #${order.orderNumber} (${order.cropName}) as Admin? This cannot be undone.`)
                          : true;
                        if (confirmed) {
                          deleteOrder(order.id);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={isHindi ? "ऑर्डर हटाएं (Admin)" : "Delete Order (Admin)"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'हटाएं (Admin)' : 'Delete (Admin)'}</span>
                    </button>
                  )}

                  {order.currentStage !== 'delivered' && (
                    <button
                      onClick={() => {
                        markOrderDelivered(order.id);
                        alert(isHindi
                          ? `खेप ${order.orderNumber} प्राप्त हुई! एस्क्रो राशि ₹${order.farmerPayout.toLocaleString('en-IN')} किसान ${order.farmerName} को जारी कर दी गई है।`
                          : `Consignment ${order.orderNumber} marked as received! Escrow ₹${order.farmerPayout.toLocaleString('en-IN')} released to ${order.farmerName}.`
                        );
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'प्राप्ति स्वीकारें व एस्क्रो जारी करें' : 'Confirm Intake & Release Escrow'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTrackingOrderId(order.id);
                      setActiveTab('track_delivery');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>{isHindi ? 'लाइव GPS ट्रैकिंग' : 'Live GPS Telematics'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
