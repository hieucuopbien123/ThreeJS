/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from "three";
import { useFrame, useGraph } from '@react-three/fiber';
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
const model = new URL("./models/Stag-transformed.glb", import.meta.url);

export function Stag2(props) {
  const group = useRef(null);
  const { materials, animations, scene } = useGLTF(model.href);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);

  const { actions } = useAnimations(animations, group);
  const { action } = props;
  const previousAction = usePrevious(action);

  // # Tải và dùng model / Dùng animation của model
  useEffect(() => {
    console.log("Here");
    console.log(previousAction);
    if (previousAction) {
      actions[previousAction].fadeOut(0.2);
      actions[action].stop();
    }
    actions[action].play();
    actions[action].fadeIn(0.2);
  }, [actions, action, previousAction]);
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="AnimalArmature">
          <primitive object={nodes.Body} />
          <primitive object={nodes.IKBackLegL} />
          <primitive object={nodes.IKFrontLegL} />
          <primitive object={nodes.IKBackLegR} />
          <primitive object={nodes.IKFrontLegR} />
          <group name="Stag">
            <skinnedMesh name="Cube" geometry={nodes.Cube.geometry} material={materials.Material} skeleton={nodes.Cube.skeleton} />
            <skinnedMesh name="Cube_1" geometry={nodes.Cube_1.geometry} material={materials['Material.001']} skeleton={nodes.Cube_1.skeleton} />
            <skinnedMesh name="Cube_2" geometry={nodes.Cube_2.geometry} material={materials['Material.003']} skeleton={nodes.Cube_2.skeleton} />
            <skinnedMesh name="Cube_3" geometry={nodes.Cube_3.geometry} material={materials['Material.010']} skeleton={nodes.Cube_3.skeleton} />
            <skinnedMesh name="Cube_4" geometry={nodes.Cube_4.geometry} material={materials['Material.011']} skeleton={nodes.Cube_4.skeleton} />
          </group>
        </group>
      </group>
    </group>
  )
}
useGLTF.preload(model.href);

// Đơn giản ta làm 1 cái hook với current luôn lưu cái action hiện tại
// Cụ thể khi ấn đổi action, nó chạy vào usePrevious trước, tại đây nó chạy hết và lấy return, sau đó mới chạy
// useEffect gán ref.current là action mới. Trong Stag2 thì previousAction vẫn lấy ra action cũ thì ta stop nó
// và chạy action mới thôi
function usePrevious(value) {
  console.log("previous");
  const ref = useRef();
  useEffect(() => {
    console.log("Check");
    ref.current = value;
  }, [value]);
  
  console.log("previous2");
  return ref.current;
}