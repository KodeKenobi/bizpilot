"use client";

import React, { useState } from "react";
import {
  Eye,
  Lock,
  Bell,
  Palette,
  Users,
  Server,
  CreditCard,
  KeyRound,
} from "lucide-react";

// Matched sections, icons stay subtle
const sections = [
  { id: "profile", label: "Profile", icon: <Eye className="w-5 h-5 mr-2" /> },
  {
    id: "security",
    label: "Security",
    icon: <Lock className="w-5 h-5 mr-2" />,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="w-5 h-5 mr-2" />,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: <Palette className="w-5 h-5 mr-2" />,
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: <Server className="w-5 h-5 mr-2" />,
  },
  {
    id: "billing",
    label: "Billing & Usage",
    icon: <CreditCard className="w-5 h-5 mr-2" />,
  },
  {
    id: "admin",
    label: "Admin Controls",
    icon: <Users className="w-5 h-5 mr-2" />,
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: <KeyRound className="w-5 h-5 mr-2" />,
  },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">
              View and manage all your admin settings and preferences.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2 justify-center mb-6">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all border select-none
                ${
                  activeSection === section.id
                    ? "bg-gray-900 text-white border-gray-700 shadow"
                    : "bg-gray-800 text-gray-300 border-transparent hover:bg-gray-700"
                }`}
                onClick={() => setActiveSection(section.id)}
                type="button"
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>

          <div className="bg-white dark:bg-gray-900/80 shadow-lg rounded-xl p-4 md:p-8 border border-gray-200 dark:border-gray-800">
            {activeSection === "profile" && <ProfileSettings />}
            {activeSection === "security" && <SecuritySettings />}
            {activeSection === "notifications" && <NotificationSettings />}
            {activeSection === "appearance" && <AppearanceSettings />}
            {activeSection === "integrations" && <IntegrationSettings />}
            {activeSection === "billing" && <BillingSettings />}
            {activeSection === "admin" && <AdminControls />}
            {activeSection === "advanced" && <AdvancedSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

const secInputBase =
  "block w-full mt-1 rounded-md p-3 border bg-gray-800/60 border-gray-700 text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-base";
const secLabelBase = "block font-medium mb-1 text-gray-300";

function ProfileSettings() {
  return (
    <form className="space-y-6">
      <div>
        <label className={secLabelBase}>Full Name</label>
        <input className={secInputBase} placeholder="Admin Name" />
      </div>
      <div>
        <label className={secLabelBase}>Email Address</label>
        <input
          type="email"
          className={secInputBase}
          placeholder="admin@example.com"
        />
      </div>
      <div>
        <label className={secLabelBase}>Avatar</label>
        <input type="file" accept="image/*" className="block mt-1" />
      </div>
      <div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-gray-900 text-white rounded-md shadow hover:bg-gray-800 transition-all"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

function SecuritySettings() {
  return (
    <form className="space-y-6">
      <div>
        <label className={secLabelBase}>Current Password</label>
        <input
          type="password"
          className={secInputBase}
          placeholder="Current password"
          autoComplete="current-password"
        />
      </div>
      <div>
        <label className={secLabelBase}>New Password</label>
        <input
          type="password"
          className={secInputBase}
          placeholder="New password"
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className={secLabelBase}>Two-Factor Authentication</label>
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            className="form-checkbox text-blue-600 focus:ring-blue-500"
            id="2fa"
          />
          <label htmlFor="2fa" className="text-sm text-gray-400">
            Enable 2FA (QR code/app)
          </label>
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-gray-900 text-white rounded-md shadow hover:bg-gray-800 transition-all"
        >
          Update Security
        </button>
      </div>
    </form>
  );
}

function NotificationSettings() {
  return (
    <form className="space-y-6">
      <div>
        <label className={secLabelBase}>Email Notifications</label>
        <select className={secInputBase}>
          <option>All</option>
          <option>Only Critical</option>
          <option>None</option>
        </select>
      </div>
      <div>
        <label className={secLabelBase}>In-app Notifications</label>
        <select className={secInputBase}>
          <option>All</option>
          <option>Mentions Only</option>
          <option>None</option>
        </select>
      </div>
      <div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-gray-900 text-white rounded-md shadow hover:bg-gray-800 transition-all"
        >
          Save Preferences
        </button>
      </div>
    </form>
  );
}

function AppearanceSettings() {
  return (
    <form className="space-y-6">
      <div>
        <label className={secLabelBase}>Theme</label>
        <select className={secInputBase}>
          <option value="system">System Default</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div>
        <label className={secLabelBase}>Dashboard Layout</label>
        <select className={secInputBase}>
          <option value="classic">Classic</option>
          <option value="compact">Compact</option>
          <option value="modern">Modern</option>
        </select>
      </div>
      <div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-gray-900 text-white rounded-md shadow hover:bg-gray-800 transition-all"
        >
          Apply Changes
        </button>
      </div>
    </form>
  );
}

function IntegrationSettings() {
  return (
    <form className="space-y-6">
      <div>
        <label className={secLabelBase}>Connect API Key</label>
        <input className={secInputBase} placeholder="Paste API key here" />
      </div>
      <div>
        <label className={secLabelBase}>Slack Integration</label>
        <input className={secInputBase} placeholder="Slack webhook URL" />
      </div>
      <div>
        <label className={secLabelBase}>Webhooks</label>
        <input className={secInputBase} placeholder="Webhook URL" />
      </div>
      <div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-gray-900 text-white rounded-md shadow hover:bg-gray-800 transition-all"
        >
          Save Integrations
        </button>
      </div>
    </form>
  );
}

function BillingSettings() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-lg text-white">Plan</h2>
          <span className="text-gray-200 font-bold">Pro (Example)</span>
        </div>
        <button className="py-2 px-4 bg-gray-700 text-gray-200 rounded-md shadow hover:bg-gray-600">
          Change Plan
        </button>
      </div>
      <div>
        <h2 className="font-semibold text-lg text-white mb-2">
          Payment Methods
        </h2>
        <input className={secInputBase} placeholder="Card ending in 4242" />
      </div>
      <div>
        <h2 className="font-semibold text-lg text-white mb-2">
          Billing History
        </h2>
        <ul className="divide-y divide-gray-800">
          <li className="py-2 flex justify-between text-gray-300">
            <span>01/2024</span> <span>$12.00</span>
          </li>
          <li className="py-2 flex justify-between text-gray-300">
            <span>12/2023</span> <span>$12.00</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

function AdminControls() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg text-white mb-2">Manage Roles</h2>
        <select className={secInputBase}>
          <option>Admin</option>
          <option>Editor</option>
          <option>View Only</option>
        </select>
      </div>
      <div>
        <h2 className="font-semibold text-lg text-white mb-2">Feature Flags</h2>
        <div className="flex gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" defaultChecked /> Beta Access
          </label>
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" /> Analytics v2
          </label>
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-lg text-white mb-2">Access Logs</h2>
        <ul className="divide-y divide-gray-800 max-h-32 overflow-auto text-gray-400">
          <li className="py-1 text-xs flex justify-between gap-3">
            <span>10 mins ago</span> <span>IP: 192.168.1.1</span>
          </li>
          <li className="py-1 text-xs flex justify-between gap-3">
            <span>1 hour ago</span> <span>IP: 175.34.5.11</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

function AdvancedSettings() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg text-white mb-2">Export Data</h2>
        <button className="py-2 px-4 bg-gray-700 text-gray-200 rounded-md">
          Download Data
        </button>
      </div>
      <div className="border-t border-gray-800 pt-4">
        <h2 className="font-semibold text-lg mb-2 text-red-500">Danger Zone</h2>
        <p className="text-sm mb-3 text-gray-400">
          Delete your admin account or the entire organization. This action is
          irreversible!
        </p>
        <button className="py-2 px-4 bg-red-700 text-white font-semibold rounded-md hover:bg-red-800 transition">
          Delete Account
        </button>
      </div>
    </section>
  );
}

export default SettingsPage;
