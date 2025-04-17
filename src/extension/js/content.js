/**
 * content.js - Скрипт для анализа веб-страниц расширением CorgPhish
 * 
 * Этот скрипт внедряется на веб-страницы и анализирует их содержимое
 * для обнаружения признаков фишинга.
 */

// Функция для доступа к локализациям
function getLocalizedText(key, lang = 'ru') {
  // Проверяем, доступен ли объект локализации
  if (window.CorgPhishLocalization && window.CorgPhishLocalization.getTranslation) {
    return window.CorgPhishLocalization.getTranslation(key, lang);
  }
  
  // Если локализация не доступна, используем встроенные строки
  const fallbackTranslations = {
    ru: {
      phishingWarning: 'ВНИМАНИЕ! CorgPhish обнаружил признаки фишингового сайта. Будьте осторожны при вводе личных данных.'
    },
    en: {
      phishingWarning: 'WARNING! CorgPhish has detected signs of a phishing site. Be cautious when entering personal information.'
    }
  };
  
  return fallbackTranslations[lang][key] || key;
}

// Переменная для хранения результатов анализа признаков
var result = {};

// Получаем URL и домен текущей страницы
var url = window.location.href;
var urlDomain = window.location.hostname;

// 1. Проверка на IP-адрес в URL
var patt = /(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]?[0-9])(\.|$){4}/;
var patt2 = /(0x([0-9][0-9]|[A-F][A-F]|[A-F][0-9]|[0-9][A-F]))(\.|$){4}/;
var ip = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;

if(ip.test(urlDomain) || patt.test(urlDomain) || patt2.test(urlDomain)){ 
    result["IP Address"] = "1";
} else {
    result["IP Address"] = "-1";
}

// 2. Проверка длины URL
if(url.length < 54){
    result["URL Length"] = "-1";
} else if(url.length >= 54 && url.length <= 75){
    result["URL Length"] = "0";
} else {
    result["URL Length"] = "1";
}

// 3. Проверка на Tiny URL
var onlyDomain = urlDomain.replace('www.','');
if(onlyDomain.length < 7){
    result["Tiny URL"] = "1";
} else {
    result["Tiny URL"] = "-1";
}

// 4. Проверка на символ @ в URL
patt = /@/;
if(patt.test(url)){ 
    result["@ Symbol"] = "1";
} else {
    result["@ Symbol"] = "-1";
}

// 5. Проверка на перенаправление с двойным слешем
if(url.lastIndexOf("//") > 7){
    result["Redirecting using //"] = "1";
} else {
    result["Redirecting using //"] = "-1";
}

// 6. Проверка на дефис в домене
patt = /-/;
if(patt.test(urlDomain)){ 
    result["(-) Prefix/Suffix in domain"] = "1";
} else {
    result["(-) Prefix/Suffix in domain"] = "-1";
}

// 7. Проверка количества поддоменов
if((onlyDomain.match(RegExp('\\.','g')) || []).length == 1){ 
    result["No. of Sub Domains"] = "-1";
} else if((onlyDomain.match(RegExp('\\.','g')) || []).length == 2){ 
    result["No. of Sub Domains"] = "0";    
} else {
    result["No. of Sub Domains"] = "1";
}

// 8. Проверка HTTPS
patt = /https:\/\//;
if(patt.test(url)){
    result["HTTPS"] = "-1";
} else {
    result["HTTPS"] = "1";
}

// 9. Domain Registration Length - обычно требует внешнего API

// 10. Проверка на фавикон
var favicon = undefined;
var nodeList = document.getElementsByTagName("link");
for (var i = 0; i < nodeList.length; i++) {
    if((nodeList[i].getAttribute("rel") == "icon") || (nodeList[i].getAttribute("rel") == "shortcut icon")) {
        favicon = nodeList[i].getAttribute("href");
    }
}

if(!favicon) {
    result["Favicon"] = "-1";
} else if(favicon.length == 12) {
    result["Favicon"] = "-1";
} else {
    patt = RegExp(urlDomain,'g');
    if(patt.test(favicon)){
        result["Favicon"] = "-1";
    } else {
        result["Favicon"] = "1";
    }
}

// 11. Проверка на нестандартный порт
result["Port"] = "-1";

// 12. Проверка HTTPS в домене URL
patt = /https/;
if(patt.test(onlyDomain)){
    result["HTTPS in URL's domain part"] = "1";
} else {
    result["HTTPS in URL's domain part"] = "-1";
}

// 13. Проверка URL в запросах изображений
var imgTags = document.getElementsByTagName("img");
var phishCount = 0;
var legitCount = 0;
patt = RegExp(onlyDomain, 'g');

for(var i = 0; i < imgTags.length; i++){
    var src = imgTags[i].getAttribute("src");
    if(!src) continue;
    if(patt.test(src)){
        legitCount++;
    } else if(src.charAt(0) == '/' && src.charAt(1) != '/'){
        legitCount++;
    } else {
        phishCount++;
    }
}

var totalCount = phishCount + legitCount;
if (totalCount > 0) {
    var outRequest = (phishCount / totalCount) * 100;
    if(outRequest < 22){
        result["Request URL"] = "-1";
    } else if(outRequest >= 22 && outRequest < 61){
        result["Request URL"] = "0";
    } else {
        result["Request URL"] = "1";
    }
} else {
    result["Request URL"] = "-1";
}

