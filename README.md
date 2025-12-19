<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ADruvH0IJV98C_F2i6grD94YEemRIOim

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on GitHub Pages

1. Push to `main` (the GitHub Action will build automatically).
2. After the first successful run, open **Settings → Pages** and set **Source** to **GitHub Actions**. If prompted for a branch, pick `gh-pages`.
3. Wait for the deploy workflow to finish; the live URL appears in the Pages settings once green.

You got this!
