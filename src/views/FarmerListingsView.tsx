import React from 'react';
import { useAgri } from '../context/AgriContext';
import { 
  PlusCircle, 
  Layers, 
  Eye, 
  Calendar, 
  MapPin, 
  Trash2, 
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export const FarmerListingsView: React.FC = () => {
  const { currentUser, listings, isFarmerListing, deleteListing, setActiveTab, setSelectedListingModal, navigateBack, addNotification } = useAgri();

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
          {myListings.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={item.images[0]}
                    alt={item.cropName}
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

                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available</span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {item.quantity} {item.unit || 'Quintals'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Expected Price</span>
                      <span className="text-sm font-extrabold text-emerald-700">
                        ₹{item.pricePerUnit.toLocaleString('en-IN')}/{(item.unit || 'Quintals').slice(0, -1)}
                      </span>
                    </div>
                  </div>

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
                  onClick={() => setSelectedListingModal(item)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
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
          ))}
        </div>
      )}
    </div>
  );
};
