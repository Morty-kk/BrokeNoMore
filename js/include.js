document.addEventListener("DOMContentLoaded", () => {
    const includes = document.querySelectorAll("[data-include]");
    includes.forEach(el => {
        fetch(el.getAttribute("data-include"))
            .then(res => res.text())
            .then(data => {
                el.innerHTML = data;
            })
            .catch(err => console.error("Include-Fehler:", err));
    });
});
