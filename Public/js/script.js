function scrollAppear() {
    var introText = document.querySelector('.intro-text');
    var introPosition = introText.getBoundingClientRect().top;
    var screenPosition = window.innerHeight / 1.3;

    if(introPosition < screenPosition) {
        introText.classList.add ('intro-appear');
    }
}
function scrollAppear2() {
    var introText = document.querySelector('.intro-text2');
    var introPosition = introText.getBoundingClientRect().top;
    var screenPosition = window.innerHeight / 1.3;

    if(introPosition < screenPosition) {
        introText.classList.add ('intro-appear');
    }
}
function scrollAppear3() {
    var introText = document.querySelector('.intro-text3');
    var introPosition = introText.getBoundingClientRect().top;
    var screenPosition = window.innerHeight*0.7;

    if(introPosition < screenPosition) {
        introText.classList.add ('intro-appear');
    }
}

window.addEventListener('scroll', scrollAppear);
window.addEventListener('scroll', scrollAppear2);
window.addEventListener('scroll', scrollAppear3);

// /////////////////////////////////////////////
