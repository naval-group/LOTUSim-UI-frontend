# Lotusim UI - Frontend

A web application for interacting with LOTUSim without needing to hand-write YAML/SDF or script against ROS 2 directly: : creating and launching scenarios, and managing models.

Built with **React** + **Vite** + **Node.js**.

The UI talks to the [LOTUSim UI backend](https://github.com/naval-group/LOTUSim-UI-backend) over a REST API, with real-time position updates over WebSocket. If you'd rather not use the UI at all, you can interact with the backend's API directly, or bypass both and talk to LOTUSim's ROS 2 topics/services yourself.

---

## Getting started

**1. Start the backend** (see the [backend README](https://github.com/naval-group/LOTUSim-UI-backend) for full setup):

```shell
npm install
npx ts-node src/main.ts
```

**2. Start the frontend:**

```shell
npm install
npm run dev
```

**3. Open the UI** at [http://localhost:5173](http://localhost:5173).
 
> This assumes LOTUSim itself is already installed and running (`lotusim run`) - see [Getting Started](https://github.com/naval-group/LOTUSim/wiki/getting-started) on the main LOTUSim wiki if you haven't set that up yet.

---

## Features
 
| Feature | Status |
|---|---|
| **Home** | ✅ Implemented - geographic world map |
| **Scenarios** | ✅ Implemented - create, edit, save, and launch scenarios with multiple vessels, each with different plugins configured per vessel |
| **Models** | ✅ Implemented - add/remove/edit models in the database. You can also enter high-level specs. Long term goal: have the UI generate the xdyn/Gazebo/Unity config automatically |
| **Instance** | You can chose which running instance of LOTUSim to load. 📋 Planned - launching multiple independent LOTUSim instances from the UI |
 
For the full step-by-step walkthrough of building and launching a scenario through this UI, see the [Tutorial](https://github.com/naval-group/LOTUSim/wiki). The short version:
 
1. `lotusim run` + `lotusim ui`, then open the **Scenarios** tab → **+**
2. Fill in scenario details, then right-click the map to add a vessel
3. Pick a model, enable the plugins it needs (Rendering / Physics / Waypoint Follower), configure each
4. Save, then start `xdyn-for-cs` per vessel using the Physics Engine plugin, and launch the scenario from **Home**
---

## Scenario Model
 
A scenario consists of vessel **name**, **position**, and **model**. Individual models can't be edited per-scenario, by design, to avoid drift between what's tested and what's deployed. If you need a variant of an existing model (e.g. the same hull with a different sensor loadout), create a **separate model** for it instead of editing one in place.
 
**Environment settings (wave/wind/current) are not tied to a scenario** - they're set once on the **Home** screen instead, so the same scenario can be re-run against different environmental conditions without duplicating it.
 
---

## Related

- [LOTUSim](https://github.com/naval-group/LOTUSim) - the core simulator this UI drives
- [LOTUSim UI Backend](https://github.com/naval-group/LOTUSim-UI-backend) - REST/WebSocket server this frontend talks to
- [Full documentation (wiki)](https://github.com/naval-group/LOTUSim/wiki)
