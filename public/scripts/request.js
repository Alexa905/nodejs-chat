module.exports = function () {
    return {
        request(url, method, data) {
            return new Promise((resolve, reject) => {
                const req = new XMLHttpRequest();
                req.open(method, url);
                req.onload = () => req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
                req.onerror = (e) => reject(Error(`Network Error: ${e}`));
                if (method = 'POST') {
                    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                }
                req.send(this.param(data));
            });
        },
        param(object) {
            var encodedString = '';
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    if (encodedString.length > 0) {
                        encodedString += '&';
                    }
                    encodedString += encodeURI(prop + '=' + object[prop]);
                }
            }
            return encodedString;
        }
    }
};