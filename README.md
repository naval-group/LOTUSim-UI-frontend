# Lotusim_UI

The goal for this UI is for user to easily interact with the Lotusim system.

The UI is based on REACT framework.

The UI is interfacing with a backend and if user choose not to use this UI, feel free to interact with the backend server API or even directly with ROS2 topics.

## Getting started

Starting [backend](https://github.com/naval-group/LOTUSim-UI-backend)

```shell
npm install
npx ts-node src/main.ts
```

Starting frontend

```shell
npm install
npm run dev
```

## Functions

1. Instance (**TBD**) : The backend server will be capable of launching different Lotusim Instance on it. User will be able to use UI to create new instance.

2. Models (**TBD**) : The user will be able to create models.

3. Scenario (**TBD**) : The user will be able to create scenario with multiple vessel.

4. Launching scenario (**TBD**) : The user will be able to launch scenario in the UI

## Scenario

Scenario consist of Vessels name, position and models. The individual model will not be allowed to be change to reduce complication. If similar models with different sensors are used, please create a seperate model for it.

Environment variables will not be tied to scenario to allow scenario to run in different environments.

Instead environment will be set in the Home screen.
