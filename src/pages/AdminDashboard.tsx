// Admin Dashboard - PRD 4.1 Content Management
// Central hub for admin functionality with role-based access control

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Users, 
  BookOpen, 
  MessageSquare, 
  BarChart3,
  FileText,
  Shield,
  Database,
  Plus,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/layout/UserHeader';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScenarios: 0,
    totalSessions: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Redirect non-admin users
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    // Load admin statistics
    loadAdminStats();
  }, [user, navigate]);

  const loadAdminStats = () => {
    // TODO: Implement actual stats loading
    setStats({
      totalUsers: 5,
      totalScenarios: 8,
      totalSessions: 42,
      activeUsers: 3
    });
  };

  if (!user || user.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  const adminModules = [
    {
      title: 'Scenario Management',
      description: 'Create, edit, and manage training scenarios',
      icon: BookOpen,
      color: 'bg-blue-100',
      hoverColor: 'hover:bg-blue-200',
      textColor: 'text-blue-700',
      route: '/admin/scenarios',
      stats: `${stats.totalScenarios} scenarios`,
      actions: ['View All', 'Create New', 'Import/Export']
    },
    {
      title: 'Character Management', 
      description: 'Manage AI characters and ElevenLabs voices',
      icon: MessageSquare,
      color: 'bg-green-100',
      hoverColor: 'hover:bg-green-200',
      textColor: 'text-green-700',
      route: '/admin/characters',
      stats: '6 characters',
      actions: ['View All', 'Create New', 'Voice Settings']
    },
    {
      title: 'Feedback Settings',
      description: 'Configure AI feedback models and prompts',
      icon: Settings,
      color: 'bg-purple-100',
      hoverColor: 'hover:bg-purple-200',
      textColor: 'text-purple-700',
      route: '/admin/feedback',
      stats: '3 AI models',
      actions: ['Model Settings', 'Prompt Library', 'Thresholds']
    },
    {
      title: 'Analytics & Reports',
      description: 'Usage statistics and performance metrics',
      icon: BarChart3,
      color: 'bg-orange-100',
      hoverColor: 'hover:bg-orange-200',
      textColor: 'text-orange-700',
      route: '/admin/analytics',
      stats: `${stats.totalSessions} sessions`,
      actions: ['Usage Reports', 'Performance Data', 'Export']
    },
    {
      title: 'User Management',
      description: 'View users, progress, and reset data',
      icon: Users,
      color: 'bg-indigo-100',
      hoverColor: 'hover:bg-indigo-200',
      textColor: 'text-indigo-700',
      route: '/admin/users',
      stats: `${stats.totalUsers} users`,
      actions: ['View All', 'Export Data', 'Reset Progress']
    },
    {
      title: 'System Configuration',
      description: 'ElevenLabs, authentication, and system settings',
      icon: Database,
      color: 'bg-slate-100',
      hoverColor: 'hover:bg-slate-200',
      textColor: 'text-slate-700',
      route: '/admin/system',
      stats: 'All systems operational',
      actions: ['API Keys', 'Security', 'Backups']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <UserHeader />
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to App Dashboard
          </button>
        </div>

        {/* Admin Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-10 h-10 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-slate-300">SkillCraft System Administration</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mt-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{stats.totalUsers}</div>
              <div className="text-sm text-slate-300">Total Users</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{stats.totalScenarios}</div>
              <div className="text-sm text-slate-300">Active Scenarios</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">{stats.totalSessions}</div>
              <div className="text-sm text-slate-300">Practice Sessions</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">{stats.activeUsers}</div>
              <div className="text-sm text-slate-300">Active Today</div>
            </div>
          </div>
        </div>

        {/* Admin Modules Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {adminModules.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden group"
              >
                {/* Module Header */}
                <div className={`${module.color} p-6`}>
                  <div className="flex items-center gap-4 mb-3">
                    <IconComponent className={`w-8 h-8 ${module.textColor}`} />
                    <div>
                      <h3 className={`text-xl font-bold ${module.textColor}`}>{module.title}</h3>
                      <p className={`${module.textColor}/80 text-sm`}>{module.description}</p>
                    </div>
                  </div>
                  <div className={`${module.textColor}/90 text-sm font-medium`}>{module.stats}</div>
                </div>

                {/* Module Content */}
                <div className="p-6">
                  <div className="space-y-3">
                    {module.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between group"
                        onClick={() => navigate(module.route)}
                      >
                        <span className="text-slate-700 font-medium">{action}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit className="w-4 h-4 text-slate-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => navigate(module.route)}
                    className={`w-full mt-6 ${module.color} ${module.hoverColor} ${module.textColor} py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border border-current/20`}
                  >
                    Open {module.title}
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Recent System Activity
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-900">New user registered: test@test.com</div>
                <div className="text-sm text-slate-600">2 hours ago</div>
              </div>
              <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                User Activity
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-900">Scenario "Difficult Client" completed by admin@admin.com</div>
                <div className="text-sm text-slate-600">4 hours ago</div>
              </div>
              <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                Practice Session
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-900">System backup completed successfully</div>
                <div className="text-sm text-slate-600">Yesterday</div>
              </div>
              <div className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                System
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}