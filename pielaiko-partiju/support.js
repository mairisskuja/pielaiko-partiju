/*
 * support.js – neliels izpildes laiks (runtime) "Pielaiko partiju" šablonam.
 *
 * index.html marķējums izmanto Claude Design komponenta sintaksi:
 *   {{ ceļš }}                       – vērtība no renderVals() vai cikla mainīgā (teksts / atribūts)
 *   <sc-if value="{{ x }}">…</sc-if> – rāda saturu, ja x ir patiess
 *   <sc-for list="{{ xs }}" as="x">  – atkārto saturu katram xs elementam
 *   onClick / onChange="{{ fn }}"    – notikumu apstrādātāji
 *   checked / disabled="{{ b }}"     – būla atribūti
 *   style-hover="css"                – stils :hover stāvoklī
 *   hint-placeholder-*               – dizaina rīka norādes, tiek ignorētas
 *
 * Komponents (logic.js) paplašina DCLogic: state, props, setState(), renderVals(),
 * componentDidMount(), componentWillUnmount(). Katrā setState() šablons tiek
 * izrēķināts no jauna un ar "morph" pieeju iestrādāts esošajā DOM, lai saglabātos
 * fokuss, <details> atvērtais stāvoklis un jau nostrādājušas CSS animācijas.
 */
