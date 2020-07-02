import React, { Component } from 'react';

import * as THREE from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';

import $ from 'jquery';

import configs from '../configs.json';

import PointService from '../services/PointService';

// import { Tooltip } from 'antd';

let pointService = PointService.getInstance();

var camera, controls, scene, renderer, loader, pointcloud;

var raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.01;
var mouse = new THREE.Vector2();

var pointclouds;

var clock = new THREE.Clock();
var toggle = 0;

// var canvas1, context1, texture1, sprite1; //per il tooltip

var sphereKps = []; // array of {uuid, titolo}

const fids = configs['filenames'];
let selected_fid = fids[1];

const frameFolder = configs['pcd_folder'] + '/';

function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  const infoPoint = intersects.find((i) => i && i.object && i.object.info);
  if (infoPoint) {
    console.log(infoPoint);
    camera.position.set(
      infoPoint.point.x,
      infoPoint.point.y,
      infoPoint.point.z
    );
  }
}

function onDocumentMouseOver(event) {
  event.preventDefault();
  // sprite1.position.set(event.clientX, event.clientY - 20, 0);
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  let o = intersects.find((i) => i && i.object && i.object.info);
  if (o) {
    o = o.object;
    const infoPoint = o.info;

    //tooltip
    // // store color of closest object (for later restoration)
    // o.currentHex = o.material.color.getHex();
    // // set a new color for closest object
    // o.material.color.setHex(0xffff00);

    // context1.clearRect(0, 0, 640, 480);
    // var message = infoPoint.titolo;
    // var metrics = context1.measureText(message);
    // var width = metrics.width;
    // context1.fillStyle = 'rgba(0,0,0,0.95)'; // black border
    // context1.fillRect(0, 0, width + 8, 20 + 8);
    // context1.fillStyle = 'rgba(255,255,255,0.95)'; // white filler
    // context1.fillRect(2, 2, width + 4, 20 + 4);
    // context1.fillStyle = 'rgba(0,0,0,1)'; // text color
    // context1.fillText(message, 4, 20);
    // texture1.needsUpdate = true;
  }
}

