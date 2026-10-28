# Weekly Shop

A two-tab shopping list (list + meals). Meal ingredients merge into one combined list.
The list is kept on each device and also synced to Netlify Blobs through one function.

## Layout

    public/index.html              the whole app
    netlify/functions/state.mjs    GET/PUT /api/state, stores one JSON document in Netlify Blobs
    netlify.toml                   publish folder and functions folder
    package.json                   pulls in @netlify/blobs

## Deploy

1. Push this folder to a GitHub repo.
2. In Netlify: Add new project > Import from Git > pick the repo.
   Build command: leave empty. Publish directory and functions folder come from netlify.toml.
3. Open the site. The first device to load sends its list up; other devices pick it up.

Blobs needs no setup on a deployed site.

## Optional passcode

The site URL is public, so anyone who finds it could change the list.
To lock it, add an environment variable in Netlify (Project configuration > Environment variables):

    APP_PASSCODE = something-you-choose

Redeploy. Each device asks for the passcode once and remembers it.
Do not put the passcode in the repo.

## Try it locally

    npm install
    npx netlify-cli dev

Local dev uses a local copy of Blobs, separate from the live site.

## How syncing behaves

- Every change saves to the device straight away, then to Netlify about a second later.
- The page checks for newer data when you come back to the tab or the phone comes back online.
- Each save carries the version it was based on. If another device saved first, this device
  takes the newer copy and shows "Updated from another device". Redo the last change.
- Offline works: changes wait on the device and send when you are back online.
