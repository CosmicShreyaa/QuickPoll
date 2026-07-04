import { useEffect, useState } from "react";
import { api, setToken } from "./api-client";

const USER_KEY = "quickpoll_user";
const EVT = "quickpoll:auth";

export type User = { name: string; email: string };

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function setSession(user: User | null, token: string | null) {
  if (typeof window === "undefined") return;
  if (user && token) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  setToken(token);
  window.dispatchEvent(new Event(EVT));
}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const { user, token } = await api.signUp(name, email, password);
  setSession(user, token);
  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const { user, token } = await api.signIn(email, password);
  setSession(user, token);
  return user;
}

export function signOutUser() {
  setSession(null, null);
}

export function useAuth() {
  const [user, setState] = useState<User | null>(null);
  useEffect(() => {
    setState(getUser());
    const h = () => setState(getUser());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return { user, signOut: signOutUser };
}
