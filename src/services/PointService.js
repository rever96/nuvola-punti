import configs from '../configs.json';

class PointService {
  static myInstance = null;
  static getInstance() {
    if (PointService.myInstance == null) {
      PointService.myInstance = new PointService();
    }
    return this.myInstance;
  }

  keypoints = {};

  //todo promise
  loadPoints = (filename) => {
    fetch(configs.infopoints_folder + '/' + filename + '.json')
      .then((response) => response.json())
      .then((data) => {
        this.keypoints = data;
      });
  };

  savePoints = (filename) => {
    if (!this.keypoints) {
      return;
    }
    let contentType = 'application/json;charset=utf-8;';
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      var blob = new Blob(
        [decodeURIComponent(encodeURI(JSON.stringify(this.keypoints)))],
        { type: contentType }
      );
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      var a = document.createElement('a');
      a.download = filename;
      a.href =
        'data:' +
        contentType +
        ',' +
        encodeURIComponent(JSON.stringify(this.keypoints));
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // keypoints
  addInfoPoint = (info, point) => {
    const infopoint = {
      descrizione: info.descrizione,
      colore: info.colore || '#ffffff',
      point,
    };
    this.keypoints[info.titolo] = infopoint;
    return infopoint;
  };

  getInfoPoints = () => {
    return this.keypoints;
  };

  removeKeypoints = () => {
    delete this.keypoints;
  };
}

export default PointService;
