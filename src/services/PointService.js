class PointService {
  static myInstance = null;
  static getInstance() {
    if (PointService.myInstance == null) {
      PointService.myInstance = new PointService();
    }
    return this.myInstance;
  }

  loadPoints = (filename) => {
    delete this.infoPoints;
    this.infoPoints = {};

    return new Promise((resolve, reject) => {
      fetch(
        process.env.PUBLIC_URL +
          '/assets/infopoints/' +
          '/' +
          filename +
          '.json'
      )
        .catch((err) => reject(err))
        .then((response) => response.json())
        .then((data) => {
          this.infoPoints = data;
          resolve(this.infoPoints);
        });
    });
  };

  savePoints = (filename) => {
    if (!this.infoPoints) {
      return;
    }
    let contentType = 'application/json;charset=utf-8;';
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      var blob = new Blob(
        [decodeURIComponent(encodeURI(JSON.stringify(this.infoPoints)))],
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
        encodeURIComponent(JSON.stringify(this.infoPoints));
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // infoPoints
  addInfoPoint = (info, point) => {
    const infopoint = {
      descrizione: info.descrizione,
      colore: info.colore || '#ffffff',
      point,
    };
    this.infoPoints[info.titolo] = infopoint;
    return infopoint;
  };
}

export default PointService;
