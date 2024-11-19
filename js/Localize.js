var Localize = (function(){

  var i18n = chrome.i18n.getMessage.bind(chrome);


  var init = function(){
    localizeHTML();
  };


  function replace_i18n(node, text) {
    var msg = text.replace(/__MSG_(\w+)__/g, function(match, v1) {
      return v1 ? chrome.i18n.getMessage(v1) : '';
    });
    if(msg != text) node.innerHTML = msg;
  }


  function localizeHTML(parent) {
    // Localize using __MSG_***__ data tags
    if (!parent) parent = document;
    var nodes = parent.querySelectorAll('[data-i18n], [data-i18n-title], [data-i18n-placeholder]');
    for (var i = 0, len = nodes.length; i < len; i++) {
      var node = nodes[i];
      var text = node.getAttribute('data-i18n');
      var title = node.getAttribute('data-i18n-title');
      var placeholder = node.getAttribute('data-i18n-placeholder');
      if (text) {
        var replacement = i18n(text);
        if (replacement) node.innerHTML = replacement;
      }
      if (title) {
        node.dataset.title = i18n(title);
        node.title = i18n(title);
      }
      if (placeholder) {
        node.placeholder = i18n(placeholder);
      }
    }

    // Localize everything else by replacing all __MSG_***__ tags
    // var page = document.getElementsByTagName('html');
    // for (var j = 0; j < page.length; j++) {
    //   var node = page[j];
    //   var text = node.innerHTML.toString();
    //   replace_i18n(node, text);
    // }
  }


  return {
    init: init,
    localizeHTML: localizeHTML
  };

})();
