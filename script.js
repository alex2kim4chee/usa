function updateFields() {
    const category = document.getElementById('productCategory').value;
    document.getElementById('productSizeContainer').style.display = category !== 'Аксессуары' ? 'block' : 'none';
    document.getElementById('productColorContainer').style.display = category === 'Одежда' ? 'block' : 'none';
    document.getElementById('productConfigContainer').style.display = category === 'Аксессуары' ? 'block' : 'none';
}

let cachedExchangeRate = null;
async function fetchExchangeRate() {
    if (cachedExchangeRate) return cachedExchangeRate;
    
    try {
        const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        const data = await response.json();
        cachedExchangeRate = data.Valute.USD.Value;
        return cachedExchangeRate;
    } catch (error) {
        console.error('Ошибка получения курса:', error);
        alert('Не удалось получить курс доллара. Попробуйте позже.');
        return null;
    }
}

async function calculateTotal() {
    const priceUSD = parseFloat(document.getElementById('productPrice').value);
    if (isNaN(priceUSD) || priceUSD <= 0) {
        alert('Введите корректную цену товара.');
        return;
    }
    
    const priceWithVAT = Math.ceil(priceUSD * 1.09);
    document.getElementById('priceWithVATDisplay').innerText = 'Цена с НДС (9%): ' + priceWithVAT + ' $';
    
    const exchangeRate = await fetchExchangeRate();
    if (!exchangeRate) return;
    
    const finalPrice = Math.ceil(priceWithVAT * exchangeRate * 1.30);
    document.getElementById('finalPrice').innerText = 'Итоговая стоимость: ' + finalPrice + ' ₽';
    
    document.getElementById('exchangeRateInfo').innerText = 'Текущий курс доллара: ' + exchangeRate.toFixed(2) + ' ₽';
    document.getElementById('exchangeRateInfo').style.display = 'block';
    
    generateWhatsAppLink(priceWithVAT, finalPrice);
}

function generateWhatsAppLink(priceWithVAT, finalPrice) {
    const productLink = document.getElementById('productLink').value.trim();
    const productName = document.getElementById('productName').value.trim();
    const productSize = document.getElementById('productSizeContainer').style.display !== 'none' ? document.getElementById('productSize').value.trim() : '';
    const productColor = document.getElementById('productColorContainer').style.display !== 'none' ? document.getElementById('productColor').value.trim() : '';
    const productConfig = document.getElementById('productConfigContainer').style.display !== 'none' ? document.getElementById('productConfig').value.trim() : '';

    if (!productName || !productLink) {
        alert('Заполните обязательные поля: Название и Ссылка на товар.');
        return;
    }

    let message = `Запрос на товар:\nНазвание: ${productName}`;
    if (productSize) message += `\nРазмер: ${productSize}`;
    if (productColor) message += `\nЦвет: ${productColor}`;
    if (productConfig) message += `\nКонфигурация: ${productConfig}`;
    message += `\nСсылка: ${productLink}\nЦена с НДС: ${priceWithVAT} $\nИтоговая цена: ${finalPrice} ₽`;

    const whatsappLink = `https://wa.me/16463226000?text=${encodeURIComponent(message).replace(/%20/g, ' ')}`;

    const sendRequestBtn = document.getElementById('sendRequest');
    sendRequestBtn.style.display = 'block';
    sendRequestBtn.onclick = () => window.open(whatsappLink, '_blank');
}

// Функция загрузки файлов в контейнеры
function loadContent(containerId, filePath) {
    const container = document.getElementById(containerId);
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            container.innerHTML = data;
        })
        .catch(error => console.error(`Ошибка загрузки ${filePath}:`, error));
}

// Загружаем файлы при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    loadContent("termsContainer", "terms.html");
    loadContent("agentTermsContainer", "agent_terms.html");
});