// 14. Проверка URL в якорях
var aTags = document.getElementsByTagName("a");
phishCount = 0;
legitCount = 0;

for(var i = 0; i < aTags.length; i++){
    var href = aTags[i].getAttribute("href");
    if(!href) continue;
    
    if(patt.test(href)){
        legitCount++;
    } else if(href.charAt(0) == '#' || (href.charAt(0) == '/' && href.charAt(1) != '/')){
        legitCount++;
    } else {
        phishCount++;
    }
}

totalCount = phishCount + legitCount;
if (totalCount > 0) {
    outRequest = (phishCount / totalCount) * 100;
    if(outRequest < 31){
        result["URL of Anchor"] = "-1";
    } else if(outRequest >= 31 && outRequest < 67){
        result["URL of Anchor"] = "0";
    } else {
        result["URL of Anchor"] = "1";
    }
} else {
    result["URL of Anchor"] = "-1";
}

// 15. Проверка тегов Meta и Link
var mTags = document.getElementsByTagName("meta");
var linkTags = document.getElementsByTagName("link");
phishCount = 0;
legitCount = 0;

for(var i = 0; i < mTags.length; i++){
    var content = mTags[i].getAttribute("content");
    if(!content) continue;
    
    if(patt.test(content)){
        legitCount++;
    } else {
        phishCount++;
    }
}

for(var i = 0; i < linkTags.length; i++){
    var href = linkTags[i].getAttribute("href");
    if(!href) continue;
    
    if(patt.test(href)){
        legitCount++;
    } else if(href.charAt(0) == '/' && href.charAt(1) != '/'){
        legitCount++;
    } else {
        phishCount++;
    }
}

totalCount = phishCount + legitCount;
if (totalCount > 0) {
    outRequest = (phishCount / totalCount) * 100;
    if(outRequest < 22){
        result["Links in tags"] = "-1";
    } else if(outRequest >= 22 && outRequest < 61){
        result["Links in tags"] = "0";
    } else {
        result["Links in tags"] = "1";
    }
} else {
    result["Links in tags"] = "-1";
}

// 16. Проверка SFH (Server Form Handler)
var forms = document.getElementsByTagName("form");
var res2 = 0;
var action_formArr = [];

for(var i = 0; i < forms.length; i++){
    var action = forms[i].getAttribute("action");
    if(!action) continue;
    action_formArr.push(action);
}

if(action_formArr.length > 0){
    for(var i = 0; i < action_formArr.length; i++){
        var action = action_formArr[i];
        if(action == "" || action == "about:blank"){
            res2 = 1;
            break;
        } else {
            if(!(action.charAt(0) == '/' || patt.test(action))){
                res2 = 0;
            } else {
                res2 = -1;
            }
        }
    }
    result["SFH"] = res2.toString();
} else {
    result["SFH"] = "-1";
}

// 17. Проверка отправки email
patt = /mailto:/;
if(patt.test(url)){
    result["Submitting to email"] = "1";
} else {
    result["Submitting to email"] = "-1";
}

// 18. Проверка ненормальных URL
if(!onlyDomain.includes('.')){
    result["Abnormal URL"] = "1";
} else {
    result["Abnormal URL"] = "-1";
}

// Считаем легитимные, подозрительные и фишинговые признаки
var phishCount = 0;
var legitCount = 0;
var suspiciousCount = 0;

for(var key in result){
    if(result[key] == "1") phishCount++;
    else if(result[key] == "0") suspiciousCount++;
    else legitCount++;
}

// Добавляем параметр общей легитимности сайта
var totalPercent = Math.round(legitCount / (phishCount + suspiciousCount + legitCount) * 100);
result["website_legitimate_percent"] = totalPercent;

// Дополнительный параметр для определения фишинга
if (phishCount > legitCount) {
    result["is_phishing_by_count"] = "1";
} else {
    result["is_phishing_by_count"] = "-1";
}

// Отправляем результаты в background script
chrome.runtime.sendMessage(result, function(response) {
    console.log("Результаты анализа отправлены:", response);
});

// Обработчик сообщений для предупреждений
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action === "alert_user") {
        // Показываем предупреждение пользователю
        showPhishingWarning();
        sendResponse({status: "warning_shown"});
    }
    return true;
});

/**
 * Показывает предупреждение о фишинговом сайте
 */
function showPhishingWarning() {
    // Создаем элемент для предупреждения
    var warning = document.createElement('div');
    warning.style.position = 'fixed';
    warning.style.top = '0';
    warning.style.left = '0';
    warning.style.width = '100%';
    warning.style.backgroundColor = '#ff8b66';
    warning.style.color = 'white';
    warning.style.padding = '15px';
    warning.style.textAlign = 'center';
    warning.style.fontFamily = 'Arial, sans-serif';
    warning.style.fontSize = '16px';
    warning.style.fontWeight = 'bold';
    warning.style.zIndex = '9999';
    warning.textContent = getLocalizedText('phishingWarning', 'ru');
    
    // Добавляем кнопку закрытия
    var closeBtn = document.createElement('button');
    closeBtn.style.marginLeft = '15px';
    closeBtn.style.padding = '5px 10px';
    closeBtn.style.backgroundColor = 'white';
    closeBtn.style.color = '#ff8b66';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '3px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.textContent = 'Закрыть';
    
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(warning);
    });
    
    warning.appendChild(closeBtn);
    
    // Добавляем предупреждение на страницу
    document.body.appendChild(warning);
} 