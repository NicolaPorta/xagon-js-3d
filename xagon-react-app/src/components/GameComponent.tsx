import React from 'react';
import {
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Scene,
  SceneLoader,
} from '@babylonjs/core';

import SceneComponent from 'components/SceneComponent';
import meshGenerator from 'debug/meshGenerator';
import Icosahedron from 'models/Icosahedron';
// import SceneComponent from 'babylonjs-hook'; // if you install 'babylonjs-hook' NPM.

const onSceneReady = (sceneArg: Scene) => {
  const scene: Scene = sceneArg;
  const alpha = -Math.PI / 2;
  const beta = Math.PI / 2.5;
  const radius = 3;
  const target = new Vector3(0, 0, 0);
  const camera = new ArcRotateCamera(
    'camera',
    alpha,
    beta,
    radius,
    target,
    scene,
  );

  const canvas = scene.getEngine().getRenderingCanvas();

  camera.attachControl(canvas, true);

  const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

  light.intensity = 1.1;
  light.setDirectionToTarget(target);
  // light.parent = camera;
  const icosahedron = new Icosahedron();
  icosahedron.subdivide();

  scene.metadata = { icosahedron };
  meshGenerator('icosahedron', scene, icosahedron.getTriangles());

  SceneLoader.ImportMeshAsync('', './assets/models/', 'triangle.babylon').then(
    () => {
      const triangle = scene.getMeshByName('Triangle');

      const scalingRatio = 1 / Math.sqrt(3); // triangle's edge scaling ratio
      if (triangle) {
        triangle.scaling = new Vector3(
          scalingRatio,
          scalingRatio,
          scalingRatio,
        );
        console.log('loaded', triangle);
      }
    },
  );
};

const onRender = (scene: Scene) => {
  // const icosahedron = scene.getTransformNodeByName('icosahedron');
  // if (icosahedron) {
  //   const deltaTimeInMillis = scene.getEngine().getDeltaTime();
  //   const rpm = 10;
  //   icosahedron.rotation.y +=
  //     (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  // }
};

const GameComponent: React.FC = () => (
  <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} />
);

export default GameComponent;
