import React, { Component } from 'react';

import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import $ from 'jquery';

import '../static/Annotator.css';
import configs from '../configs.json';

import PointService from '../services/PointService';

let pointService = PointService.getInstance();

var camera, controls, scene, stats, renderer, loader, pointcloud;
// var bboxHelperList = [];

var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.01;

var pointclouds;

var clock = new THREE.Clock();
var toggle = 0;

var sphereKps = []; // array of {uuid, keypoint_label}

var sphereGeometry = new THREE.SphereBufferGeometry(0.04, 32, 32);
var sphereMaterial = new THREE.MeshBasicMaterial({ color: '#FF0000' });
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.scale.set(1, 1, 1);

function range(start, end) {
  return new Array(end - start + 1)
    .fill(undefined)
    .map((_, i) => (i + start).toString());
}

const fids = range(configs['begin_fid'], configs['end_fid']);
// const bboxes = fids;
var selected_fid = fids[0];

const frameFolder = configs['pcd_folder'] + '/' + configs['set_nm'];
// const bboxFolder = settings["configs"]["bbox_folder"] + "/" + set_nm;

function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  const infoPoint = intersects.find((i) => i && i.object && i.object.callback);
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
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  const infoPoint = intersects.find((i) => i && i.object && i.object.callback);
  if (infoPoint) {
    infoPoint.object.callback();
  }
}

/////////////////////////////////////////

class Annotator extends Component {
  constructor(props) {
    super(props);
    console.log(props.infoPoints);

    for (const title in props.infoPoints) {
      const infoPoint = props.infoPoints[title];
      pointService.addKeypoint(selected_fid, title, infoPoint);
    }

    this.state = {
      loaded: 0,
      intrinsic: 0,
      extrinsic: 0,
      point: [],
      selected_keypoint_label: '',
      selected_keypoint_color: '#FFFFFF',
    };
  }

  componentDidMount() {
    this.init();

    window.addEventListener('resize', this.onWindowResize, false);
    window.addEventListener('keypress', this.onKeyPress);
    window.addEventListener('mousemove', this.onMouseMove, false);
    window.addEventListener('click', this.onMouseClick, false);
    window.addEventListener('click', onDocumentMouseDown, false);
    window.addEventListener('mousemove', onDocumentMouseOver, false);
    this.animate();
  }

  componentWillUnmount() {
    window.removeEventListener('resize');
    window.removeEventListener('keypress');
    window.removeEventListener('click');
    window.removeEventListener('mousemove');
  }

