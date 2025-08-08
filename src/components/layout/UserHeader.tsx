import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserHeader() {
  const { user, logout } = useAuth();

  return (
    <div className="flex justify-between items-center mb-8 bg-white rounded-lg shadow-sm px-6 py-4">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="font-semibold text-slate-900">
            Welcome, {user?.firstName || user?.email}
          </h2>
          <p className="text-sm text-slate-600">
            {user?.role === 'admin' ? 'Administrator' : 'Team Lead'} • Ready to practice
          </p>
        </div>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}