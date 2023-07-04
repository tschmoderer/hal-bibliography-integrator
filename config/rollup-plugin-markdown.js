const markdownIt = require('markdown-it');
const emoji = require('markdown-it-emoji');
const fs = require('fs');
const path = require('path');

var extraStyles = '<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/default.min.css">\n';
extraStyles += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css" integrity="sha512-SzlrxWUlpfuzQ+pcUCosxcglQRNAq/DZjVsC0lE40xsADsfeQoEypE+enwcOiGjk/bSuGGKHEyjSoQ1zVisanQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />\n';
extraStyles += '<style> html {scroll-behavior: smooth;} img {max-width: 75%;} a {text-decoration:none; color: inherit;} </style>\n';
module.exports = function markdown(options = {}) {

  const { targets = [], mdopts = {}, hook = 'buildEnd' } = options
  const md = new markdownIt(mdopts).use(require('markdown-it-highlightjs'), {}).use(emoji);

  return {
    name: 'markdown',
    [hook]: async() => {
      targets.forEach(async target => {
        // create folder
        fs.mkdirSync(target.dest, { recursive: true });
        // convert markdown to html 
        const htmlContent = md.render(fs.readFileSync(target.src, 'utf-8'));
        // highlight code
        const highlightedContent = extraStyles + htmlContent;
        
        // construct destination file 
        const destPath = path.join(target.dest, path.parse(target.src).name + ".html");
        fs.writeFileSync(destPath, highlightedContent)
      })
    }, 
  };
};
