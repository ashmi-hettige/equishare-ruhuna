const categoryColors = {
  Electronics: "bg-violet-100 text-violet-700",
  Photography: "bg-amber-100 text-amber-700",
  "Lab Equipment": "bg-sky-100 text-sky-700",
  Sports: "bg-orange-100 text-orange-700",
  Books: "bg-rose-100 text-rose-700",
  Other: "bg-slate-100 text-slate-700",
};

export default function ItemCard({ item, onClick, currentUser, onRequireAuth }) {
  const badgeClass = categoryColors[item.category] || categoryColors.Other;

  // This function intercepts the click on the contact buttons
  const handleContactClick = (e) => {
    e.stopPropagation(); // Prevents the details modal from opening
    
    if (!currentUser) {
      e.preventDefault(); // Stops the call/WhatsApp link from executing
      onRequireAuth();    // Opens the login modal instead
    }
  };

  return (
    <article 
      onClick={onClick} 
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
          {item.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{item.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-500">{item.description}</p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Per day</p>
            <p className="text-2xl font-bold text-emerald-600">
              Rs. {item.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Contact buttons are always visible, but protected by handleContactClick */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <a
            href={`tel:${item.contact.phone}`}
            onClick={handleContactClick}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            📞 Call
          </a>
          <a
            href={`https://wa.me/94${item.contact.phone.replace(/^0/, "")}`}
            target={currentUser ? "_blank" : undefined}
            rel="noreferrer"
            onClick={handleContactClick}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            WhatsApp
          </a>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          Listed by {item.contact.name}
        </p>
      </div>
    </article>
  );
}