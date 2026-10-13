(function () {
  if (window.__ALI_AGENT_WIDGET_LOADED__) return;
  window.__ALI_AGENT_WIDGET_LOADED__ = true;

  var script = document.currentScript;
  var origin = script && script.src ? new URL(script.src).origin : "http://localhost:3000";

  var iframe = document.createElement("iframe");
  iframe.src = origin + "/widget/embed";
  iframe.title = "Ali Agent Chat Widget";
  iframe.style.cssText = [
    "position:fixed",
    "bottom:0",
    "right:0",
    "width:420px",
    "height:590px",
    "max-width:100vw",
    "max-height:100vh",
    "border:none",
    "background:transparent",
    "z-index:2147483647",
  ].join(";");
  document.body.appendChild(iframe);
})();
