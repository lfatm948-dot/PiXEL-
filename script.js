const whatsappNumber = "218944969802";

const shippingCities = [
    { name: "بنغازي", price: 25 },
    { name: "اجدابيا", price: 25 },
    { name: "توكرة", price: 35 },
    { name: "المرج", price: 35 },
    { name: "الابيار", price: 35 },
    { name: "البيضاء", price: 35 },
    { name: "قمينس", price: 35 },
    { name: "سلوق", price: 35 },
    { name: "شحات", price: 35 },
    { name: "سوسة", price: 35 },
    { name: "القبة", price: 35 },
    { name: "طبرق", price: 35 },
    { name: "درنة", price: 40 },
    { name: "اساعد", price: 50 },
    { name: "سبها", price: 30 },
    { name: "مزدة", price: 30 },
    { name: "الشويرف", price: 30 },
    { name: "القريات", price: 30 },
    { name: "براك الشاطئ", price: 35 },
    { name: "اوباري", price: 45 },
    { name: "ام الارانب", price: 45 },
    { name: "وادي عتبة", price: 45 },
    { name: "مرزق", price: 45 },
    { name: "تراغن", price: 45 },
    { name: "القطرون", price: 45 },
    { name: "غات", price: 50 },
    { name: "غدامس", price: 40 },
    { name: "سيناون", price: 40 },
    { name: "الشـواء", price: 40 },
    { name: "أوال", price: 40 },
    { name: "طرابلس", price: 15 },
    { name: "كريمة", price: 15 },
    { name: "طريق المطار", price: 15 },
    { name: "عين زارة", price: 15 },
    { name: "تاجوراء", price: 15 },
    { name: "خلة", price: 15 },
    { name: "مشروع الهضبة", price: 15 },
    { name: "غريان", price: 25 },
    { name: "الأصابعة", price: 35 },
    { name: "الرابطة", price: 35 },
    { name: "القواويش", price: 35 },
    { name: "العوينية", price: 35 },
    { name: "الناعلة - يفرن", price: 35 },
    { name: "الرياينة", price: 35 },
    { name: "الرجبان", price: 35 },
    { name: "الرتـبان", price: 35 },
    { name: "الرحيبات", price: 35 },
    { name: "جادو", price: 35 },
    { name: "كاباو", price: 35 },
    { name: "تيجي", price: 35 },
    { name: "بدر", price: 35 },
    { name: "الجوش", price: 35 },
    { name: "ترهونة", price: 25 },
    { name: "بني وليد", price: 25 },
    { name: "وادي بي", price: 20 },
    { name: "قصر بن غشير", price: 20 },
    { name: "السبيعة", price: 20 },
    { name: "سوق الخميس مسيحل", price: 20 },
    { name: "سيدي السايح", price: 20 },
    { name: "الماية", price: 20 },
    { name: "الزاوية", price: 20 },
    { name: "المطرد", price: 20 },
    { name: "صرمان", price: 20 },
    { name: "صبراتة", price: 20 },
    { name: "زوارة", price: 30 },
    { name: "العجيلات", price: 30 },
    { name: "الجميل", price: 30 },
    { name: "جنزور", price: 30 },
    { name: "زلطن", price: 30 },
    { name: "رأس جدير", price: 40 },
    { name: "سوق الجمعة", price: 30 },
    { name: "هراوة", price: 30 },
    { name: "بن جواد", price: 30 },
    { name: "النوفلية", price: 30 },
    { name: "رأس لانوف", price: 30 },
    { name: "البريقة", price: 30 },
    { name: "العقيلة", price: 30 },
    { name: "سرت", price: 30 },
    { name: "سوكنة", price: 30 },
    { name: "ودان", price: 30 },
    { name: "الجفرة", price: 30 },
    { name: "زلة", price: 40 }
];

let selectedProduct = "";
let selectedProductPrice = 0;
let selectedCity = "";
let selectedShippingPrice = null;

const sortedCities = [...shippingCities].sort((first, second) =>
    first.name.localeCompare(second.name, "ar")
);

function normalizeArabic(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .toLocaleLowerCase("ar")
        .trim();
}

function normalizeProductName(value) {
    return normalizeArabic(value)
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0E\uFE0F]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
}

function formatPrice(amount) {
    return `${Number(amount).toLocaleString("en-US")} د.ل`;
}

function findProductCard(productName) {
    const normalizedName = normalizeProductName(productName);
    return [...document.querySelectorAll(".product-card")].find((card) =>
        normalizeProductName(card.querySelector("h3")?.textContent) === normalizedName
    );
}

function updateOrderTotal() {
    const quantityField = document.getElementById("quantity");
    const unitPriceLabel = document.getElementById("unitPrice");
    const shippingPriceLabel = document.getElementById("shippingPrice");
    const totalLabel = document.getElementById("orderTotal");
    if (!quantityField || !unitPriceLabel || !shippingPriceLabel || !totalLabel) return;

    const quantity = Number.parseInt(quantityField.value, 10);
    const validQuantity = Number.isInteger(quantity) && quantity > 0;
    unitPriceLabel.textContent = selectedProductPrice ? formatPrice(selectedProductPrice) : "—";
    shippingPriceLabel.textContent = selectedShippingPrice === null
        ? "اختر المدينة"
        : formatPrice(selectedShippingPrice);

    totalLabel.textContent = validQuantity && selectedShippingPrice !== null
        ? formatPrice((selectedProductPrice * quantity) + selectedShippingPrice)
        : "—";
}

function closeCityPicker() {
    const dropdown = document.getElementById("cityDropdown");
    const trigger = document.getElementById("cityTrigger");
    if (!dropdown || !trigger) return;
    dropdown.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
}

