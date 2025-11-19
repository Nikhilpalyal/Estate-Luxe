import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { API_BASE } from "@/api";

const ProfilePage = () => {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth:user") || "null");
    } catch {
      return null;
    }
  })();

  const deriveNameFromEmail = (email?: string | null) => {
    const emailUsername = String(email || "").split("@")[0] || "";
    return emailUsername
      .replace(/[._-]+/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  };

  const [editing, setEditing] = useState(false);
  const initialName = user?.name || deriveNameFromEmail(user?.email) || "Anonymous";
  const [name, setName] = useState<string>(initialName);
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [prefs, setPrefs] = useState<{ newsletter: boolean; alerts: boolean }>({ newsletter: true, alerts: true });
  const [notifyFreq, setNotifyFreq] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [savedProps, setSavedProps] = useState<Array<{ id: string; img?: string; price?: string; address?: string; details?: string }>>([]);
  const [apiKeys, setApiKeys] = useState<Array<{ id: number; name: string; created_at: string; revoked_at?: string }>>([]);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [generatingKey, setGeneratingKey] = useState(false);

  const initials = useMemo(() => {
    const n = (name && name !== "Anonymous" ? name : (user?.email?.split("@")[0] || "")).trim();
    if (!n) return "PP";
    const parts = n.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }, [name, user?.email]);

  // Provider badge (from social login or email)
  const provider = (user?.provider as "google" | "facebook" | "apple" | "x" | undefined) || (user?.email ? "email" as const : undefined);
  const providerLabel = (() => {
    switch (provider) {
      case "google": return "Google";
      case "facebook": return "Facebook";
      case "apple": return "Apple";
      case "x": return "X";
      case "email": return "Email";
      default: return undefined;
    }
  })();

  const logout = () => {
    localStorage.removeItem("auth:user");
    window.location.href = "/";
  };

  // Resolve name/avatar: prefer saved profile name; fallback to email username (Title Case)
  useEffect(() => {
    try {
      const emailKey = (user?.email || "").trim().toLowerCase();
      if (!emailKey) return;
      const profiles = JSON.parse(localStorage.getItem("auth:profiles") || "{}");
      const entry = profiles[emailKey] || {};
      const emailUsername = String(user?.email || "").split("@")[0] || "";
      const titleCaseFromEmail = emailUsername
        .replace(/[._-]+/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");

      const resolvedName = entry.name || user?.name || titleCaseFromEmail || "Anonymous";
      setName(resolvedName);
      if (!user?.avatar && entry.avatar) setAvatar(entry.avatar);
      // Optionally sync back into auth:user to avoid future Anonymous
      if ((user?.name !== resolvedName) || (!user?.avatar && entry.avatar)) {
        const updated = { ...(user || {}), name: resolvedName, avatar: entry.avatar || user?.avatar, email: user?.email };
        localStorage.setItem("auth:user", JSON.stringify(updated));
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load preferences
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("profile:prefs") || "null");
      if (saved && typeof saved === "object") {
        setPrefs({ newsletter: !!saved.newsletter, alerts: !!saved.alerts });
      }
    } catch {}
  }, []);

  const savePrefs = (next: { newsletter: boolean; alerts: boolean }) => {
    setPrefs(next);
    try { localStorage.setItem("profile:prefs", JSON.stringify(next)); } catch {}
  };

  // Load notification frequency and saved properties
  useEffect(() => {
    try {
      const freq = String(localStorage.getItem("profile:notify:freq") || "");
      if (freq === "daily" || freq === "weekly" || freq === "monthly") setNotifyFreq(freq);
    } catch {}
    try {
      const arr = JSON.parse(localStorage.getItem("saved:properties") || "[]");
      if (Array.isArray(arr)) setSavedProps(arr);
    } catch {}
  }, []);

  const onChangeFreq = (v: "daily" | "weekly" | "monthly") => {
    setNotifyFreq(v);
    try { localStorage.setItem("profile:notify:freq", v); } catch {}
    toast({ title: "Notification frequency updated", description: `You will receive ${v} updates.` });
  };

  const handleDownloadReport = () => {
    try {
      const doc = window.open("", "_blank");
      if (!doc) return;
      const styles = `
        body { font-family: ui-sans-serif, system-ui; padding: 24px; color: #111; }
        h1 { font-size: 24px; margin: 0 0 12px; }
        h2 { font-size: 18px; margin: 16px 0 8px; }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; background: #fff; }
        .muted { color: #555; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 4px 0; vertical-align: top; }
        .small { font-size: 12px; }
      `;
      const provider = (user?.provider as string) || (user?.email ? "email" : "");
      const prefsText = `${prefs.newsletter ? "Newsletter: On" : "Newsletter: Off"}, ${prefs.alerts ? "Alerts: On" : "Alerts: Off"}, Freq: ${notifyFreq}`;
      const savedCount = savedProps.length;
      const html = `<!doctype html><html><head><meta charset='utf-8'><title>Estate Luxe - Profile Report</title><style>${styles}</style></head><body>
        <h1>Estate Luxe - Profile Report</h1>
        <div class='card'>
          <table>
            <tr><td><strong>Name</strong></td><td>${name}</td></tr>
            <tr><td><strong>Email</strong></td><td>${user?.email || "-"}</td></tr>
            <tr><td><strong>Provider</strong></td><td>${provider || "-"}</td></tr>
          </table>
        </div>
        <h2>Preferences</h2>
        <div class='card'>${prefsText}</div>
        <h2>Saved Properties</h2>
        <div class='card'>Total saved: ${savedCount}</div>
        <p class='small muted'>Generated on ${new Date().toLocaleString()}</p>
        <script>window.onload = () => { window.print(); };</script>
      </body></html>`;
      doc.document.write(html);
      doc.document.close();
    } catch {}
  };

  const handleShareProfile = async () => {
    const shareData = {
      title: "Estate Luxe Profile",
      text: `Profile for ${name} (${
        user?.email || ""
      }). Notifications: ${notifyFreq}.` ,
      url: window.location.origin + "/profile",
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData as ShareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Link copied", description: "Profile link copied to clipboard." });
      } else {
        alert("Sharing not supported in this browser.");
      }
    } catch {}
  };

  const handleDeleteAccount = () => {
    if (!confirm("Are you sure you want to delete your account data from this device? This action cannot be undone.")) return;
    try {
      const current = JSON.parse(localStorage.getItem("auth:user") || "{}");
      const emailKey = String(current?.email || "").trim().toLowerCase();
      // Remove user
      localStorage.removeItem("auth:user");
      // Remove entry from profiles map
      try {
        const profiles = JSON.parse(localStorage.getItem("auth:profiles") || "{}");
        if (emailKey && profiles[emailKey]) {
          delete profiles[emailKey];
          localStorage.setItem("auth:profiles", JSON.stringify(profiles));
        }
      } catch {}
      // Optional: clear prefs
      localStorage.removeItem("profile:prefs");
    } catch {}
    window.location.href = "/";
  };

  const saveProfile = () => {
    try {
      const current = JSON.parse(localStorage.getItem("auth:user") || "{}");
      const safeName = (name || "").trim() || current.name; // avoid saving empty name
      const updated = { ...current, name: safeName, avatar };
      localStorage.setItem("auth:user", JSON.stringify(updated));
      // persist into profiles map keyed by email
      try {
        const profiles = JSON.parse(localStorage.getItem("auth:profiles") || "{}");
        const emailKey = (updated.email || "").trim().toLowerCase();
        if (emailKey) {
          profiles[emailKey] = { ...(profiles[emailKey] || {}), name: updated.name, avatar: updated.avatar, password: profiles[emailKey]?.password };
          localStorage.setItem("auth:profiles", JSON.stringify(profiles));
        }
      } catch {}
    } catch {}
    setEditing(false);
  };

  const onPickAvatar = () => fileInputRef.current?.click();
  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setAvatar(dataUrl);
      try {
        const current = JSON.parse(localStorage.getItem("auth:user") || "{}");
        const updated = { ...current, avatar: dataUrl };
        localStorage.setItem("auth:user", JSON.stringify(updated));
        // update profiles map as well
        try {
          const profiles = JSON.parse(localStorage.getItem("auth:profiles") || "{}");
          const emailKey = (updated.email || "").trim().toLowerCase();
          if (emailKey) {
            profiles[emailKey] = { ...(profiles[emailKey] || {}), avatar: dataUrl, name: profiles[emailKey]?.name, password: profiles[emailKey]?.password };
            localStorage.setItem("auth:profiles", JSON.stringify(profiles));
          }
        } catch {}
      } catch {}
    };
    reader.readAsDataURL(file);
  };
  const onRemoveAvatar = () => {
    setAvatar(null);
    try {
      const current = JSON.parse(localStorage.getItem("auth:user") || "{}");
      delete current.avatar;
      localStorage.setItem("auth:user", JSON.stringify(current));
      try {
        const profiles = JSON.parse(localStorage.getItem("auth:profiles") || "{}");
        const emailKey = (current.email || "").trim().toLowerCase();
        if (emailKey) {
          const entry = profiles[emailKey] || {};
          delete entry.avatar;
          profiles[emailKey] = entry;
          localStorage.setItem("auth:profiles", JSON.stringify(profiles));
        }
      } catch {}
    } catch {}
  };

  // API Key management functions
  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem("auth:token");
      if (!token) return;

      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api-keys`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.api_keys || []);
      }
    } catch (err) {
      console.error("Failed to fetch API keys:", err);
    }
  };

  const generateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      toast({ title: "Error", description: "Please enter a name for the API key." });
      return;
    }

    setGeneratingKey(true);
    try {
      const token = localStorage.getItem("auth:token");
      if (!token) {
        toast({ title: "Error", description: "Authentication required." });
        return;
      }

      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newApiKeyName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("api_key", data.key); // Store the new key
        toast({
          title: "API Key Generated",
          description: `Key: ${data.key.substring(0, 20)}... (copied to clipboard)`,
        });
        navigator.clipboard?.writeText(data.key);
        setNewApiKeyName("");
        fetchApiKeys();
      } else {
        const error = await res.text();
        toast({ title: "Error", description: error });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to generate API key." });
    } finally {
      setGeneratingKey(false);
    }
  };

  const revokeApiKey = async (keyId: number) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("auth:token");
      if (!token) return;

      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api-keys/${keyId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (res.ok) {
        toast({ title: "Success", description: "API key revoked." });
        fetchApiKeys();
        // If the revoked key was stored, remove it
        const storedKey = localStorage.getItem("api_key");
        if (storedKey) {
          // Check if the stored key matches any active key
          const activeKeys = apiKeys.filter(k => !k.revoked_at && k.id !== keyId);
          if (activeKeys.length === 0) {
            localStorage.removeItem("api_key");
          }
        }
      } else {
        const error = await res.text();
        toast({ title: "Error", description: error });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to revoke API key." });
    }
  };

  // Load API keys on mount
  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="glass p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Profile</h1>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleShareProfile}>Share</Button>
                  <Button className="btn-premium" onClick={handleDownloadReport}>Download Report</Button>
                </div>
              </div>

              {/* Header with Avatar */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 mb-8">
                <div className="relative w-20 h-20 md:w-24 md:h-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 blur-md"></div>
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="relative w-full h-full rounded-full object-cover border border-border/50" />
                  ) : (
                    <div className="relative w-full h-full rounded-full bg-muted/30 border border-border/50 flex items-center justify-center text-2xl md:text-3xl font-semibold tracking-wide">
                      {initials}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Name</div>
                    {editing ? (
                      <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
                    ) : (
                      <div className="text-xl font-semibold flex items-center gap-3">
                        {name}
                        {providerLabel && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5">
                            {/* simple provider glyphs */}
                            {provider === "google" && (
                              <span className="inline-block w-2 h-2 rounded-full bg-[#4285F4]" aria-hidden></span>
                            )}
                            {provider === "facebook" && (
                              <span className="inline-block w-2 h-2 rounded-full bg-[#1877F2]" aria-hidden></span>
                            )}
                            {provider === "apple" && (
                              <span className="inline-block w-2 h-2 rounded-full bg-white" aria-hidden></span>
                            )}
                            {provider === "x" && (
                              <span className="inline-block w-2 h-2 rounded-full bg-black" aria-hidden></span>
                            )}
                            <span className="text-foreground/80">{providerLabel}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Email</div>
                    <div className="text-xl font-medium break-all">{user.email}</div>
                  </div>
                </div>
                <div className="flex gap-2 md:self-start">
                  {editing ? (
                    <>
                      <Button onClick={saveProfile} className="btn-premium">Save</Button>
                      <Button variant="outline" onClick={() => { setEditing(false); setName(user.name || "Anonymous"); }}>Cancel</Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Saved Properties", value: 0 },
                  { label: "Valuations Run", value: 0 },
                  { label: "Member Since", value: new Date().getFullYear() },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/30 p-5">
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/valuation" className="group rounded-xl border border-border/50 bg-muted/20 p-6 transition hover:bg-muted/30">
                  <div className="text-lg font-semibold mb-1">Get a Valuation</div>
                  <div className="text-sm text-muted-foreground">Estimate your property's value instantly.</div>
                </a>
                <a href="/insights" className="group rounded-xl border border-border/50 bg-muted/20 p-6 transition hover:bg-muted/30">
                  <div className="text-lg font-semibold mb-1">Market Insights</div>
                  <div className="text-sm text-muted-foreground">Track local trends and recent sales.</div>
                </a>
                <a href="/calculator" className="group rounded-xl border border-border/50 bg-muted/20 p-6 transition hover:bg-muted/30">
                  <div className="text-lg font-semibold mb-1">Investment Calculator</div>
                  <div className="text-sm text-muted-foreground">Analyze returns and cash flow.</div>
                </a>
              </div>

              {/* Avatar actions */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" onClick={onPickAvatar}>Upload Photo</Button>
                {avatar && (
                  <Button variant="outline" onClick={onRemoveAvatar}>Remove Photo</Button>
                )}
              </div>
            </Card>

            {/* Preferences */}
            <Card className="glass p-8 mt-10">
                <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <div className="font-medium">Email newsletter</div>
                      <div className="text-sm text-muted-foreground">Get occasional product news and premium updates.</div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--secondary)]"
                      checked={prefs.newsletter}
                      onChange={(e) => savePrefs({ ...prefs, newsletter: e.target.checked })}
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <div className="font-medium">Price & listing alerts</div>
                      <div className="text-sm text-muted-foreground">Be notified about price changes and new matches.</div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--secondary)]"
                      checked={prefs.alerts}
                      onChange={(e) => savePrefs({ ...prefs, alerts: e.target.checked })}
                    />
                  </label>
                </div>
                {/* Notification frequency */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">Notification frequency</div>
                        <div className="text-sm text-muted-foreground">Choose how often to receive email alerts.</div>
                      </div>
                      <select
                        className="h-10 rounded-md bg-background/80 border border-white/10 px-3"
                        value={notifyFreq}
                        onChange={(e) => onChangeFreq(e.target.value as any)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
            </Card>

            {/* API Keys */}
            <Card className="glass p-8 mt-10">
              <h2 className="text-xl font-semibold mb-4">API Keys</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Generate API keys to access the valuation API programmatically. Keep your keys secure and revoke them if compromised.
              </p>

              {/* Generate new key */}
              <div className="flex gap-3 mb-6">
                <Input
                  placeholder="Enter a name for your API key"
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={generateApiKey}
                  disabled={generatingKey || !newApiKeyName.trim()}
                  className="btn-premium"
                >
                  {generatingKey ? "Generating..." : "Generate Key"}
                </Button>
              </div>

              {/* List existing keys */}
              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                    <div className="font-medium mb-1">No API keys yet</div>
                    <div className="text-sm text-muted-foreground">Generate your first API key to start using the valuation API.</div>
                  </div>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{key.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(key.created_at).toLocaleDateString()}
                          {key.revoked_at && ` • Revoked: ${new Date(key.revoked_at).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {key.revoked_at ? (
                          <span className="text-xs text-red-400">Revoked</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeApiKey(key.id)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="glass p-8 mt-10">
                <h2 className="text-xl font-semibold mb-4">Recent activity</h2>
                <div className="space-y-3">
                  {[ 
                    { t: "Logged in", d: "Just now" },
                    { t: "Viewed Market Insights", d: "Earlier today" },
                    { t: "Ran a valuation", d: "This week" },
                  ].map((ev, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{ev.t}</div>
                        <div className="text-xs text-muted-foreground">{ev.d}</div>
                      </div>
                      <span className="text-foreground/60 text-xs">Details</span>
                    </div>
                  ))}
                </div>
            </Card>

              {/* Connected accounts */}
              {providerLabel && (
                <Card className="glass p-8 mt-10">
                  <h2 className="text-xl font-semibold mb-4">Connected account</h2>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/5">
                        {provider?.[0]?.toUpperCase()}
                      </span>
                      <div>
                        <div className="font-medium">{providerLabel}</div>
                        <div className="text-xs text-muted-foreground">Used for sign-in</div>
                      </div>
                    </div>
                    <Button variant="outline" disabled title="Provider linking coming soon">Manage</Button>
                  </div>
                </Card>
              )}

            {/* Saved Properties */}
            <Card className="glass p-8 mt-10">
                <h2 className="text-xl font-semibold mb-4">Saved properties</h2>
                {savedProps.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                    <div className="font-medium mb-1">No saved properties yet</div>
                    <div className="text-sm text-muted-foreground mb-4">Save your favorite listings to quickly compare later.</div>
                    <div className="flex justify-center gap-3">
                      <a href="/insights"><Button variant="outline">Explore Insights</Button></a>
                      <a href="/valuation"><Button className="btn-premium">Run a Valuation</Button></a>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {savedProps.map((p) => (
                      <Card key={p.id} className="overflow-hidden border border-white/10 bg-white/5">
                        {p.img && (
                          <div className="h-32 overflow-hidden">
                            <img src={p.img} alt={p.address || "Saved property"} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-4">
                          {p.price && <div className="text-lg font-semibold text-primary">{p.price}</div>}
                          {p.address && <div className="font-medium text-foreground/90 mt-1">{p.address}</div>}
                          {p.details && <div className="text-xs text-muted-foreground mt-1">{p.details}</div>}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
            </Card>

            {/* Danger zone */}
            <Card className="glass p-8 mt-10">
              <h2 className="text-xl font-semibold mb-3 text-red-400">Danger zone</h2>
              <Card className="p-4 border-red-500/30 bg-red-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">Delete account data on this device</div>
                      <div className="text-xs text-foreground/70">Removes your saved profile and preferences from localStorage.</div>
                    </div>
                    <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white" onClick={handleDeleteAccount}>Delete</Button>
                  </div>
              </Card>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;






