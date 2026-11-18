# Fraction Lab

A classroom-ready, interactive 3D lesson on fractional distillation for Class XI chemistry.

## Presenting

Open the hosted website, or double-click `fraction-lab-offline.html` in the dist folder. The offline file contains the model, font, scripts and styles; it does not require internet access to run. External reading links still require internet.

Click **Present** for larger labels and fullscreen. Use **Space** to play/pause, **← / →** to change stage, **F** to toggle presentation mode, **L** to toggle labels, and **R** to restart. Escape exits fullscreen. Click labelled apparatus parts to read their role. Drag to rotate; use the + / − buttons to zoom. The view-reset button restores the camera.

The lesson includes a presenter-controlled five-stage apparatus animation, a fractionating-column cutaway, a separate 3D petroleum-refinery model, a three-question quiz with feedback, simple-distillation comparison, and lesson notes with source links.

## Running and editing the source

Requires Node.js 20 or newer.

```sh
npm install
npm test
npm run build
npm run dev
```

Open http://localhost:4173. `src/model.js` contains the Three.js scene, `src/lesson.js` contains the lesson and playback logic, and `src/app.js` connects the controls. Static HTML and CSS live in `dist/`. `npm run build` bundles the JavaScript into `dist/app.js` and regenerates the standalone offline file in the dist folder.

## Science and scope

This is an illustrative teaching model, not a numerical prediction of vapour–liquid equilibrium. Liquid A and Liquid B are fictional. Colours and motion explain enrichment; no purity, temperature, collection-volume or composition measurements are claimed. The industrial tower is schematic. See the in-app notes for the azeotrope limitation and references.

The 3D models are original procedural geometry. Three.js is MIT licensed; the local DM Sans font is distributed under the SIL Open Font License. No analytics, accounts, external runtime requests or personal-data collection are included in the application.

Designed and browser-checked for a 1920×1080 classroom display, with a responsive phone layout. Modern WebGL2-capable browsers are required for 3D; explanations and the quiz remain available if 3D cannot start.

## Manual classroom lesson

Continue advances exactly one stage. Animations loop within the selected stage until you choose Continue or another stage. Pause animation freezes the current animation; Replay restarts it. After Collect, Show summary opens a recap. Every apparatus label opens an animated explanation panel. Refinery fraction selections open a submenu and highlight the selected outlet flow.

## Hosting

Run `npm ci` then `npm run build`. Publish the `dist` directory on any static host. No server, secrets or environment variables are required. `npm run dev` starts the local preview on port 4173. The page scrolls naturally on small or zoomed screens. The opening illustration supports pause and reduced-motion preferences.
