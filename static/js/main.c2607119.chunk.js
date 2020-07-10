(this['webpackJsonppoint-cloud-annotator'] =
  this['webpackJsonppoint-cloud-annotator'] || []).push([
  [0],
  {
    248: function (e, t, n) {
      e.exports = n(505);
    },
    254: function (e, t, n) {},
    505: function (e, t, n) {
      'use strict';
      n.r(t);
      var o = n(0),
        a = n.n(o),
        i = n(7),
        r = n.n(i),
        s = (n(253), n(254), n(245)),
        l = n(41),
        c = n(55),
        d = n(49),
        u = n(48),
        m = n(3),
        p = n(224),
        h = n(225),
        f = n(226),
        w = n.n(f),
        v = (function () {
          function e() {
            var t = this;
            Object(l.a)(this, e),
              (this.loadPoints = function (e) {
                return (
                  delete t.infoPoints,
                  (t.infoPoints = {}),
                  new Promise(function (n, o) {
                    fetch(
                      '/nuvola-punti/builder/assets/infopoints/' + e + '.json'
                    )
                      .catch(function (e) {
                        return o(e);
                      })
                      .then(function (e) {
                        return e.json();
                      })
                      .then(function (e) {
                        (t.infoPoints = e),
                          console.log(t.infoPoints),
                          n(t.infoPoints);
                      });
                  })
                );
              }),
              (this.savePoints = function (e) {
                if (t.infoPoints) {
                  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    var n = new Blob(
                      [
                        decodeURIComponent(
                          encodeURI(JSON.stringify(t.infoPoints))
                        ),
                      ],
                      { type: 'application/json;charset=utf-8;' }
                    );
                    navigator.msSaveOrOpenBlob(n, e);
                  } else {
                    var o = document.createElement('a');
                    (o.download = e),
                      (o.href =
                        'data:application/json;charset=utf-8;,' +
                        encodeURIComponent(JSON.stringify(t.infoPoints))),
                      (o.target = '_blank'),
                      document.body.appendChild(o),
                      o.click(),
                      document.body.removeChild(o);
                  }
                }
              }),
              (this.addInfoPoint = function (e, n) {
                var o = {
                  descrizione: e.descrizione,
                  colore: e.colore || '#ffffff',
                  point: n,
                };
                return (t.infoPoints[e.titolo] = o), o;
              });
          }
          return (
            Object(c.a)(e, null, [
              {
                key: 'getInstance',
                value: function () {
                  return (
                    null == e.myInstance && (e.myInstance = new e()),
                    this.myInstance
                  );
                },
              },
            ]),
            e
          );
        })();
      v.myInstance = null;
      var g,
        y,
        b,
        C,
        E,
        x = v,
        k = n(512),
        P = n(511),
        S = n(514),
        j = n(58),
        O = n(227),
        M = (function (e) {
          Object(d.a)(n, e);
          var t = Object(u.a)(n);
          function n() {
            var e;
            Object(l.a)(this, n);
            for (var o = arguments.length, a = new Array(o), i = 0; i < o; i++)
              a[i] = arguments[i];
            return (
              ((e = t.call.apply(t, [this].concat(a))).state = {
                displayColorPicker: !1,
                background: '#fff',
              }),
              (e.handleClick = function () {
                e.setState({ displayColorPicker: !e.state.displayColorPicker });
              }),
              (e.handleClose = function () {
                e.setState({ displayColorPicker: !1 });
              }),
              (e.handleChange = function (t) {
                e.setState({ background: t.hex });
              }),
              (e.handleChangeComplete = function (t) {
                e.props.changeColor(t.hex), e.setState({ background: t.hex });
              }),
              e
            );
          }
          return (
            Object(c.a)(n, [
              {
                key: 'render',
                value: function () {
                  return a.a.createElement(
                    'div',
                    null,
                    a.a.createElement(
                      j.a,
                      {
                        style: { backgroundColor: this.state.background },
                        onClick: this.handleClick,
                      },
                      !this.state.displayColorPicker && 'Apri ',
                      this.state.displayColorPicker && 'Chiudi ',
                      'ColorPicker'
                    ),
                    this.state.displayColorPicker
                      ? a.a.createElement(
                          'div',
                          { style: { position: 'absolute', zIndex: '2' } },
                          a.a.createElement('div', {
                            style: {
                              position: 'fixed',
                              top: '0px',
                              right: '0px',
                              bottom: '0px',
                              left: '0px',
                            },
                            onClick: this.handleClose,
                          }),
                          a.a.createElement(O.ChromePicker, {
                            color: this.state.background,
                            onChange: this.handleChange,
                            onChangeComplete: this.handleChangeComplete,
                          })
                        )
                      : null
                  );
                },
              },
            ]),
            n
          );
        })(a.a.Component),
        z = { labelCol: { span: 8 }, wrapperCol: { span: 16 } },
        I = { wrapperCol: { offset: 8, span: 16 } },
        F = (function (e) {
          Object(d.a)(n, e);
          var t = Object(u.a)(n);
          function n() {
            var e;
            Object(l.a)(this, n);
            for (var o = arguments.length, i = new Array(o), r = 0; r < o; r++)
              i[r] = arguments[r];
            return (
              ((e = t.call.apply(
                t,
                [this].concat(i)
              )).formRef = a.a.createRef()),
              (e.changeColor = function (t) {
                e.formRef.current.setFieldsValue({ colore: t });
              }),
              (e.onFinish = function (t) {
                e.props.handleOk(t);
              }),
              (e.onFinishFailed = function (e) {
                console.log('Failed:', e);
              }),
              e
            );
          }
          return (
            Object(c.a)(n, [
              {
                key: 'render',
                value: function () {
                  return a.a.createElement(
                    'div',
                    {
                      onMouseMove: function (e) {
                        return e.stopPropagation();
                      },
                    },
                    a.a.createElement(
                      k.a,
                      {
                        title: 'Basic Modal',
                        visible: this.props.visible,
                        footer: null,
                        onCancel: this.props.handleCancel,
                      },
                      this.props.visible &&
                        a.a.createElement(
                          a.a.Fragment,
                          null,
                          a.a.createElement(
                            'p',
                            null,
                            'x: ',
                            this.props.point.x.toString().substring(0, 5)
                          ),
                          a.a.createElement(
                            P.a,
                            Object.assign({}, z, {
                              name: 'basic',
                              initialValues: { remember: !0 },
                              ref: this.formRef,
                              onFinish: this.onFinish,
                              onFinishFailed: this.onFinishFailed,
                            }),
                            a.a.createElement(
                              P.a.Item,
                              {
                                label: 'Titolo*',
                                name: 'titolo',
                                rules: [
                                  {
                                    required: !0,
                                    message: 'Campo obbligatorio!',
                                  },
                                ],
                              },
                              a.a.createElement(S.a, null)
                            ),
                            a.a.createElement(
                              P.a.Item,
                              { label: 'Colore', name: 'colore' },
                              a.a.createElement(M, {
                                changeColor: this.changeColor,
                              })
                            ),
                            a.a.createElement(
                              P.a.Item,
                              { label: 'Descrizione', name: 'descrizione' },
                              a.a.createElement(S.a.TextArea, null)
                            ),
                            a.a.createElement(
                              P.a.Item,
                              I,
                              a.a.createElement(
                                j.a,
                                { type: 'primary', htmlType: 'submit' },
                                'Aggiungi'
                              )
                            )
                          )
                        )
                    )
                  );
                },
              },
            ]),
            n
          );
        })(a.a.Component),
        R = n(513),
        W = n(507),
        U = n(508),
        A = n(509),
        B = n(510),
        D = n(515),
        T = n(516),
        H = R.a.Option,
        J = x.getInstance(),
        L = new m.s();
      L.params.Points.threshold = 0.01;
      var N,
        K = new m.x(),
        V = new m.c(),
        q = 0,
        X = [],
        Y = new m.u(0.04, 32, 32),
        _ = new m.n({ color: '#FF0000' }),
        G = new m.m(Y, _);
      G.scale.set(1, 1, 1);
      var Q = (function (e) {
        Object(d.a)(n, e);
        var t = Object(u.a)(n);
        function n(e) {
          var o;
          return (
            Object(l.a)(this, n),
            ((o = t.call(this, e)).init = function () {
              w()('.alert-success').hide();
              var e = 0.75 * window.innerWidth,
                t = 0.85 * window.innerHeight;
              ((b = new m.t()).background = new m.d(32768)),
                (C = new m.z({ antialias: !0 })).setPixelRatio(
                  window.devicePixelRatio
                ),
                C.setSize(e, t),
                (C.dofAutofocus = !0),
                o.mount.appendChild(C.domElement),
                (g = new m.o(65, e / t, 1, 1e3)).position.set(8, 4, 8),
                g.up.set(0, 1, 0),
                o.setState({
                  intrinsic: o.cameraMatrix2npString(g.projectionMatrix),
                  extrinsic: o.cameraMatrix2npString(g.matrixWorldInverse),
                }),
                ((y = new h.a(g, C.domElement)).enableDamping = !1),
                (y.dampingFactor = 0.05),
                (y.screenSpacePanning = !1),
                (y.minDistance = 1),
                (y.maxDistance = 500),
                (y.maxPolarAngle = 2 * Math.PI),
                o.addPointcloud(),
                o.addSphereInfo();
              var n = new m.a(5);
              b.add(n), b.add(G);
            }),
            (o.cameraMatrix2npString = function (e) {
              for (var t = 'np.array([', n = 0; n < 4; n++) {
                t += '[';
                for (var o = 0; o < 4; o++) {
                  var a = 4 * n + o;
                  (t +=
                    0 === e.elements[a]
                      ? e.elements[a]
                      : e.elements[a].toFixed(4)),
                    3 !== o && (t += ', ');
                }
                (t += ']'), 3 !== n && (t += ', ');
              }
              return (t += '])');
            }),
            (o.addPointcloud = function () {
              (E = new m.p(new m.h(), new m.l())),
                new p.a().load(
                  '/nuvola-punti/builder/assets/pointclouds/' +
                    o.state.frame +
                    '.pcd',
                  function (e) {
                    (E = e), b.add(E), (N = [E]);
                    var t = E.geometry.boundingSphere.radius;
                    g.position.set(1.5 * t, 0.5 * t, 1.5 * t);
                  },
                  function (e) {
                    o.setState({
                      loaded: Math.round((e.loaded / e.total) * 100),
                    });
                  }
                );
            }),
            (o.removePointcloud = function () {
              b.remove(E);
            }),
            (o.removeSphereKps = function () {
              X.forEach(function (e) {
                var t = b.getObjectByProperty('uuid', e.uuid);
                t.geometry.dispose(), t.material.dispose(), b.remove(t);
              }),
                C.renderLists.dispose(),
                (X = []);
            }),
            (o.addSphereInfo = function () {
              J.loadPoints(o.state.frame)
                .catch(function (e) {
                  console.log(e);
                })
                .then(function (e) {
                  Object.keys(e).forEach(function (t) {
                    var n = g.position.distanceTo(e[t].point),
                      o = new m.u(n / 32, 32, 32),
                      a = new m.n({ color: e[t].colore }),
                      i = new m.m(o, a);
                    i.position.copy(e[t].point),
                      X.push({ uuid: i.uuid, titolo: t }),
                      b.add(i);
                  });
                });
            }),
            (o.animate = function () {
              o.setState({
                intrinsic: o.cameraMatrix2npString(g.projectionMatrix),
                extrinsic: o.cameraMatrix2npString(g.matrixWorldInverse),
              }),
                requestAnimationFrame(o.animate),
                y.update(),
                o.renderScene();
            }),
            (o.renderScene = function () {
              if (
                (g.updateMatrixWorld(),
                L.setFromCamera(K, g),
                'undefined' !== typeof N)
              ) {
                var e = L.intersectObjects(N),
                  t = e.length > 0 ? e[0] : null;
                q > 0.02 &&
                  null != t &&
                  (o.setState({ point: t.point }),
                  G.position.copy(t.point),
                  (q = 0));
              }
              (q += V.getDelta()), C.render(b, g);
            }),
            (o.onMouseMove = function (e) {
              e.preventDefault(),
                (K.x = (e.clientX / o.mount.clientWidth) * 2 - 1),
                (K.y =
                  (-(e.clientY - 0.1 * window.innerHeight) /
                    o.mount.clientHeight) *
                    2 +
                  1);
            }),
            (o.onMouseClick = function (e) {
              e.shiftKey && o.state.point.x && o.showModal(o.state.point);
            }),
            (o.onWindowResize = function () {
              (g.aspect =
                (0.75 * window.innerWidth) / (0.85 * window.innerHeight)),
                g.updateProjectionMatrix(),
                C.setSize(0.75 * window.innerWidth, 0.85 * window.innerHeight);
            }),
            (o.scaleDown = function () {
              var e = b.getObjectByName(o.state.frame + '.pcd');
              (e.material.size *= 0.8), (e.material.needsUpdate = !0);
            }),
            (o.scaleUp = function () {
              var e = b.getObjectByName(o.state.frame + '.pcd');
              (e.material.size *= 1.2), (e.material.needsUpdate = !0);
            }),
            (o.onFrameUpdate = function (e) {
              e != o.state.frame &&
                ((o.state.frame = e),
                o.removeSphereKps(),
                o.removePointcloud(),
                o.addPointcloud(),
                o.addSphereInfo());
            }),
            (o.showModal = function (e) {
              o.setState({ showModal: !0, selectedPoint: e });
            }),
            (o.handleOk = function (e) {
              var t,
                n,
                a = J.addInfoPoint(e, o.state.selectedPoint),
                i = !1,
                r = Object(s.a)(X);
              try {
                for (r.s(); !(n = r.n()).done; ) {
                  var l = n.value;
                  if (l.titolo === e.titolo) {
                    (t = b.getObjectByProperty('uuid', l.uuid)).position.copy(
                      o.state.point
                    ),
                      (i = !0);
                    break;
                  }
                }
              } catch (u) {
                r.e(u);
              } finally {
                r.f();
              }
              if (!i) {
                var c = new m.u(0.04, 32, 32),
                  d = new m.n({ color: a.colore });
                (t = new m.m(c, d)).position.copy(a.point),
                  X.push({ uuid: t.uuid, titolo: e.titolo }),
                  b.add(t);
              }
              o.setState({ showModal: !1 });
            }),
            (o.handleCancel = function (e) {
              o.setState({ showModal: !1 });
            }),
            (o.state = {
              showModal: !1,
              loaded: 0,
              intrinsic: 0,
              extrinsic: 0,
              point: [],
              selectedPoint: [],
              impostazioniJson: null,
              frame: '',
            }),
            fetch('assets/impostazioni.json', {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            })
              .then(function (e) {
                return e.json();
              })
              .then(function (e) {
                o.setState({ impostazioniJson: e, frame: e.filenames[0] }),
                  o.init(),
                  o.animate();
              }),
            o
          );
        }
        return (
          Object(c.a)(n, [
            {
              key: 'componentDidMount',
              value: function () {
                window.addEventListener('resize', this.onWindowResize, !1),
                  window.addEventListener('mousemove', this.onMouseMove, !1),
                  window.addEventListener('click', this.onMouseClick, !1);
              },
            },
            {
              key: 'componentWillUnmount',
              value: function () {
                window.removeEventListener('resize'),
                  window.removeEventListener('mousemove'),
                  window.removeEventListener('click');
              },
            },
            {
              key: 'render',
              value: function () {
                var e = this;
                return a.a.createElement(
                  'div',
                  null,
                  a.a.createElement(F, {
                    handleCancel: this.handleCancel,
                    handleOk: this.handleOk,
                    visible: this.state.showModal,
                    point: this.state.selectedPoint,
                  }),
                  a.a.createElement(
                    W.a,
                    {
                      style: {
                        height: '100vh',
                        width: '100vw',
                        backgroundColor: '#404040',
                      },
                    },
                    a.a.createElement(
                      U.a,
                      { style: { width: 0.75 * window.innerWidth } },
                      a.a.createElement(
                        W.a,
                        { style: { height: 0.1 * window.innerHeight } },
                        a.a.createElement(
                          j.a,
                          {
                            onClick: function () {
                              return J.savePoints(e.state.frame);
                            },
                          },
                          'Salva InfoPoint'
                        ),
                        a.a.createElement(
                          j.a,
                          { onClick: this.scaleUp },
                          a.a.createElement(D.a, null)
                        ),
                        a.a.createElement(
                          j.a,
                          { onClick: this.scaleDown },
                          a.a.createElement(T.a, null)
                        )
                      ),
                      a.a.createElement(
                        W.a,
                        { style: { height: 0.85 * window.innerHeight } },
                        a.a.createElement('div', {
                          ref: function (t) {
                            e.mount = t;
                          },
                        })
                      ),
                      a.a.createElement(
                        W.a,
                        { style: { height: 0.05 * window.innerHeight } },
                        a.a.createElement(
                          A.a,
                          { direction: 'horizontal' },
                          a.a.createElement(
                            B.a.Text,
                            { style: { color: 'red' } },
                            'x: ',
                            this.state.point.x
                              ? this.state.point.x.toFixed(4)
                              : 0
                          ),
                          a.a.createElement(
                            B.a.Text,
                            { style: { color: 'lime' } },
                            'y: ',
                            this.state.point.y
                              ? this.state.point.y.toFixed(4)
                              : 0
                          ),
                          a.a.createElement(
                            B.a.Text,
                            { style: { color: 'blue' } },
                            'z: ',
                            this.state.point.z
                              ? this.state.point.z.toFixed(4)
                              : 0
                          )
                        )
                      )
                    ),
                    a.a.createElement(
                      U.a,
                      { flex: 5 },
                      this.state.impostazioniJson &&
                        a.a.createElement(
                          W.a,
                          null,
                          a.a.createElement(
                            A.a,
                            { direction: 'horizontal' },
                            a.a.createElement(
                              B.a.Text,
                              { style: { color: 'white', fontSize: '2em' } },
                              'Nuvola:'
                            ),
                            a.a.createElement(
                              R.a,
                              {
                                defaultValue: this.state.frame,
                                style: { width: 120 },
                                onChange: this.onFrameUpdate,
                              },
                              this.state.impostazioniJson.filenames.map(
                                function (e, t) {
                                  return a.a.createElement(
                                    H,
                                    { key: t, value: e },
                                    e
                                  );
                                }
                              )
                            )
                          )
                        )
                    )
                  )
                );
              },
            },
          ]),
          n
        );
      })(o.Component);
      r.a.render(a.a.createElement(Q, null), document.getElementById('root'));
    },
  },
  [[248, 1, 2]],
]);
//# sourceMappingURL=main.c2607119.chunk.js.map
