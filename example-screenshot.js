const fs = require('mz/fs');
const url2pdf3 = require('./index.js');

url2pdf3.renderURL('https://www.google.com', {screenshot: true}).then(png => {
   return fs.writeFile('myscreenshot.png', png).then(() =>
      console.log('See myscreenshot.png!')
   );
});
