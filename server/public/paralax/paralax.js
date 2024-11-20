// Получаем элементы параллакса
const parallax1 = document.getElementById('parallax1');
const parallax2 = document.getElementById('parallax2');

// Получаем начальные значения backgroundPositionY
const startBcgPositionY1 = parseFloat(getComputedStyle(parallax1).backgroundPositionY) || 0;
const startBcgPositionY2 = parseFloat(getComputedStyle(parallax2).backgroundPositionY) || 0;
console.log("startBcgPositionY2", startBcgPositionY2)

// Добавляем обработчик события scroll
window.addEventListener('scroll', function () {
    const scrollPosition = window.pageYOffset;

    // Коэффициенты для параллакс-эффекта
    const parallaxSpeed1 = 0.3;
    const parallaxSpeed2 = 0.3;
    // console.log("scrollPosition", scrollPosition, "parallax1.offsetTop", parallax1.offsetTop)
    // console.log("startBcgPositionY1", startBcgPositionY1)
    // console.log('startBcgPositionY1 + scrollPosition', startBcgPositionY1 + scrollPosition)
    if (scrollPosition >= parallax1.offsetTop) {
        parallax1.style.backgroundPositionY = startBcgPositionY1 + scrollPosition * parallaxSpeed1 + 'px';
    }
    console.log("scrollPosition", scrollPosition, "parallax2.offsetTop", parallax2.offsetTop)
    console.log("startBcgPositionY2", startBcgPositionY2)
    console.log('startBcgPositionY2 + scrollPosition', startBcgPositionY2 + scrollPosition)
    console.log('window.innerHeight', startBcgPositionY2 + scrollPosition)
    // Параллакс для второго элемента (когда он попадает в видимую область)


    const scrollIf = parallax2.offsetTop - window.innerHeight / 2
    if (scrollPosition >= scrollIf) {

        parallax2.style.backgroundPositionY = startBcgPositionY2 + (scrollPosition - scrollIf) * parallaxSpeed2 + 'px';
    }
});