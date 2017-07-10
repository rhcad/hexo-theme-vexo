(function ($) {
  var app = $('.app-body')
  var header = $('.header')
  var banner = document.getElementById('article-banner')
  var progress = $('#nprogress')
  var top = $('.scroll-top')

  $(function () {
    NProgress.start()
    progress.find('.bar').css({
      'background': banner ? '#fff' : '#42b983'
    })
    progress.find('.spinner').hide()

    var fade = {
      transform: 'translateY(0)',
      opacity: 1
    }
    if (banner) {
      app.css('transition-delay', '0.15s')
      $('#article-banner').children().css(fade)
    }
    app.css(fade)
  })

  function updateFixedHeaderClass () {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    var headerH = header.height()
    if (scrollTop > headerH || header.hasClass('open')) {
      header.addClass('fixed-header')
    } else if (scrollTop < headerH) {
      header.removeClass('fixed-header')
    }
  }

  function toggleMenu () {
    $('.header').toggleClass('open')
    updateFixedHeaderClass()
  }

  $('.menu').on('click', toggleMenu)
  $(window).bind('orientationchange', function () {
    if (header.hasClass('open')) {
      toggleMenu()
    }
    var dropdown = $('.dropdown.open')
    if (dropdown.hasClass('open')) {
      dropdown.removeClass('open')
      $('.submenu').hide()
    }
  })

  $('.search-btn').on('click', function () {
    if (header.hasClass('open')) {
      toggleMenu()
    }
    $('.dropdown.open').removeClass('open')
    $('.submenu').hide()
  })

  $('.reward-btn').on('click', function () {
    $('.money-code').fadeToggle()
  })

  top.on('click', function () {
    $('html,body').animate({ scrollTop: 0 }, 600)
  })

  if (banner) {
    header.removeClass('fixed-header')
  }
  document.addEventListener('scroll', function () {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    if (scrollTop > 100) {
      top.addClass('opacity')
    } else {
      top.removeClass('opacity')
    }
    updateFixedHeaderClass()
  })
})(jQuery)
