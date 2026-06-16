import { useState, useEffect } from "react";

const categoryColors = {
  Electronics: "bg-violet-100 text-violet-700",
  Photography: "bg-amber-100 text-amber-700",
  "Lab Equipment": "bg-sky-100 text-sky-700",
  Sports: "bg-orange-100 text-orange-700",
  Books: "bg-rose-100 text-rose-700",
  Other: "bg-slate-100 text-slate-700",
};

export default function ItemDetailsModal({ item, currentUser, onClose, onDelete, onEdit, onRequireAuth }) {
  if (!item) return null;

  const allImages = item.images && item.images.length > 0 ? item.images : [item.image];
  const [mainImage, setMainImage] = useState(allImages[0]);
  const badgeClass = categoryColors[item.category] || categoryColors.Other;
  
  // Ensure the main image updates if the item prop changes
  useEffect(() => {
    setMainImage(allImages[0]);
  }, [item]);

  const isOwner = currentUser && item.user_id && currentUser.id === item.user_id;

  const handleContactClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      onRequireAuth();   
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Side: Image Gallery */}
        <div className="md:w-1/2 bg-slate-100 p-4 flex flex-col gap-4 overflow-y-auto">
          <img src={mainImage} alt="Main item" className="w-full h-64 md:h-80 object-cover rounded-xl border border-slate-200" />
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <img key={idx} src={img} alt={`Thumbnail ${idx + 1}`} onClick={() => setMainImage(img)} className={`h-20 w-20 object-cover rounded-lg cursor-pointer border-2 transition ${mainImage === img ? 'border-emerald-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`} />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className={`inline-block mb-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                {item.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{item.title}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
          </div>
          
          <p className="text-3xl font-bold text-emerald-600 mb-6">
            {item.price === 0 ? "Free" : `Rs. ${item.price}`} <span className="text-lg font-normal text-slate-400">/day</span>
          </p>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Details</h3>
            <p className="text-slate-500 whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="mt-auto bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact</h3>
            <p className="text-slate-800 font-medium flex items-center gap-2 mb-3">👤 {item.contact.name}</p>
            
            <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
              <a href={`tel:${item.contact.phone}`} onClick={handleContactClick} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">📞 Call</a>
              <a href={`https://wa.me/94${item.contact.phone.replace(/^0/, "")}`} target={currentUser ? "_blank" : undefined} rel="noreferrer" onClick={handleContactClick} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">WhatsApp</a>
            </div>
          </div>

          {/* Owner Controls: Update and Delete */}
          {isOwner && (
            <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
              <button onClick={() => onEdit(item)} className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200">
                Edit
              </button>
              <button onClick={() => onDelete(item.id)} className="flex-1 rounded-xl bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100">
                Delete
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}