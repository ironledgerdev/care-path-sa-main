Supabase Function CI Deployment

This repository includes a GitHub Actions workflow that deploys the Supabase Edge function `admin-data` and sets the required Supabase secrets. Use the workflow when you want CI to deploy the function securely (without exposing service_role in the client).

What the workflow does

- Installs supabase CLI
- Logs into Supabase using SUPABASE_ACCESS_TOKEN (GitHub secret)
- Links the project using SUPABASE_PROJECT_REF (GitHub secret)
- Sets SUPABASE_SERVICE_ROLE and SUPABASE_URL as Supabase project secrets
- Deploys the supabase function located at `supabase/functions/admin-data`
- Invokes the function as a smoke test

Required GitHub repository secrets

Add the following repository secrets (Repository -> Settings -> Secrets -> Actions):

- SUPABASE_ACCESS_TOKEN: A personal access token from Supabase (used with supabase CLI). Create in Supabase dashboard or via `supabase login` and token export.
- SUPABASE_PROJECT_REF: Your Supabase project ref (example: irvwoushpskgonjwwmap).
- SUPABASE_SERVICE_ROLE: Your Supabase service_role key (server-only secret). The workflow will set this as a Supabase secret.
- SUPABASE_URL: Your Supabase project URL (example: https://irvwoushpskgonjwwmap.supabase.co).

How to trigger

- Push to branch `ai_main_885320a640e6` or run the workflow manually from the Actions tab (Workflow: Deploy Supabase admin-data Function -> Run workflow).

Security notes

- Do NOT add SUPABASE_SERVICE_ROLE to your frontend environment. It must remain a server-side secret.
- The GitHub Actions runner will use SUPABASE_ACCESS_TOKEN to authenticate the supabase CLI; keep that token restricted and rotate periodically.

Troubleshooting

- If the workflow fails during `supabase login`, verify SUPABASE_ACCESS_TOKEN is correct.
- If `supabase functions deploy` fails, check the function logs and ensure the `supabase/functions/admin-data` directory exists and contains a valid function (the repo already includes one).

If you want, I can also:
- Add a Netlify build hook to trigger the site redeploy after function deployment.
- Create a small script to validate the function output and post the result as a GitHub annotation.
