"use client";

import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";

const STORAGE_KEY = "hiremepwes-admin-secret";

export function AdminProtectedArea({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState("");
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("Enter my admin password once for this browser.");

  const verify = async (value: string) => {
    if (!value.trim()) {
      setMessage("Enter the admin password first.");
      return false;
    }

    setMessage("Checking this browser...");
    const response = await fetch("/api/admin/schedule", {
      headers: { "x-admin-secret": value },
      cache: "no-store",
    });

    if (!response.ok) {
      window.localStorage.removeItem(STORAGE_KEY);
      setAuthorized(false);
      setMessage("That password did not work.");
      return false;
    }

    window.localStorage.setItem(STORAGE_KEY, value);
    setAuthorized(true);
    setMessage("This browser is unlocked.");
    return true;
  };

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) ?? "";
    setSecret(saved);

    if (!saved) {
      setReady(true);
      return;
    }

    void verify(saved).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!authorized) return;

    const timer = window.setTimeout(() => {
      document.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
        const label = button.textContent?.trim().toLowerCase();
        if (label === "load" || label === "load schedule") button.click();
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [authorized]);

  const unlock = async () => {
    await verify(secret);
    setReady(true);
  };

  if (!ready) {
    return <div className="mx-auto max-w-xl px-4 py-16 text-center font-bold text-ink/60">Checking this browser...</div>;
  }

  if (!authorized) {
    return (
      <section className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <div className="card-pop p-6 sm:p-8">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-lavender-100 text-ink">
            <LockKeyhole className="size-7" />
          </div>
          <h1 className="mt-4 text-center text-3xl font-black text-ink">My admin</h1>
          <p className="mt-2 text-center text-sm font-bold text-ink/60">{message}</p>
          <div className="mt-6 grid gap-3">
            <input
              className="input-cute"
              type="password"
              placeholder="Admin password"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void unlock();
              }}
            />
            <button className="btn-primary" type="button" onClick={() => void unlock()}>
              Unlock this browser
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="admin-unlocked">
      {children}
      <style>{`
        .admin-unlocked input[type="password"],
        .admin-unlocked input[type="password"] + button {
          display: none;
        }
      `}</style>
    </div>
  );
}
