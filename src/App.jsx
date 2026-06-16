import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import ItemCard from "./components/ItemCard";
import ListItemModal from "./components/ListItemModal";
import ItemDetailsModal from "./components/ItemDetailsModal"; 
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal"; // NEW IMPORT
import { supabase } from "./supabaseClient";

// Custom Alert/Confirm Modal Component (To solve the "Code" title issue)
function CustomDialog({ config, onClose }) {
  if (!config.isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{config.title}</h3>
        <p className="text-sm text-slate-600 mb-6">{config.message}</p>
        <div className="flex justify-end gap-3">
          {config.isConfirm && (
            <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          )}
          <button 
            onClick={() => { config.onConfirm && config.onConfirm(); onClose(); }} 
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            {config.isConfirm ? "Yes" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [editItemData, setEditItemData] = useState(null);
  
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // NEW: Sort State
  const [isUploading, setIsUploading] = useState(false); 

  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // NEW STATE
  const [totalUsers, setTotalUsers] = useState(0); // NEW STATE

  // NEW: Dialog State
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, title: "", message: "", isConfirm: false, onConfirm: null });

  const showDialog = (title, message, isConfirm = false, onConfirm = null) => {
    setDialogConfig({ isOpen: true, title, message, isConfirm, onConfirm });
  };

  useEffect(() => {
    fetchItems();
    fetchTotalUsers(); // Fetch global users

    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchTotalUsers(); // Refresh count on login/signup
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    if (!error) {
      const liveData = data.map(item => ({
        id: item.id,
        user_id: item.user_id, 
        title: item.title,
        description: item.description,
        category: item.category,
        price: parseInt(item.price) || 0,
        contact: {
          name: item.uploaded_by || "Ruhuna Student",
          phone: item.contact_info,
        },
        image: item.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400",
        images: item.images || [], 
      }));
      setItems(liveData);
    }
  };

  // Fetch Global User Count from our new Profiles table
  const fetchTotalUsers = async () => {
    const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (!error) setTotalUsers(count || 0);
  };

  const categories = useMemo(() => ["All", "Electronics", "Photography", "Lab Equipment", "Sports", "Books", "Other"], []);

  // Handle Search, Filter, AND Sorting
  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === "All" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      return 0; // Default is newest, which is already handled by the fetch order
    });

  const handleSaveListing = async (form, newFiles, existingImages, editId = null) => {
    if (!user) return showDialog("Authentication Required", "You must be logged in to list an item.");

    setIsUploading(true);
    let uploadedUrls = [];

    // 1. Upload new files if any
    if (newFiles && newFiles.length > 0) {
      const uploadPromises = newFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage.from('item-images').upload(fileName, file);
        if (!error) return supabase.storage.from('item-images').getPublicUrl(fileName).data.publicUrl;
        return null;
      });
      const results = await Promise.all(uploadPromises);
      uploadedUrls = results.filter(url => url !== null);
    }

    // Combine newly uploaded images with the remaining existing images
    const finalImagesArray = [...existingImages, ...uploadedUrls];

    const payload = {
      user_id: user.id,
      title: form.title,
      description: form.description,
      category: form.category,
      price: form.price.toString(),
      contact_info: form.contactPhone,
      is_available: true,
      image_url: finalImagesArray[0] || null, 
      images: finalImagesArray,               
      uploaded_by: form.contactName
    };

    let responseError;
    if (editId) {
      const { error } = await supabase.from('items').update(payload).eq('id', editId);
      responseError = error;
    } else {
      const { error } = await supabase.from('items').insert([payload]);
      responseError = error;
    }

    setIsUploading(false);
    if (responseError) {
      showDialog("Database Error", "Error saving to database! Check console.");
    } else {
      setSelectedItem(null); // Close details if open
      fetchItems(); 
    }
  };

  const handleDelete = (itemId) => {
    showDialog("Delete Item", "Are you sure you want to permanently delete this listing?", true, async () => {
      const { error } = await supabase.from('items').delete().eq('id', itemId);
      if (error) showDialog("Error", "Error deleting item.");
      else {
        setSelectedItem(null); 
        fetchItems(); 
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <CustomDialog config={dialogConfig} onClose={() => setDialogConfig({ ...dialogConfig, isOpen: false })} />

      <Header 
        user={user} 
        onLoginClick={() => setIsAuthOpen(true)} 
        onLogoutClick={handleLogout}
        onProfileClick={() => setIsProfileOpen(true)} // Open profile modal
        onListItem={() => {
          if (user) {
            setEditItemData(null); // Ensure it's a new form
            setIsModalOpen(true);
          } else {
            setIsAuthOpen(true);
          }
        }} 
      />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 p-5 text-white sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Borrow smarter. Share on campus.</h2>
              <p className="mt-3 max-w-2xl text-sm text-emerald-50 sm:text-base">
                Find calculators, cameras, lab gear, and more from students at E-fac Ruhuna 
              </p>
              <p className="mt-0 max-w-2xl text-sm text-emerald-50 sm:text-base">
                No shop needed.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: "Live Listings", value: items.length },
                { label: "Categories", value: categories.length - 1 },
                { label: "Active Members", value: totalUsers }, // Dynamic global count
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/15 px-4 py-4 text-center backdrop-blur sm:px-4">
                  <p className="text-xl font-bold sm:text-2xl">{stat.value}</p>
                  <p className="text-sm text-emerald-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isUploading && (
          <div className="mb-4 rounded-xl bg-green-100 p-3 text-center text-green-800 font-medium">
            ⏳ Uploading to the cloud... please wait!
          </div>
        )}

        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search EquiShare"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-4 text-sm shadow-sm outline-none transition focus:border-emerald-500"
              />
            </div>
            
            {/* NEW: Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white  text-slate-600 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filterCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {filteredItems.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onClick={() => setSelectedItem(item)} 
                currentUser={user}
                onRequireAuth={() => setIsAuthOpen(true)}
              />
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-lg font-medium text-slate-600">No items found</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50 py-6 text-center mt-auto">
        <p className="text-sm text-slate-500">
          © 2026, EquiShare Ruhuna, Inc. 
        </p>
      </footer>

      <ListItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSaveListing} 
        user={user}
        editItem={editItemData}
        onShowAlert={showDialog}
      />
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onShowAlert={showDialog} 
      />

      {/* NEW: Profile Edit Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onShowAlert={showDialog}
        onProfileUpdated={(updatedUser) => setUser(updatedUser)}
      />

      <ItemDetailsModal 
        item={selectedItem} 
        currentUser={user} 
        onClose={() => setSelectedItem(null)} 
        onDelete={handleDelete}
        onEdit={(item) => {
          setSelectedItem(null); 
          setEditItemData(item); // Load item into the editor
          setIsModalOpen(true);  // Open the list modal
        }}
        onRequireAuth={() => {
          setSelectedItem(null); 
          setIsAuthOpen(true);   
        }}
      />
    </div>
  );
}