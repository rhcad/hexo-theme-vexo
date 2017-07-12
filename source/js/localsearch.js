(function ($) {
  var script = document.querySelector('script[src*="localsearch.js"]')
  var args = script ? script.getAttribute('src').replace(/^.+data=/, '').split('|') : []
  var path = args[0] || '/search.json'
  var upperBound = parseInt(args[1] || 1)
  var trigger = args[2] || 'auto'
  var isXml = !/json$/i.test(path)
  var isFetched = false

  var onPopupClose = function (e) {
    $('.search-popup').hide()
    $('#local-search-input').val('')
    $('.search-result-list').remove()
    $('#no-result').remove()
    $('.local-search-pop-overlay').remove()
    $('body').css('overflow', '')
  }

  function proceedsearch () {
    $('body')
            .append('<div class="search-popup-overlay local-search-pop-overlay"></div>')
            .css('overflow', 'hidden')
    $('.search-popup-overlay').click(onPopupClose)
    $('.search-popup').toggle()
    var $input = $('#local-search-input')
    $input.attr('autocapitalize', 'none')
    $input.attr('autocorrect', 'off')
    $input.focus()
  }

  var searchFunc = function (path, searchId, contentId) {
    'use strict'

    var input = document.getElementById(searchId)
    var resultContent = document.getElementById(contentId)
    console.assert(input && resultContent, 'No searching elements')

    // start loading animation
    $('body')
            .append('<div class="search-popup-overlay local-search-pop-overlay">' +
                    '<div id="search-loading-icon">' +
                    '<i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i>' +
                    '</div>' +
                    '</div>')
            .css('overflow', 'hidden')
    $('#search-loading-icon').css('margin', '20% auto 0 auto').css('text-align', 'center')

    $.ajax({
      url: path,
      dataType: isXml ? 'xml' : 'json',
      async: true,
      success: function (res) {
        // get the contents from search data
        isFetched = true
        $('.search-popup').detach().appendTo('body')
        var data = isXml ? $('entry', res).map(function () {
          return {
            title: $('title', this).text(),
            content: $('content', this).text(),
            url: $('url', this).text()
          }
        }).get() : res
        var inputEventFunction = function () {
          var searchText = input.value.trim().toLowerCase()
          var keywords = searchText.split(/[\s-]+/)
          if (keywords.length > 1) {
            keywords.push(searchText)
          }
          var resultItems = []
          if (searchText.length > 0) {
            // perform local searching
            data.forEach(function (data) {
              var isMatch = false
              var hitCount = 0
              var searchTextCount = 0
              var title = data.title.trim()
              var titleInLowerCase = title.toLowerCase()
              var content = data.content.trim().replace(/<[^>]+>/g, '')
              var contentInLowerCase = content.toLowerCase()
              var articleUrl = decodeURIComponent(data.url)
              var indexOfTitle = []
              var indexOfContent = []

              function mergeIntoSlice (text, start, end, index) {
                var item = index[index.length - 1]
                var position = item.position
                var word = item.word
                var hits = []
                var searchTextCountInSlice = 0
                while (position + word.length <= end && index.length !== 0) {
                  if (word === searchText) {
                    searchTextCountInSlice++
                  }
                  hits.push({position: position, length: word.length})
                  var wordEnd = position + word.length

                  // move to next position of hit

                  index.pop()
                  while (index.length !== 0) {
                    item = index[index.length - 1]
                    position = item.position
                    word = item.word
                    if (wordEnd > position) {
                      index.pop()
                    } else {
                      break
                    }
                  }
                }
                searchTextCount += searchTextCountInSlice
                return {
                  hits: hits,
                  start: start,
                  end: end,
                  searchTextCount: searchTextCountInSlice
                }
              }

              function highlightKeyword (text, slice) {
                var result = ''
                var prevEnd = slice.start
                slice.hits.forEach(function (hit) {
                  result += text.substring(prevEnd, hit.position)
                  var end = hit.position + hit.length
                  result += '<b class="search-keyword">' + text.substring(hit.position, end) + '</b>'
                  prevEnd = end
                })
                result += text.substring(prevEnd, slice.end)
                return result
              }

              // only match articles with not empty titles
              if (title) {
                keywords.forEach(function (keyword) {
                  function getIndexByWord (word, text, caseSensitive) {
                    var wordLen = word.length
                    if (wordLen === 0) {
                      return []
                    }
                    var startPosition = 0
                    var position = []
                    var index = []
                    if (!caseSensitive) {
                      text = text.toLowerCase()
                      word = word.toLowerCase()
                    }
                    while ((position = text.indexOf(word, startPosition)) > -1) {
                      index.push({position: position, word: word})
                      startPosition = position + wordLen
                    }
                    return index
                  }

                  indexOfTitle = indexOfTitle.concat(getIndexByWord(keyword, titleInLowerCase, false))
                  indexOfContent = indexOfContent.concat(getIndexByWord(keyword, contentInLowerCase, false))
                })
                if (indexOfTitle.length > 0 || indexOfContent.length > 0) {
                  isMatch = true
                  hitCount = indexOfTitle.length + indexOfContent.length
                }
              }

              // show search results

              if (isMatch) {
                // sort index by position of keyword

                [indexOfTitle, indexOfContent].forEach(function (index) {
                  index.sort(function (itemLeft, itemRight) {
                    if (itemRight.position !== itemLeft.position) {
                      return itemRight.position - itemLeft.position
                    } else {
                      return itemLeft.word.length - itemRight.word.length
                    }
                  })
                })

                // merge hits into slices

                var slicesOfTitle = []
                if (indexOfTitle.length !== 0) {
                  slicesOfTitle.push(mergeIntoSlice(title, 0, title.length, indexOfTitle))
                }

                var slicesOfContent = []
                while (indexOfContent.length !== 0) {
                  var item = indexOfContent[indexOfContent.length - 1]
                  var position = item.position
                  var word = item.word
                  // cut out 100 characters
                  var start = position - 20
                  var end = position + 80
                  if (start < 0) {
                    start = 0
                  }
                  if (end < position + word.length) {
                    end = position + word.length
                  }
                  if (end > content.length) {
                    end = content.length
                  }
                  slicesOfContent.push(mergeIntoSlice(content, start, end, indexOfContent))
                }

                // sort slices in content by search text's count and hits' count

                slicesOfContent.sort(function (sliceLeft, sliceRight) {
                  if (sliceLeft.searchTextCount !== sliceRight.searchTextCount) {
                    return sliceRight.searchTextCount - sliceLeft.searchTextCount
                  } else if (sliceLeft.hits.length !== sliceRight.hits.length) {
                    return sliceRight.hits.length - sliceLeft.hits.length
                  } else {
                    return sliceLeft.start - sliceRight.start
                  }
                })

                // select top N slices in content
                if (upperBound >= 0) {
                  slicesOfContent = slicesOfContent.slice(0, upperBound)
                }

                // highlight title and content

                var resultItem = ''

                if (slicesOfTitle.length) {
                  resultItem += "<li><a href='" + articleUrl + "' class='search-result-title'>" + highlightKeyword(title, slicesOfTitle[0]) + '</a>'
                } else {
                  resultItem += "<li><a href='" + articleUrl + "' class='search-result-title'>" + title + '</a>'
                }

                slicesOfContent.forEach(function (slice) {
                  resultItem += "<a href='" + articleUrl + "'>" +
                          '<p class="search-result">' + highlightKeyword(content, slice) +
                          '...</p></a>'
                })

                resultItem += '</li>'
                resultItems.push({
                  item: resultItem,
                  searchTextCount: searchTextCount,
                  hitCount: hitCount,
                  id: resultItems.length
                })
              }
            })
          }
          if (keywords.length === 1 && keywords[0] === '') {
            resultContent.innerHTML = '<div id="no-result"><i class="fa fa-search fa-5x" /></div>'
          } else if (resultItems.length === 0) {
            resultContent.innerHTML = '<div id="no-result"><i class="fa fa-frown-o fa-5x" /></div>'
          } else {
            resultItems.sort(function (resultLeft, resultRight) {
              if (resultLeft.searchTextCount !== resultRight.searchTextCount) {
                return resultRight.searchTextCount - resultLeft.searchTextCount
              } else if (resultLeft.hitCount !== resultRight.hitCount) {
                return resultRight.hitCount - resultLeft.hitCount
              } else {
                return resultRight.id - resultLeft.id
              }
            })
            var searchResultList = '<ul class="search-result-list">'
            resultItems.forEach(function (result) {
              searchResultList += result.item
            })
            searchResultList += '</ul>'
            resultContent.innerHTML = searchResultList
          }
        }

        if (trigger === 'auto') {
          input.addEventListener('input', inputEventFunction)
        } else {
          $('.search-icon').click(inputEventFunction)
          input.addEventListener('keypress', function (event) {
            if (event.keyCode === 13) {
              inputEventFunction()
            }
          })
        }

        // remove loading animation
        $('.local-search-pop-overlay').remove()
        $('body').css('overflow', '')

        proceedsearch()
      }
    })
  }

  // handle and trigger popup window
  $(function () {
    $('.search-btn').click(function (e) {
      e.stopPropagation()
      if (isFetched === false) {
        searchFunc(path, 'local-search-input', 'local-search-result')
      } else {
        proceedsearch()
      }
    })

    $('.popup-btn-close').click(onPopupClose)
    $(document).on('keyup', function (event) {
      if (event.which === 27 && $('.search-popup').is(':visible')) {
        onPopupClose()
      }
    })
  })
})(jQuery)
