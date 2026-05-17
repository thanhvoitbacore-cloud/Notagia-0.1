"use client";

export default function SettingsPage() {
  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-8">
      <header>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your profile and security preferences.</p>
      </header>

      <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02] py-20 mt-4">
        <p className="text-zinc-400 font-medium text-center max-w-md">
          You are currently using the app in Guest Mode. Account settings are not available since no data is saved to the database.
        </p>
      </div>
    </main>
  );
}