(function () {
  "use strict";

  var EXPR = /\{\{\s*([^}]*?)\s*\}\}/g;
  var EVENT_ATTR = /^on([a-z]+)$/i; // HTML parsers atribūtu nosaukumus pārvērš mazajos burtos (onClick -> onclick)
  var BOOL_ATTRS = { checked: 1, disabled: 1, selected: 1, open: 1, hidden: 1, readonly: 1, required: 1 };
  var KEEP_ATTRS = { open: 1 }; // lietotāja mainīts stāvoklis, ko šablons nepārraksta

  // ---- izteiksmes -----------------------------------------------------------
  function evalPath(path, scope) {
    path = path.trim();
    if (path === "true") return true;
    if (path === "false") return false;
    if (path === "null" || path === "") return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var m = path.match(/^(["'])(.*)\1$/);
    if (m) return m[2];
    var parts = path.split("."), v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v === null || v === undefined) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function toText(v) { return v === null || v === undefined ? "" : String(v); }
  function interpolate(str, scope) {
    return str.replace(EXPR, function (_, p) { return toText(evalPath(p, scope)); });
  }
  // Ja visa vērtība ir viena {{ }} izteiksme – atgriež "jēlo" vērtību (funkciju, būlu…)
  function bindValue(str, scope) {
    var m = str.match(/^\s*\{\{\s*([^}]*?)\s*\}\}\s*$/);
    return m ? evalPath(m[1], scope) : interpolate(str, scope);
  }

  // ---- style-hover -> CSS klases ---------------------------------------------
  var hoverClasses = {}, hoverStyle = null, hoverCount = 0;
  function hoverClass(css) {
    if (hoverClasses[css]) return hoverClasses[css];
    if (!hoverStyle) {
      hoverStyle = document.createElement("style");
      hoverStyle.textContent = "sc-if,sc-for{display:contents}\n";
      document.head.appendChild(hoverStyle);
    }
    var cls = "dc-hover-" + (++hoverCount);
    var important = css.split(";").filter(function (d) { return d.trim(); })
      .map(function (d) { return d.trim() + " !important"; }).join(";");
    hoverStyle.textContent += "." + cls + ":hover{" + important + "}\n";
    hoverClasses[css] = cls;
    return cls;
  }

  // ---- šablona izvērtēšana --------------------------------------------------
  function renderNode(tpl, scope, out) {
    if (tpl.nodeType === 3) {
      var t = tpl.nodeValue;
      out.appendChild(document.createTextNode(t.indexOf("{{") >= 0 ? interpolate(t, scope) : t));
      return;
    }
    if (tpl.nodeType !== 1) return;
    var tag = tpl.nodeName.toLowerCase();

    if (tag === "sc-if") {
      var wrap = document.createElement("sc-if");
      if (bindValue(tpl.getAttribute("value") || "", scope)) renderChildren(tpl, scope, wrap);
      out.appendChild(wrap);
      return;
    }
    if (tag === "sc-for") {
      var wrapF = document.createElement("sc-for");
      var list = bindValue(tpl.getAttribute("list") || "", scope);
      var as = tpl.getAttribute("as") || "item";
      if (Array.isArray(list)) {
        for (var i = 0; i < list.length; i++) {
          var inner = Object.create(scope);
          inner[as] = list[i];
          inner[as + "Index"] = i;
          renderChildren(tpl, inner, wrapF);
        }
      }
      out.appendChild(wrapF);
      return;
    }

    var XHTML = "http://www.w3.org/1999/xhtml";
    var el = tpl.namespaceURI && tpl.namespaceURI !== XHTML
      ? document.createElementNS(tpl.namespaceURI, tpl.localName) // <svg>, <path> u.c.
      : document.createElement(tpl.nodeName);
    var handlers = null;
    for (var a = 0; a < tpl.attributes.length; a++) {
      var name = tpl.attributes[a].name, raw = tpl.attributes[a].value;
      if (name.indexOf("hint-") === 0) continue;
      var ev = name.match(EVENT_ATTR);
      if (ev) {
        var fn = bindValue(raw, scope);
        if (typeof fn === "function") { (handlers = handlers || {})[ev[1].toLowerCase()] = fn; }
        continue;
      }
      if (name === "style-hover") { el.classList.add(hoverClass(raw)); continue; }
      var val = bindValue(raw, scope);
      if (BOOL_ATTRS[name]) {
        if (val === true || val === "true" || val === "") el.setAttribute(name, "");
        continue;
      }
      if (val === null || val === undefined || val === false) continue;
      el.setAttribute(name, typeof val === "function" ? "" : String(val));
    }
    el.__dcOn = handlers;
    renderChildren(tpl, scope, el);
    out.appendChild(el);
  }
  function renderChildren(tpl, scope, out) {
    for (var c = tpl.firstChild; c; c = c.nextSibling) renderNode(c, scope, out);
  }

  // ---- morph: jaunā fragmenta iestrādāšana esošajā DOM ----------------------
  function syncProps(el) {
    var tag = el.nodeName;
    if (tag === "INPUT") {
      var type = (el.getAttribute("type") || "").toLowerCase();
      if (type === "checkbox" || type === "radio") el.checked = el.hasAttribute("checked");
      el.disabled = el.hasAttribute("disabled");
    } else if (tag === "BUTTON" || tag === "SELECT" || tag === "TEXTAREA") {
      el.disabled = el.hasAttribute("disabled");
    }
  }
  function patchAttrs(oldEl, newEl) {
    var i, name;
    for (i = 0; i < newEl.attributes.length; i++) {
      name = newEl.attributes[i].name;
      var v = newEl.attributes[i].value;
      if (oldEl.getAttribute(name) !== v) oldEl.setAttribute(name, v);
    }
    for (i = oldEl.attributes.length - 1; i >= 0; i--) {
      name = oldEl.attributes[i].name;
      if (!newEl.hasAttribute(name) && !KEEP_ATTRS[name]) oldEl.removeAttribute(name);
    }
    oldEl.__dcOn = newEl.__dcOn || null;
    syncProps(oldEl);
  }
  function morph(oldParent, newParent) {
    var oldKids = Array.prototype.slice.call(oldParent.childNodes);
    var newKids = Array.prototype.slice.call(newParent.childNodes);
    var n = Math.max(oldKids.length, newKids.length);
    for (var i = 0; i < n; i++) {
      var o = oldKids[i], nw = newKids[i];
      if (!nw) { oldParent.removeChild(o); continue; }
      if (!o) { oldParent.appendChild(nw); continue; }
      if (o.nodeType !== nw.nodeType || o.nodeName !== nw.nodeName) { oldParent.replaceChild(nw, o); continue; }
      if (o.nodeType === 3) { if (o.nodeValue !== nw.nodeValue) o.nodeValue = nw.nodeValue; continue; }
      if (o.nodeType === 1) { patchAttrs(o, nw); morph(o, nw); }
    }
  }

  // ---- DCLogic bāzes klase ---------------------------------------------------
  function DCLogic() { this.state = this.state || {}; this.props = {}; this._pending = false; }
  DCLogic.prototype.setState = function (partial) {
    var next = typeof partial === "function" ? partial(this.state) : partial;
    this.state = Object.assign({}, this.state, next);
    if (this._mounted && !this._pending) {
      this._pending = true;
      var self = this;
      Promise.resolve().then(function () { self._pending = false; self._render(); });
    }
  };
  DCLogic.prototype.renderVals = function () { return {}; };
  DCLogic.prototype.componentDidMount = function () {};
  DCLogic.prototype.componentWillUnmount = function () {};
  DCLogic.prototype._render = function () {
    var vals = this.renderVals() || {};
    var frag = document.createDocumentFragment();
    renderChildren(this._template, vals, frag);
    morph(this._root, frag);
  };
  DCLogic.prototype.mount = function (root) {
    var self = this;
    this._root = root;
    this._template = document.createDocumentFragment();
    while (root.firstChild) this._template.appendChild(root.firstChild);

    var propsAttr = root.getAttribute("data-props");
    if (propsAttr) {
      try {
        var raw = JSON.parse(propsAttr), props = {};
        Object.keys(raw).forEach(function (k) {
          var d = raw[k];
          props[k] = d && typeof d === "object" && "default" in d ? d["default"] : d;
        });
        this.props = props;
      } catch (e) { console.warn("support.js: nederīgs data-props JSON", e); }
    }

    // Deleģēti notikumi: apstrādātājs meklēts no mērķa uz augšu līdz saknei.
    ["click", "change", "input", "submit", "keydown", "focus", "blur"].forEach(function (type) {
      root.addEventListener(type, function (e) {
        for (var el = e.target; el && el !== root; el = el.parentNode) {
          var fn = el.__dcOn && el.__dcOn[type];
          if (fn) { fn.call(self, e); return; }
        }
      }, type === "focus" || type === "blur");
    });

    this._mounted = true;
    this._render();
    this.componentDidMount();
    window.addEventListener("pagehide", function () { self.componentWillUnmount(); });
    return this;
  };
  window.DCLogic = DCLogic;

  // ---- palaišana ------------------------------------------------------------
  function boot() {
    var root = document.querySelector("x-dc");
    var Comp = typeof Component === "function" ? Component : window.Component;
    if (!root || !Comp) { console.error("support.js: trūkst <x-dc> saknes vai Component klases (logic.js)"); return; }
    window.app = new Comp().mount(root);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
