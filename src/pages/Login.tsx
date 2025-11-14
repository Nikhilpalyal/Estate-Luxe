import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Facebook } from "lucide-react";
import luxeLogo from "@/assets/Luxe Estate Logo Design.png";
import { useLocation, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState<boolean>(() => {
    try {
      return localStorage.getItem("auth:remember") === "true";
    } catch {
      return true;
    }
  });

  // Router utilities to support redirect-after-login
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from?.pathname || "/profile";

  // Prefill from previously saved user
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("auth:user") || "null");
      if (saved?.email) {
        setEmail(saved.email);
        if (saved?.password) setPassword(saved.password);
        // If name missing, try hydrate from profiles map
        if (!saved?.name) {
          try {
            const profiles = JSON.parse(localStorage.getItem("auth:profiles") || "{}");
            const key = String(saved.email).trim().toLowerCase();
            const entry = profiles[key] || {};
            if (entry.name) {
              localStorage.setItem("auth:user", JSON.stringify({ ...saved, name: entry.name, avatar: saved.avatar ?? entry.avatar }));
            }
          } catch {}
        }
      }
    } catch {}
  }, []);

  // Persist remember preference
  useEffect(() => {
    try { localStorage.setItem("auth:remember", String(remember)); } catch {}
  }, [remember]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const profiles = JSON.parse(localStorage.getItem("auth:profiles") || "{}");
      const emailKey = String(email || "").trim().toLowerCase();
      const profile = profiles[emailKey];
      if (!profile) {
        toast({ title: "Account not found", description: "Please sign up before logging in." });
        navigate("/signup", { replace: false, state: { from: { pathname: from } } });
        return;
      }
      const storedPass = String(profile.password || "");
      if (!storedPass || storedPass !== password) {
        toast({ title: "Incorrect password", description: "Please try again or reset your password." });
        return;
      }
      const toStore: any = {
        email: emailKey,
        name: profile.name,
        avatar: profile.avatar,
        password: remember ? storedPass : undefined,
      };
      localStorage.setItem("auth:user", JSON.stringify(toStore));
      if (!remember) {
        // do not persist password back to profiles if remember is off
      }
      navigate(from, { replace: true });
    } catch {
      toast({ title: "Login error", description: "Something went wrong logging you in." });
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook" | "apple" | "x") => {
    // With local auth, require sign-up first.
    toast({ title: "Sign up required", description: `Please sign up first to continue with ${provider}.` });
    navigate("/signup", { replace: false, state: { from: { pathname: from } } });
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Premium black-to-gold gradient with subtle watermark logo */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0b0b0f] to-[#221600]" />
        {/* Full background image (provided Luxe asset) */}
        <img
          src={luxeLogo}
          alt="Estate Luxe background"
          className="absolute inset-0 w-full h-full object-cover object-left opacity-70"
        />
        {/* Soft gold glow accents (responsive sizes) */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-br from-[#CBA13533] via-[#d4af3733] to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] md:w-[700px] md:h-[700px] rounded-full bg-gradient-to-tl from-[#CBA13526] via-[#d4af3726] to-transparent blur-3xl" />
        {/* Vignette for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/60" />
      </div>
      <Navigation />
      <main className="pt-16">
        <section className="py-20">
          <div className="max-w-md mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8">
              <span className="bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent tracking-wide">
                Welcome
              </span>
            </h1>
            <Card className="glass p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl bg-white/5">
              <h1 className="text-3xl font-bold mb-6">Login</h1>
              <form onSubmit={handleLogin} className="space-y-6">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white/10 text-white placeholder:text-white/60 border border-white/20 focus:ring-2 focus:ring-secondary/60 focus:outline-none shadow-sm"
                  required
                />
                <div className="relative">
                  <Input
                    type={show ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12 bg-white/10 text-white placeholder:text-white/60 border border-white/20 focus:ring-2 focus:ring-secondary/60 focus:outline-none shadow-sm"
                    required
                  />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-foreground/70 hover:text-foreground">
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
                <Button type="submit" className="btn-premium w-full mt-3">Login</Button>
                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="text-xs text-foreground/70 whitespace-nowrap">(or continue)</span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>

                {/* Social auth icons */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    className="group h-11 w-11 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 shadow-[0_6px_16px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.45)] flex items-center justify-center [perspective:600px] transition-all"
                    aria-label="Continue with Google"
                  >
                    {/* Google G (official mark, 18x18 viewBox) with 3D hover */}
                    <svg className="h-5 w-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] [transform:translateZ(0.001px)] group-hover:[transform:rotateX(8deg)_rotateY(-6deg)_scale(1.03)] transition-transform duration-300" viewBox="0 0 18 18" aria-hidden>
                      <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2091 1.1273-.8436 2.0818-1.793 2.7182v2.259h2.9082c1.7027-1.5682 2.6818-3.8773 2.6818-6.6182z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1773l-2.9082-2.259c-.806.54-1.8368.8591-3.0482.8591-2.3455 0-4.3309-1.5845-5.0382-3.7136H.9573v2.3318C2.4382 15.978 5.4818 18 9 18z"/>
                      <path fill="#FBBC05" d="M3.9618 10.7091c-.18-.54-.2818-1.1182-.2818-1.7091s.1018-1.1691.2818-1.7091V4.9591H.9573C.3477 6.1745 0 7.5545 0 9s.3477 2.8255.9573 4.0409l3.0045-2.3318z"/>
                      <path fill="#EA4335" d="M9 3.5455c1.3191 0 2.5082.4546 3.4418 1.3455l2.5819-2.5818C13.4646.84 11.4273 0 9 0 5.4818 0 2.4382 2.0227.9573 4.9591l3.0045 2.3318C4.6691 5.1291 6.6545 3.5455 9 3.5455z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("facebook")}
                    className="group h-11 w-11 rounded-full border border-white/10 bg-[#1877F2]/85 hover:bg-[#1877F2] shadow-[0_2px_8px_rgba(24,119,242,0.25)] hover:shadow-[0_3px_10px_rgba(24,119,242,0.28)] flex items-center justify-center transition-colors duration-200"
                    aria-label="Continue with Facebook"
                  >
                    <Facebook className="h-5 w-5 text-white/90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("apple")}
                    className="group h-11 w-11 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 shadow-[0_6px_16px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.45)] flex items-center justify-center [perspective:600px] transition-all"
                    aria-label="Continue with Apple"
                  >
                    {/* Apple logo (inline SVG) */}
                    <svg className="h-5 w-5 text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] [transform:translateZ(0.001px)] group-hover:[transform:rotateX(8deg)_rotateY(6deg)_scale(1.03)] transition-transform duration-300" viewBox="0 0 256 315" fill="currentColor" aria-hidden>
                      <path d="M213.803 167.163c.41 44.363 38.969 59.15 39.395 59.325-.326 1.048-6.16 21.119-20.305 41.825-12.229 17.826-24.911 35.59-45.004 35.945-19.66.35-26.027-11.636-48.558-11.636-22.53 0-29.615 11.287-48.34 11.986-19.42.7-34.24-19.257-46.54-37.04-25.34-36.7-44.748-103.76-18.725-149.03 12.962-22.522 36.17-36.84 61.381-37.165 19.167-.37 37.27 12.982 48.558 12.982 11.29 0 33.392-16.06 56.295-13.707 9.582.398 36.53 3.873 53.812 29.16-1.384.86-32.139 18.792-31.969 56.355M175.07 20.97C186.18 7.618 201.65.293 216.26 0c1.858 15.264-4.923 30.49-13.916 41.24-9.088 10.91-24.17 19.34-38.886 18.12-2.115-14.82 5.61-30.16 11.613-38.39" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("x")}
                    className="group h-11 w-11 rounded-full border border-white/20 bg-gradient-to-br from-[#0f0f10] to-[#1b1b1f] shadow-[0_6px_16px_rgba(0,0,0,0.45)] hover:shadow-[0_8px_22px_rgba(0,0,0,0.6)] flex items-center justify-center [perspective:600px] transition-all"
                    aria-label="Continue with X"
                  >
                    {/* X (formerly Twitter) logo with 3D effect */}
                    <svg className="h-5 w-5 text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] [transform:translateZ(0.001px)] group-hover:[transform:rotateX(8deg)_rotateY(6deg)_scale(1.03)] transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M18.244 2H21l-6.52 8.11L22 22h-6.244l-4.36-6.22L6.2 22H3l6.93-8.85L2 2h6.32l3.9 5.61L18.244 2zm-1.09 18h1.73L8.65 4h-1.8l10.3 16z"/>
                    </svg>
                  </button>
                </div>
                {/* Controls row: right-aligned Remember me + Forgot password */}
                <div className="flex justify-between items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-sm text-foreground/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-border/60 bg-background/60 accent-[var(--secondary)]"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => toast({
                      title: "Password reset",
                      description: "If this email exists, a reset link will be sent shortly.",
                    })}
                    className="text-sm text-secondary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                {/* Consent note */}
                <p className="mt-4 text-center text-xs text-foreground/70">
                  By creating this account, you agree to our
                  {' '}<a href="/privacy" className="text-foreground font-medium hover:underline">Privacy Policy</a>
                  {' '}&&{' '}
                  <a href="/cookies" className="text-foreground font-medium hover:underline">Cookie Policy</a>.
                </p>
              </form>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;


