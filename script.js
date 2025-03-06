function updateFields() {
    const category = document.getElementById('productCategory').value;
    document.getElementById('productSizeContainer').style.display = category !== 'Аксессуары' ? 'block' : 'none';
    document.getElementById('productColorContainer').style.display = category === 'Одежда' ? 'block' : 'none';
    document.getElementById('productConfigContainer').style.display = category === 'Аксессуары' ? 'block' : 'none';
}

async function fetchExchangeRate() {
    try {
        const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        const data = await response.json();
        return data.Valute.USD.Value;
    } catch (error) {
        console.error('Ошибка получения курса:', error);
        return null;
    }
}

async function calculateTotal() {
    const priceUSD = parseFloat(document.getElementById('productPrice').value);
    if (isNaN(priceUSD)) return;
    
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
    const productLink = document.getElementById('productLink').value;
    const productName = document.getElementById('productName').value;
    const productSize = document.getElementById('productSizeContainer').style.display !== 'none' ? document.getElementById('productSize').value : '';
    const productColor = document.getElementById('productColorContainer').style.display !== 'none' ? document.getElementById('productColor').value : '';
    const productConfig = document.getElementById('productConfigContainer').style.display !== 'none' ? document.getElementById('productConfig').value : '';

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
