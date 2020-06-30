import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import configs from './configs.json';
import data from './assets/infopoints.json';

import Annotator from './components/Annotator';
import Visualizator from './components/Visualizator';

class RouterBoard extends Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <Route
              exact
              path='/'
              render={() => <Visualizator infoPoints={data['0']} />}
            />
            <Route
              exact
              path='/builder'
              render={() => (
                <Annotator displayKeypoints={this.displayKeypoints} />
              )}
            />
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default RouterBoard;
