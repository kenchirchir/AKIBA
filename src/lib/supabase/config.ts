function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `${name} is missing. Copy .env.example to .env.local and add your Supabase project details.`,
    );
  }
  return value;
}

export function supabaseConfig() {
  return {
    url: required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    publishableKey: required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}
