import React, { Component } from 'react';

import * as THREE from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';

import $ from 'jquery';

import PointService from '../services/PointService';

import AddInfoPoint from './addInfoPoint';

import { Row, Col, Button, Select, Typography, Space } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Option } = Select;

let pointService = PointService.getInstance();

var camera, controls, scene, renderer, loader, pointcloud;

var raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.01;
var mouse = new THREE.Vector2();

var pointclouds;

var clock = new THREE.Clock();
var toggle = 0;

var sphereKps = []; // array of {uuid, titolo}

var sphereGeometry = new THREE.SphereBufferGeometry(0.04, 32, 32);
var sphereMaterial = new THREE.MeshBasicMaterial({ color: '#FF0000' });
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.scale.set(1, 1, 1);

const frameFolder = process.env.PUBLIC_URL + '/assets/pointclouds/';

class Annotator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      loaded: 0,
      intrinsic: 0,
      extrinsic: 0,
      point: [],
      selectedPoint: [],
      impostazioniJson: null,
      frame: '',
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
          frame: impostazioniJson.filenames[0],
        });
        this.init();
        this.animate();
      });
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize, false);
    window.addEventListener('mousemove', this.onMouseMove, false);
    window.addEventListener('click', this.onMouseClick, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize');
    window.removeEventListener('mousemove');
    window.removeEventListener('click');
  }

  init = () => {
    $('.alert-success').hide();

    const width = 0.75 * window.innerWidth;
    const height = 0.85 * window.innerHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x008000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.dofAutofocus = true;
    this.mount.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(65, width / height, 1, 1000);
    // camera = new THREE.OrthographicCamera( 5, -5, 3, 0, 1, 1000 );
    camera.position.set(8, 4, 8);
    camera.up.set(0, 1, 0);

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

    controls.maxPolarAngle = 2 * Math.PI;

    // point cloud
    this.addPointcloud();
    this.addSphereInfo();

    // axis
    var axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

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
      frameFolder + this.state.frame + '.pcd',
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
      .loadPoints(this.state.frame)
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
    this.renderScene();
  };

  renderScene = () => {
    camera.updateMatrixWorld();

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

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
    mouse.y =
      -((e.clientY - 0.1 * window.innerHeight) / this.mount.clientHeight) * 2 +
      1;
  };

  onMouseClick = (e) => {
    if (e.shiftKey && this.state.point.x) {
      this.showModal(this.state.point);
    }
  };

  onWindowResize = () => {
    camera.aspect = (0.75 * window.innerWidth) / (0.85 * window.innerHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(0.75 * window.innerWidth, 0.85 * window.innerHeight);
  };

  scaleDown = () => {
    var points = scene.getObjectByName(this.state.frame + '.pcd');
    points.material.size *= 0.8;
    points.material.needsUpdate = true;
  };
  scaleUp = () => {
    var points = scene.getObjectByName(this.state.frame + '.pcd');
    points.material.size *= 1.2;
    points.material.needsUpdate = true;
  };

  onFrameUpdate = (e) => {
    if (e == this.state.frame) {
      return;
    }
    this.state.frame = e;
    this.removeSphereKps();
    this.removePointcloud();
    this.addPointcloud();
    this.addSphereInfo();
  };

  //////// infopoint tool ///////
  showModal = (point) => {
    this.setState({
      showModal: true,
      selectedPoint: point,
    });
  };

  // aggiungo un infopoint
  handleOk = (e) => {
    const ip = pointService.addInfoPoint(e, this.state.selectedPoint);

    var found = false;
    var sphereKp;
    for (const pair of sphereKps) {
      if (pair.titolo === e.titolo) {
        sphereKp = scene.getObjectByProperty('uuid', pair.uuid);
        sphereKp.position.copy(this.state.point);
        found = true;
        break;
      }
    }
    if (!found) {
      var sphereKpGeometry = new THREE.SphereBufferGeometry(0.04, 32, 32);
      var sphereKpMaterial = new THREE.MeshBasicMaterial({
        color: ip.colore,
      });
      sphereKp = new THREE.Mesh(sphereKpGeometry, sphereKpMaterial);
      sphereKp.position.copy(ip.point);
      sphereKps.push({
        uuid: sphereKp.uuid,
        titolo: e.titolo,
      });
      scene.add(sphereKp);
    }

    this.setState({
      showModal: false,
    });
  };

  handleCancel = (e) => {
    this.setState({
      showModal: false,
    });
  };
  /////////////////

  render() {
    return (
      <div>
        <AddInfoPoint
          handleCancel={this.handleCancel}
          handleOk={this.handleOk}
          visible={this.state.showModal}
          point={this.state.selectedPoint}
        ></AddInfoPoint>
        <Row
          style={{
            height: '100vh',
            width: '100vw',
            backgroundColor: '#404040',
          }}
        >
          <Col style={{ width: 0.75 * window.innerWidth }}>
            <Row style={{ height: 0.1 * window.innerHeight }}>
              <Button onClick={() => pointService.savePoints(this.state.frame)}>
                Salva InfoPoint
              </Button>
              <Button onClick={this.scaleUp}>
                <PlusOutlined />
              </Button>
              <Button onClick={this.scaleDown}>
                <MinusOutlined />
              </Button>
            </Row>
            <Row style={{ height: 0.85 * window.innerHeight }}>
              <div
                ref={(mount) => {
                  this.mount = mount;
                }}
              ></div>
            </Row>
            <Row style={{ height: 0.05 * window.innerHeight }}>
              <Space direction='horizontal'>
                <Typography.Text style={{ color: 'red' }}>
                  x: {this.state.point.x ? this.state.point.x.toFixed(4) : 0}
                </Typography.Text>
                <Typography.Text style={{ color: 'lime' }}>
                  y: {this.state.point.y ? this.state.point.y.toFixed(4) : 0}
                </Typography.Text>
                <Typography.Text style={{ color: 'blue' }}>
                  z: {this.state.point.z ? this.state.point.z.toFixed(4) : 0}
                </Typography.Text>
              </Space>
            </Row>
          </Col>
          <Col flex={5}>
            {this.state.impostazioniJson && (
              <Row>
                <Space direction='horizontal'>
                  <Typography.Text style={{ color: 'white', fontSize: '2em' }}>
                    Nuvola:
                  </Typography.Text>
                  <Select
                    defaultValue={this.state.frame}
                    style={{ width: 120 }}
                    onChange={this.onFrameUpdate}
                  >
                    {this.state.impostazioniJson.filenames.map((fid, i) => (
                      <Option key={i} value={fid}>
                        {fid}
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Row>
            )}
            {/* <Row>lista infopoints</Row> */}
          </Col>
        </Row>
      </div>
    );
  }
}

export default Annotator;
