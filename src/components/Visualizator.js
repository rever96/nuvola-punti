import React, { Component } from 'react';

import * as THREE from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';

import PointService from '../services/PointService';

import { Card } from 'antd';
import { Vector3 } from 'three';

let pointService = PointService.getInstance();

var camera, controls, scene, renderer, loader, pointcloud;

var raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.01;
var mouse = new THREE.Vector2();

var sphereKps = []; // array of {uuid, titolo}

const frameFolder = process.env.PUBLIC_URL + '/assets/pointclouds/';

let prevTime = 0;
var divStyle = {
  position: 'absolute',
  display: 'none',
  left: '0px',
  top: '0px',
};

class Visualizzator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: 0,
      activeInfoPoint: null,
      movePoint: null,
      moveVector: null,
      impostazioniJson: null,
    };

    fetch('assets/impostazioni.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((r) => r.json())
      .then((impostazioniJson) => {
        this.setState({
          impostazioniJson,
        });
        this.init();
        this.animate();
      });
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize, false);
    window.addEventListener('click', this.onDocumentMouseClick, false);
    window.addEventListener('mousemove', this.onDocumentMouseOver, false);
    window.addEventListener('mousedown', this.onDocumentMouseDown, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize');
    window.removeEventListener('mousemove');
    window.removeEventListener('mousedown');
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
  };

  onDocumentMouseClick = (event) => {
    event.preventDefault();
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    const infoPoint = intersects.find((i) => i && i.object && i.object.info);
    if (infoPoint) {
      const a = camera.position;
      const b = infoPoint.point;
      this.setState({
        movePoint: infoPoint.point,
        moveVector: new Vector3(b.x - a.x, b.y - a.y, b.z - a.z),
      });
    }
  };

  onDocumentMouseDown = (e) => {
    this.setState({
      movePoint: null,
    });
  };

  onDocumentMouseOver = (event) => {
    event.preventDefault();
    if (!renderer) {
      return;
    }
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    let o = intersects.find((i) => i && i.object && i.object.info);
    if (o) {
      o = o.object;
      if (!this.state.activeInfoPoint) {
        divStyle = {
          position: 'absolute',
          left: event.clientX,
          top: event.clientY,
        };
        this.setState({
          activeInfoPoint: o.info,
        });
      }
    } else {
      this.setState({
        activeInfoPoint: null,
      });
    }
  };

  addPointcloud = () => {
    pointcloud = new THREE.Points(new THREE.Geometry(), new THREE.Material());
    loader = new PCDLoader();
    loader.load(
      frameFolder + this.state.impostazioniJson.visualizza + '.pcd',
      (points) => {
        pointcloud = points;
        // if (points.material.color.r !== 1) {
        //   points.material.color.setHex(0x000000);
        // }
        points.material.size = 0.02;
        scene.add(pointcloud);
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
      .loadPoints(this.state.impostazioniJson.visualizza)
      .catch((err) => {
        console.log(err);
      })
      .then((infopoints) => {
        Object.keys(infopoints).forEach((titolo) => {
          const dist = camera.position.distanceTo(infopoints[titolo].point);
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
    this.reDrawInfoPoint();

    requestAnimationFrame(this.animate);
    controls.update();
    camera.updateMatrixWorld();

    var time = performance.now();

    if (this.state.moveVector) {
      var delta = (time - prevTime) / 1000;
      camera.position.x += this.state.moveVector.x * delta;
      camera.position.y += this.state.moveVector.y * delta;
      camera.position.z += this.state.moveVector.z * delta;
      if (camera.position.distanceTo(this.state.movePoint) < 4) {
        this.setState({
          moveVector: null,
        });
      }
    }
    prevTime = time;

    if (this.state.movePoint) {
      camera.lookAt(this.state.movePoint);
    }

    renderer.render(scene, camera);
  };

  reDrawInfoPoint = () => {
    sphereKps.forEach((pair) => {
      const object = scene.getObjectByProperty('uuid', pair.uuid);
      const dist = camera.position.distanceTo(object.position);
      const sphereKpGeometry = new THREE.SphereBufferGeometry(
        dist / 32,
        32,
        32
      );
      object.geometry = sphereKpGeometry;
    });
  };

  onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  render() {
    return (
      <>
        {this.state.activeInfoPoint && (
          <Card
            size='small'
            title={this.state.activeInfoPoint.titolo}
            style={divStyle}
          >
            <p>{this.state.activeInfoPoint.descrizione}</p>
          </Card>
        )}

        <div
          style={{ width: window.innerWidth, height: window.innerHeight }}
          ref={(mount) => {
            this.mount = mount;
          }}
        ></div>
      </>
    );
  }
}

export default Visualizzator;
