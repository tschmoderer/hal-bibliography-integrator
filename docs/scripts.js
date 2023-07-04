var currentYear = new Date().getFullYear();
document.getElementById('current-year').textContent = currentYear;

document.addEventListener('DOMContentLoaded', function () {
    const iframe = document.getElementById('content-iframe');
    const logoLink = document.getElementById('logo-link');
    const homeLink = document.getElementById('home-link');
    const demoLink = document.getElementById('demo-link');
    const docsLink = document.getElementById('docs-link');

    iframe.addEventListener("load", function(event) {  
        iframe.style.height=(iframe.contentWindow.document.body.scrollHeight+20)+'px';
    });

    logoLink.addEventListener('click', function (event) {
        event.preventDefault();
        if (iframe.src.indexOf("README.html") != -1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            iframe.src = './pages/README.html'; // Replace with your home page URL or file path
        }
    });

    homeLink.addEventListener('click', function (event) {
        event.preventDefault();
        if (iframe.src.indexOf("README.html") != -1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            iframe.src = './pages/README.html'; // Replace with your home page URL or file path
        }
    });

    demoLink.addEventListener('click', function (event) {
        event.preventDefault();
        if (iframe.src.indexOf("demo.html") != -1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            iframe.src = './pages/demo.html'; // Replace with your demo page URL or file path
        }
    });

    docsLink.addEventListener('click', function (event) {
        event.preventDefault();
        if (iframe.src.indexOf("docs.html") != -1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            iframe.src = './pages/docs.html'; // Replace with your docs page URL or file path
        }
    });
});