  init = () => {
    $('.alert-success').hide();

    const width = window.innerWidth;
    const height = window.innerHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.dofAutofocus = true;
    this.mount.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(65, width / height, 1, 1000);
    // camera = new THREE.OrthographicCamera( 5, -5, 3, 0, 1, 1000 );
    camera.position.set(4, 4, 4);
    camera.up.set(0, 0, 1);

    this.setState({
      intrinsic: this.cameraMatrix2npString(camera.projectionMatrix),
      extrinsic: this.cameraMatrix2npString(camera.matrixWorldInverse),
    });

    // controls

    controls = new MapControls(camera, renderer.domElement);

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 1;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 2;

    this.showSphereKps();
    // point cloud
    this.addPointcloud();

    // bbox
    // this.addBbox();

    // stats
    stats = new Stats();

    // sphere
    scene.add(sphere);
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
        scene.add(pointcloud);
        pointclouds = [pointcloud];
      },
      (xhr) => {
        this.setState({
          loaded: Math.round((xhr.loaded / xhr.total) * 100),
        });

        // console.log( ( this.state.loaded ) + '% loaded' );
      }
    );

    // loader = new PLYLoader();
    // loader.load(frameFolder + '/' + selected_fid + '.ply', function (geometry) {
    //   geometry.computeVertexNormals();

    //   var material = new THREE.MeshStandardMaterial({
    //     color: 0x0055ff,
    //     flatShading: true,
    //   });
    //   var mesh = new THREE.Mesh(geometry, material);

    //   mesh.position.y = -0.2;
    //   mesh.position.z = 0.3;
    //   mesh.rotation.x = -Math.PI / 2;

    //   mesh.castShadow = true;
    //   mesh.receiveShadow = true;

    //   scene.add(mesh);
    // });
  };

  showSphereKps = () => {
    const keypoints = pointService.getKeypoints();
    console.log(keypoints);
    if (typeof keypoints[selected_fid] !== 'undefined') {
      console.log('existed');

      var keypoint_labels = Object.keys(keypoints[selected_fid]);

      for (const keypoint_label of keypoint_labels) {
        for (const keypoint of configs['keypoints']) {
          if (keypoint.label === keypoint_label) {
            var keypoint_color = keypoint.color;
          }
        }
        var sphereKpGeometry = new THREE.SphereBufferGeometry(0.04, 32, 32);
        var sphereKpMaterial = new THREE.MeshBasicMaterial({
          color: keypoint_color,
        });
        var sphereKp = new THREE.Mesh(sphereKpGeometry, sphereKpMaterial);
        sphereKp.position.copy(keypoints[selected_fid][keypoint_label]);
        sphereKps.push({
          uuid: sphereKp.uuid,
          keypoint_label: keypoint_label,
        });
        sphereKp.callback = function () {
          console.log('g');
        };
        scene.add(sphereKp);
      }
    }
  };

  animate = () => {
    // console.log(camera.position.clone());

    this.setState({
      intrinsic: this.cameraMatrix2npString(camera.projectionMatrix),
      extrinsic: this.cameraMatrix2npString(camera.matrixWorldInverse),
    });

    requestAnimationFrame(this.animate);

    controls.update();

    stats.update();

    this.renderScene();
  };

  renderScene = () => {
    camera.updateMatrixWorld();

    // update the picking ray with the camera and mouse position
    // raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    if (typeof pointclouds !== 'undefined') {
      var intersections = raycaster.intersectObjects(pointclouds);
      var intersection = intersections.length > 0 ? intersections[0] : null;
      if (toggle > 0.02 && intersection != null) {
        this.setState({
          point: intersection.point,
        });
        sphere.position.copy(intersection.point);
        toggle = 0;
      }
    }

    toggle += clock.getDelta();

    renderer.render(scene, camera);
  };

  onMouseMove = (e) => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    e.preventDefault();
    mouse.x = (e.clientX / this.mount.clientWidth) * 2 - 1;
    mouse.y = -(e.clientY / this.mount.clientHeight) * 2 + 1;
  };

  onMouseClick = (e) => {
    if (e.shiftKey && this.state.selected_keypoint_label !== '') {
      pointService.addKeypoint(
        selected_fid,
        this.state.selected_keypoint_label,
        this.state.point
      );

      var found = false;
      var sphereKp;
      for (const pair of sphereKps) {
        if (pair.keypoint_label === this.state.selected_keypoint_label) {
          sphereKp = scene.getObjectByProperty('uuid', pair.uuid);
          sphereKp.position.copy(this.state.point);
          found = true;
          break;
        }
      }
      if (!found) {
        var sphereKpGeometry = new THREE.SphereBufferGeometry(0.04, 32, 32);
        var sphereKpMaterial = new THREE.MeshBasicMaterial({
          color: this.state.selected_keypoint_color,
        });
        sphereKp = new THREE.Mesh(sphereKpGeometry, sphereKpMaterial);
        sphereKp.position.copy(this.state.point);
        sphereKps.push({
          uuid: sphereKp.uuid,
          keypoint_label: this.state.selected_keypoint_label,
        });
        scene.add(sphereKp);
      }

      console.log(scene.children);

      console.log(pointService.getKeypoints());
    }
  };

  onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  onKeyPress = (e) => {
    console.log(e.keyCode);
  };

  render() {
    return (
      <div className='contain-fluid'>
        <div className='row'>
          <div
            id='center'
            className='col'
            style={{
              width: window.innerWidth,
              height: window.innerHeight,
            }}
            ref={(mount) => {
              this.mount = mount;
            }}
          />
        </div>
      </div>
    );
  }
}

export default Annotator;
