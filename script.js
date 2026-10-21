
const whatsappNumber = "218944969802";

// المنتج المختار
let selectedProduct = "";

// حالة الطلب
let selectedPrice = 0;
let selectedCity = "";
let selectedDelivery = 0;

// المدن وأسعار التوصيل (د.ل)
const CITIES = [
    ["بنغازي", 25], ["اجدابيا", 25], ["توكرة", 35], ["المرج", 35], ["الابيار", 35],
    ["البيضاء", 35], ["قمينس", 35], ["سلوق", 35], ["شحات", 35], ["سوسة", 35],
    ["القبة", 35], ["طبرق", 35], ["درنة", 40], ["اساعد", 50], ["سبها", 30],
    ["مزدة", 30], ["الشويرف", 30], ["القريات", 30], ["براك الشاطئ", 35], ["اوباري", 45],
    ["ام الارانب", 45], ["وادي عتبة", 45], ["مرزق", 45], ["تراغن", 45], ["القطرون", 45],
    ["غات", 50], ["غدامس", 40], ["سيناون", 40], ["الشـواء", 40], ["أوال", 40],
    ["طرابلس", 15], ["كريمة", 15], ["طريق المطار", 15], ["عين زارة", 15], ["تاجوراء", 15],
    ["خلة", 15], ["مشروع الهضبة", 15], ["غريان", 25], ["الأصابعة", 35], ["الرابطة", 35],
    ["القواويش", 35], ["العوينية", 35], ["الناعلة - يفرن", 35], ["الرياينة", 35], ["الرجبان", 35],
    ["الرتـبان", 35], ["الرحيبات", 35], ["جادو", 35], ["كاباو", 35], ["تيجي", 35],
    ["بدر", 35], ["الجوش", 35], ["ترهونة", 25], ["بني وليد", 25], ["وادي بي", 20],
    ["قصر بن غشير", 20], ["السبيعة", 20], ["سوق الخميس مسيحل", 20], ["سيدي السايح", 20], ["الماية", 20],
    ["الزاوية", 20], ["المطرد", 20], ["صرمان", 20], ["صبراتة", 20], ["زوارة", 30],
    ["العجيلات", 30], ["الجميل", 30], ["جنزور", 30], ["زلطن", 30], ["رأس جدير", 40],
    ["سوق الجمعة", 30], ["هراوة", 30], ["بن جواد", 30], ["النوفلية", 30], ["رأس لانوف", 30],
    ["البريقة", 30], ["العقيلة", 30], ["سرت", 30], ["سوكنة", 30], ["ودان", 30],
    ["الجفرة", 30], ["زلة", 40]
];

// قراءة سعر المنتج من البطاقة (مثال: "140د.ل" => 140)
function getProductPrice(productName) {
    let card = Array.from(document.querySelectorAll(".product-card")).find(function (c) {
        const b = c.querySelector("button");
        return b && (b.getAttribute("onclick") || "").indexOf("'" + productName + "'") !== -1;
    });

    if (!card && window.event && window.event.target && window.event.target.closest) {
        card = window.event.target.closest(".product-card");
    }

    if (!card) return 0;

    const h4 = card.querySelector("h4");
    if (!h4) return 0;

    const text = h4.textContent.replace(/[٠-٩]/g, function (d) {
        return "٠١٢٣٤٥٦٧٨٩".indexOf(d);
    });
    const match = text.match(/\d+(?:\.\d+)?/);

    return match ? Number(match[0]) : 0;
}

// ===== السلة =====
let cart = [];
const CART_KEY = "pixel_cart";

function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart.map(function (i) {
            return { name: i.name, qty: i.qty };
        })));
    } catch (e) {}
    updateCartBadge();
}

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        cart = saved.map(function (i) {
            return {
                name: i.name,
                price: getProductPrice(i.name),
                qty: Math.min(Math.max(parseInt(i.qty) || 1, 1), 20)
            };
        }).filter(function (i) { return i.price > 0; });
    } catch (e) { cart = []; }
}

function cartSubtotal() {
    return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
}

function updateCartBadge() {
    const num = document.getElementById("cartCount");
    if (!num) return;
    num.textContent = cart.reduce(function (s, i) { return s + i.qty; }, 0);
}

let toastTimer;
function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
        t = document.createElement("div");
        t.id = "toast";
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800);
}

// تحديث ملخص السعر داخل بوكس الطلب
function updateOrderSummary() {
    const sp = document.getElementById("sumProduct");
    const sd = document.getElementById("sumDelivery");
    const st = document.getElementById("sumTotal");

    if (!sp || !sd || !st) return;

    const subtotal = cartSubtotal();

    sp.innerText = subtotal + " د.ل";

    if (selectedCity) {
        sd.innerText = selectedDelivery + " د.ل";
        sd.classList.remove("muted");
        st.innerText = (subtotal + selectedDelivery) + " د.ل";
    } else {
        sd.innerText = "اختر المدينة";
        sd.classList.add("muted");
        st.innerText = "—";
    }
}

