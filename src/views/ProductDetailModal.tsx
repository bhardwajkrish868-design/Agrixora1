import React, { useState, useEffect } from 'react';
import { useAgri } from '../context/AgriContext';
import { calculateOrderFees } from '../utils/pricingUtils';
import { calculateDistanceKm, geocodeLocation, getHyperlocalDispatchEstimate } from '../utils/geoUtils';
import { getAILogisticsPreview } from '../utils/aiLogisticsEngine';
import { 
  X, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Award, 
  Truck, 
  Lock, 
  CheckCircle2, 
  ShoppingBag, 
  Building2, 
  Sparkles, 
  Phone,
  Scale,
  Plus,
  Minus,
  CreditCard,
  Check,
  Zap,
  Clock,
  Bot,
  Thermometer,
  FileText,
  BadgePercent,
  Smartphone,
  QrCode,
  Copy,
  CheckCheck,
  Landmark,
  Wallet,
  ExternalLink
} from 'lucide-react';

// Synthesize pleasant SMS arrival chime via Web Audio API
const playSmsChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (_) {}
};

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedListingModal, 
    setSelectedListingModal, 
    currentUser, 
    userLocation,
    vehicles,
    orders,
    placeOrder, 
    setActiveTab,
    setActiveTrackingOrderId 
  } = useAgri();

  const [orderQty, setOrderQty] = useState<number>(50);
  const [deliveryAddress, setDeliveryAddress] = useState('AgroFresh Central Fulfilment Hub, Sector 18, Navi Mumbai, Maharashtra');
  const [pincode, setPincode] = useState('400705');
  const [paymentTab, setPaymentTab] = useState<'upi_qr' | 'neft_rtgs' | 'card' | 'credit'>('upi_qr');
  const [paymentMethod, setPaymentMethod] = useState('Instant UPI QR (krishbhardwaj326@naviaxis)');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderRef, setCreatedOrderRef] = useState('');
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any>(null);

  // Buyer Phone for Order & Transport SMS
  const [buyerMobileNumber, setBuyerMobileNumber] = useState<string>(() => {
    return currentUser?.phone ? currentUser.phone.replace(/\D/g, '').slice(-10) : '9631359486';
  });

  // Floating SMS Notification State
  const [smsNotification, setSmsNotification] = useState<{
    show: boolean;
    phone: string;
    orderNumber: string;
    cropName: string;
    quantity: string;
    totalAmount: number;
    vehicleNo: string;
    driverName: string;
    driverPhone: string;
    destination: string;
    timestamp: string;
    deliveredReal?: boolean;
    provider?: string;
  } | null>(null);

  useEffect(() => {
    if (selectedListingModal) {
      setOrderSuccess(false);
      setIsOrdering(false);
      const initialQty = Math.min(50, selectedListingModal.quantity);
      setOrderQty(initialQty > 0 ? initialQty : 1);
    }
  }, [selectedListingModal]);

  useEffect(() => {
    if (paymentTab === 'upi_qr') {
      setPaymentMethod('Instant UPI QR (krishbhardwaj326@naviaxis)');
    } else if (paymentTab === 'neft_rtgs') {
      setPaymentMethod('NEFT / RTGS Corporate Escrow');
    } else if (paymentTab === 'card') {
      setPaymentMethod('Debit / Credit Card (RuPay / Visa)');
    } else if (paymentTab === 'credit') {
      setPaymentMethod('Agri-Credit 30-Day Line');
    }
  }, [paymentTab]);

  if (!selectedListingModal) return null;

  const item = selectedListingModal;
  const maxAvailable = item.quantity;
  const currentOrderQty = Math.min(Math.max(1, orderQty), maxAvailable);

  const {
    produceAmount,
    platformFee,
    collectionFee,
    logisticsFee,
    logisticsLabel,
    totalPayable,
    farmerPayout,
    effectiveKg
  } = calculateOrderFees(currentOrderQty, item.pricePerUnit, item.unit || 'Quintals');

  const itemLat = item.latitude || geocodeLocation(item.farmerLocation || item.location || '', item.farmerState || item.state || '').lat;
  const itemLng = item.longitude || geocodeLocation(item.farmerLocation || item.location || '', item.farmerState || item.state || '').lng;
  const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, itemLat, itemLng);
  const isHyperlocal = distanceKm <= 10;
  const dispatchEstimate = getHyperlocalDispatchEstimate(distanceKm);

  const isPerishable = 
    item.category === 'Vegetables' || 
    item.category === 'Fruits' || 
    item.cropName.toLowerCase().includes('tomato') || 
    item.cropName.toLowerCase().includes('onion') ||
    item.storageCondition === 'Cold Storage';

  const aiPreview = getAILogisticsPreview(
    effectiveKg,
    item.cropName,
    isPerishable,
    item.farmerLocation || item.location || '',
    vehicles
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdering(true);

    const cleanPhone = buyerMobileNumber.replace(/\D/g, '').slice(-10) || '9631359486';

    const newOrder = placeOrder({
      listing: item,
      quantity: currentOrderQty,
      deliveryAddress,
      pincode,
      buyerOrg: currentUser?.businessName || currentUser?.name,
      paymentMethod
    });

    const vNo = newOrder.dispatchDetails?.vehicleNo || aiPreview.modelName || 'Assigned Truck';
    const dName = newOrder.dispatchDetails?.driverName || 'Assigned Driver';
    const dPhone = newOrder.dispatchDetails?.driverPhone || '+91 98231 44512';

    const smsMessage = `✅ Order Successful & Transport Booked! (Farm2Future)\nOrder #${newOrder.orderNumber}: ${currentOrderQty} ${item.unit} ${item.cropName} (₹${totalPayable.toLocaleString('en-IN')}) confirmed.\nTransport Vehicle: ${vNo}\nDriver: ${dName} (${dPhone})\nDelivery to: ${deliveryAddress}`;

    const callmebotKey = typeof window !== 'undefined' ? (localStorage.getItem('f2f_callmebot_api_key') || undefined) : undefined;

    // Direct WhatsApp Message & URL
    const whatsappOrderText = `✅ *Order Successful & Transport Booked! (Farm2Future)*\n\n` +
      `📦 *Order Ref:* ${newOrder.orderNumber}\n` +
      `🌾 *Produce:* ${currentOrderQty} ${item.unit} ${item.cropName}\n` +
      `💰 *Total Paid:* ₹${totalPayable.toLocaleString('en-IN')}\n\n` +
      `🚚 *Transport Vehicle:* ${vNo}\n` +
      `👤 *Driver:* ${dName} (${dPhone})\n` +
      `📍 *Delivery Address:* ${deliveryAddress}\n\n` +
      `Thank you for purchasing on Farm2Future!`;
    const whatsappOrderUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(whatsappOrderText)}`;

    // Auto-launch WhatsApp directly
    try {
      window.open(whatsappOrderUrl, '_blank');
    } catch (_) {}

    // Call /api/send-sms with CallMeBot support
    let apiDelivery: any = null;
    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          message: smsMessage,
          vehicleNo: vNo,
          driverName: dName,
          driverPhone: dPhone,
          origin: newOrder.collectionHubName || 'Central Hub',
          destination: deliveryAddress,
          cost: totalPayable,
          callmebotApiKey: callmebotKey
        })
      });
      apiDelivery = await res.json();
    } catch (_) {
      apiDelivery = { success: false, simulated: true };
    }

    // Play chime sound
    playSmsChime();

    // Trigger native OS notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification('✅ Order Successful & Transport Booked!', {
            body: `Order #${newOrder.orderNumber} confirmed. Transport: ${vNo}. Driver: ${dName} (${dPhone}).`,
            icon: '/favicon.ico'
          });
        } catch (_) {}
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') {
            try {
              new Notification('✅ Order Successful & Transport Booked!', {
                body: `Order #${newOrder.orderNumber} confirmed. Transport: ${vNo}. Driver: ${dName} (${dPhone}).`,
                icon: '/favicon.ico'
              });
            } catch (_) {}
          }
        }).catch(() => {});
      }
    }

    // Trigger floating phone SMS notification
    setSmsNotification({
      show: true,
      phone: cleanPhone,
      orderNumber: newOrder.orderNumber,
      cropName: item.cropName,
      quantity: `${currentOrderQty} ${item.unit || 'Quintals'}`,
      totalAmount: totalPayable,
      vehicleNo: vNo,
      driverName: dName,
      driverPhone: dPhone,
      destination: deliveryAddress,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      deliveredReal: Boolean(apiDelivery?.provider === 'fast2sms' && apiDelivery?.success),
      provider: apiDelivery?.provider || 'simulation'
    });

    setLastCreatedOrder(newOrder);
    setCreatedOrderRef(newOrder.orderNumber);
    setIsOrdering(false);
    setOrderSuccess(true);
  };

  const handleFinishAndTrack = () => {
    setSelectedListingModal(null);
    setOrderSuccess(false);
    setActiveTab('track_delivery');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* 📲 FLOATING BUYER SMS NOTIFICATION TOAST */}
      {smsNotification && smsNotification.show && (() => {
        const cleanPhone = smsNotification.phone;
        const whatsappText = `✅ *Order Successful & Transport Booked! (Farm2Future)*\n\n` +
          `📦 *Order Ref:* ${smsNotification.orderNumber}\n` +
          `🌾 *Produce:* ${smsNotification.quantity} ${smsNotification.cropName}\n` +
          `💰 *Total Paid:* ₹${smsNotification.totalAmount.toLocaleString('en-IN')}\n\n` +
          `🚚 *Transport Vehicle:* ${smsNotification.vehicleNo}\n` +
          `👤 *Driver:* ${smsNotification.driverName} (${smsNotification.driverPhone})\n` +
          `📍 *Delivery Address:* ${smsNotification.destination}\n\n` +
          `Thank you for purchasing on Farm2Future!`;
        const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(whatsappText)}`;
        const nativeSmsUrl = `sms:+91${cleanPhone}?body=${encodeURIComponent(whatsappText.replace(/[*_]/g, ''))}`;

        return (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-lg w-[94vw] animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
            <div className="bg-slate-950/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-3xl shadow-2xl border-2 border-emerald-500/60 space-y-3 ring-4 ring-emerald-500/20">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                    💬
                  </div>
                  <div>
                    <span className="font-extrabold text-emerald-300">BUYER SMS ALERT</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">• VM-AGRIF2F • {smsNotification.timestamp}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsNotification(null)}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300">
                    SMS To Buyer: <strong className="text-white font-mono">+91 {smsNotification.phone}</strong>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-extrabold text-[10px] border border-emerald-400/40 uppercase">
                    Order & Transport Confirmed
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 font-sans text-slate-100 text-xs leading-relaxed border border-white/10 space-y-1.5">
                  <p className="font-black text-emerald-300 text-sm flex items-center gap-1.5">
                    <span>✅</span>
                    <span>Order Successful & Transport Booked! (ऑर्डर व ट्रांसपोर्ट सफल)</span>
                  </p>
                  <p className="text-slate-200">
                    Order <strong>#{smsNotification.orderNumber}</strong> for <strong>{smsNotification.quantity} {smsNotification.cropName}</strong> (₹{smsNotification.totalAmount.toLocaleString('en-IN')}) is confirmed and escrow protected.
                  </p>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 space-y-0.5 text-[11px]">
                    <p className="text-emerald-300 font-bold">
                      🚚 Transport Vehicle: {smsNotification.vehicleNo}
                    </p>
                    <p className="text-slate-300">
                      Driver: <strong>{smsNotification.driverName}</strong> (📞 {smsNotification.driverPhone})
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      Destination: {smsNotification.destination}
                    </p>
                  </div>
                </div>

                {/* 1-Click WhatsApp & Phone SMS buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ring-2 ring-emerald-400/40"
                  >
                    <span>🟢</span>
                    <span>Direct WhatsApp में खोलें</span>
                  </button>
                  <a
                    href={nativeSmsUrl}
                    className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Open Phone SMS App</span>
                  </a>

                  {/* 🔔 Free NTFY Push Button */}
                  <a
                    href={`https://ntfy.sh/farm2future_${smsNotification.phone.replace(/\D/g, '').slice(-10)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="col-span-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <span>🔔</span>
                    <span>Live NTFY Mobile Push Alert (ntfy.sh/farm2future_{smsNotification.phone.slice(-10)})</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
                <span>Farm2Future Automated Buyer Gateway</span>
                <button
                  type="button"
                  onClick={() => setSmsNotification(null)}
                  className="text-slate-300 hover:text-white font-bold cursor-pointer"
                >
                  Dismiss (बंद करें)
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Backdrop */}
      <div 
        onClick={() => setSelectedListingModal(null)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden z-10 border border-slate-100 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 font-mono">
              {item.id}
            </span>
            <h3 className="font-bold text-base">{item.cropName} ({item.variety})</h3>
          </div>

          <button
            onClick={() => setSelectedListingModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {orderSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                    {createdOrderRef}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                    <QrCode className="w-3 h-3 text-emerald-600" />
                    <span>{paymentMethod}</span>
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Order Successful & Transport Booked!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  ₹{totalPayable.toLocaleString('en-IN')} is locked securely in Farm2Future Escrow Vault. Transport vehicle has been dispatched for delivery.
                </p>
              </div>

              {/* 📱 Buyer Order & Transport SMS Confirmation Card */}
              <div className="p-4 bg-white rounded-2xl border-2 border-emerald-300 text-left max-w-md mx-auto space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Buyer SMS Alert Dispatched</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 font-mono">
                    +91 {buyerMobileNumber}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1">
                    <span>✅</span>
                    <span>Order #{createdOrderRef} Confirmed & Transport Booked!</span>
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    Vehicle: <strong className="text-slate-800 font-mono">{lastCreatedOrder?.dispatchDetails?.vehicleNo}</strong> • Driver: <strong className="text-slate-800">{lastCreatedOrder?.dispatchDetails?.driverName}</strong> (📞 {lastCreatedOrder?.dispatchDetails?.driverPhone})
                  </p>
                </div>

                {/* 1-Click WhatsApp & Phone SMS buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const waLink = `https://api.whatsapp.com/send?phone=91${buyerMobileNumber.replace(/\D/g, '').slice(-10)}&text=${encodeURIComponent(
                        `✅ *Order Successful & Transport Booked! (Farm2Future)*\n\n` +
                        `📦 *Order Ref:* ${createdOrderRef}\n` +
                        `🌾 *Produce:* ${currentOrderQty} ${item.unit} ${item.cropName}\n` +
                        `💰 *Total Paid:* ₹${totalPayable.toLocaleString('en-IN')}\n\n` +
                        `🚚 *Transport Vehicle:* ${lastCreatedOrder?.dispatchDetails?.vehicleNo}\n` +
                        `👤 *Driver:* ${lastCreatedOrder?.dispatchDetails?.driverName} (${lastCreatedOrder?.dispatchDetails?.driverPhone})\n` +
                        `📍 *Delivery Destination:* ${deliveryAddress}\n\n` +
                        `Thank you for ordering on Farm2Future!`
                      )}`;
                      window.open(waLink, '_blank');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ring-2 ring-emerald-400/30"
                  >
                    <span>🟢</span>
                    <span>Direct WhatsApp में खोलें (+91 {buyerMobileNumber.slice(-10)})</span>
                  </button>
                  <a
                    href={`sms:+91${buyerMobileNumber.replace(/\D/g, '').slice(-10)}?body=${encodeURIComponent(
                      `Order ${createdOrderRef} Confirmed & Transport Booked! Vehicle: ${lastCreatedOrder?.dispatchDetails?.vehicleNo}, Driver: ${lastCreatedOrder?.dispatchDetails?.driverName} (${lastCreatedOrder?.dispatchDetails?.driverPhone}). Total: Rs ${totalPayable}. Delivery to: ${deliveryAddress}`
                    )}`}
                    className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-sky-200" />
                    <span>Open in Phone SMS App</span>
                  </a>

                  {/* 🔔 100% Free NTFY Mobile Push Alerts */}
                  <a
                    href={`https://ntfy.sh/farm2future_${buyerMobileNumber.replace(/\D/g, '').slice(-10)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="sm:col-span-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>🔔</span>
                    <span>Live NTFY Mobile Push Alert (ntfy.sh/farm2future_{buyerMobileNumber.slice(-10)})</span>
                  </a>
                </div>
              </div>

              {/* 🤖 AI Assigned Fleet Box */}
              {lastCreatedOrder && lastCreatedOrder.dispatchDetails && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl text-left max-w-md mx-auto space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Bot className="w-4 h-4" />
                      AI Auto-Assigned Carrier
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                      {lastCreatedOrder.aiAllocation?.aiMatchScore || 99.2}% Match
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Vehicle & Model</span>
                      <span className="font-bold text-white font-mono">{lastCreatedOrder.dispatchDetails.vehicleNo}</span>
                      <span className="text-[10px] text-slate-300 block truncate">{lastCreatedOrder.dispatchDetails.modelName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Driver & Contact</span>
                      <span className="font-bold text-white truncate block">{lastCreatedOrder.dispatchDetails.driverName}</span>
                      <span className="text-[10px] text-emerald-300 font-mono block">📞 {lastCreatedOrder.dispatchDetails.driverPhone}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Cold Chamber Temp</span>
                      <span className="font-bold text-emerald-400">{lastCreatedOrder.dispatchDetails.temperatureCelsius}°C Active</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Buyer Delivery Fee</span>
                      <span className="font-bold text-emerald-400">₹{logisticsFee} (Escrowed)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Ordered Produce:</span>
                  <span>{currentOrderQty} {item.unit} {item.cropName} (₹{produceAmount.toLocaleString('en-IN')})</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Delivery Logistics (Paid by Buyer):</span>
                  <span className="text-emerald-800 font-bold">₹{logisticsFee}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Farmer Payout (100% Realization):</span>
                  <span className="text-slate-900 font-bold">₹{farmerPayout.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-900 pt-2 border-t border-emerald-200 text-sm">
                  <span>Total Amount Paid by Buyer:</span>
                  <span>₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleFinishAndTrack}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Open Live GPS Telematics & Highway Tracker</span>
                </button>
                <button
                  onClick={() => setSelectedListingModal(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Product Gallery & Core Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="relative h-60 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                    <img
                      src={item.images[0]}
                      alt={item.cropName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                        {item.qualityGrade}
                      </span>
                      {item.organicCertified && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                          Organic Certified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Farmer Credibility Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg">
                        👨‍🌾
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900">{item.farmerName}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <p className="text-[11px] text-slate-500">Aadhaar & Land KYC Verified</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-amber-600">★ 4.9 Rating</span>
                      <span className="text-[10px] text-slate-400 block">{item.farmerLocation || item.location || ''}</span>
                    </div>
                  </div>
                </div>

                {/* Specs and Pricing Breakdown */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                      {item.category}
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900">{item.cropName}</h2>
                    <p className="text-xs text-slate-500">{item.variety} • Cured & Stored at Farmgate</p>
                  </div>

                  {/* Specifications Table */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available Lot</span>
                      <span className="font-bold text-slate-900 text-sm">{item.quantity} {item.unit || 'Quintals'}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Moisture Content</span>
                      <span className="font-bold text-slate-900 text-sm">{item.moisturePercent}% (Tested)</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Harvest Date</span>
                      <span className="font-bold text-slate-900">{item.harvestDate}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Direct Farm Price</span>
                      <span className="font-bold text-emerald-700 text-sm">₹{item.pricePerUnit.toLocaleString('en-IN')}/{(item.unit || 'Quintals').slice(0, -1)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Order Placement Form */}
              <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    Configure Procurement & Escrow
                  </h4>
                  <span className="text-xs text-slate-500">Available: <strong className="text-slate-800">{maxAvailable} {item.unit || 'Quintals'}</strong></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quantity Stepper & Presets */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Procurement Quantity ({item.unit || 'Quintals'}) *
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderQty(Math.max(1, orderQty - 10))}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={maxAvailable}
                        required
                        value={orderQty}
                        onChange={e => setOrderQty(Math.min(maxAvailable, Math.max(1, Number(e.target.value))))}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 text-center focus:ring-2 focus:ring-emerald-500"
                      />

                      <button
                        type="button"
                        onClick={() => setOrderQty(Math.min(maxAvailable, orderQty + 10))}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick percentage buttons */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setOrderQty(Math.max(1, Math.round(maxAvailable * 0.25)))}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      >
                        25%
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderQty(Math.max(1, Math.round(maxAvailable * 0.5)))}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderQty(Math.max(1, Math.round(maxAvailable * 0.75)))}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      >
                        75%
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderQty(maxAvailable)}
                        className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold cursor-pointer"
                      >
                        Full Lot ({maxAvailable})
                      </button>
                    </div>
                  </div>

                  {/* Delivery Location */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Buyer Warehouse Destination Address *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                    />
                  </div>

                  {/* Buyer Mobile Number for Order & Transport SMS */}
                  <div className="sm:col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <label className="block font-bold text-slate-800 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>Buyer Mobile Number for Order & Transport SMS (मोबाइल नंबर दर्ज करें) *</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        ● Live SMS Dispatch
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-bold text-slate-600 text-xs select-none font-mono">🇮🇳 +91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        value={buyerMobileNumber}
                        onChange={e => setBuyerMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-16 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      ऑर्डर कन्फर्म होते ही इस नंबर पर <strong>Order Successful</strong> और <strong>Transport Booking (गाड़ी संख्या व ड्राइवर नंबर)</strong> का मैसेज भेजा जाएगा।
                    </p>
                  </div>

                  {/* 💳 Interactive Payment Gateway & Dynamic Escrow UPI QR */}
                  <div className="sm:col-span-2 p-4 bg-gradient-to-br from-slate-50 via-emerald-50/25 to-slate-50 rounded-2xl border-2 border-emerald-500/40 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                            <span>Payment & Smart Escrow Gateway (पेमेंट विकल्प व UPI QR)</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                              🔒 100% Escrow Protected
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Funds are safely held in ICICI Smart Escrow Vault until delivery intake & quality verification.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Mode Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setPaymentTab('upi_qr')}
                        className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentTab === 'upi_qr'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>UPI / QR Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentTab('neft_rtgs')}
                        className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentTab === 'neft_rtgs'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Landmark className="w-3.5 h-3.5" />
                        <span>NEFT / RTGS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentTab('card')}
                        className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentTab === 'card'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Card / NetBanking</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentTab('credit')}
                        className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentTab === 'credit'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Agri-Credit (30D)</span>
                      </button>
                    </div>

                    {/* TAB 1: UPI / QR CODE CONTENT */}
                    {paymentTab === 'upi_qr' && (
                      <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {/* Real Dynamic QR Code Box */}
                          <div className="flex flex-col items-center p-2.5 bg-slate-50 rounded-2xl border-2 border-emerald-500/50 shadow-xs shrink-0">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=${encodeURIComponent(
                                `upi://pay?pa=krishbhardwaj326@naviaxis&pn=Krish%20Bhardwaj&am=${totalPayable}&cu=INR&tn=Farm2Future%20Order`
                              )}`}
                              alt="Farm2Future UPI Escrow QR"
                              className="w-36 h-36 rounded-xl bg-white p-1.5 shadow-xs"
                            />
                            <span className="text-[10px] font-extrabold text-emerald-800 mt-1.5 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                              Scan: ₹{totalPayable.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* UPI Details & Supported Apps */}
                          <div className="space-y-2 text-xs flex-1 w-full">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                Official UPI ID (VPA)
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono font-black text-emerald-950 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 text-xs sm:text-sm select-all">
                                  krishbhardwaj326@naviaxis
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText('krishbhardwaj326@naviaxis');
                                    setCopiedUpi(true);
                                    setTimeout(() => setCopiedUpi(false), 2500);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 border border-emerald-600 shadow-xs cursor-pointer"
                                >
                                  {copiedUpi ? <CheckCheck className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                                  <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>

                            {/* Supported UPI Apps Pills */}
                            <div>
                              <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                                Scan with any UPI app on your phone:
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                  🔵 Google Pay
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                                  🟣 PhonePe
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                                  🟦 Paytm
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                  🟧 BHIM UPI
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-bold">
                                  CRED
                                </span>
                              </div>
                            </div>

                            {/* Mobile Tap to Pay & Simulated Demo button */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <a
                                href={`upi://pay?pa=krishbhardwaj326@naviaxis&pn=Krish%20Bhardwaj&am=${totalPayable}&cu=INR&tn=Farm2Future%20Order`}
                                className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>Open UPI App (Mobile)</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => setUpiVerified(!upiVerified)}
                                className={`py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1 border cursor-pointer transition-colors ${
                                  upiVerified
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                                }`}
                              >
                                <CheckCircle2 className={`w-3.5 h-3.5 ${upiVerified ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <span>{upiVerified ? '✓ UPI Paid & Verified' : 'Simulate Paid (Demo)'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: NEFT / RTGS CONTENT */}
                    {paymentTab === 'neft_rtgs' && (
                      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Landmark className="w-4 h-4 text-emerald-600" />
                            Virtual Escrow Nodal Account
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                            RTGS / NEFT / IMPS
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[10px]">Beneficiary Name</span>
                            <span className="font-bold text-slate-800">Farm2Future Agriculture Escrow Trust</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Virtual Escrow A/C</span>
                              <span className="font-mono font-bold text-slate-900">F2FESCROW{buyerMobileNumber.slice(-10) || '9631359486'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(`F2FESCROW${buyerMobileNumber.slice(-10) || '9631359486'}`);
                                setCopiedAccount(true);
                                setTimeout(() => setCopiedAccount(false), 2000);
                              }}
                              className="p-1 text-slate-500 hover:text-emerald-600"
                            >
                              {copiedAccount ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[10px]">IFSC Code</span>
                            <span className="font-mono font-bold text-slate-900">ICIC0000002</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[10px]">Nodal Bank</span>
                            <span className="font-bold text-slate-800">ICICI Bank Escrow Corporate Hub, Mumbai</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: CARDS CONTENT */}
                    {paymentTab === 'card' && (
                      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                            Debit / Credit / RuPay Corporate Card
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-600">
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded border">RuPay</span>
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded border">VISA</span>
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded border">MasterCard</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-3">
                            <input
                              type="text"
                              readOnly
                              value="4532 •••• •••• 8821"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 text-xs"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              readOnly
                              value="Expiry: 12 / 28"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-600 text-xs"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              readOnly
                              value="CVV: •••"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-600 text-xs text-center"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: AGRI-CREDIT CONTENT */}
                    {paymentTab === 'credit' && (
                      <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Wallet className="w-4 h-4 text-emerald-600" />
                            e-Kisan Trade Credit Facility (0% Interest 30 Days)
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                            Pre-Approved
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          You have an active credit line of <strong>₹5,00,000</strong> provided by NABARD partner NBFCs. Payment will be automatically settled after 30 days of produce acceptance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🤖 AI Logistics & Automated Truck Dispatch Preview Card */}
                <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-800/50 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                        <Bot className="w-4 h-4 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-white">AI Automated Truck Dispatch</span>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                            {aiPreview.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-[10px] text-indigo-200">
                          {aiPreview.modelName} • {aiPreview.perishabilityHandling}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-bold block">{aiPreview.temperature}</span>
                      <span className="text-[9px] text-slate-400">{aiPreview.carbonSaving}</span>
                    </div>
                  </div>

                  {/* Transparent Buyer Delivery Cost Callout */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span><strong>Delivery Fee (₹{logisticsFee}):</strong> Paid 100% by Buyer</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                      👨‍🌾 Farmer Pays ₹0 Transport
                    </span>
                  </div>
                </div>

                {/* ⚡ 10 KM Hyper-Local Advantage Callout */}
                {isHyperlocal && (
                  <div className="p-3 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 rounded-2xl border border-emerald-300 flex items-center justify-between text-xs text-emerald-950 font-bold">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Zap className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900">10 KM Auto-Connected Farm ({distanceKm <= 0 ? '< 1' : distanceKm} km away)</span>
                        <p className="text-[11px] text-emerald-800 font-medium">{dispatchEstimate.label} • Direct Farmgate Freshness</p>
                      </div>
                    </div>
                    <span className="text-[11px] bg-emerald-600 text-white px-2.5 py-1 rounded-xl font-extrabold shadow-xs shrink-0">
                      ₹{logisticsFee} Delivery
                    </span>
                  </div>
                )}

                {/* Transparent Escrow Breakdown */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Produce Cost ({currentOrderQty} {item.unit || 'Quintals'} × ₹{item.pricePerUnit}):</span>
                    <span className="font-semibold text-slate-900">₹{produceAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Collection Hub Aggregation & QC (1%):</span>
                    <span className="font-semibold text-slate-900">₹{collectionFee.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-emerald-800 font-semibold bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-200/60">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{logisticsLabel} (Buyer Delivery Fee):</span>
                    </span>
                    <span>₹{logisticsFee.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Farm2Future Tech Platform Fee (1.5%):</span>
                    <span className="font-semibold text-slate-900">₹{platformFee.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-900 text-sm">
                    <div>
                      <span>Total Amount Payable (Escrow Locked):</span>
                      <span className="text-[10px] text-slate-500 font-normal block">Produce ₹{produceAmount.toLocaleString('en-IN')} + Delivery ₹{logisticsFee} + Fees</span>
                    </div>
                    <span className="text-base text-emerald-700 font-extrabold">₹{totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isOrdering}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isOrdering
                      ? '⚡ Verifying Payment & Securing Escrow...'
                      : paymentTab === 'upi_qr'
                      ? `Pay via UPI QR & Lock Escrow (₹${totalPayable.toLocaleString('en-IN')})`
                      : `Confirm Order & Lock Escrow (₹${totalPayable.toLocaleString('en-IN')})`}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
