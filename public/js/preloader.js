$(document).ready(function () {
    "use strict";

    // Show preloader when the page starts loading
    $('.preloader').fadeIn();

    // Hide preloader when the page finishes loading
    $(window).on('load', function () {
        $('.preloader').fadeOut("slow");
    });
});