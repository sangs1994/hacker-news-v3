const BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("Missing REACT_APP_API_BASE_URL in environment variables.");
}

export async function hnGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`HN API error ${res.status} for ${path}`);
  }

  return (await res.json()) as T;
}
