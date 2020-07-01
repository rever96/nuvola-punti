import React from 'react';
import { ChromePicker } from 'react-color';
import { Button } from 'antd';

class ButtonExample extends React.Component {
  state = {
    displayColorPicker: false,
    background: '#fff',
  };

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  handleChange = (color) => {
    this.setState({ background: color.hex });
  };

  handleChangeComplete = (color) => {
    this.props.changeColor(color.hex);
    this.setState({ background: color.hex });
  };

  render() {
    const popover = {
      position: 'absolute',
      zIndex: '2',
    };
    const cover = {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    };
    return (
      <div>
        <Button
          style={{
            backgroundColor: this.state.background,
          }}
          onClick={this.handleClick}
        >
          {!this.state.displayColorPicker && 'Apri '}
          {this.state.displayColorPicker && 'Chiudi '}
          ColorPicker
        </Button>
        {this.state.displayColorPicker ? (
          <div style={popover}>
            <div style={cover} onClick={this.handleClose} />
            <ChromePicker
              color={this.state.background}
              onChange={this.handleChange}
              onChangeComplete={this.handleChangeComplete}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default ButtonExample;
