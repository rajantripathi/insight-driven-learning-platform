
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0c7281b7-d126-48d7-91b7-9b93be42a24d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0c7281b7-d126-48d7-91b7-9b93be42a24d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Local Setup

For local development with your own Supabase project:

1. **Clone and install dependencies**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   npm install
   ```

2. **Environment configuration**
   ```sh
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - `OPENAI_API_KEY` - Your OpenAI API key (for Edge Functions)

3. **Database setup**
   ```sh
   # Initialize Supabase (if not already done)
   supabase init
   
   # Push database schema
   supabase db push
   ```

4. **Start development server**
   ```sh
   npm run dev
   ```

## Security Note

After replacing the dummy Supabase keys with your own production keys, rotate your Supabase anon key and consider scrubbing the old secrets from git history:

```sh
# Optional: Remove old secrets from git history
git filter-repo --path src/lib/aiClient.ts --invert-paths
```

## Architecture

This project includes several key features:

- **Authentication & Authorization**: User roles (teacher, student) with Supabase Auth
- **AI Integration**: OpenAI-powered lesson and quiz generation
- **Rate Limiting**: Built-in guardrails to prevent API abuse (1-minute cooldown on rate limits)
- **Real-time Updates**: Course and lesson management with live data sync
- **Responsive Design**: Mobile-first UI built with Tailwind CSS and shadcn/ui

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Authentication, Database, Edge Functions)
- OpenAI API

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0c7281b7-d126-48d7-91b7-9b93be42a24d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
