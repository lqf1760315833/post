function Network() {
    this.apiPre =
      'https://www.fastmock.site/mock/f95c895fbc1d0a0105476c05c8e24fd8/vuetest/api';
  }
  
  Network.prototype.get = function(url, { render: render }) {
    fetch(this.apiPre + url)
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        if (myJson.data) {
          render(myJson.data, myJson);
        }
      });
  };
  