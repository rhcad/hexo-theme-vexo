/**
 * Created by zyg on 2017/9/14.
 */
window.createGGBApplet = function(appletID, previewFile, parameters) {
  function getTick() {
    var d = new Date();
    return d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds();
  }
  function setDefault(name, value) {
    if (parameters[name] === undefined) {
      parameters[name] = value;
    }
  }
  var oldOnLoad = parameters.appletOnLoad;
  function appletOnLoad() {
    console.log('#' + parameters.id + ' loaded at ' + getTick());
    window.ggbApplet = window[parameters.id];
    if (oldOnLoad) {
      oldOnLoad(parameters.id);
    }
    if (typeof window.appletOnLoad === 'function') {
      window.appletOnLoad(parameters.id);
    }
    setTimeout(function() {
      var frame = document.querySelector('#' + parameters.id + '0 > .GeoGebraFrame');
      if (frame && parameters.borderColor === 'none') {
        frame.style['border-width'] = 0;
      }
    }, 0);
  }
  setDefault('enableShiftDragZoom', false);
  setDefault('enableRightClick', false);
  setDefault('borderColor', 'none');
  setDefault('preventFocus', true);
  setDefault('enableFileFeatures', false);
  delete parameters.container;
  delete parameters.previewFile;
  parameters.appletOnLoad = appletOnLoad;
  if (!parameters.ggbBase64) {
    delete parameters.ggbBase64;
  }
  var applet = new GGBApplet(parameters, appletID);
  applet.setHTML5Codebase(window.codebase);
  applet.setPreviewImage(previewFile, '/css/images/loading.png');
  console.log('#' + parameters.id + ' created at ' + getTick());
  return applet;
};

window.injectGGBApplets = function() {
  var applets = Array.prototype.slice.apply(arguments);
  applets = applets.map(function(applet) {
    if (typeof applet === 'object' && !applet.inject) {
      applet = createGGBApplet(applet.container || null, applet.previewFile || null, applet);
    }
    return applet;
  });
  if (window.ggbApplet) {
    applets.forEach(function(applet) {
      applet.inject('html5')
    });
  } else {
    $(function() {
      applets.forEach(function(applet) {
        applet.inject('html5')
      });
    });
  }
}