export default function Header({ user, onLoginClick, onLogoutClick, onListItem }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg shadow-emerald-500/25">
            E
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              EquiShare Ruhuna
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Peer-to-peer campus rentals · University of Ruhuna
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <>
              <span className="hidden text-sm font-medium text-slate-500 md:block">{user.email}</span>
              <button onClick={onLogoutClick} className="text-sm font-semibold text-slate-500 transition hover:text-slate-800">
                Log Out
              </button>
            </>
          ) : (
            <button onClick={onLoginClick} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
              Log In
            </button>
          )}

          <button
            onClick={onListItem}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">List an item</span>
            <span className="sm:hidden">List</span>
          </button>
        </div>
      </div>
    </header>
  );
}