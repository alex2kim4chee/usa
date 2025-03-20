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

// Логика аккордеона
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
        });
    });
});