function renderCities(query = "") {
    const optionsContainer = document.getElementById("cityOptions");
    const noResults = document.getElementById("noCities");
    if (!optionsContainer || !noResults) return;

    const normalizedQuery = normalizeArabic(query);
    const matchingCities = sortedCities.filter((city) =>
        normalizeArabic(city.name).includes(normalizedQuery)
    );

    optionsContainer.replaceChildren();
    matchingCities.forEach((city) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "city-option";
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(city.name === selectedCity));

        const cityName = document.createElement("span");
        cityName.textContent = city.name;
        const cityPrice = document.createElement("span");
        cityPrice.className = "city-option-price";
        cityPrice.textContent = formatPrice(city.price);
        option.append(cityName, cityPrice);

        option.addEventListener("click", () => {
            selectedCity = city.name;
            selectedShippingPrice = city.price;
            document.getElementById("location").value = city.name;
            document.getElementById("cityTriggerText").textContent = city.name;
            document.getElementById("cityTrigger").classList.add("has-value");
            closeCityPicker();
            updateOrderTotal();
            document.getElementById("cityTrigger").focus();
        });

        optionsContainer.append(option);
    });

    noResults.hidden = matchingCities.length !== 0;
}

function showOrder(productName) {
    const productCard = findProductCard(productName);
    const priceText = productCard?.querySelector("h4")?.textContent ?? "";
    const priceDigits = priceText.replace(/[^\d]/g, "");
    const parsedPrice = Number.parseInt(priceDigits, 10);

    if (!productCard || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        window.alert("تعذر العثور على سعر المنتج. يرجى المحاولة مرة أخرى.");
        return;
    }

    selectedProduct = productCard.querySelector("h3").textContent.trim();
    selectedProductPrice = parsedPrice;
    selectedCity = "";
    selectedShippingPrice = null;

    document.getElementById("selectedProduct").textContent = selectedProduct;
    document.getElementById("location").value = "";
    document.getElementById("citySearch").value = "";
    document.getElementById("cityTriggerText").textContent = "اختر المدينة";
    document.getElementById("cityTrigger").classList.remove("has-value");
    document.getElementById("quantity").value = "1";
    closeCityPicker();
    updateOrderTotal();

    const orderBox = document.getElementById("orderBox");
    orderBox.style.display = "block";
    orderBox.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("name").focus({ preventScroll: true });
}

function searchProducts() {
    const input = document.getElementById("searchInput").value.trim().toLowerCase();
    const cards = document.querySelectorAll(".product-card");

    cards.forEach((card) => {
        const title = card.querySelector("h3") ? card.querySelector("h3").innerText.toLowerCase() : "";
        const content = card.innerText.toLowerCase();
        if (title.includes(input) || content.includes(input)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

function sendWhatsApp() {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const quantity = Number.parseInt(document.getElementById("quantity").value, 10);
    const payment = document.getElementById("payment").value;

    if (!name || !phone || !selectedCity || selectedShippingPrice === null) {
        window.alert("يرجى إدخال الاسم ورقم الهاتف واختيار المدينة.");
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        window.alert("يرجى إدخال كمية صحيحة لا تقل عن 1.");
        document.getElementById("quantity").focus();
        return;
    }

    const productsTotal = selectedProductPrice * quantity;
    const finalTotal = productsTotal + selectedShippingPrice;
    const message = `طلب جديد من الموقع 🛍️

اسم الزبون: ${name}
رقم الهاتف: ${phone}
المدينة / المكان: ${selectedCity}
سعر التوصيل: ${formatPrice(selectedShippingPrice)}

المنتج: ${selectedProduct}
الكمية: ${quantity}
سعر المنتج للوحدة: ${formatPrice(selectedProductPrice)}
قيمة المنتجات: ${formatPrice(productsTotal)}

الإجمالي شامل التوصيل: ${formatPrice(finalTotal)}
طريقة الدفع: ${payment}`;

    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
}

function openMenu() {
    const menu = document.querySelector(".menu");
    if (menu.style.display === "flex") {
        menu.style.display = "none";
    } else {
        menu.style.display = "flex";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cityTrigger = document.getElementById("cityTrigger");
    const citySearch = document.getElementById("citySearch");
    const cityDropdown = document.getElementById("cityDropdown");
    const quantityField = document.getElementById("quantity");
    const orderForm = document.getElementById("orderForm");

    renderCities();

    cityTrigger?.addEventListener("click", () => {
        const shouldOpen = cityDropdown.hidden;
        cityDropdown.hidden = !shouldOpen;
        cityTrigger.setAttribute("aria-expanded", String(shouldOpen));
        if (shouldOpen) {
            renderCities(citySearch.value);
            citySearch.focus();
        }
    });

    citySearch?.addEventListener("input", (event) => renderCities(event.target.value));
    quantityField?.addEventListener("input", updateOrderTotal);

    document.addEventListener("click", (event) => {
        const picker = document.getElementById("cityPicker");
        if (picker && !picker.contains(event.target)) closeCityPicker();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeCityPicker();
    });

    orderForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        sendWhatsApp();
    });
});

const products = document.querySelectorAll(".product-card");
window.addEventListener("scroll", () => {
    products.forEach((product) => {
        const position = product.getBoundingClientRect().top;
        const screen = window.innerHeight;
        if (position < screen - 100) {
            product.classList.add("show");
        } else {
            product.classList.remove("show");
        }
    });
});

window.addEventListener("load", () => {
    const title = document.querySelector(".products h2");
    if (title) {
        setTimeout(() => title.classList.add("title-intro"), 2800);
    }
});
