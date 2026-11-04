
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
// عدد القطع في السلة
function cartCount() {
    return cart.reduce(function (s, i) { return s + i.qty; }, 0);
}

// نسبة الخصم: قطعتين = 4% ، ثلاث قطع أو أكثر = 6%
function cartDiscountPct() {
    const n = cartCount();
    if (n >= 3) return 6;
    if (n === 2) return 4;
    return 0;
}

// الأسعار: قبل الخصم / النسبة / بعد الخصم
function cartTotals() {
    const sub = cartSubtotal();
    const pct = cartDiscountPct();
    const total = pct ? Math.round(sub * (100 - pct) / 100) : sub;
    return { sub: sub, pct: pct, total: total };
}

// يعرض السعر الأصلي مشطوبًا وبجانبه السعر بعد الخصم
function showPrice(el, t) {
    if (!el) return;
    el.textContent = "";
    if (t.pct) {
        const old = document.createElement("s");
        old.className = "old-price";
        old.textContent = t.sub + " د.ل";
        el.appendChild(old);
        el.appendChild(document.createTextNode(" " + t.total + " د.ل"));
    } else {
        el.textContent = t.total + " د.ل";
    }
}

// رسالة الخصم داخل السلة
function discountNote() {
    const n = cartCount();
    if (n === 0) return "";
    if (n === 1) return "🛍️ أضف منتجًا ثانيًا واحصل على خصم 4%";
    if (n === 2) return "🎉 حصلت على خصم 4% — أضف قطعة ثالثة لتحصل على خصم 6%";
    return "🎉 حصلت على أعلى خصم: 6%";
}