// Логика аккордеона с плавной прокруткой
document.addEventListener("DOMContentLoaded", () => {
    const accordionButtons = document.querySelectorAll(".accordion-button");

    accordionButtons.forEach(button => {
        button.addEventListener("click", () => {
            const content = button.nextElementSibling;

            // Закрываем другие открытые элементы
            document.querySelectorAll(".accordion-content").forEach(item => {
                if (item !== content) {
                    item.style.display = "none";
                }
            });

            // Переключаем видимость текущего элемента
            content.style.display = (content.style.display === "block") ? "none" : "block";

            // Если контент открыт, плавно прокручиваем страницу к нему
            if (content.style.display === "block") {
                setTimeout(() => {
                    content.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 200); // Небольшая задержка, чтобы секция успела открыться
            }
        });
    });
});

async function loadProductData() {
    const productUrl = document.getElementById("productLink").value;
    if (!productUrl) {
        alert("Введите ссылку на товар.");
        return;
    }

    // Показать индикатор загрузки
    document.getElementById("loadingMessage").style.display = "block";
    document.getElementById("productDetails").style.display = "none";

    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(productUrl)}`);
        const data = await response.json();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, "text/html");

        // 1️⃣ Поиск JSON-LD (лучший способ найти данные на сложных сайтах)
        let jsonLd = doc.querySelector('script[type="application/ld+json"]');
        let jsonData = jsonLd ? JSON.parse(jsonLd.textContent) : null;

        // 2️⃣ Название товара
        let productName = jsonData?.name || 
                          doc.querySelector('[itemprop="name"], [property="og:title"], meta[name="title"]')?.content || 
                          doc.querySelector("h1")?.innerText.trim();

        // 3️⃣ Цена товара
        let productPrice = jsonData?.offers?.price ||
                           doc.querySelector('[itemprop="price"], [property="product:price:amount"], meta[property="og:price:amount"]')?.content ||
                           doc.querySelector(".price, .a-price-whole, .product-price, [class*='price']")?.innerText?.trim();

        // 4️⃣ Цвет товара
        let productColor = jsonData?.color ||
                           doc.querySelector('[itemprop="color"], [data-color], [class*="color"]')?.content ||
                           doc.querySelector("label[for*='color'] span, .variation-selector")?.innerText?.trim();

        // 5️⃣ Модель товара
        let productModel = jsonData?.model ||
                           doc.querySelector('[itemprop="model"], [property="product:model"], [class*="model"]')?.content ||
                           doc.querySelector(".product-model, .model-number, [class*='model']")?.innerText?.trim();

        // 6️⃣ Продавец
        let sellerName = jsonData?.brand?.name ||
                         jsonData?.offers?.seller?.name ||
                         doc.querySelector('[itemprop="seller"], [itemprop="brand"], [property="og:site_name"]')?.content ||
                         doc.querySelector(".seller-name, .merchant-info")?.innerText?.trim();

        // 7️⃣ Изображение товара
        let productImage = jsonData?.image ||
                           doc.querySelector('[property="og:image"], [itemprop="image"], meta[name="twitter:image"]')?.content ||
                           doc.querySelector("img[src*='product'], img[src*='image']")?.src;

        // Скрыть индикатор загрузки
        document.getElementById("loadingMessage").style.display = "none";

        // Обновляем элементы на странице
        document.getElementById("productImage").src = productImage || "placeholder.jpg";
        document.getElementById("productNameDisplay").innerText = productName ? `Название: ${productName}` : "Название: не найдено";
        document.getElementById("productPriceDisplay").innerText = productPrice ? `Цена: ${productPrice} $` : "Цена: не найдена";
        document.getElementById("productColorDisplay").innerText = productColor ? `Цвет: ${productColor}` : "Цвет: не найден";
        document.getElementById("productModelDisplay").innerText = productModel ? `Модель: ${productModel}` : "Модель: не найдена";
        document.getElementById("productSellerDisplay").innerText = sellerName ? `Продавец: ${sellerName}` : "Продавец: не найден";

        // Показываем блок с информацией
        document.getElementById("productDetails").style.display = "block";

    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        document.getElementById("loadingMessage").innerText = "Ошибка загрузки данных 😞";
    }
}
