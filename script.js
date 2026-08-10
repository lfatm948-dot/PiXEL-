
const whatsappNumber = "218944969802";

// المنتج المختار
let selectedProduct = "";

// إظهار نموذج الطلب
function showOrder(productName) {

    selectedProduct = productName;

    document.getElementById("selectedProduct").innerText = productName;

    const orderBox = document.getElementById("orderBox");

    orderBox.style.display = "block";

    // ينزل المستخدم للنموذج
    orderBox.scrollIntoView({
        behavior: "smooth"
    });

}
const products = document.querySelectorAll(".product-card");

window.addEventListener("scroll",()=>{

products.forEach(product=>{

let position = product.getBoundingClientRect().top;

let screen = window.innerHeight;

if(position < screen - 100){

product.classList.add("show");

}

else{

product.classList.remove("show");

}

});

});
// إرسال الطلب للواتساب
function sendWhatsApp() {

    let name = document.getElementById("name").value;

    let phone = document.getElementById("phone").value;

    let location = document.getElementById("location").value;

    let payment = document.getElementById("payment").value;

    if(name === "" || phone === "" || location === ""){

        alert("يرجى تعبئة جميع البيانات");

        return;

    }

    let message = 
`طلب جديد من متجر PIXEL 💜

المنتج: ${selectedProduct}

الاسم: ${name}

رقم الهاتف: ${phone}

المكان: ${location}

طريقة الدفع: ${payment}`;

    let whatsappLink = 
    "https://wa.me/" + whatsappNumber + 
    "?text=" + encodeURIComponent(message);

    window.open(whatsappLink, "_blank");

}

// القائمة في الهاتف

function openMenu(){

    let menu = document.querySelector(".menu");

    if(menu.style.display === "flex"){

        menu.style.display = "none";

    }else{

        menu.style.display = "flex";

    }
// مراقب التمرير لإظهار وإخفاء البطاقات
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // تظهر البطاقة عندما تنزل للأسفل
            entry.target.classList.add('show');
        } else {
            // تختفي البطاقة عندما تصعد للأعلى
            entry.target.classList.remove('show');
        }
    });
}, {
    threshold: 0.15 
});

// تطبيق المراقبة على جميع بطاقات المنتجات
document.querySelectorAll('.product-card').forEach(card => {
    observer.observe(card);
});

}
window.addEventListener("load", function () {

    const title = document.querySelector(".products h2");

    if (title) {
        setTimeout(function () {
            title.classList.add("title-intro");
        }, 2800);
    }

});
