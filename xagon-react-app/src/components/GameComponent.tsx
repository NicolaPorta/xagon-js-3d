import React from 'react';
import {
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Scene,
  SceneLoader,
  TransformNode,
  SkeletonViewer,
  BoneAxesViewer,
  BoneLookController,
  Color3,
} from '@babylonjs/core';

import SceneComponent from 'components/SceneComponent';
import meshGenerator from 'debug/meshGenerator';
import Icosahedron from 'models/Icosahedron';

import { addAxisToScene } from 'utils';
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
  camera.minZ = 0.1;
  camera.lowerRadiusLimit = 1.5; // we dont' want to get too close

  const canvas = scene.getEngine().getRenderingCanvas();
  camera.attachControl(canvas, true);

  const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

  light.intensity = 1.1;
  light.setDirectionToTarget(target);
  // light.parent = camera;
  const icosahedron = new Icosahedron();
  icosahedron.subdivide();
  icosahedron.subdivide();
  // icosahedron.subdivide();
  const triangles = icosahedron.getTriangles();

  scene.metadata = { icosahedron };
  meshGenerator('icosahedron', scene, icosahedron.getTriangles());

  SceneLoader.ImportMeshAsync(
    'TriangleMesh',
    './assets/models/',
    'triangle.babylon',
  ).then(({ meshes, skeletons }) => {
    if (meshes && meshes.length > 0) {
      const triangleMesh = meshes[0];
      // console.log('loaded', triangleMesh);
      // console.log('meshes', meshes);

      if (!skeletons || skeletons.length === 0) {
        console.warn('No skeletons found');
      }
      const triangleRadius = 1;
      const triangleSide = triangleRadius * (3 / Math.sqrt(3));
      const triangleEdgeLength = icosahedron.findShortestEdgeLength();
      const scalingRatio = (1 / triangleSide) * triangleEdgeLength * 0.9;

      triangles
        // .slice(0, 3)
        .map((tr, i) => {
          triangleMesh.scaling = new Vector3(
            scalingRatio,
            scalingRatio,
            scalingRatio,
          );
          const meshClone = triangleMesh?.clone(`Triangle${i}`, triangleMesh);
          if (meshClone) {
            const meshNode = new TransformNode(`tranformNode${i}`);
            meshClone.metadata = { triangle: tr };
            const triangleCenter = tr.getCenterPoint();
            const direction = triangleCenter; // Center - origin
            meshClone.parent = meshNode;
            meshNode.setDirection(direction, 0, Math.PI / 2, 0);
            meshClone.position = new Vector3(0, direction.length(), 0);

            // addAxisToScene({ scene, size: 1, parent: meshClone });

            const p1CenterVector = tr.p1().subtract(triangleCenter);

            const angle = Vector3.GetAngleBetweenVectors(
              meshNode.forward,
              p1CenterVector,
              meshNode.up,
            );
            console.log(angle);

            meshClone.rotate(meshClone.up, angle);

            if (skeletons && triangleMesh.skeleton) {
              const skeletonMesh = triangleMesh.skeleton.clone(`skeleton${i}`);
              meshClone.skeleton = skeletonMesh;
              // skeletonMesh.bones[0].scale(i, i, i);
              // skeletonMesh.bones[1].scale(1, 1, 1);
              // skeletonMesh.bones[2].scale(1, 1, 1);

              // https://www.babylonjs-playground.com/#1B1PUZ#15
              const bone0DirectionFix = new BoneLookController(
                meshClone,
                skeletonMesh.bones[0],
                tr.p3(),
                {
                  adjustYaw: Math.PI * 0.5,
                  adjustRoll: Math.PI * 0.5,
                },
              );
              const bone1DirectionFix = new BoneLookController(
                meshClone,
                skeletonMesh.bones[1],
                tr.p2(),
                {
                  adjustYaw: Math.PI * 0.5,
                  adjustRoll: Math.PI * 0.5,
                  adjustPitch: Math.PI,
                },
              );
              const bone2DirectionFix = new BoneLookController(
                meshClone,
                skeletonMesh.bones[2],
                tr.p1(),
                { adjustYaw: Math.PI * 0.5, adjustRoll: Math.PI * 0.5 },
              );
              scene.registerBeforeRender(() => {
                bone0DirectionFix.update();
                bone1DirectionFix.update();
                bone2DirectionFix.update();
              });

              // console.log(meshClone.skeleton);

              // scene.debugLayer.show();

              // const skeletonViewer = new SkeletonViewer(
              //   meshClone.skeleton,
              //   meshClone,
              //   scene,
              // );
              // skeletonViewer.isEnabled = true;
              // skeletonViewer.color = Color3.Red();
              // scene.registerBeforeRender(() => {
              //   skeletonViewer.update();
              // });

              // skeletonMesh.bones.forEach((bone) => {
              //   new BoneAxesViewer(scene, bone, meshClone);
              // });
            }
          }
        });
      triangleMesh.visibility = 0;
    }
  });
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