function mk(tag, cls, txt, fn) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (txt !== undefined) el.textContent = txt;
    if (fn) { el.type = "button"; el.addEventListener("click", fn); }
    return el;
}

// يرسم قائمة المنتجات (اسم + كمية + سعر + حذف) داخل أي عنصر
function renderItems(box) {
    if (!box) return;
    box.innerHTML = "";

    cart.forEach(function (it, idx) {
        const row = mk("div", "ob-item");
        const qty = mk("div", "ob-qty");
        qty.appendChild(mk("button", "", "−", function () { changeQty(idx, -1); }));
        qty.appendChild(mk("span", "", String(it.qty)));
        qty.appendChild(mk("button", "", "+", function () { changeQty(idx, 1); }));

        row.appendChild(mk("span", "ob-name", it.name));
        row.appendChild(qty);
        row.appendChild(mk("span", "ob-price", (it.price * it.qty) + " د.ل"));
        row.appendChild(mk("button", "ob-rm", "✕", function () { removeItem(idx); }));
        box.appendChild(row);
    });
}

function renderCart() {
    renderItems(document.getElementById("cartItems"));
    const empty = !cart.length;
    document.getElementById("cartEmpty").style.display = empty ? "block" : "none";
    document.getElementById("cartFoot").style.display = empty ? "none" : "block";
    document.getElementById("cartSubtotal").textContent = cartSubtotal() + " د.ل";
}

function renderOrderItems() {
    renderItems(document.getElementById("obItems"));
    updateOrderSummary();
}

// بعد أي تغيير في السلة
function refreshCart() {
    saveCart();
    renderCart();

    const ob = document.getElementById("orderBox");
    if (ob && ob.style.display === "block") {
        if (!cart.length) ob.style.display = "none";
        else renderOrderItems();
    }
}

function changeQty(idx, d) {
    const it = cart[idx];
    if (!it) return;
    it.qty = Math.min(Math.max(it.qty + d, 1), 20);
    refreshCart();
}

function removeItem(idx) {
    cart.splice(idx, 1);
    refreshCart();
}

// أضف للسلة
function addToCart(productName) {
    const found = cart.find(function (i) { return i.name === productName; });
    if (found) found.qty = Math.min(found.qty + 1, 20);
    else cart.push({ name: productName, price: getProductPrice(productName), qty: 1 });
    saveCart();
    renderCart();
    toast("تمت الإضافة للسلة 🛒");
}

function openCart() {
    renderCart();
    document.getElementById("cartPanel").classList.add("open");
    document.body.classList.add("cart-open");
}

function closeCart() {
    document.getElementById("cartPanel").classList.remove("open");
    document.body.classList.remove("cart-open");
}

// زر "اطلب الآن" داخل السلة: يرفع المنتجات لبوكس الطلب
function checkoutCart() {
    if (!cart.length) return;
    closeCart();

    const ob = document.getElementById("orderBox");
    ob.style.display = "block";
    renderOrderItems();
    ob.scrollIntoView({ behavior: "smooth" });
}

// البحث + التصنيف
let activeCat = "all";