// تحديث ملخص السعر داخل بوكس الطلب
function updateOrderSummary() {
    const sp = document.getElementById("sumProduct");
    const sd = document.getElementById("sumDelivery");
    const st = document.getElementById("sumTotal");
    const dr = document.getElementById("sumDiscRow");
    const dv = document.getElementById("sumDisc");

    if (!sp || !sd || !st) return;

    const t = cartTotals();

    showPrice(sp, t);

    if (dr && dv) {
        dr.style.display = t.pct ? "flex" : "none";
        if (t.pct) dv.textContent = t.pct + "% (وفّرت " + (t.sub - t.total) + " د.ل)";
    }

    if (selectedCity) {
        sd.innerText = selectedDelivery + " د.ل";
        sd.classList.remove("muted");
        showPrice(st, { pct: t.pct, sub: t.sub + selectedDelivery, total: t.total + selectedDelivery });
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
    showPrice(document.getElementById("cartSubtotal"), cartTotals());
    const note = document.getElementById("cartNote");
    if (note) note.textContent = discountNote();
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
function sendWhatsApp() {

    let name = document.getElementById("name").value.trim();

    let phone = document.getElementById("phone").value.trim();

    let payment = document.getElementById("payment").value;

    if(name === "" || phone === "" || selectedCity === "" || !cart.length){

        alert("يرجى تعبئة جميع البيانات");

        return;

    }

    // السعر النهائي = مجموع المنتجات بعد الخصم + سعر التوصيل
    let t = cartTotals();
    let total = t.total + selectedDelivery;
    let discLine = t.pct ? "\n🎁 الخصم: " + t.pct + "% (-" + (t.sub - t.total) + " د.ل)" : "";

    function line(i) { return i.name + (i.qty > 1 ? " × " + i.qty : ""); }

    let productsText = cart.length === 1
        ? "📦 المنتج: " + line(cart[0])
        : "📦 المنتجات:\n" + cart.map(function (i) { return "• " + line(i); }).join("\n");

    let message = 
`طلبية جديدة من الموقع💜.
${productsText}
👤 الاسم: ${name}
📞 رقم الهاتف: ${phone}
📍 المدينة: ${selectedCity}${discLine}
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

// ==========================================================
// المفضلة ❤️ + شريط التنقل السفلي + قسم "لماذا PIXEL؟" + شاشة الترحيب
// ==========================================================

const FAV_KEY = "pixel_favs";
let favOnly = false;
let favIds = new Set();

try { favIds = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); } catch (e) { favIds = new Set(); }

function saveFavs() {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favIds))); } catch (e) {}
}

function updateFavBadge() {
    const el = document.getElementById("navFavCount");
    if (!el) return;
    el.textContent = favIds.size;
    el.style.display = favIds.size ? "flex" : "none";
}

// عدّاد السلة (نسخة تدعم شريط التنقل السفلي)
function updateCartBadge() {
    const n = cartCount();
    const a = document.getElementById("cartCount");
    if (a) a.textContent = n;
    const b = document.getElementById("navCartCount");
    if (b) {
        b.textContent = n;
        b.style.display = n ? "flex" : "none";
    }
}

// البحث + التصنيف + المفضلة (نسخة جديدة)
function searchProducts() {
    const input = (document.getElementById("searchInput").value || "").trim().toLowerCase();
    let shown = 0;

    document.querySelectorAll(".product-card").forEach(function (card) {
        const h3 = card.querySelector("h3");
        const title = h3 ? h3.innerText.toLowerCase() : "";
        const content = card.innerText.toLowerCase();

        const okText = !input || title.includes(input) || content.includes(input);
        const okCat = activeCat === "all" || card.dataset.cat === activeCat;
        const okFav = !favOnly || favIds.has(card.id);

        if (okText && okCat && okFav) {
            card.style.display = "block";
            card.classList.add("show");
            shown++;
        } else {
            card.style.display = "none";
        }
    });

    const nr = document.getElementById("noResults");
    if (nr) {
        nr.style.display = shown ? "none" : "block";
        nr.textContent = (favOnly && !favIds.size)
            ? "لا توجد منتجات في المفضلة بعد ❤️ اضغط على القلب في أي منتج لإضافته"
            : "لا توجد منتجات مطابقة";
    }
}

function setFavOnly(on) {
    favOnly = on;
    const bar = document.getElementById("favBar");
    if (bar) bar.style.display = on ? "flex" : "none";
    const nb = document.querySelector('#bottomNav [data-act="fav"]');
    if (nb) nb.classList.toggle("active", on);
    searchProducts();
}

(function initApp() {

    const section = document.querySelector(".products");

    // ---------- شريط المفضلة + رسالة "لا توجد نتائج" ----------
    const anchor = document.querySelector(".sort-row") || document.querySelector(".cat-bar");
    if (anchor) {
        const fb = document.createElement("div");
        fb.id = "favBar";
        fb.className = "fav-bar";
        fb.style.display = "none";

        const sp = document.createElement("span");
        sp.textContent = "❤️ تعرض المفضلة فقط";
        const bt = document.createElement("button");
        bt.type = "button";
        bt.textContent = "عرض كل المنتجات";
        bt.addEventListener("click", function () { setFavOnly(false); });
        fb.appendChild(sp);
        fb.appendChild(bt);

        const nr = document.createElement("div");
        nr.id = "noResults";
        nr.className = "no-results";
        nr.style.display = "none";

        anchor.insertAdjacentElement("afterend", nr);
        anchor.insertAdjacentElement("afterend", fb);
    }

    // ---------- أزرار القلب على المنتجات ----------
    function syncHearts() {
        document.querySelectorAll(".product-card").forEach(function (card) {
            const b = card.querySelector(".fav-btn");
            if (!b) return;
            const on = favIds.has(card.id);
            b.textContent = on ? "❤️" : "🤍";
            b.classList.toggle("on", on);
            b.setAttribute("aria-pressed", on ? "true" : "false");
        });
    }

    document.querySelectorAll(".product-card").forEach(function (card) {
        const wrap = card.querySelector(".p-actions");
        if (!wrap) return;

        const b = document.createElement("button");
        b.type = "button";
        b.className = "fav-btn";
        b.setAttribute("aria-label", "المفضلة");
        b.addEventListener("click", function () {
            if (favIds.has(card.id)) {
                favIds.delete(card.id);
                toast("تمت الإزالة من المفضلة");
            } else {
                favIds.add(card.id);
                toast("تمت الإضافة للمفضلة ❤️");
            }
            saveFavs();
            syncHearts();
            updateFavBadge();
            if (favOnly) searchProducts();
        });

        wrap.insertBefore(b, wrap.querySelector(".share-btn"));
    });
    syncHearts();

    // ---------- قسم لماذا PIXEL؟ ----------
    const why = [
        ["🚚", "توصيل لجميع المدن", "وسعر التوصيل يظهر لك قبل تأكيد الطلب"],
        ["🛡️", "منتجات مضمونة", "جودة عالية ومنتجات مختارة بعناية"],
        ["🎁", "خصم على الكمية", "4% لقطعتين و6% لثلاث قطع أو أكثر"],
        ["💬", "دعم عبر الواتساب", "تواصل معنا لأي استفسار قبل الطلب"]
    ];

    const sec = document.createElement("section");
    sec.id = "why";
    sec.className = "why";

    const h2 = document.createElement("h2");
    h2.textContent = "لماذا PIXEL؟ 💜";
    sec.appendChild(h2);

    const grid = document.createElement("div");
    grid.className = "why-grid";

    why.forEach(function (w) {
        const card = document.createElement("div");
        card.className = "why-card";

        const ico = document.createElement("span");
        ico.className = "why-ico";
        ico.textContent = w[0];
        const t = document.createElement("b");
        t.textContent = w[1];
        const p = document.createElement("p");
        p.textContent = w[2];

        card.appendChild(ico);
        card.appendChild(t);
        card.appendChild(p);
        grid.appendChild(card);
    });
    sec.appendChild(grid);

    const place = document.getElementById("reviews") || document.getElementById("faq") || document.getElementById("about");
    if (place) place.parentNode.insertBefore(sec, place);

    // ---------- شريط التنقل السفلي ----------
    const nav = document.createElement("div");
    nav.id = "bottomNav";
    nav.setAttribute("role", "navigation");

    [["home", "🏠", "الرئيسية"], ["products", "🛍️", "المنتجات"], ["fav", "❤️", "المفضلة"], ["cart", "🛒", "السلة"], ["contact", "💬", "تواصل"]].forEach(function (it) {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.act = it[0];

        const ico = document.createElement("span");
        ico.className = "bn-ico";
        ico.textContent = it[1];
        const lbl = document.createElement("span");
        lbl.className = "bn-lbl";
        lbl.textContent = it[2];
        b.appendChild(ico);
        b.appendChild(lbl);

        if (it[0] === "fav" || it[0] === "cart") {
            const bd = document.createElement("span");
            bd.className = "bn-badge";
            bd.id = it[0] === "fav" ? "navFavCount" : "navCartCount";
            bd.textContent = "0";
            bd.style.display = "none";
            b.appendChild(bd);
        }
        nav.appendChild(b);
    });

    nav.addEventListener("click", function (e) {
        const b = e.target.closest("button[data-act]");
        if (!b) return;
        const act = b.dataset.act;

        if (act === "home") {
            setFavOnly(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (act === "products") {
            setFavOnly(false);
            if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (act === "fav") {
            setFavOnly(!favOnly);
            if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (act === "cart") {
            openCart();
        } else if (act === "contact") {
            const c = document.getElementById("contact");
            if (c) c.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    document.body.appendChild(nav);
    document.body.classList.add("has-nav");
    updateCartBadge();
    updateFavBadge();

    // إخفاء الشريط أثناء إتمام الطلب وأثناء الكتابة (لا يغطي لوحة المفاتيح)
    const ob = document.getElementById("orderBox");
    if (ob && "IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
            nav.classList.toggle("hide", es[0].isIntersecting);
        }).observe(ob);
    }

    document.addEventListener("focusin", function (e) {
        if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) nav.classList.add("kb");
    });
    document.addEventListener("focusout", function () { nav.classList.remove("kb"); });

    // ---------- شاشة الترحيب ----------
    const splash = document.getElementById("splash");
    if (splash) {
        splash.addEventListener("click", function () { splash.classList.add("hide"); });
        setTimeout(function () { splash.classList.add("hide"); }, 1900);
    }

})();

// ==========================================================
// الواجهة الجديدة: بانر + ترحيب + عروض + لماذا PIXEL + شريط سفلي بسلة بارزة + قلب المفضلة
// (كتلة واحدة مستقلة: الصقها في آخر script.js)
// ==========================================================
(function pxLanding() {

    // ⚙️ شرائح البانر في أول الصفحة (عدّل النصوص كما تريد، أو أضف شريحة)
    const BANNERS = [
        { icon: "🚚", title: "توصيل لجميع المدن", text: "اختر مدينتك وسعر التوصيل يظهر لك قبل التأكيد", cls: "b1" },
        { icon: "🎁", title: "خصم على طلبك", text: "4% لقطعتين • 6% لثلاث قطع أو أكثر", cls: "b2" },
        { icon: "📸", title: "كل ما تحتاجه لصناعة المحتوى", text: "إضاءة • ترايبود • مايكات • جيمبال", cls: "b3" }
        // مثال لعرض "أول طلب" (فعّله فقط لو ستلتزم به):
        // { icon: "🎉", title: "أول طلب لك توصيل مجاني", text: "اطلب الآن واستفد من العرض", cls: "b1" }
    ];

    const ICON_GRID = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>';
    const ICON_CART = '<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
    const ICON_HEART = '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    const ICON_HEAD = '<svg viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>';

    function $(s, r) { return (r || document).querySelector(s); }
    function $$(s, r) { return Array.from((r || document).querySelectorAll(s)); }

    function el(tag, cls, txt) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt !== undefined) e.textContent = txt;
        return e;
    }

    function btn(cls, txt, fn) {
        const b = el("button", cls, txt);
        b.type = "button";
        if (fn) b.addEventListener("click", fn);
        return b;
    }

    function normName(s) { return String(s).toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, ""); }

    function hashStr(s) {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return h.toString(36);
    }

    function priceOf(card) {
        const h4 = $("h4", card);
        const t = h4 ? h4.textContent.replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }) : "";
        const m = t.match(/\d+(?:\.\d+)?/);
        return m ? Number(m[0]) : 0;
    }

    const section = $(".products");
    if (!section) return;

    document.body.classList.add("landing");

    function go(node) {
        if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // ---------- تجهيز البطاقات ----------
    const cards = $$(".product-card");
    cards.forEach(function (c, i) {
        if (c.dataset.idx === undefined) c.dataset.idx = i;
        const h3 = $("h3", c);
        if (!c.id) c.id = "p-" + hashStr(normName(h3 ? h3.textContent : String(i)));
    });

    // ---------- المفضلة ----------
    let favs = new Set();
    try { favs = new Set(JSON.parse(localStorage.getItem("pixel_favs") || "[]")); } catch (e) { favs = new Set(); }
    let favOnly = false;

    function saveFavs() {
        try { localStorage.setItem("pixel_favs", JSON.stringify(Array.from(favs))); } catch (e) {}
    }

    function updateFavBadge() {
        const b = document.getElementById("navFavCount");
        if (!b) return;
        b.textContent = favs.size;
        b.style.display = favs.size ? "flex" : "none";
    }

    function syncHearts() {
        $$(".product-card").forEach(function (c) {
            const b = $(".fav-btn", c);
            if (!b) return;
            const on = favs.has(c.id);
            b.classList.toggle("on", on);
            b.setAttribute("aria-pressed", on ? "true" : "false");
        });
    }

    function toggleFav(card) {
        if (favs.has(card.id)) {
            favs.delete(card.id);
            toast("تمت الإزالة من المفضلة");
        } else {
            favs.add(card.id);
            toast("تمت الإضافة للمفضلة ❤️");
        }
        saveFavs();
        syncHearts();
        updateFavBadge();
        if (favOnly) window.searchProducts();
    }

    // زر القلب بجانب زر الإضافة للسلة (يشتغل حتى لو ما كان فيه زر مشاركة)
    cards.forEach(function (card) {
        const addBtn = $(".add-cart", card);
        let wrap = $(".p-actions", card);
        if (!wrap && addBtn) {
            wrap = el("div", "p-actions");
            addBtn.parentNode.insertBefore(wrap, addBtn);
            wrap.appendChild(addBtn);
        }
        if (!wrap) return;

        $$(".fav-btn", wrap).forEach(function (b) { b.remove(); });

        const hb = btn("fav-btn", "", function () { toggleFav(card); });
        hb.innerHTML = ICON_HEART;
        hb.setAttribute("aria-label", "المفضلة");
        wrap.insertBefore(hb, $(".share-btn", wrap));
    });

    // ---------- شريط البحث والسلة في الأعلى ----------
    const topNav = $("body > nav");
    const search = $(".search-box");
    if (topNav && search) {
        const input = $("input", search);
        if (input) input.placeholder = "ابحث عن منتج...";

        const logo = $(".logo-text", topNav);
        if (logo) {
            logo.style.cursor = "pointer";
            logo.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
            logo.insertAdjacentElement("afterend", search);
        } else {
            topNav.insertBefore(search, topNav.firstChild);
        }

        // عند الكتابة في البحث انزل للمنتجات تلقائيًا
        let jumped = false;
        if (input) {
            input.addEventListener("input", function () {
                if (!jumped && input.value.trim()) { jumped = true; go(section); }
            });
            input.addEventListener("blur", function () { jumped = false; });
        }

        const pill = btn("top-cart", "", function () { openCart(); });
        pill.id = "topCart";
        pill.innerHTML = '<span>السلة</span><b id="topCartCount">0</b>';
        topNav.appendChild(pill);
    }

    // ---------- بانر العروض ----------
    function buildBanner() {
        if (!BANNERS.length) return null;

        const sec = el("section", "promo reveal");
        sec.id = "promo";
        const stage = el("div", "promo-stage");
        const slides = [];
        const dots = [];
        const dotBox = el("div", "promo-dots");
        let cur = 0;
        let startX = null;

        function show(i) {
            cur = (i + slides.length) % slides.length;
            slides.forEach(function (s, k) { s.classList.toggle("on", k === cur); });
            dots.forEach(function (d, k) { d.classList.toggle("on", k === cur); });
        }

        BANNERS.forEach(function (b, i) {
            const s = el("div", "promo-slide " + (b.cls || "b1") + (i === 0 ? " on" : ""));
            const t = el("div", "ps-txt");
            t.appendChild(el("h3", "", b.title));
            t.appendChild(el("p", "", b.text));
            t.appendChild(btn("ps-btn", "تسوّق الآن", function () { go(section); }));
            s.appendChild(t);
            s.appendChild(el("div", "ps-ico", b.icon));
            stage.appendChild(s);
            slides.push(s);

            const d = btn("pd" + (i === 0 ? " on" : ""), "", function () { show(i); });
            d.setAttribute("aria-label", "شريحة " + (i + 1));
            dotBox.appendChild(d);
            dots.push(d);
        });

        if (slides.length > 1) {
            stage.appendChild(btn("promo-arrow prev", "›", function () { show(cur - 1); }));
            stage.appendChild(btn("promo-arrow next", "‹", function () { show(cur + 1); }));
            stage.appendChild(dotBox);

            stage.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
            stage.addEventListener("touchend", function (e) {
                if (startX === null) return;
                const dx = e.changedTouches[0].clientX - startX;
                startX = null;
                if (Math.abs(dx) > 40) show(dx < 0 ? cur + 1 : cur - 1);
            });

            setInterval(function () {
                const r = stage.getBoundingClientRect();
                const inView = r.bottom > 0 && r.top < window.innerHeight;
                if (inView && !document.hidden) show(cur + 1);
            }, 4500);
        }

        sec.appendChild(stage);
        return sec;
    }

    // ---------- بطاقة الترحيب ----------
    function buildHero() {
        const hdr = $("header");
        const h1 = hdr ? $("h1", hdr) : null;
        const p = hdr ? $("p", hdr) : null;
        const img = hdr ? $("img", hdr) : null;

        const sec = el("section", "hero reveal");
        sec.id = "hero";

        if (img && img.getAttribute("src")) {
            const logo = el("img", "hero-logo");
            logo.src = img.getAttribute("src");
            logo.alt = "";
            logo.addEventListener("error", function () { logo.style.display = "none"; });
            sec.appendChild(logo);
        }

        sec.appendChild(el("div", "hero-kicker", h1 ? h1.textContent.trim() : "مرحبًا بك في متجرنا 💜"));
        sec.appendChild(el("div", "hero-title", "PIXEL STORE"));
        sec.appendChild(el("p", "", p ? p.textContent.trim() : "وجهتك الأولى في صناعة المحتوى"));

        const row = el("div", "hero-btns");
        row.appendChild(btn("hero-btn primary", "تصفح المنتجات", function () { go(section); }));
        row.appendChild(btn("hero-btn ghost", "اكتشف العروض", function () { go(document.getElementById("offers")); }));
        sec.appendChild(row);
        return sec;
    }

    // ---------- العروض ----------
    function updateOffersStatus() {
        const s = document.getElementById("offersStatus");
        if (!s) return;
        const n = typeof cartCount === "function" ? cartCount() : 0;
        const pct = typeof cartDiscountPct === "function" ? cartDiscountPct() : 0;
        s.textContent = n === 0 ? "🛍️ أضف منتجات لسلتك وشاهد خصمك يتحدث مباشرة"
            : pct ? "✅ في سلتك " + n + " قطعة — خصمك الحالي " + pct + "%"
            : "🛍️ في سلتك قطعة واحدة — أضف قطعة ثانية لتحصل على خصم 4%";
    }

    function buildOffers() {
        const sec = el("section", "offers reveal");
        sec.id = "offers";
        sec.appendChild(el("h2", "", "العروض 🎁"));

        const grid = el("div", "offer-grid");
        [["4", "عند طلب قطعتين"], ["6", "عند طلب 3 قطع أو أكثر"]].forEach(function (o) {
            const t = el("div", "offer-tile");
            const pct = el("div", "offer-pct", o[0]);
            pct.appendChild(el("small", "", "%"));
            t.appendChild(pct);
            t.appendChild(el("div", "offer-lbl", "خصم"));
            t.appendChild(el("p", "", o[1]));
            grid.appendChild(t);
        });
        sec.appendChild(grid);

        const st = el("div", "offer-status");
        st.id = "offersStatus";
        sec.appendChild(st);
        return sec;
    }

    // ---------- لماذا PIXEL ----------
    function buildWhy() {
        const sec = el("section", "why reveal");
        sec.id = "why";
        sec.appendChild(el("h2", "", "لماذا PIXEL؟ 💜"));

        const grid = el("div", "why-grid");
        [
            ["🚚", "توصيل لجميع المدن", "وسعر التوصيل يظهر لك قبل تأكيد الطلب"],
            ["🛡️", "منتجات مضمونة", "جودة عالية ومنتجات مختارة بعناية"],
            ["🎁", "خصم على الكمية", "4% لقطعتين و6% لثلاث قطع أو أكثر"],
            ["💬", "دعم عبر الواتساب", "تواصل معنا لأي استفسار قبل الطلب"]
        ].forEach(function (w) {
            const c = el("div", "why-card");
            c.appendChild(el("span", "why-ico", w[0]));
            c.appendChild(el("b", "", w[1]));
            c.appendChild(el("p", "", w[2]));
            grid.appendChild(c);
        });
        sec.appendChild(grid);
        return sec;
    }

    // ---------- تجميع الصفحة الرئيسية ----------
    const old = document.getElementById("why");
    if (old) old.remove();

    const landing = el("div");
    landing.id = "landing";
    [buildBanner(), buildHero(), buildOffers(), buildWhy()].forEach(function (s) {
        if (s) landing.appendChild(s);
    });
    section.parentNode.insertBefore(landing, section);

    // ---------- المنتجات: عنوان + فلاتر ----------
    const h2 = $("h2", section);
    if (h2) h2.textContent = "المنتجات";

    $$(".sort-row").forEach(function (x) { x.remove(); });
    ["favBar", "noResults"].forEach(function (id) {
        const x = document.getElementById(id);
        if (x) x.remove();
    });

    const filters = el("div", "filters");
    const sel = el("select");
    sel.id = "sortSel";
    [["def", "الافتراضي"], ["new", "الأحدث أولًا"], ["asc", "السعر: الأقل"], ["desc", "السعر: الأعلى"]].forEach(function (o) {
        const op = el("option", "", o[1]);
        op.value = o[0];
        sel.appendChild(op);
    });
    const mp = el("input");
    mp.id = "maxPrice";
    mp.type = "text";
    mp.inputMode = "numeric";
    mp.placeholder = "أعلى سعر (د.ل)";
    mp.setAttribute("autocomplete", "off");
    filters.appendChild(sel);
    filters.appendChild(mp);

    const favBar = el("div", "fav-bar");
    favBar.id = "favBar";
    favBar.style.display = "none";
    favBar.appendChild(el("span", "", "❤️ تعرض المفضلة فقط"));
    favBar.appendChild(btn("", "عرض كل المنتجات", function () { setFavOnly(false); }));

    const noRes = el("div", "no-results");
    noRes.id = "noResults";
    noRes.style.display = "none";

    const catBar = $(".cat-bar", section);
    const after = catBar || h2;
    if (after) {
        after.insertAdjacentElement("afterend", noRes);
        after.insertAdjacentElement("afterend", favBar);
        after.insertAdjacentElement("afterend", filters);
    }

    function applySort(v) {
        $$(".product-card").sort(function (a, b) {
            if (v === "asc") return priceOf(a) - priceOf(b);
            if (v === "desc") return priceOf(b) - priceOf(a);
            if (v === "new") return b.dataset.idx - a.dataset.idx;
            return a.dataset.idx - b.dataset.idx;
        }).forEach(function (c) { section.appendChild(c); });
    }

    sel.addEventListener("change", function () { applySort(sel.value); });
    mp.addEventListener("input", function () { window.searchProducts(); });

    // البحث + التصنيف + المفضلة + أعلى سعر
    window.searchProducts = function () {
        const si = document.getElementById("searchInput");
        const q = (si ? si.value : "").trim().toLowerCase();
        const cat = (typeof activeCat !== "undefined") ? activeCat : "all";
        const maxRaw = String(mp.value || "").replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); });
        const max = parseFloat(maxRaw);
        let shown = 0;

        $$(".product-card").forEach(function (c) {
            const h3 = $("h3", c);
            const title = h3 ? h3.innerText.toLowerCase() : "";
            const content = c.innerText.toLowerCase();

            const okText = !q || title.includes(q) || content.includes(q);
            const okCat = cat === "all" || c.dataset.cat === cat;
            const okFav = !favOnly || favs.has(c.id);
            const okPrice = !(max > 0) || priceOf(c) <= max;

            if (okText && okCat && okFav && okPrice) {
                c.style.display = "block";
                c.classList.add("show");
                shown++;
            } else {
                c.style.display = "none";
            }
        });

        noRes.style.display = shown ? "none" : "block";
        noRes.textContent = (favOnly && !favs.size)
            ? "لا توجد منتجات في المفضلة بعد ❤️ اضغط على القلب في أي منتج لإضافته"
            : "لا توجد منتجات مطابقة";
    };

    function setFavOnly(on) {
        favOnly = on;
        favBar.style.display = on ? "flex" : "none";
        const b = $('#appNav [data-act="fav"]');
        if (b) b.classList.toggle("active", on);
        window.searchProducts();
    }

    // ---------- عدّاد السلة ----------
    window.updateCartBadge = function () {
        const n = typeof cartCount === "function" ? cartCount() : 0;
        ["cartCount", "topCartCount"].forEach(function (id) {
            const e = document.getElementById(id);
            if (e) e.textContent = n;
        });
        const nb = document.getElementById("navCartCount");
        if (nb) {
            nb.textContent = n;
            nb.style.display = n ? "flex" : "none";
        }
        updateOffersStatus();
    };

    // ---------- واجهة التواصل (تقرأ روابطك من قسم "تواصل معنا" في الصفحة) ----------
    const contactSheet = el("div", "px-sheet");
    contactSheet.id = "contactSheet";

    function openContact() {
        contactSheet.classList.add("open");
        document.body.classList.add("cart-open");
    }

    function closeContact() {
        contactSheet.classList.remove("open");
        document.body.classList.remove("cart-open");
    }

    (function buildContact() {
        const back = el("div", "px-backdrop");
        back.addEventListener("click", closeContact);

        const box = el("div", "px-box");
        box.appendChild(el("div", "px-handle"));

        const head = el("div", "px-head");
        head.appendChild(el("h3", "", "تواصل معنا 💬"));
        head.appendChild(btn("px-close", "✕", closeContact));
        box.appendChild(head);
        box.appendChild(el("p", "px-sub", "اختر الطريقة الأنسب لك، ويسعدنا خدمتك"));

        const SUB = { wa: "راسلنا مباشرة على واتساب", ig: "تابعنا على إنستغرام", fb: "صفحتنا على فيسبوك", tk: "تابعنا على تيك توك" };
        const ORDER = ["wa", "ig", "fb", "tk"];
        const list = el("div", "px-list");

        const found = $$("#contact a.social").map(function (a) {
            const m = a.className.match(/\b(ig|fb|tk|wa)\b/);
            const nm = $(".s-name", a);
            const svg = $("svg", a);
            return { k: m ? m[1] : "wa", href: a.getAttribute("href"), name: nm ? nm.textContent : "", svg: svg ? svg.outerHTML : "" };
        });

        if (!found.length && typeof whatsappNumber !== "undefined") {
            found.push({ k: "wa", href: "https://wa.me/" + whatsappNumber, name: "واتساب", svg: "" });
        }

        found.sort(function (a, b) { return ORDER.indexOf(a.k) - ORDER.indexOf(b.k); }).forEach(function (f) {
            const row = el("a", "px-row " + f.k);
            row.href = f.href;
            row.target = "_blank";
            row.rel = "noopener";

            const ico = el("span", "px-ico");
            ico.innerHTML = f.svg;
            row.appendChild(ico);

            const tx = el("span", "px-tx");
            tx.appendChild(el("b", "", f.name));
            tx.appendChild(el("small", "", SUB[f.k] || ""));
            row.appendChild(tx);

            row.appendChild(el("span", "px-go", "‹"));
            list.appendChild(row);
        });

        box.appendChild(list);
        contactSheet.appendChild(back);
        contactSheet.appendChild(box);
        document.body.appendChild(contactSheet);
    })();

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeContact();
    });

    // زر "متابعة التسوق" داخل السلة
    const cartFoot = $(".cart-foot");
    if (cartFoot && !$(".cart-continue", cartFoot)) {
        cartFoot.appendChild(btn("cart-continue", "متابعة التسوق", function () { closeCart(); }));
    }

    // ---------- الشريط السفلي (4 أزرار + سلة بارزة) ----------
    const oldNav = document.getElementById("bottomNav");
    if (oldNav) oldNav.remove();

    const nav = el("div");
    nav.id = "appNav";
    nav.setAttribute("role", "navigation");

    [["products", "المنتجات", ICON_GRID], ["cart", "السلة", ICON_CART], ["fav", "المفضلة", ICON_HEART], ["contact", "تواصل", ICON_HEAD]].forEach(function (it) {
        const b = el("button", it[0] === "cart" ? "bn-cart" : "");
        b.type = "button";
        b.dataset.act = it[0];

        if (it[0] === "cart") {
            const wrap = el("span", "bn-hexwrap");
            const hex = el("span", "bn-hex");
            hex.innerHTML = it[2];
            wrap.appendChild(hex);
            b.appendChild(wrap);
        } else {
            const ico = el("span", "bn-ico");
            ico.innerHTML = it[2];
            b.appendChild(ico);
        }
        b.appendChild(el("span", "bn-lbl", it[1]));

        if (it[0] === "cart" || it[0] === "fav") {
            const bd = el("span", "bn-badge" + (it[0] === "fav" ? " fav" : ""), "0");
            bd.id = it[0] === "fav" ? "navFavCount" : "navCartCount";
            bd.style.display = "none";
            b.appendChild(bd);
        }
        nav.appendChild(b);
    });

    nav.addEventListener("click", function (e) {
        const b = e.target.closest("button[data-act]");
        if (!b) return;
        const act = b.dataset.act;

        if (act === "products") {
            setFavOnly(false);
            go(section);
        } else if (act === "cart") {
            openCart();
        } else if (act === "fav") {
            setFavOnly(!favOnly);
            go(section);
        } else if (act === "contact") {
            openContact();
        }
    });

    document.body.appendChild(nav);
    document.body.classList.add("has-nav");

    // يختفي أثناء إتمام الطلب وأثناء الكتابة (حتى لا يغطي لوحة المفاتيح)
    const ob = document.getElementById("orderBox");
    if (ob && "IntersectionObserver" in window) {
        new IntersectionObserver(function (es) { nav.classList.toggle("hide", es[0].isIntersecting); }).observe(ob);
    }
    document.addEventListener("focusin", function (e) {
        if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) nav.classList.add("kb");
    });
    document.addEventListener("focusout", function () { nav.classList.remove("kb"); });

    // ---------- ظهور تدريجي للأقسام ----------
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(function (es) {
            es.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
            });
        }, { threshold: 0.12 });
        $$(".reveal").forEach(function (r) { io.observe(r); });
    } else {
        $$(".reveal").forEach(function (r) { r.classList.add("in"); });
    }

    syncHearts();
    updateFavBadge();
    window.updateCartBadge();

})();

// ==========================================================
// لمسات احترافية: تحميل الصور بسلاسة + نافذة تفاصيل المنتج + شاشة تأكيد الطلب + زر للأعلى
// (كتلة مستقلة: الصقها في آخر script.js)
// ==========================================================
(function pxPro() {

    function $(s, r) { return (r || document).querySelector(s); }
    function $$(s, r) { return Array.from((r || document).querySelectorAll(s)); }

    function el(tag, cls, txt) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt !== undefined) e.textContent = txt;
        return e;
    }

    function btn(cls, txt, fn) {
        const b = el("button", cls, txt);
        b.type = "button";
        if (fn) b.addEventListener("click", fn);
        return b;
    }

    const PLACEHOLDER = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 190"><rect width="300" height="190" fill="#f3eefc"/>' +
        '<g fill="none" stroke="#b9a6dc" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="105" y="62" width="90" height="66" rx="12"/><circle cx="150" cy="95" r="17"/><path d="M128 62l7-12h30l7 12"/></g></svg>'
    );

    // ---------- أداء + لون شريط المتصفح ----------
    try {
        if (!$('link[rel="preconnect"][href*="ibb.co"]')) {
            const l = document.createElement("link");
            l.rel = "preconnect";
            l.href = "https://i.ibb.co";
            l.crossOrigin = "";
            document.head.appendChild(l);
        }
        if (!$('meta[name="theme-color"]')) {
            const m = document.createElement("meta");
            m.name = "theme-color";
            m.content = "#7b2cff";
            document.head.appendChild(m);
        }
    } catch (e) {}

    // ---------- الصور: هيكل تحميل + ظهور تدريجي + صورة بديلة ----------
    $$(".product-card img").forEach(function (img, i) {
        function ok() { img.classList.add("img-ok"); }
        function bad() {
            if (!img.dataset.fb) { img.dataset.fb = "1"; img.src = PLACEHOLDER; }
            else ok();
        }
        if (img.complete && img.naturalWidth > 0) ok();
        else if (img.complete) bad();
        img.addEventListener("load", ok);
        img.addEventListener("error", bad);
        if (i > 1 && !img.hasAttribute("loading")) img.loading = "lazy";
    });

    // ---------- نافذة تفاصيل المنتج ----------
    function specsOf(card) { return $("ul", card) || $("pre", card); }

    const dsheet = el("div", "px-sheet");
    dsheet.id = "detailSheet";
    document.body.appendChild(dsheet);

    function closeDetail() {
        dsheet.classList.remove("open");
        document.body.classList.remove("cart-open");
    }

    function openDetail(card) {
        const h3 = $("h3", card);
        const h4 = $("h4", card);
        const im = $("img", card);
        const specs = specsOf(card);

        dsheet.innerHTML = "";
        const back = el("div", "px-backdrop");
        back.addEventListener("click", closeDetail);

        const box = el("div", "px-box ds-box");
        box.appendChild(el("div", "px-handle"));

        const head = el("div", "px-head");
        head.appendChild(el("h3", "", h3 ? h3.textContent.trim() : ""));
        head.appendChild(btn("px-close", "✕", closeDetail));
        box.appendChild(head);

        const imgWrap = el("div", "ds-img");
        const big = el("img");
        big.alt = "";
        big.src = im ? (im.currentSrc || im.src) : "";
        imgWrap.appendChild(big);
        box.appendChild(imgWrap);

        box.appendChild(el("div", "ds-price", h4 ? h4.textContent.trim() : ""));

        if (specs) {
            const c = specs.cloneNode(true);
            c.className = "ds-specs";
            c.removeAttribute("style");
            box.appendChild(c);
        }

        const row = el("div", "ds-actions");
        const addB = $(".add-cart", card);
        const sold = !addB || addB.disabled;
        const add = btn("ds-add", sold ? "نفدت الكمية" : "🛒 أضف للسلة", function () {
            if (sold) return;
            addB.click();
            add.textContent = "✓ تمت الإضافة";
            setTimeout(function () { add.textContent = "🛒 أضف للسلة"; }, 1200);
        });
        if (sold) add.disabled = true;
        row.appendChild(add);

        const ch = $(".fav-btn", card);
        if (ch) {
            const hb = btn("ds-icon fav" + (ch.classList.contains("on") ? " on" : ""), "", function () {
                ch.click();
                hb.classList.toggle("on", ch.classList.contains("on"));
            });
            hb.innerHTML = ch.innerHTML;
            row.appendChild(hb);
        }

        const sh = $(".share-btn", card);
        if (sh) row.appendChild(btn("ds-icon", "🔗", function () { sh.click(); }));

        box.appendChild(row);
        dsheet.appendChild(back);
        dsheet.appendChild(box);
        dsheet.classList.add("open");
        document.body.classList.add("cart-open");
    }

    // المواصفات مختصرة على البطاقة + زر "عرض كل المواصفات"
    $$(".product-card").forEach(function (card) {
        const specs = specsOf(card);
        const h3 = $("h3", card);

        if (specs && !$(".more-btn", card)) {
            specs.insertAdjacentElement("afterend", btn("more-btn", "عرض كل المواصفات ‹", function () { openDetail(card); }));
        }
        if (h3) {
            h3.style.cursor = "pointer";
            h3.addEventListener("click", function () { openDetail(card); });
        }
        const img = $("img", card);
        if (img && !document.getElementById("lightbox")) {
            img.style.cursor = "pointer";
            img.addEventListener("click", function () { openDetail(card); });
        }
    });

    // إذا المواصفات قصيرة وتظهر كاملة، لا حاجة للتقصير ولا للزر
    function fitSpecs() {
        $$(".product-card").forEach(function (card) {
            const specs = specsOf(card);
            const more = $(".more-btn", card);
            if (!specs || !more || card.style.display === "none") return;
            const fits = specs.scrollHeight <= 68;
            specs.classList.toggle("fits", fits);
            more.style.display = fits ? "none" : "";
        });
    }
    window.addEventListener("load", function () { setTimeout(fitSpecs, 300); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(fitSpecs, 100); });

    // ---------- تفاعل زر "أضف للسلة" ----------
    const origAdd = window.addToCart;
    if (typeof origAdd === "function") {
        window.addToCart = function (name) {
            origAdd(name);

            let b = null;
            try {
                const t = window.event && window.event.target;
                b = t && t.closest ? t.closest(".add-cart") : null;
            } catch (e) {}

            if (b && !b.dataset.busy) {
                b.dataset.busy = "1";
                const oldTxt = b.textContent;
                b.textContent = "✓ تمت الإضافة";
                b.classList.add("added");
                setTimeout(function () {
                    b.textContent = oldTxt;
                    b.classList.remove("added");
                    delete b.dataset.busy;
                }, 1200);
            }

            $$(".top-cart, .bn-hexwrap").forEach(function (x) {
                x.classList.remove("bump");
                void x.offsetWidth;
                x.classList.add("bump");
            });
            try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {}
        };
    }

    // ---------- شاشة تأكيد بعد الطلب ----------
    const tsheet = el("div", "px-sheet");
    tsheet.id = "thanksSheet";
    document.body.appendChild(tsheet);

    function closeThanks() {
        tsheet.classList.remove("open");
        document.body.classList.remove("cart-open");
    }

    function finishOrder() {
        try { cart.length = 0; saveCart(); renderCart(); } catch (e) {}
        const ob = document.getElementById("orderBox");
        if (ob) ob.style.display = "none";
        closeThanks();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showThanks(link) {
        const n = typeof cartCount === "function" ? cartCount() : 0;
        const t = typeof cartTotals === "function" ? cartTotals() : null;
        const delivery = typeof selectedDelivery !== "undefined" ? selectedDelivery : 0;
        const total = t ? t.total + delivery : 0;

        tsheet.innerHTML = "";
        const back = el("div", "px-backdrop");
        back.addEventListener("click", closeThanks);

        const box = el("div", "px-box th-box");
        box.appendChild(el("div", "px-handle"));
        box.appendChild(el("div", "th-ico", "✓"));
        box.appendChild(el("h3", "th-title", "تم تجهيز طلبك 🎉"));
        box.appendChild(el("p", "th-text", "فتحنا لك واتساب والرسالة جاهزة، اضغط «إرسال» لتأكيد الطلب معنا."));

        const sum = el("div", "th-sum");
        const a = el("div");
        a.appendChild(el("span", "", "عدد القطع"));
        a.appendChild(el("b", "", String(n)));
        const b = el("div");
        b.appendChild(el("span", "", "الإجمالي شامل التوصيل"));
        b.appendChild(el("b", "", total + " د.ل"));
        sum.appendChild(a);
        sum.appendChild(b);
        box.appendChild(sum);

        if (link) {
            const l = el("a", "th-link", "لم يفتح واتساب؟ اضغط هنا");
            l.href = link;
            l.target = "_blank";
            l.rel = "noopener";
            box.appendChild(l);
        }

        box.appendChild(btn("th-main", "تم الإرسال، ابدأ طلبًا جديدًا", finishOrder));
        box.appendChild(btn("cart-continue", "رجوع للتسوق", closeThanks));

        tsheet.appendChild(back);
        tsheet.appendChild(box);
        tsheet.classList.add("open");
        document.body.classList.add("cart-open");
    }

    const origSend = window.sendWhatsApp;
    if (typeof origSend === "function") {
        window.sendWhatsApp = function () {
            const wo = window.open;
            let opened = false;
            let link = "";
            window.open = function (u) {
                opened = true;
                link = u;
                return wo.apply(window, arguments);
            };
            try { origSend(); } finally { window.open = wo; }
            if (opened) showThanks(link);
        };
    }

    // ---------- سلة فارغة بشكل أجمل ----------
    const ce = document.getElementById("cartEmpty");
    if (ce) {
        ce.innerHTML = "";
        ce.appendChild(el("div", "ce-ico", "🛒"));
        ce.appendChild(el("b", "", "سلتك فارغة"));
        ce.appendChild(el("p", "", "أضف منتجاتك المفضلة وابدأ التسوق"));
        ce.appendChild(btn("ce-btn", "تصفح المنتجات", function () {
            if (typeof closeCart === "function") closeCart();
            const s = $(".products");
            if (s) s.scrollIntoView({ behavior: "smooth", block: "start" });
        }));
    }

    // ---------- زر للأعلى ----------
    const top = btn("to-top", "", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    top.id = "toTop";
    top.setAttribute("aria-label", "للأعلى");
    top.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(top);
    window.addEventListener("scroll", function () {
        top.classList.toggle("show", window.scrollY > 700);
    }, { passive: true });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { closeDetail(); closeThanks(); }
    });

})();

// ==========================================================
// نفدت الكمية: يعطّل زر الإضافة للمنتجات اللي عليها الكلاس sold-out
// ويحذفها من سلة أي زبون كان أضافها قبل ما تنفد
// ==========================================================
(function pxSoldOut() {

    const soldNames = new Set();

    document.querySelectorAll(".product-card.sold-out").forEach(function (card) {
        const b = card.querySelector(".add-cart");
        if (!b) return;

        b.disabled = true;
        b.textContent = "نفدت الكمية";

        const m = (b.getAttribute("onclick") || "").match(/addToCart\('(.*)'\)/);
        if (m) soldNames.add(m[1]);
    });

    if (soldNames.size && typeof cart !== "undefined") {
        const before = cart.length;
        for (let i = cart.length - 1; i >= 0; i--) {
            if (soldNames.has(cart[i].name)) cart.splice(i, 1);
        }
        if (cart.length !== before) {
            saveCart();
            renderCart();
            toast("تم حذف منتج نفدت كميته من سلتك");
        }
    }

})();
// ==========================================================
// الحوالة المصرفية: بيانات الحساب + رفع صورة الإيصال (اختياري)
// (كتلة مستقلة: الصقها في آخر script.js، بعد كل الكتل السابقة)
// ==========================================================
(function pxBank() {

    // ⚙️ حساباتك المصرفية: اترك الحقل فاضيًا ("") وما يظهر، وتقدر تضيف حساب ثالث بنفس الشكل
    const BANKS = [
        { name: "المصرف التجاري الوطني", holder: "", account: "091011872440014", iban: "LY84004091091011872440014" },
        { name: "مصرف النوران", holder: "", account: "", iban: "LY59024005010089051020501" }
    ];

    // ⚙️ مفتاح imgbb لرفع صور الإيصالات (مجاني من api.imgbb.com)
    // لو تركته فاضيًا: يُطلب من الزبون إرفاق الإيصال داخل محادثة واتساب بدل رفعه من الموقع
    const IMGBB_KEY = "cac8af036e10b4c36a700d7252ec1b14";

    const select = document.getElementById("payment");
    if (!select) return;

    function $(s, r) { return (r || document).querySelector(s); }

    function el(tag, cls, txt) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt !== undefined) e.textContent = txt;
        return e;
    }

    function btn(cls, txt, fn) {
        const b = el("button", cls, txt);
        b.type = "button";
        if (fn) b.addEventListener("click", fn);
        return b;
    }

    function isBank() { return /حوال|تحويل|bank/i.test(select.value); }

    function copyText(text, msg) {
        function done() { if (typeof toast === "function") toast(msg); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, fallback);
        } else {
            fallback();
        }
        function fallback() {
            const t = document.createElement("textarea");
            t.value = text;
            t.style.position = "fixed";
            t.style.opacity = "0";
            document.body.appendChild(t);
            t.select();
            try { document.execCommand("copy"); done(); } catch (e) {}
            t.remove();
        }
    }

    // ---------- الصندوق ----------
    const box = el("div", "bank-box");
    box.id = "bankBox";
    box.style.display = "none";

    box.appendChild(el("div", "bk-title", "🏦 بيانات الحوالة المصرفية"));
    if (BANKS.length > 1) box.appendChild(el("div", "bk-pick", "اضغط على المصرف اللي بتحوّل له (اختياري)"));

    let chosen = -1;
    const cards = [];

    BANKS.forEach(function (bk, i) {
        const card = el("div", "bk-card");
        card.appendChild(el("div", "bk-name", bk.name));

        function addRow(label, value, copyMsg) {
            if (!value) return;
            const r = el("div", "bk-row");
            r.appendChild(el("span", "bk-lbl", label));
            r.appendChild(el("span", "bk-val", value));
            if (copyMsg) r.appendChild(btn("bk-copy", "نسخ", function () { copyText(value, copyMsg); }));
            card.appendChild(r);
        }
        addRow("اسم صاحب الحساب:", bk.holder);
        addRow("رقم الحساب:", bk.account, "تم نسخ رقم الحساب ✓");
        addRow("الآيبان:", bk.iban, "تم نسخ الآيبان ✓");

        if (BANKS.length > 1) {
            card.addEventListener("click", function (e) {
                if (e.target.closest(".bk-copy")) return;
                chosen = (chosen === i) ? -1 : i;
                cards.forEach(function (c, k) { c.classList.toggle("on", k === chosen); });
            });
        }

        cards.push(card);
        box.appendChild(card);
    });

    box.appendChild(el("div", "bk-note", "ℹ️ التحويل الآن اختياري: تقدر تحوّل وترفع صورة الإيصال هنا، أو تحوّل عند الاستلام."));

    let file = null;
    let thumbUrl = "";
    let input = null;
    let prev = null;
    let msgEl = null;

    function setMsg(text, cls) {
        if (!msgEl) return;
        msgEl.textContent = text;
        msgEl.className = "bk-msg" + (cls ? " " + cls : "");
    }

    function clearFile() {
        file = null;
        if (thumbUrl) { URL.revokeObjectURL(thumbUrl); thumbUrl = ""; }
        if (input) input.value = "";
        if (prev) prev.style.display = "none";
        setMsg("");
    }

    if (IMGBB_KEY) {
        input = el("input", "bk-file");
        input.type = "file";
        input.accept = "image/*";
        input.id = "rcptInput";

        const lab = el("label", "bk-up");
        lab.htmlFor = "rcptInput";
        lab.appendChild(el("span", "bk-up-ico", "📎"));
        lab.appendChild(el("span", "", "أرفق صورة إيصال التحويل (اختياري)"));

        prev = el("div", "bk-prev");
        prev.style.display = "none";
        const thumb = el("img", "bk-thumb");
        thumb.alt = "";
        const fname = el("span", "bk-fname");
        prev.appendChild(thumb);
        prev.appendChild(fname);
        prev.appendChild(btn("bk-x", "✕", clearFile));

        msgEl = el("div", "bk-msg");

        input.addEventListener("change", function () {
            const f = input.files && input.files[0];
            if (!f) return;
            if (f.type && f.type.indexOf("image/") !== 0) {
                clearFile();
                setMsg("اختر صورة فقط (JPG أو PNG)", "err");
                return;
            }
            clearFile();
            file = f;
            thumbUrl = URL.createObjectURL(f);
            thumb.src = thumbUrl;
            fname.textContent = f.name;
            prev.style.display = "flex";
            setMsg("✅ تم اختيار الصورة، وستُرسل مع طلبك", "ok");
        });

        box.appendChild(input);
        box.appendChild(lab);
        box.appendChild(prev);
        box.appendChild(msgEl);
    } else {
        box.appendChild(el("div", "bk-hint", "📎 بعد فتح واتساب، أرفق صورة إيصال التحويل في المحادثة (اختياري)."));
    }

    select.insertAdjacentElement("afterend", box);

    function sync() { box.style.display = isBank() ? "block" : "none"; }
    select.addEventListener("change", sync);
    sync();

    // ---------- رفع الإيصال (مع ضغط الصورة) ----------
    function compress(f) {
        return new Promise(function (resolve, reject) {
            const img = new Image();
            const url = URL.createObjectURL(f);
            img.onload = function () {
                const max = 1600;
                const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
                const w = Math.max(1, Math.round(img.naturalWidth * s));
                const h = Math.max(1, Math.round(img.naturalHeight * s));
                const c = document.createElement("canvas");
                c.width = w;
                c.height = h;
                c.getContext("2d").drawImage(img, 0, 0, w, h);
                URL.revokeObjectURL(url);
                resolve(c.toDataURL("image/jpeg", 0.82).split(",")[1]);
            };
            img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("img")); };
            img.src = url;
        });
    }

    function uploadReceipt(f) {
        return compress(f).then(function (b64) {
            const fd = new FormData();
            fd.append("image", b64);
            const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
            const timer = setTimeout(function () { if (ctl) ctl.abort(); }, 30000);
            return fetch("https://api.imgbb.com/1/upload?key=" + encodeURIComponent(IMGBB_KEY) + "&expiration=2592000", {
                method: "POST",
                body: fd,
                signal: ctl ? ctl.signal : undefined
            }).then(function (r) { clearTimeout(timer); return r.json(); });
        }).then(function (j) {
            if (j && j.success && j.data && j.data.url) return j.data.url;
            throw new Error("upload");
        });
    }

    // ---------- تعديل رسالة الواتساب عند الحوالة المصرفية ----------
    const prevSend = window.sendWhatsApp;
    if (typeof prevSend !== "function") return;

    function val(id) { const e = document.getElementById(id); return e ? e.value.trim() : ""; }

    function send(receiptUrl, targetWin) {
        const wo = window.open;
        let finalUrl = "";

        window.open = function (u) {
            let url = u;
            try {
                const m = String(u).match(/^(https:\/\/wa\.me\/[^?]*\?text=)([\s\S]*)$/);
                if (m) {
                    let text = decodeURIComponent(m[2]);
                    if (chosen >= 0) text += "\n🏦 المصرف: " + BANKS[chosen].name;
                    text += receiptUrl
                        ? "\n🧾 إيصال التحويل: " + receiptUrl
                        : "\n🏦 التحويل: عند الاستلام (أو سيرسل الإيصال في المحادثة)";
                    url = m[1] + encodeURIComponent(text);
                }
            } catch (e) {}
            finalUrl = url;

            if (targetWin && !targetWin.closed) {
                targetWin.location.href = url;
                return targetWin;
            }
            return wo.call(window, url, "_blank");
        };

        try { prevSend(); } finally { window.open = wo; }

        // رابط احتياطي في شاشة التأكيد يحمل نفس الرسالة المعدّلة
        const l = $("#thanksSheet .th-link");
        if (l && finalUrl) l.href = finalUrl;
        if (finalUrl) clearFile();
    }

    window.sendWhatsApp = function () {
        if (!isBank()) { prevSend(); return; }

        const valid = val("name") && val("phone") && typeof selectedCity !== "undefined" && selectedCity && typeof cart !== "undefined" && cart.length;
        if (!file || !IMGBB_KEY || !valid) { send(null, null); return; }

        // نفتح نافذة واتساب فورًا (داخل الضغطة) ثم نملؤها بعد رفع الإيصال
        let w = null;
        try { w = window.open("about:blank", "_blank"); } catch (e) {}

        const submit = $(".ob-submit");
        const oldTxt = submit ? submit.textContent : "";
        if (submit) { submit.disabled = true; submit.textContent = "جاري رفع الإيصال..."; }
        setMsg("⏳ جاري رفع الإيصال، لحظات...", "");

        function finish() { if (submit) { submit.disabled = false; submit.textContent = oldTxt; } }

        uploadReceipt(file).then(function (url) {
            finish();
            send(url, w);
        }).catch(function () {
            finish();
            setMsg("تعذّر رفع الإيصال، أكملنا طلبك بدونه، وتقدر ترفقه داخل محادثة واتساب.", "err");
            send(null, w);
        });
    };

})();
