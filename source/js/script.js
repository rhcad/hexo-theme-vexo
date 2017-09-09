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

  function dropdown (e) {
    var $this = $(this)
    var btn = $this; while (!btn.hasClass('dropdown')) btn = btn.parent()
    var panel = btn.find('.submenu')

    if ((e.data.hide && !btn.hasClass('open')) || (e.data.show && btn.hasClass('open'))) {
      return
    }
    panel.slideToggle()
    btn.toggleClass('open')
  }

  function hideDropdown () {
    $('.submenu').slideUp().parent().removeClass('open')
  }

  function initDropdown (el) {
    var btn = el.find('.dropdown')
    btn.on('click', {}, dropdown)
    btn.find('a').on('mouseenter', {show: true}, dropdown)
    el.on('mouseleave', hideDropdown)
  }

  initDropdown($('.right-list'))

  function updateFixedHeaderClass () {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    var headerH = header.height()
    if (!banner || scrollTop > headerH || header.hasClass('open')) {
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
    hideDropdown()
  })

  $('.search-btn').on('click', function () {
    if (header.hasClass('open')) {
      toggleMenu()
    }
    hideDropdown()
  })

  $('.reward-btn').on('click', function () {
    $('.money-code').fadeToggle()
  })

  top.on('click', function () {
    $('html,body').animate({ scrollTop: 0 }, 600)
  })

  updateFixedHeaderClass()
  document.addEventListener('scroll', function () {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    if (scrollTop > 100) {
      top.addClass('opacity')
    } else {
      top.removeClass('opacity')
    }
    updateFixedHeaderClass()
    hideDropdown()
  })
})(jQuery)
