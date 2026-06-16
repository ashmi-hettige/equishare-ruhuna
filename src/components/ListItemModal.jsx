import { useState, useRef, useEffect } from "react";
import { categories } from "../data/mockItems";

export default function ListItemModal({ isOpen, onClose, onSubmit, user, editItem, onShowAlert }) {
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    title: "", description: "", category: categories[0], price: "", contactName: "", contactPhone: "", contactEmail: "",
  });
  
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  // Auto-fill user data or Edit mode data when the modal opens
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setForm({
          title: editItem.title,
          description: editItem.description,
          category: editItem.category,
          price: editItem.price,
          contactName: editItem.contact.name,
          contactPhone: editItem.contact.phone,
          contactEmail: user?.email || "",
        });
        setExistingImages(editItem.images || []);
        setNewFiles([]);
      } else {
        setForm({
          title: "", description: "", category: categories[0], price: "",
          contactName: user?.user_metadata?.full_name || "",
          contactPhone: user?.user_metadata?.phone_number || "",
          contactEmail: user?.email || "",
        });
        setExistingImages([]);
        setNewFiles([]);
      }
    }
  }, [isOpen, editItem, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeNewFile = (indexToRemove) => {
    setNewFiles(newFiles.filter((_, idx) => idx !== indexToRemove));
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(existingImages.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (form.contactPhone.length !== 10 || isNaN(form.contactPhone)) {
      onShowAlert("Invalid Contact", "Please enter a valid 10-digit contact number.");
      return;
    }
    if (existingImages.length === 0 && newFiles.length === 0) {
      onShowAlert("Image Required", "Please attach at least one image of your item.");
      return;
    }

    onSubmit({ ...form, price: Number(form.price) }, newFiles, existingImages, editItem?.id); 
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-4xl font-bold text-white shadow-emerald-500/25">
              E
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{editItem ? "Update the list" : "List an item"}</h2>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Scientific Calculator" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Condition, what's included, pickup location..." className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
          </div>

          {/* NEW: Custom Attach Image Field */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Item Images</label>
            <div className="flex flex-col gap-3">
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                📎 Attach Images
              </button>
              <input type="file" accept="image/*" multiple hidden ref={fileInputRef} onChange={handleFileSelect} />
              
              {/* Image Previews */}
              {(existingImages.length > 0 || newFiles.length > 0) && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {existingImages.map((imgUrl, idx) => (
                    <div key={`exist-${idx}`} className="relative shrink-0">
                      <img src={imgUrl} alt="existing" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
                      <button type="button" onClick={() => removeExistingImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">✕</button>
                    </div>
                  ))}
                  {newFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative shrink-0">
                      <img src={URL.createObjectURL(file)} alt="new" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
                      <button type="button" onClick={() => removeNewFile(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Price (Rs./day)</label>
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required placeholder="150" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Contact info</p>
            <div className="space-y-3">
              <input name="contactName" value={form.contactName} onChange={handleChange} required placeholder="Your name" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
              <input name="contactPhone" value={form.contactPhone} onChange={handleChange} required placeholder="07XXXXXXXX" maxLength="10" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
              <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} required placeholder="you@engug.ruh.ac.lk" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
            <button type="submit" className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
              {editItem ? "Save Changes" : "Publish listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}