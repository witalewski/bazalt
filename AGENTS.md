# Bazalt Development Guidelines

## Running the App

- Assume the Expo dev server is running in the background
- Do NOT run `npx expo start` or `npx expo start --web` - the dev server should already be running
- If hot reload doesn't work, ask the user to restart the server

## Building

- Run `npx expo export --platform web` to build the web bundle (only when explicitly requested)
- The user will test locally and let you know if changes are needed

## Supabase

- Supabase MCP tools may not always be available
- If needed, use the CLI: `npx supabase db push` (requires SUPABASE_ACCESS_TOKEN)
- Database migrations are in `supabase/migrations/`

## Style Guidelines

- Black and white only, sharp corners, monospace fonts
- Always specify text color explicitly (color="white" or color="black") - never rely on defaults
