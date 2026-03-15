//Codigo boton hamburguesa
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const links = navLinks.querySelectorAll("a")

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    if(navLinks.classList.contains("active")){
        menuBtn.innerHTML = "X";
        menuBtn.setAttribute("aria-expanded", "true")
    }else{
        menuBtn.innerHTML = "☰";
        menuBtn.setAttribute("aria-expanded", "false")

    }
});

//Esto es para que cuanndo el usuario se diriga a un link se cierre el menu 
//Y evitar que quede abierto al estar en otra seccion
links.forEach(link => {
    link.addEventListener("click", () => {
        navlinks.classList.remove("active");
        menuBtn.innerHTML = "☰" ;
        menuBtn.setAttribute("aria-expended", "false");
    })

})