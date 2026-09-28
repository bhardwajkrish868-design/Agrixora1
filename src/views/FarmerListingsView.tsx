import React, { useState } from 'react';
import { useAgri } from '../context/AgriContext';
import { CropListing } from '../types';
import { EditListingModal } from '../components/EditListingModal';
import { 
  PlusCircle, 
  Layers, 
  Eye, 
  Pencil,
  Calendar, 
  MapPin, 
  Trash2, 
  ShieldCheck, 
  ArrowLeft, 
  Building2, 
  Store,
  Scale
} from 'lucide-react';
import { getUnitConversions } from '../utils/unitUtils';

export const FarmerListingsView: React.FC = () => {
  const { currentUser, listings, isFarmerListing, deleteListing, setActiveTab, setSelectedListingModal, navigateBack, addNotification, language } = useAgri();

  const [editingListing, setEditingListing] = useState<CropListing | null>(null);

  const myListings = listings.filter(l => isFarmerListing(l, currentUser));

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
              <Layers className="w-6 h-6 text-emerald-600" />
              My Crop Listings & Lots
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your active harvest listings, update pricing, and review buyer inquiries.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('add_produce')}
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Harvest Lot</span>
        </button>
      </div>

      {/* ⚖️ Quantity & Units Informational Guide */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              Quantity & Units
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Understand the quantity units used for your crop listings.
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            Standard Mandi Units
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card A: KG - Kilogram */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                KG
              </span>
              <span className="text-xs font-bold text-slate-700">Kilogram</span>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 font-mono text-xs font-bold text-slate-800 shadow-2xs">
              1 Kg = 1 kilogram
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Used for smaller quantities of produce.
            </p>
          </div>

          {/* Card B: QTL - Quintal */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                QTL
              </span>
              <span className="text-xs font-bold text-slate-700">Quintal</span>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 font-mono text-xs font-bold text-slate-800 shadow-2xs">
              1 Qtl = 100 Kg
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Used for larger agricultural quantities.
            </p>
          </div>

          {/* Card C: TON - Metric Ton */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                TON
              </span>
              <span className="text-xs font-bold text-slate-700">Metric Ton</span>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 font-mono text-[11px] font-bold text-slate-800 shadow-2xs space-y-0.5">
              <div>1 Ton = 1,000 Kg</div>
              <div className="text-emerald-700">1 Ton = 10 Qtl</div>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Used for bulk agricultural orders.
            </p>
          </div>
        </div>
      </div>

      {myListings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft space-y-4">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No Produce Listed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            List your crop harvest with quality grade and expected price to receive direct buyer orders.
          </p>
          <button
            onClick={() => setActiveTab('add_produce')}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myListings.map(item => {
            const conversions = getUnitConversions(item.quantity, item.unit);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={(item.images && item.images[0]) || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
                      alt={item.cropName || 'Crop'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                        {item.qualityGrade}
                      </span>
                      {item.organicCertified && (
                        <span className="px-2.5 py-1 rounded-full bg-green-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Organic
                        </span>
                      )}
                    </div>

                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${
                      item.status === 'Active'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-white'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{item.category}</span>
                        <span className="font-mono font-semibold">{item.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{item.cropName}</h3>
                      <p className="text-xs text-slate-600 font-medium">{item.variety}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available</span>
                          <span className="text-base font-extrabold text-slate-900 block">
                            {item.quantity} {item.unit || 'Kg'}
                          </span>
                          {/* Unit conversion breakdown */}
                          {conversions.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {conversions.map((conv, idx) => (
                                <span key={idx} className="block text-[11px] font-medium text-slate-500 font-mono">
                                  {conv.value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Expected Price</span>
                          <span className="text-base font-extrabold text-emerald-700 block">
                            ₹{item.pricePerUnit.toLocaleString('en-IN')}/{item.unit || 'Kg'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-1">
                            Total: ₹{(item.expectedPriceTotal || (item.pricePerUnit * item.quantity)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                  {/* 🏛️ Assigned FCI Procurement Hub & Mandi */}
                  <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-extrabold text-emerald-950 text-xs block truncate">
                          {item.fciHubName || 'FCI Central Silo'}
                        </span>
                        <span className="text-[10px] text-emerald-700 block truncate">
                          {item.fciHubCode || 'FCI Depot'} • {item.fciHubDistanceKm !== undefined ? `${item.fciHubDistanceKm} km away` : 'Assigned Hub'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-950 rounded-md font-mono text-[10px] font-bold shrink-0">
                      {item.fciHubDistanceKm !== undefined ? `${item.fciHubDistanceKm} km` : 'FCI'}
                    </span>
                  </div>

                  {item.nearestMandi && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 px-0.5">
                      <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Target Mandi: <strong className="text-slate-800">{item.nearestMandi}</strong></span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.farmerLocation || item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Harvested: {item.harvestDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedListingModal(item)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'विवरण' : 'View'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingListing(item)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Edit Listing Details"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'संपादित करें' : 'Edit'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const ok = typeof window !== 'undefined' && window.confirm 
                      ? window.confirm(`Are you sure you want to permanently remove listing #${item.id} (${item.cropName})?`)
                      : true;
                    if (ok) {
                      deleteListing(item.id);
                      addNotification({
                        title: 'Listing Removed',
                        message: `Listing #${item.id} (${item.cropName}) was delisted and permanently removed.`,
                        type: 'alert',
                        recipientRole: 'all'
                      });
                    }
                  }}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                  title="Delete Listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Edit Listing Details Modal */}
      <EditListingModal
        isOpen={!!editingListing}
        onClose={() => setEditingListing(null)}
        listing={editingListing}
      />
    </div>
  );
};