function searchProducts() {
    let input = document.getElementById('searchInput').value.trim().toLowerCase();
    let cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        let title = card.querySelector('h3') ? card.querySelector('h3').innerText.toLowerCase() : '';
        let content = card.innerText.toLowerCase();

        let okText = !input || title.includes(input) || content.includes(input);
        let okCat = activeCat === "all" || card.dataset.cat === activeCat;

        if (okText && okCat) {
            card.style.display = "block";
            card.classList.add("show");
        } else {
            card.style.display = "none";
        }
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

    let name = document.getElementById("name").value.trim();

    let phone = document.getElementById("phone").value.trim();

    let payment = document.getElementById("payment").value;

    if(name === "" || phone === "" || selectedCity === "" || !cart.length){

        alert("يرجى تعبئة جميع البيانات");

        return;

    }

    // السعر النهائي = مجموع المنتجات + سعر التوصيل
    let subtotal = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    let total = subtotal + selectedDelivery;

    function line(i) { return i.name + (i.qty > 1 ? " × " + i.qty : ""); }

    let productsText = cart.length === 1
        ? "📦 المنتج: " + line(cart[0])
        : "📦 المنتجات:\n" + cart.map(function (i) { return "• " + line(i); }).join("\n");

    let message = 
`طلبية جديدة من الموقع💜.
${productsText}
👤 الاسم: ${name}
📞 رقم الهاتف: ${phone}
📍 المدينة: ${selectedCity}
💰 السعر النهائي (شامل التوصيل): ${total} د.ل
💳 طريقة الدفع: ${payment}`;

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


// ==========================================================
// منتقي المدن: قائمة + بحث فوري + سعر التوصيل بجانب كل مدينة
// ==========================================================
(function initCityPicker() {

    const picker  = document.getElementById("cityPicker");
    const trigger = document.getElementById("cityTrigger");
    const label   = document.getElementById("cityLabel");
    const search  = document.getElementById("citySearch");
    const list    = document.getElementById("cityList");
    const hidden  = document.getElementById("location");

    if (!picker || !trigger || !search || !list) return;

    // توحيد الحروف العربية لتسهيل البحث
    function norm(s) {
        return String(s)
            .toLowerCase()
            .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
            .replace(/[أإآٱ]/g, "ا")
            .replace(/ى/g, "ي")
            .replace(/ة/g, "ه")
            .replace(/\s+/g, " ")
            .trim();
    }

    function stripAl(s) {
        return (s.length > 2 && s.indexOf("ال") === 0) ? s.slice(2) : s;
    }

    const data = CITIES.map(function (c) {
        const key = norm(c[0]);
        return {
            name: c[0],
            price: c[1],
            key: key,
            sk: stripAl(key),
            words: key.split(/[\s\-]+/).filter(Boolean).map(stripAl)
        };
    });

    function score(c, q) {
        if (c.key.indexOf(q) === 0 || c.sk.indexOf(q) === 0) return 0;
        for (let i = 0; i < c.words.length; i++) {
            if (c.words[i].indexOf(q) === 0) return 1;
        }
        if (c.key.indexOf(q) !== -1) return 2;
        return -1;
    }

    function byAlpha(a, b) {
        return a.sk.localeCompare(b.sk, "ar");
    }

    function getResults(query) {
        const q = norm(query);

        if (!q) return data.slice().sort(byAlpha);

        return data
            .map(function (c) { return { c: c, s: score(c, q) }; })
            .filter(function (x) { return x.s >= 0; })
            .sort(function (x, y) { return (x.s - y.s) || byAlpha(x.c, y.c); })
            .map(function (x) { return x.c; });
    }

    function render(query) {
        const results = getResults(query);
        list.innerHTML = "";

        if (!results.length) {
            const li = document.createElement("li");
            li.className = "no-res";
            li.textContent = "لا توجد نتائج";
            list.appendChild(li);
            return;
        }

        results.forEach(function (c) {
            const li = document.createElement("li");
            li.setAttribute("role", "option");
            li.dataset.name = c.name;
            if (c.name === selectedCity) li.className = "selected";

            const n = document.createElement("span");
            n.className = "c-name";
            n.textContent = c.name;

            const p = document.createElement("span");
            p.className = "c-price";
            p.textContent = c.price + " د.ل";

            li.appendChild(n);
            li.appendChild(p);
            list.appendChild(li);
        });

        list.scrollTop = 0;
    }

    function openPanel() {
        search.value = "";
        render("");
        picker.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
        picker.scrollIntoView({ behavior: "smooth", block: "start" });
        try { search.focus({ preventScroll: true }); } catch (e) { search.focus(); }
    }

    function closePanel() {
        picker.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
    }

    function choose(name) {
        const c = data.find(function (x) { return x.name === name; });
        if (!c) return;

        // حفظ المدينة + سعر التوصيل في الطلب
        selectedCity = c.name;
        selectedDelivery = c.price;
        hidden.value = c.name;

        label.textContent = c.name + " — " + c.price + " د.ل";
        label.classList.remove("placeholder");

        updateOrderSummary();
        closePanel();
    }

    trigger.addEventListener("click", function () {
        if (picker.classList.contains("open")) closePanel();
        else openPanel();
    });

    search.addEventListener("input", function () {
        render(search.value);
    });

    search.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const first = list.querySelector("li[data-name]");
            if (first) choose(first.dataset.name);
        }
    });

    list.addEventListener("click", function (e) {
        const li = e.target.closest("li[data-name]");
        if (li) choose(li.dataset.name);
    });

    document.addEventListener("click", function (e) {
        if (!picker.contains(e.target)) closePanel();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closePanel();
    });

})();