class Visualizzator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: 0,
      intrinsic: 0,
      extrinsic: 0,
    };
  }

  componentDidMount() {
    this.init();
    window.addEventListener('resize', this.onWindowResize, false);
    window.addEventListener('click', onDocumentMouseDown, false);
    window.addEventListener('mousemove', onDocumentMouseOver, false);
    this.animate();
  }

  componentWillUnmount() {
    window.removeEventListener('resize');
    window.removeEventListener('mousemove');
    window.removeEventListener('click');
  }

  init = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x606060);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.dofAutofocus = true;
    this.mount.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(65, width / height, 1, 1000);
    camera.up.set(0, 1, 0);

    this.setState({
      intrinsic: this.cameraMatrix2npString(camera.projectionMatrix),
      extrinsic: this.cameraMatrix2npString(camera.matrixWorldInverse),
    });

    controls = new MapControls(camera, renderer.domElement);

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 500;
    controls.maxPolarAngle = 0.5 * Math.PI;

    //carico gli oggetti da file
    this.addPointcloud();
    this.addSphereInfo();

    //tooltip
    // canvas1 = document.createElement('canvas');
    // context1 = canvas1.getContext('2d');
    // context1.font = 'Bold 20px Arial';
    // context1.fillStyle = 'rgba(0,0,0,0.95)';
    // context1.fillText('Hello, world!', 0, 20);

    // // canvas contents will be used for a texture
    // texture1 = new THREE.Texture(canvas1);
    // texture1.needsUpdate = true;

    // ////////////////////////////////////////

    // var spriteMaterial = new THREE.SpriteMaterial({
    //   map: texture1,
    //   color: 0xffffff,
    // });

    // sprite1 = new THREE.Sprite(spriteMaterial);
    // sprite1.scale.set(200, 100, 1.0);
    // sprite1.position.set(50, 50, 0);
    // scene.add(sprite1);
  };

  cameraMatrix2npString = (cameraMatrix) => {
    var npString = 'np.array([';
    for (var i = 0; i < 4; i++) {
      npString += '[';
      for (var j = 0; j < 4; j++) {
        var pos = i * 4 + j;
        npString +=
          cameraMatrix.elements[pos] === 0
            ? cameraMatrix.elements[pos]
            : cameraMatrix.elements[pos].toFixed(4);
        if (j !== 3) {
          npString += ', ';
        }
      }
      npString += ']';
      if (i !== 3) {
        npString += ', ';
      }
    }
    npString += '])';
    return npString;
  };

  addPointcloud = () => {
    pointcloud = new THREE.Points(new THREE.Geometry(), new THREE.Material());
    loader = new PCDLoader();
    loader.load(
      frameFolder + '/' + selected_fid + '.pcd',
      (points) => {
        pointcloud = points;
        // if (points.material.color.r !== 1) {
        //   points.material.color.setHex(0x000000);
        // }
        // points.material.size = 0.02;
        scene.add(pointcloud);
        pointclouds = [pointcloud];
        const r = pointcloud.geometry.boundingSphere.radius;
        camera.position.set(r * 1.5, r * 0.5, r * 1.5);
      },
      (xhr) => {
        this.setState({
          loaded: Math.round((xhr.loaded / xhr.total) * 100),
        });
      }
    );
  };

  removePointcloud = () => {
    scene.remove(pointcloud);
  };

  removeSphereKps = () => {
    sphereKps.forEach((pair) => {
      const object = scene.getObjectByProperty('uuid', pair.uuid);
      object.geometry.dispose();
      object.material.dispose();
      scene.remove(object);
    });
    renderer.renderLists.dispose();
    sphereKps = [];
  };
  addSphereInfo = () => {
    pointService
      .loadPoints(selected_fid)
      .catch((err) => {
        console.log(err);
      })
      .then((infopoints) => {
        console.log(infopoints);
        Object.keys(infopoints).forEach((titolo) => {
          const dist = camera.position.distanceTo(infopoints[titolo].point);
          console.log(dist);
          const sphereKpGeometry = new THREE.SphereBufferGeometry(
            dist / 32,
            32,
            32
          );
          const sphereKpMaterial = new THREE.MeshBasicMaterial({
            color: infopoints[titolo].colore,
          });
          const sphereKp = new THREE.Mesh(sphereKpGeometry, sphereKpMaterial);
          sphereKp.position.copy(infopoints[titolo].point);
          sphereKps.push({
            uuid: sphereKp.uuid,
            titolo: titolo,
          });
          sphereKp.info = {
            titolo,
            descrizione: infopoints[titolo].descrizione,
          };
          scene.add(sphereKp);
        });
      });
  };
  animate = () => {
    this.setState({
      intrinsic: this.cameraMatrix2npString(camera.projectionMatrix),
      extrinsic: this.cameraMatrix2npString(camera.matrixWorldInverse),
    });
    requestAnimationFrame(this.animate);
    controls.update();
    camera.updateMatrixWorld();
    toggle += clock.getDelta();
    renderer.render(scene, camera);
  };

  onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  scaleDown = () => {
    var points = scene.getObjectByName(selected_fid + '.pcd');
    points.material.size *= 0.8;
    points.material.needsUpdate = true;
  };
  scaleUp = () => {
    var points = scene.getObjectByName(selected_fid + '.pcd');
    points.material.size *= 1.2;
    points.material.needsUpdate = true;
  };

  onFrameUpdate = (e) => {
    if (e == selected_fid) {
      return;
    }
    selected_fid = e;
    this.removeSphereKps();
    this.removePointcloud();
    this.addPointcloud();
    this.addSphereInfo();
  };

  render() {
    return (
      <div
        style={{ width: window.innerWidth, height: window.innerHeight }}
        ref={(mount) => {
          this.mount = mount;
        }}
      ></div>
    );
  }
}

export default Visualizzator;