// ==========================================================
// خلفية النجوم: نقاط صغيرة تتحرك ببطء للأعلى (خلف المحتوى)
// ==========================================================
(function initStars() {

    const canvas = document.createElement("canvas");
    canvas.id = "bgStars";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, stars = [], last = 0, raf = 0;

    function rnd(a, b) { return a + Math.random() * (b - a); }

    function makeStar(initial) {
        return {
            x: rnd(0, w),
            y: initial ? rnd(0, h) : h + rnd(2, 20),
            r: rnd(0.8, 2.3),
            v: rnd(14, 38),                 // السرعة (بكسل/ثانية) - بطيئة وواضحة
            a: rnd(0.45, 0.95),              // الشفافية
            t: rnd(0, 6.28),                // طور التلألؤ
            ts: rnd(0.5, 1.6),              // سرعة التلألؤ
            c: Math.random() < 0.3 ? "233,216,255" : "255,255,255"
        };
    }

    function draw(dt) {
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];

            s.y -= s.v * dt;
            s.t += s.ts * dt;

            if (s.y < -4) {
                stars[i] = makeStar(false);
                continue;
            }

            const alpha = s.a * (0.65 + 0.35 * Math.sin(s.t));

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, 6.2832);
            ctx.fillStyle = "rgba(" + s.c + "," + alpha.toFixed(3) + ")";
            ctx.fill();

            // هالة خفيفة للنجوم الأكبر
            if (s.r > 1.6) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 2.6, 0, 6.2832);
                ctx.fillStyle = "rgba(" + s.c + "," + (alpha * 0.14).toFixed(3) + ")";
                ctx.fill();
            }
        }
    }

    function resize() {
        const nw = window.innerWidth;
        const nh = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const widthChanged = nw !== w;

        w = nw;
        h = nh;

        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (widthChanged || !stars.length) {
            const count = Math.min(160, Math.round((w * h) / 4000));
            stars = [];
            for (let i = 0; i < count; i++) stars.push(makeStar(true));
        }

        draw(0);
    }

    function loop(now) {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        draw(dt);
        raf = requestAnimationFrame(loop);
    }

    function start() {
        if (raf) return;
        last = performance.now();
        raf = requestAnimationFrame(loop);
    }

    function stop() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
    }

    let resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });

    // إيقاف الحركة عند إخفاء الصفحة لتوفير البطارية
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else start();
    });

    resize();
    start();

})();


// ==========================================================
// المتجر: تصنيفات + زر أضف للسلة + أزرار عائمة
// ==========================================================
(function initStore() {

    document.querySelectorAll(".product-card").forEach(function (card) {
        const h3 = card.querySelector("h3");

        // التصنيف تلقائيًا من اسم المنتج (أو أضف data-cat="light|tripod|audio|acc" على البطاقة)
        if (!card.dataset.cat) {
            const t = (h3 ? h3.textContent : "").toLowerCase();
            let cat = "light";
            if (/mic|earbuds|مايك|سماع/.test(t)) cat = "audio";
            else if (/power bank|حاملة|ستاند رقبة/.test(t)) cat = "acc";
            else if (/tripod|ترايبود|live-k7|pk-?99|pk10/.test(t)) cat = "tripod";
            card.dataset.cat = cat;
        }
    });

    // شريط التصنيفات
    const cats = [["all", "الكل"], ["light", "💡 إضاءة"], ["tripod", "📸 ترايبود"], ["audio", "🎤 صوتيات"], ["acc", "🔌 ملحقات"]];
    const bar = document.createElement("div");
    bar.className = "cat-bar";

    cats.forEach(function (c) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "cat" + (c[0] === "all" ? " active" : "");
        b.textContent = c[1];
        b.dataset.cat = c[0];
        bar.appendChild(b);
    });

    bar.addEventListener("click", function (e) {
        const b = e.target.closest(".cat");
        if (!b) return;
        activeCat = b.dataset.cat;
        bar.querySelectorAll(".cat").forEach(function (x) { x.classList.toggle("active", x === b); });
        searchProducts();
    });

    const h2 = document.querySelector(".products h2");
    if (h2) h2.insertAdjacentElement("afterend", bar);

    // زر واتساب عائم + زر السلة
    const wa = document.createElement("a");
    wa.id = "waFab";
    wa.className = "fab";
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.setAttribute("aria-label", "واتساب");
    wa.href = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent("مرحبًا، عندي استفسار عن منتج من الموقع 💜");
    wa.textContent = "💬";

    const cf = document.createElement("button");
    cf.id = "cartFab";
    cf.type = "button";
    cf.className = "fab";
    cf.innerHTML = '🛒 السلة (<span id="cartCount">0</span>)';
    cf.addEventListener("click", openCart);

    document.body.appendChild(wa);
    document.body.appendChild(cf);

    // إخفاء الأزرار العائمة عندما يظهر بوكس الطلب
    const ob = document.getElementById("orderBox");
    if (ob && "IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
            const v = es[0].isIntersecting;
            wa.classList.toggle("hide", v);
            cf.classList.toggle("hide", v);
        }).observe(ob);
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeCart();
    });

    loadCart();
    updateCartBadge();
    renderCart();

})();
