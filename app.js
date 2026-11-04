/* SmartStock — utils.js
   Shared helpers: safe DOM builder, formatting (MMK, dates, quantities), CSV, modals, charts.
   No innerHTML is used anywhere: all text goes through text nodes / setAttribute. */
(function () {
  'use strict';
  const SS = (window.SS = window.SS || {});
  const U = (SS.U = {});
  SS.UI = SS.UI || {};
  SS.pages = SS.pages || {};
  let seq = 0, fieldSeq = 0;

  SS.PAY = { cash: 'ငွေသား', bank: 'ဘဏ်လွှဲ', wallet: 'မိုဘိုင်းပိုက်ဆံအိတ်', other: 'အခြား' };
  SS.SALE_STATUS = { completed: 'ပြီးစီး', partially_returned: 'တစ်စိတ်တစ်ပိုင်း ပြန်အမ်း', returned: 'ပြန်အမ်းပြီး', cancelled: 'ပယ်ဖျက်ပြီး' };
  SS.PURCHASE_STATUS = { draft: 'မူကြမ်း', confirmed: 'အတည်ပြုပြီး', cancelled: 'ပယ်ဖျက်ပြီး' };

  /* ---------------- DOM ---------------- */
  function append(el, kids) {
    for (const k of kids) {
      if (k == null || k === false || k === true) continue;
      if (Array.isArray(k)) append(el, k);
      else if (typeof Node !== 'undefined' && k instanceof Node) el.appendChild(k);
      else el.appendChild(document.createTextNode(String(k)));
    }
  }
  U.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    let value;
    const isAttrs = attrs && typeof attrs === 'object' && !Array.isArray(attrs) && !(typeof Node !== 'undefined' && attrs instanceof Node);
    if (isAttrs) {
      for (const k of Object.keys(attrs)) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'value') value = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v === true) { if (k in el) el[k] = true; else el.setAttribute(k, ''); }
        else el.setAttribute(k, String(v));
      }
    } else if (attrs != null) kids.unshift(attrs);
    append(el, kids);
    if (value !== undefined) el.value = value;
    return el;
  };
  const h = U.h;
  U.clear = (n) => { while (n.firstChild) n.removeChild(n.firstChild); return n; };
  U.svg = function (tag, attrs, ...kids) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (const k of Object.keys(attrs)) if (attrs[k] != null) el.setAttribute(k, String(attrs[k]));
    for (const k of kids) if (k) el.appendChild(k);
    return el;
  };
  const ICONS = {
    home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
    box: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
    tag: 'M20 12l-8 8-9-9V3h8zM7.5 7.5h.01',
    layers: 'M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5',
    cart: 'M3 4h2l2.4 11h10.2l2-8H6M9 20h.01M17 20h.01',
    truck: 'M2 6h11v10H2zM13 9h4l4 3v4h-8zM6 19h.01M17 19h.01',
    store: 'M3 9l1-5h16l1 5M4 9v11h16V9M9 20v-6h6v6',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l2-3h12v3M16 13.5h.01',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    database: 'M12 3c4.4 0 8 1.1 8 2.5S16.4 8 12 8 4 6.9 4 5.5 7.6 3 12 3zM4 5.5v13C4 19.9 7.6 21 12 21s8-1.1 8-2.5v-13M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12h2M3 12h2M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    menu: 'M3 6h18M3 12h18M3 18h18',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    chevrons: 'M11 17l-5-5 5-5M18 17l-5-5 5-5'
  };
  U.icon = function (name, size) {
    const s = U.svg('svg', { viewBox: '0 0 24 24', width: size || 20, height: size || 20, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' });
    s.appendChild(U.svg('path', { d: ICONS[name] || '' }));
    return s;
  };

  /* ---------------- basics ---------------- */
  U.uid = (prefix) => (prefix || 'id') + '_' + Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 7);
  U.nowISO = () => new Date().toISOString();
  U.r3 = (n) => Math.round((Number(n) + Number.EPSILON) * 1000) / 1000;
  U.sum = (arr, f) => arr.reduce((a, x) => a + (f ? f(x) : x), 0);
  U.pad = (n) => String(n).padStart(2, '0');
  U.debounce = function (fn, ms) { let t; const d = function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; d.cancel = () => clearTimeout(t); return d; };
  U.clone = (o) => JSON.parse(JSON.stringify(o));
  // Splits an integer `total` across `weights` so the parts add up exactly (largest-remainder method).
  U.allocate = function (total, weights) {
    const sign = total < 0 ? -1 : 1; total = Math.abs(Math.round(total));
    if (!weights.length || total === 0) return weights.map(() => 0);
    let w = weights.slice(); let sum = w.reduce((a, b) => a + b, 0);
    if (sum <= 0) { w = w.map(() => 1); sum = w.length; }
    const raw = w.map((x) => (total * x) / sum), fl = raw.map(Math.floor);
    let rem = total - fl.reduce((a, b) => a + b, 0);
    const order = raw.map((r, i) => [r - fl[i], i]).sort((a, b) => b[0] - a[0]);
    for (let k = 0; k < rem; k++) fl[order[k % order.length][1]]++;
    return fl.map((x) => x * sign);
  };

  // Burmese digits → ASCII, then parse
  U.normDigits = (s) => String(s == null ? '' : s).replace(/[၀-၉]/g, (c) => String(c.charCodeAt(0) - 0x1040));
  U.parseNum = function (s) {
    if (typeof s === 'number') return s;
    const t = U.normDigits(s).replace(/[,\s]/g, '');
    if (t === '' || !/^-?\d*\.?\d+$/.test(t)) return NaN;
    return Number(t);
  };
  // Integer MMK amounts; returns NaN when blank/invalid/fractional
  U.parseMoney = function (s) {
    const n = U.parseNum(s);
    return Number.isInteger(n) ? n : NaN;
  };

  /* ---------------- formatting ---------------- */
  U.fmtNum = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 3 });
  U.money = function (n) {
    const label = (SS.Settings && SS.Settings.get().currencyLabel) || 'ကျပ်';
    n = Math.round(Number(n) || 0);
    return (n < 0 ? '-' : '') + Math.abs(n).toLocaleString('en-US') + ' ' + label;
  };
  U.qty = (n) => U.fmtNum(U.r3(n));
  U.compact = function (n) {
    const a = Math.abs(n), s = n < 0 ? '-' : '';
    if (a >= 1e6) return s + (a / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (a >= 1e3) return s + (a / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return s + Math.round(a);
  };
  U.dayKey = function (d) {
    const x = d instanceof Date ? d : new Date(d);
    return x.getFullYear() + '-' + U.pad(x.getMonth() + 1) + '-' + U.pad(x.getDate());
  };
  U.todayKey = () => U.dayKey(new Date());
  U.addDays = function (key, n) { const [y, m, d] = key.split('-').map(Number); return U.dayKey(new Date(y, m - 1, d + n)); };
  U.isDayKey = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && U.dayKey(new Date(s + 'T00:00:00')) === s;
  U.fmtDate = function (v) {
    if (!v) return '';
    let y, m, d;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) { [y, m, d] = v.split('-'); }
    else { const x = new Date(v); if (isNaN(x)) return String(v); y = x.getFullYear(); m = U.pad(x.getMonth() + 1); d = U.pad(x.getDate()); }
    const f = (SS.Settings && SS.Settings.get().dateFormat) || 'DD/MM/YYYY';
    return f === 'MM/DD/YYYY' ? `${m}/${d}/${y}` : f === 'YYYY-MM-DD' ? `${y}-${m}-${d}` : `${d}/${m}/${y}`;
  };
  U.fmtTime = (iso) => { const x = new Date(iso); return isNaN(x) ? '' : U.pad(x.getHours()) + ':' + U.pad(x.getMinutes()); };
  U.fmtDateTime = (iso) => U.fmtDate(iso) + ' ' + U.fmtTime(iso);
  U.inRange = (key, from, to) => (!from || key >= from) && (!to || key <= to);
  U.period = function (kind, from, to) {
    const t = U.todayKey();
    if (kind === 'today') return { from: t, to: t };
    if (kind === '7d') return { from: U.addDays(t, -6), to: t };
    if (kind === '30d') return { from: U.addDays(t, -29), to: t };
    if (kind === 'month') return { from: t.slice(0, 8) + '01', to: t };
    return { from: from || t, to: to || t };
  };

  /* ---------------- CSV / download / files ---------------- */
  U.csv = function (headers, rows) {
    const esc = (v) => {
      if (v == null) return '';
      let s = String(v);
      if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s; // spreadsheet formula-injection guard
      if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    return '﻿' + [headers].concat(rows).map((r) => r.map(esc).join(',')).join('\r\n');
  };
  U.download = function (name, content, mime) {
    const blob = new Blob([content], { type: (mime || 'text/plain') + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  U.readText = (file) => new Promise((res, rej) => { const fr = new FileReader(); fr.onerror = () => rej(new Error('ဖိုင်ဖတ်၍မရပါ')); fr.onload = () => res(String(fr.result)); fr.readAsText(file); });
  U.readImage = (file, max) => new Promise((res, rej) => {
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) return rej(new Error('PNG/JPG/WEBP ပုံဖိုင်သာ ရွေးပါ'));
    const fr = new FileReader();
    fr.onerror = () => rej(new Error('ဖိုင်ဖတ်၍မရပါ'));
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, (max || 240) / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
        const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => rej(new Error('ပုံဖိုင် မမှန်ပါ'));
      img.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });
  // Only allow data:image URLs coming from storage/backups to be used as <img src>
  U.safeImg = (src) => (typeof src === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(src) ? src : '');

  /* ---------------- UI building blocks ---------------- */
  U.toast = function (msg, type, ms) {
    const root = document.getElementById('toasts');
    if (!root) return;
    const t = h('div', { class: 'toast toast-' + (type || 'info'), role: type === 'error' ? 'alert' : 'status' }, msg);
    root.appendChild(t);
    setTimeout(() => t.remove(), ms || (type === 'error' ? 8000 : 3800));
  };
  U.modal = function (o) {
    const root = document.getElementById('modal-root');
    const prev = document.activeElement;
    let closed = false;
    const overlay = h('div', { class: 'modal-overlay' });
    const box = h('div', { class: 'modal modal-' + (o.size || 'md'), role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title });
    function onKey(e) { if (e.key === 'Escape' && root.lastElementChild === overlay) close(); }
    function close(result) {
      if (closed) return; closed = true;
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      if (prev && prev.focus) { try { prev.focus(); } catch (_) {} }
      if (o.onClose) o.onClose(result);
    }
    const body = h('div', { class: 'modal-body' }, o.body);
    box.appendChild(h('div', { class: 'modal-head' }, h('h3', null, o.title), h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'ပိတ်ရန်', onClick: () => close() }, '✕')));
    box.appendChild(body);
    if (o.buttons && o.buttons.length) {
      box.appendChild(h('div', { class: 'modal-foot' }, o.buttons.map((b) => h('button', {
        type: 'button', class: 'btn ' + (b.class || 'btn-ghost'),
        onClick: async (e) => {
          if (b.onClick) { const r = await b.onClick(e, close); if (r === false) return; }
          if (b.close !== false) close(b.value);
        }
      }, b.label))));
    }
    overlay.appendChild(box);
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay && !o.sticky) close(); });
    root.appendChild(overlay);
    document.addEventListener('keydown', onKey);
    const first = box.querySelector('input:not([type=hidden]),select,textarea');
    if (first && !o.noFocus) first.focus(); else box.querySelector('.btn-primary,.btn-danger') && box.querySelector('.btn-primary,.btn-danger').focus();
    return { close, el: box, body };
  };
  U.confirm = (message, o) => new Promise((resolve) => {
    o = o || {};
    U.modal({
      title: o.title || 'အတည်ပြုပါ', size: 'sm', body: h('p', { style: 'white-space:pre-line;margin:0' }, message),
      buttons: [{ label: o.cancelLabel || 'မလုပ်တော့ပါ', value: false }, { label: o.confirmLabel || 'အတည်ပြုသည်', class: o.danger ? 'btn-danger' : 'btn-primary', value: true }],
      onClose: (r) => resolve(r === true)
    });
  });
  U.askReason = (o) => new Promise((resolve) => {
    const ta = h('textarea', { 'aria-label': o.label || 'အကြောင်းရင်း', placeholder: o.placeholder || '' });
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    U.modal({
      title: o.title, size: 'sm',
      body: [o.message ? h('p', { style: 'white-space:pre-line;margin:0 0 10px' }, o.message) : null, err, U.field(o.label || 'အကြောင်းရင်း (မဖြစ်မနေ)', ta, { required: true })],
      buttons: [{ label: 'မလုပ်တော့ပါ', value: null }, {
        label: o.confirmLabel || 'အတည်ပြုသည်', class: o.danger ? 'btn-danger' : 'btn-primary', close: false,
        onClick: (e, close) => { const v = ta.value.trim(); if (v.length < 3) { err.textContent = 'အကြောင်းရင်း ရေးပါ (အနည်းဆုံး ၃ လုံး)'; err.hidden = false; ta.setAttribute('aria-invalid', 'true'); ta.focus(); return false; } close(v); }
      }],
      onClose: (r) => resolve(typeof r === 'string' ? r : null)
    });
  });
  U.field = function (label, input, o) {
    o = o || {};
    const id = input.id || (input.id = 'f' + (++fieldSeq));
    return h('div', { class: 'field' + (o.class ? ' ' + o.class : '') },
      h('label', { for: id }, label, o.required ? h('span', { class: 'req', 'aria-hidden': 'true' }, ' *') : null),
      input, o.hint ? h('small', { class: 'hint' }, o.hint) : null);
  };
  U.select = function (options, value, attrs) {
    const s = h('select', attrs || null, options.map((o) => h('option', { value: o.value }, o.label)));
    if (value !== undefined && value !== null) s.value = value;
    return s;
  };
  U.formError = function (box, msg) { box.textContent = msg || ''; box.hidden = !msg; if (msg) box.scrollIntoView && box.scrollIntoView({ block: 'nearest' }); };
  U.badge = (text, kind) => h('span', { class: 'badge badge-' + (kind || 'muted') }, text);
  U.empty = (msg, sub) => h('div', { class: 'empty' }, h('div', { class: 'big', 'aria-hidden': 'true' }, '∅'), h('div', null, msg), sub ? h('div', { class: 'small' }, sub) : null);
  U.pageHeader = (title, sub, actions) => h('div', { class: 'page-head' }, h('div', null, h('h2', null, title), sub ? h('p', null, sub) : null), h('div', { class: 'row' }, actions || []));
  U.table = function (cols, rows, o) {
    o = o || {};
    const head = h('tr', null, cols.map((c) => h('th', { scope: 'col', class: c.class || '' }, c.label)));
    const body = rows.map((r) => h('tr', { class: o.rowClass ? o.rowClass(r) : '' }, cols.map((c) => h('td', { class: c.class || '' }, c.render ? c.render(r) : (r[c.key] == null ? '' : r[c.key])))));
    const foot = o.foot ? h('tfoot', null, h('tr', null, o.foot.map((c) => h('td', { class: c.class || '' }, c.text)))) : null;
    return h('div', { class: 'table-wrap' }, h('table', { class: 'table' }, h('thead', null, head), h('tbody', null, body), foot));
  };
  U.pager = function (total, page, per, onPage) {
    const pages = Math.max(1, Math.ceil(total / per));
    const from = total === 0 ? 0 : (page - 1) * per + 1, to = Math.min(total, page * per);
    return h('div', { class: 'pager' }, h('span', { class: 'muted small' }, `${from}–${to} / ${total}`),
      h('button', { type: 'button', class: 'btn btn-ghost btn-sm', disabled: page <= 1, onClick: () => onPage(page - 1) }, '‹ ရှေ့'),
      h('span', null, `${page} / ${pages}`),
      h('button', { type: 'button', class: 'btn btn-ghost btn-sm', disabled: page >= pages, onClick: () => onPage(page + 1) }, 'နောက် ›'));
  };
  U.tabs = function (tabs, initial) {
    const bar = h('div', { class: 'tabs', role: 'tablist' });
    const panel = h('div', { role: 'tabpanel' });
    let cur;
    function show(id) {
      cur = id;
      bar.querySelectorAll('button').forEach((b) => { const on = b.getAttribute('data-id') === id; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
      U.clear(panel);
      panel.appendChild(tabs.find((t) => t.id === id).render());
    }
    tabs.forEach((t) => bar.appendChild(h('button', { type: 'button', role: 'tab', class: 'tab', 'data-id': t.id, onClick: () => show(t.id) }, t.label)));
    show(initial || tabs[0].id);
    const wrap = h('div', null, bar, panel);
    wrap.refresh = () => show(cur);
    wrap.show = show;
    return wrap;
  };
  U.stockBadge = function (p) {
    const st = p.stock <= 0 ? 'out' : p.stock <= p.lowStock ? 'low' : 'ok';
    return U.badge(st === 'out' ? 'ကုန်သွားပြီ' : st === 'low' ? 'နည်းနေပြီ' : 'လုံလောက်', st === 'out' ? 'err' : st === 'low' ? 'warn' : 'ok');
  };

  /* ---------------- printing ---------------- */
  // Renders `node` into #print-area, sets @page size, and opens the browser print dialog.
  U.printNode = function (node, pageSize) {
    const area = document.getElementById('print-area');
    U.clear(area).appendChild(node);
    let st = document.getElementById('page-size-style');
    if (!st) { st = document.createElement('style'); st.id = 'page-size-style'; document.head.appendChild(st); }
    st.textContent = pageSize === 'A4' ? '@page{size:A4;margin:12mm}' : `@page{size:${pageSize || '80mm'} auto;margin:3mm}`;
    const done = () => { U.clear(area); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
  };

  /* ---------------- charts (inline SVG, no dependency) ---------------- */
  U.COLORS = ['#14B8A6', '#0B223F', '#F59E0B', '#6366F1', '#EF4444', '#22C55E', '#EC4899', '#64748B'];
  function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
  U.lineChart = function (labels, series) {
    const W = 640, H = 250, pl = 54, pr = 14, pt = 14, pb = 30;
    const all = series.flatMap((s) => s.values);
    const yMax = niceMax(Math.max(0, ...all)), yMin = Math.min(0, ...all) < 0 ? -niceMax(-Math.min(0, ...all)) : 0;
    const n = labels.length;
    const x = (i) => pl + (n <= 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (n - 1));
    const y = (v) => pt + ((yMax - v) / (yMax - yMin || 1)) * (H - pt - pb);
    const svg = U.svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': series.map((s) => s.name).join(', ') });
    for (let i = 0; i <= 4; i++) {
      const v = yMin + ((yMax - yMin) * i) / 4;
      svg.appendChild(U.svg('line', { class: 'grid-line', x1: pl, x2: W - pr, y1: y(v), y2: y(v) }));
      const t = U.svg('text', { x: pl - 6, y: y(v) + 4, 'text-anchor': 'end' }); t.textContent = U.compact(v); svg.appendChild(t);
    }
    const step = Math.max(1, Math.ceil(n / 7));
    labels.forEach((l, i) => { if (i % step === 0 || i === n - 1) { const t = U.svg('text', { x: x(i), y: H - 8, 'text-anchor': 'middle' }); t.textContent = l; svg.appendChild(t); } });
    series.forEach((s, si) => {
      const color = s.color || U.COLORS[si % U.COLORS.length];
      svg.appendChild(U.svg('polyline', { points: s.values.map((v, i) => x(i) + ',' + y(v)).join(' '), fill: 'none', stroke: color, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
      s.values.forEach((v, i) => { const c = U.svg('circle', { cx: x(i), cy: y(v), r: 3.5, fill: color }); const t = U.svg('title'); t.textContent = `${labels[i]} — ${s.name}: ${U.money(v)}`; c.appendChild(t); svg.appendChild(c); });
    });
    const legend = h('ul', { class: 'legend', style: 'display:flex;gap:16px;margin-top:6px' }, series.map((s, si) => h('li', null, h('span', { class: 'sw', style: 'background:' + (s.color || U.COLORS[si % U.COLORS.length]) }), s.name)));
    return h('div', { class: 'chart' }, svg, legend);
  };
  U.donut = function (items) {
    const total = U.sum(items, (i) => i.value);
    const svg = U.svg('svg', { viewBox: '0 0 140 140', role: 'img', 'aria-label': 'Share chart' });
    const cx = 70, cy = 70, r = 62, ri = 38;
    if (items.length === 1 || (items.length && items[0].value === total)) {
      svg.appendChild(U.svg('circle', { cx, cy, r: (r + ri) / 2, fill: 'none', stroke: U.COLORS[0], 'stroke-width': r - ri }));
    } else {
      let a0 = -Math.PI / 2;
      items.forEach((it, i) => {
        const a1 = a0 + (it.value / total) * Math.PI * 2, lg = a1 - a0 > Math.PI ? 1 : 0;
        const p = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
        const [x0, y0] = p(r, a0), [x1, y1] = p(r, a1), [x2, y2] = p(ri, a1), [x3, y3] = p(ri, a0);
        const path = U.svg('path', { d: `M${x0} ${y0}A${r} ${r} 0 ${lg} 1 ${x1} ${y1}L${x2} ${y2}A${ri} ${ri} 0 ${lg} 0 ${x3} ${y3}Z`, fill: U.COLORS[i % U.COLORS.length] });
        const t = U.svg('title'); t.textContent = `${it.label}: ${U.money(it.value)}`; path.appendChild(t); svg.appendChild(path);
        a0 = a1;
      });
    }
    return h('div', { class: 'donut-wrap chart' }, svg, h('ul', { class: 'legend' }, items.map((it, i) =>
      h('li', null, h('span', { class: 'sw', style: 'background:' + U.COLORS[i % U.COLORS.length] }), h('span', { class: 'grow' }, it.label), h('span', { class: 'mono' }, Math.round((it.value / total) * 100) + '%')))));
  };
  U.barList = function (items, fmt) {
    const max = Math.max(1, ...items.map((i) => i.value));
    return h('div', { class: 'barlist' }, items.map((it) => h('div', { class: 'bl' }, h('span', null, it.label),
      h('div', { class: 'track' }, h('div', { class: 'fill', style: `width:${Math.max(2, (it.value / max) * 100)}%` })),
      h('span', { class: 'mono' }, fmt ? fmt(it.value) : U.fmtNum(it.value)))));
  };
})();

;
/* SmartStock — storage.js
   The ONLY module that touches localStorage. Provides:
   - namespaced, versioned keys (smartstock:*)
   - validated reads (corrupt data is quarantined, never silently overwritten)
   - validated writes with quota-error handling
   - Storage.tx(fn): all-or-nothing multi-collection commit with rollback
   - backup export / validation / restore and schema migration */
(function () {
  'use strict';
  const SS = (window.SS = window.SS || {});
  const NS = 'smartstock:';
  const SCHEMA_VERSION = 1;
  const COLLECTIONS = ['products', 'categories', 'sales', 'purchases', 'suppliers', 'customers', 'expenses', 'stockMovements', 'payments'];
  const OBJECTS = ['settings', 'meta'];
  const cache = {}, indexes = {};
  let txDepth = 0, dirty = new Set();

  const S = (SS.Storage = { NS, SCHEMA_VERSION, COLLECTIONS, errors: [], readOnly: false });

  class StorageError extends Error { constructor(m, quota) { super(m); this.name = 'StorageError'; this.quota = !!quota; } }
  S.StorageError = StorageError;
  const key = (n) => NS + n;

  function writeRaw(k, str) {
    try { localStorage.setItem(k, str); }
    catch (e) {
      const quota = !!e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014);
      throw new StorageError(quota
        ? 'သိမ်းဆည်းရန် browser နေရာ မလောက်တော့ပါ။ Backup ဒေါင်းလုဒ်လုပ်ပြီး မလိုအပ်သော ပုံများ/ဒေတာများကို လျှော့ချပါ။ (ဤလုပ်ဆောင်ချက်ကို မသိမ်းဆည်းရသေးပါ)'
        : 'သိမ်းဆည်း၍မရပါ: ' + ((e && e.message) || e), quota);
    }
  }

  function quarantine(name, raw, err) {
    const qk = NS + 'corrupt:' + name + ':' + Date.now();
    let saved = false;
    try { localStorage.setItem(qk, raw); saved = true; } catch (_) { /* no room */ }
    S.errors.push({ name, message: `"${name}" ဒေတာ ပျက်စီး/မမှန်ကန်ပါ (${err.message})။ မူရင်းကို ${saved ? '"' + qk + '" အောက်တွင် သိမ်းထားပါသည်' : 'သိမ်း၍မရပါ'}။ Backup မှ ပြန်ရယူနိုင်ပါသည်။` });
  }

  function readKey(name, kind) {
    const empty = () => (kind === 'array' ? [] : {});
    let raw;
    try { raw = localStorage.getItem(key(name)); }
    catch (e) { S.errors.push({ name, fatal: true, message: 'localStorage ကို ဖတ်၍မရပါ: ' + e.message }); return empty(); }
    if (raw == null) return empty();
    try {
      const v = JSON.parse(raw);
      if (kind === 'array') {
        if (!Array.isArray(v) || v.some((x) => !x || typeof x !== 'object' || typeof x.id !== 'string')) throw new Error('invalid structure');
      } else if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('invalid structure');
      return v;
    } catch (e) { quarantine(name, raw, e); return empty(); }
  }

  function reloadAll() {
    for (const c of COLLECTIONS) { cache[c] = readKey(c, 'array'); delete indexes[c]; }
    for (const o of OBJECTS) cache[o] = readKey(o, 'object');
  }

  /* ---------- schema migrations ---------- */
  const MIGRATIONS = {
    // 0 → 1: normalise legacy/partial data so every record has the fields the app relies on
    1(d) {
      for (const c of COLLECTIONS) if (!Array.isArray(d[c])) d[c] = [];
      d.settings = d.settings && typeof d.settings === 'object' ? d.settings : {};
      d.meta = d.meta && typeof d.meta === 'object' ? d.meta : {};
      d.meta.counters = d.meta.counters || {};
      d.products.forEach((p) => { p.status = p.status || 'active'; p.stock = Number(p.stock) || 0; p.lowStock = Number(p.lowStock) || 0; p.cost = Math.round(Number(p.cost) || 0); p.price = Math.round(Number(p.price) || 0); });
      d.categories.forEach((c) => { c.status = c.status || 'active'; });
      d.suppliers.forEach((c) => { c.status = c.status || 'active'; });
      d.customers.forEach((c) => { c.status = c.status || 'active'; });
      d.sales.forEach((s) => { s.returns = s.returns || []; s.items = s.items || []; });
      d.expenses.forEach((e) => { e.status = e.status || 'active'; });
    }
  };
  S.migrateData = function (data, from) {
    for (let v = (from || 0) + 1; v <= SCHEMA_VERSION; v++) if (MIGRATIONS[v]) MIGRATIONS[v](data);
    data.meta = data.meta || {}; data.meta.schemaVersion = SCHEMA_VERSION;
    return data;
  };

  /* ---------- init ---------- */
  S.init = function () {
    S.errors = []; S.readOnly = false;
    reloadAll();
    const meta = cache.meta;
    if (!meta.schemaVersion) {
      const hadAnything = COLLECTIONS.some((c) => cache[c].length);
      meta.schemaVersion = hadAnything ? 0 : SCHEMA_VERSION;
      meta.createdAt = meta.createdAt || new Date().toISOString();
      meta.counters = meta.counters || {};
    }
    if (meta.schemaVersion > SCHEMA_VERSION) {
      S.readOnly = true;
      S.errors.push({ name: 'meta', fatal: true, message: `ဒေတာသည် schema v${meta.schemaVersion} ဖြစ်ပြီး ဤအက်ပ်သည် v${SCHEMA_VERSION} ကိုသာ နားလည်ပါသည်။ ဒေတာကို မပြင်မိစေရန် ရေးသားခြင်းကို ပိတ်ထားပါသည်။` });
      return S.errors;
    }
    try {
      if (meta.schemaVersion < SCHEMA_VERSION) {
        S.snapshotNow();
        const d = {}; [...COLLECTIONS, ...OBJECTS].forEach((n) => (d[n] = cache[n]));
        S.migrateData(d, meta.schemaVersion);
        S.tx(() => { [...COLLECTIONS, ...OBJECTS].forEach((n) => S.save(n)); });
      } else if (localStorage.getItem(key('meta')) == null) S.save('meta');
    } catch (e) { S.errors.push({ name: 'init', message: 'စတင်ခြင်း အမှား: ' + e.message }); }
    return S.errors;
  };

  /* ---------- reads ---------- */
  S.all = (name) => cache[name];
  S.obj = (name) => cache[name];
  S.byId = function (name, id) {
    const arr = cache[name];
    let ix = indexes[name];
    if (!ix || ix.size !== arr.length) { ix = new Map(); for (const x of arr) ix.set(x.id, x); indexes[name] = ix; }
    return ix.get(id);
  };
  S.inTx = () => txDepth > 0;

  /* ---------- writes ---------- */
  function validateCollection(name, arr) {
    if (!Array.isArray(arr)) throw new StorageError(`"${name}" သည် array မဟုတ်ပါ`);
    const ids = new Set();
    for (const x of arr) {
      if (!x || typeof x !== 'object' || typeof x.id !== 'string' || !x.id) throw new StorageError(`"${name}" တွင် id မရှိသော မှတ်တမ်း ပါနေသည်`);
      if (ids.has(x.id)) throw new StorageError(`"${name}" တွင် id ထပ်နေသည်: ${x.id}`);
      ids.add(x.id);
    }
  }
  S.save = function (name) {
    if (S.readOnly) throw new StorageError('ဤဒေတာသည် ပိုအသစ်သော ဗားရှင်းဖြစ်၍ ရေးသား၍မရပါ');
    if (COLLECTIONS.includes(name)) { validateCollection(name, cache[name]); delete indexes[name]; }
    else if (!OBJECTS.includes(name)) throw new StorageError('Unknown storage key: ' + name);
    if (txDepth > 0) { dirty.add(name); return; }
    writeRaw(key(name), JSON.stringify(cache[name]));
  };
  // Runs fn() synchronously; every S.save() inside is held back and committed together.
  // If fn throws, or any write fails (e.g. quota), nothing is kept: storage and memory are restored.
  S.tx = function (fn) {
    if (txDepth > 0) return fn();
    txDepth = 1; dirty = new Set();
    let result;
    try { result = fn(); }
    catch (e) { txDepth = 0; dirty = new Set(); reloadAll(); throw e; }
    txDepth = 0;
    const names = [...dirty]; dirty = new Set();
    const before = {}, written = [];
    try {
      for (const n of names) before[n] = localStorage.getItem(key(n));
      for (const n of names) { writeRaw(key(n), JSON.stringify(cache[n])); written.push(n); }
    } catch (e) {
      for (const n of written) { try { before[n] == null ? localStorage.removeItem(key(n)) : localStorage.setItem(key(n), before[n]); } catch (_) { /* best effort */ } }
      reloadAll();
      throw e;
    }
    return result;
  };
  S.nextNumber = function (kind, prefix, pad) {
    const m = cache.meta; m.counters = m.counters || {};
    m.counters[kind] = (m.counters[kind] || 0) + 1;
    S.save('meta');
    return (prefix || '') + String(m.counters[kind]).padStart(pad || 6, '0');
  };
  S.usage = function () {
    let chars = 0;
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(NS)) chars += k.length + (localStorage.getItem(k) || '').length; } } catch (_) { /* ignore */ }
    const limit = 5242880; // typical 5M-character browser limit (browser dependent)
    return { chars, bytes: chars * 2, limitChars: limit, ratio: chars / limit };
  };
  S.hasRoom = function (chars) {
    const k = NS + 'probe';
    try { localStorage.setItem(k, 'x'.repeat(chars)); localStorage.removeItem(k); return true; }
    catch (_) { try { localStorage.removeItem(k); } catch (__) { /* ignore */ } return false; }
  };
  S.setMeta = function (patch) { Object.assign(cache.meta, patch); S.save('meta'); };

  /* ---------- backup / restore ---------- */
  S.exportAll = function () {
    const data = {};
    for (const c of COLLECTIONS) { validateCollection(c, cache[c]); data[c] = cache[c]; }
    data.settings = cache.settings; data.meta = cache.meta;
    const counts = {}; COLLECTIONS.forEach((c) => (counts[c] = cache[c].length));
    return { app: 'SmartStock', format: 'smartstock-backup', schemaVersion: SCHEMA_VERSION, createdAt: new Date().toISOString(), counts, data };
  };

  const REQUIRED = {
    products: (x) => typeof x.name === 'string' && Number.isFinite(x.cost) && Number.isFinite(x.price) && Number.isFinite(x.stock),
    categories: (x) => typeof x.name === 'string',
    suppliers: (x) => typeof x.name === 'string',
    customers: (x) => typeof x.name === 'string',
    sales: (x) => typeof x.number === 'string' && Array.isArray(x.items) && Number.isFinite(x.total),
    purchases: (x) => Array.isArray(x.items) && Number.isFinite(x.total),
    expenses: (x) => Number.isFinite(x.amount),
    stockMovements: (x) => typeof x.productId === 'string' && Number.isFinite(x.qty),
    payments: (x) => Number.isFinite(x.amount)
  };
  // Returns {ok, errors[], warnings[], summary, data}. Never mutates current storage.
  S.validateBackup = function (obj) {
    const errors = [], warnings = [];
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, errors: ['ဖိုင်သည် SmartStock backup ပုံစံ မဟုတ်ပါ'], warnings };
    if (obj.app !== 'SmartStock' || obj.format !== 'smartstock-backup') errors.push('ဤဖိုင်သည် SmartStock backup မဟုတ်ပါ (app/format မကိုက်ပါ)');
    if (!Number.isInteger(obj.schemaVersion) || obj.schemaVersion < 0) errors.push('schemaVersion မမှန်ပါ');
    else if (obj.schemaVersion > SCHEMA_VERSION) errors.push(`Backup schema v${obj.schemaVersion} သည် ဤအက်ပ် (v${SCHEMA_VERSION}) ထက် အသစ်ဖြစ်သည်`);
    if (!obj.data || typeof obj.data !== 'object') errors.push('data အပိုင်း မပါပါ');
    if (errors.length) return { ok: false, errors, warnings };
    let data;
    try { data = S.migrateData(JSON.parse(JSON.stringify(obj.data)), obj.schemaVersion); } catch (e) { return { ok: false, errors: ['Migration မအောင်မြင်ပါ: ' + e.message], warnings }; }
    for (const c of COLLECTIONS) {
      const arr = data[c];
      if (!Array.isArray(arr)) { errors.push(`"${c}" သည် စာရင်း (array) မဟုတ်ပါ`); continue; }
      const ids = new Set();
      arr.forEach((x, i) => {
        if (!x || typeof x !== 'object' || typeof x.id !== 'string' || !x.id) { errors.push(`${c}[${i}]: id မရှိပါ`); return; }
        if (ids.has(x.id)) errors.push(`${c}: id ထပ်နေသည် ${x.id}`);
        ids.add(x.id);
        if (REQUIRED[c] && !REQUIRED[c](x)) errors.push(`${c}[${i}] (${x.id}): လိုအပ်သော field မပြည့်စုံ/မမှန်ပါ`);
      });
    }
    if (errors.length) return { ok: false, errors: errors.slice(0, 12).concat(errors.length > 12 ? [`... နှင့် အခြား အမှား ${errors.length - 12} ခု`] : []), warnings };
    const pid = new Set(data.products.map((p) => p.id)), cid = new Set(data.categories.map((c) => c.id));
    let dangling = 0;
    data.products.forEach((p) => { if (!cid.has(p.categoryId)) dangling++; });
    data.stockMovements.forEach((m) => { if (!pid.has(m.productId)) dangling++; });
    data.sales.forEach((s) => s.items.forEach((it) => { if (!pid.has(it.productId)) dangling++; }));
    if (dangling) warnings.push(`ချိတ်ဆက်မှု မညီသော reference ${dangling} ခု တွေ့ရှိသည် (restore လုပ်နိုင်သော်လည်း စစ်ဆေးသင့်သည်)`);
    if (!data.settings || typeof data.settings !== 'object') errors.push('settings မမှန်ပါ');
    if (errors.length) return { ok: false, errors, warnings };
    const counts = {}; COLLECTIONS.forEach((c) => (counts[c] = data[c].length));
    return { ok: true, errors, warnings, data, summary: { createdAt: obj.createdAt || '', schemaVersion: obj.schemaVersion, shopName: data.settings.shopName || '', counts } };
  };
  S.parseBackupText = function (text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { return { ok: false, errors: ['JSON ဖိုင် ပျက်စီး/မမှန်ပါ: ' + e.message], warnings: [] }; }
    return S.validateBackup(obj);
  };

  // Single-slot snapshot inside localStorage (verified by read-back). Returns {ok, error?, at?}
  S.snapshotNow = function () {
    try {
      const snap = S.exportAll(); const str = JSON.stringify(snap);
      writeRaw(key('autobackup'), str);
      if (localStorage.getItem(key('autobackup')) !== str) throw new Error('read-back mismatch');
      return { ok: true, at: snap.createdAt };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  S.getSnapshot = function () {
    try { const raw = localStorage.getItem(key('autobackup')); return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
  };
  S.restore = function (validated) {
    if (!validated || !validated.ok) throw new StorageError('Backup မမှန်ကန်ပါ');
    const names = [...COLLECTIONS, ...OBJECTS];
    const before = {}, written = [];
    for (const n of names) before[n] = localStorage.getItem(key(n));
    try {
      for (const n of names) { writeRaw(key(n), JSON.stringify(validated.data[n])); written.push(n); }
    } catch (e) {
      for (const n of written) { try { before[n] == null ? localStorage.removeItem(key(n)) : localStorage.setItem(key(n), before[n]); } catch (_) { /* best effort */ } }
      reloadAll(); throw e;
    }
    S.errors = []; S.readOnly = false;
    reloadAll();
  };
  S.resetAll = function () {
    const rm = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(NS) && k !== key('autobackup')) rm.push(k); } } catch (_) { /* ignore */ }
    rm.forEach((k) => localStorage.removeItem(k));
    S.errors = []; S.readOnly = false;
    reloadAll();
    cache.meta = { schemaVersion: SCHEMA_VERSION, createdAt: new Date().toISOString(), counters: {} };
    S.save('meta');
  };
})();

;
/* SmartStock — settings.js
   Settings logic, first-run seeding, optional demo-data loader, and the Settings + Backup/Restore pages. */
(function () {
  'use strict';
  const SS = window.SS, S = SS.Storage, U = SS.U, h = U.h;
  const Settings = (SS.Settings = {});

  const DEFAULTS = {
    shopName: 'ကျွန်ုပ်၏ဆိုင်', shopPhone: '', shopAddress: '', logo: '',
    currencyLabel: 'ကျပ်', lowStockDefault: 5, receiptFooter: 'ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါသည်။',
    receiptWidth: '80mm', defaultPayment: 'cash', taxEnabled: false, taxRate: 0, allowCredit: true, allowDuplicateSku: false,
    dateFormat: 'DD/MM/YYYY', theme: 'light', sidebarCollapsed: false,
    units: [
      { name: 'ခု (piece)', decimal: false }, { name: 'ထုပ် (pack)', decimal: false }, { name: 'သေတ္တာ (box)', decimal: false },
      { name: 'ပုလင်း (bottle)', decimal: false }, { name: 'ကီလိုဂရမ် (kg)', decimal: true }, { name: 'လီတာ (liter)', decimal: true }
    ],
    expenseCategories: ['ဆိုင်ငှားခ (Rent)', 'မီးဖိုး (Electricity)', 'ပို့ဆောင်ခ (Transport)', 'ဝန်ထမ်းလစာ (Staff wages)', 'ထုပ်ပိုးစရိတ် (Packaging)', 'အခြားစရိတ် (Other)']
  };
  Settings.DEFAULTS = DEFAULTS;
  let current = null;

  function sanitize(stored) {
    const out = {};
    for (const k of Object.keys(DEFAULTS)) {
      const d = DEFAULTS[k], v = stored && Object.prototype.hasOwnProperty.call(stored, k) ? stored[k] : undefined;
      if (v !== undefined && (Array.isArray(d) ? Array.isArray(v) : typeof v === typeof d)) out[k] = Array.isArray(v) ? JSON.parse(JSON.stringify(v)) : v; else out[k] = JSON.parse(JSON.stringify(d));
    }
    if (!['cash', 'bank', 'wallet', 'other'].includes(out.defaultPayment)) out.defaultPayment = 'cash';
    if (!['58mm', '80mm', 'A4'].includes(out.receiptWidth)) out.receiptWidth = '80mm';
    if (!['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].includes(out.dateFormat)) out.dateFormat = 'DD/MM/YYYY';
    if (!['light', 'dark'].includes(out.theme)) out.theme = 'light';
    if (!['ကျပ်', 'MMK'].includes(out.currencyLabel)) out.currencyLabel = 'ကျပ်';
    out.logo = U.safeImg(out.logo);
    out.taxRate = Math.min(100, Math.max(0, Number(out.taxRate) || 0));
    out.lowStockDefault = Math.max(0, Math.round(Number(out.lowStockDefault) || 0));
    return out;
  }
  Settings.init = function () { current = sanitize(S.obj('settings')); Settings.applyTheme(); return current; };
  Settings.get = () => current || Settings.init();
  Settings.applyTheme = function () { if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', Settings.get().theme); };
  Settings.set = function (patch) {
    const next = sanitize(Object.assign({}, Settings.get(), patch));
    Object.assign(S.obj('settings'), next);
    S.save('settings');
    current = next; Settings.applyTheme();
    return current;
  };
  let pending = null;
  const flushLater = U.debounce(() => Settings.flush(), 400);
  // For non-critical UI preferences (theme, sidebar). Never used for financial data.
  Settings.setDebounced = function (patch) { current = sanitize(Object.assign({}, Settings.get(), patch)); pending = true; Settings.applyTheme(); flushLater(); };
  Settings.flush = function () {
    if (!pending) return; pending = null;
    try { Object.assign(S.obj('settings'), current); S.save('settings'); } catch (e) { U.toast(e.message, 'error'); }
  };
  Settings.unitDecimal = (name) => { const u = Settings.get().units.find((x) => x.name === name); return !!(u && u.decimal); };

  // First-run: default category + walk-in customer. No demo values are ever inserted automatically.
  SS.seed = function () {
    S.tx(() => {
      if (!S.all('categories').length) { const now = U.nowISO(); S.all('categories').push({ id: U.uid('cat'), name: 'အထွေထွေ', description: 'မူလ အမျိုးအစား', status: 'active', createdAt: now, updatedAt: now }); S.save('categories'); }
      if (!S.byId('customers', 'cust_walkin')) { const now = U.nowISO(); S.all('customers').push({ id: 'cust_walkin', name: 'ဧည့်သည် (Walk-in)', phone: '', address: '', notes: 'မူလ ဖောက်သည်', system: true, status: 'active', createdAt: now, updatedAt: now }); S.save('customers'); }
      if (!S.obj('settings').shopName) { Object.assign(S.obj('settings'), Settings.get()); S.save('settings'); }
    });
  };

  // Optional demo data for evaluation only. Runs through the normal APIs; only offered when there are no products.
  SS.Demo = {
    load() {
      if (S.all('products').length) throw new Error('ကုန်ပစ္စည်းများ ရှိပြီးသားဖြစ်၍ နမူနာဒေတာ မထည့်ပါ');
      S.tx(() => {
        const cats = {};
        ['စားသောက်ကုန်', 'အဖျော်ယမကာ', 'အိမ်သုံးပစ္စည်း'].forEach((n) => { cats[n] = SS.Categories.add({ name: n, description: '' }).id; });
        const sup = SS.Suppliers.add({ name: 'မင်္ဂလာ လက်ကား', phone: '09-123456789', address: 'ရန်ကုန်', contactPerson: 'ဦးမောင်', notes: '' });
        SS.Customers.add({ name: 'ဒေါ်မြင့်', phone: '09-987654321', address: '', notes: '' });
        const unit = Settings.get().units;
        const list = [
          ['ကော်ဖီမစ် (Coffee 3in1)', 'စားသောက်ကုန်', unit[1].name, 2800, 3500, 40], ['ခေါက်ဆွဲခြောက်', 'စားသောက်ကုန်', unit[1].name, 450, 600, 120],
          ['ဆန် ၁ ပြည်', 'စားသောက်ကုန်', unit[4].name, 2400, 2800, 60, true], ['ရေသန့်ဘူး 1L', 'အဖျော်ယမကာ', unit[3].name, 300, 500, 80],
          ['Coca-Cola 330ml', 'အဖျော်ယမကာ', unit[3].name, 700, 1000, 48], ['ဆပ်ပြာမှုန့် 500g', 'အိမ်သုံးပစ္စည်း', unit[1].name, 1800, 2400, 18],
          ['သွားတိုက်ဆေး', 'အိမ်သုံးပစ္စည်း', unit[0].name, 1500, 2000, 4], ['မီးခြစ်', 'အိမ်သုံးပစ္စည်း', unit[0].name, 150, 300, 0]
        ];
        list.forEach((r) => SS.Products.create({ name: r[0], categoryId: cats[r[1]], unit: r[2], cost: r[3], price: r[4], lowStock: 5, supplierId: sup.id, decimal: !!r[6] }, r[5]));
      });
    }
  };

  /* =========================== Settings page =========================== */
  SS.pages.settings = {
    title: 'ဆက်တင်များ',
    render(root) {
      const st = Settings.get();
      let logo = st.logo;
      const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
      const f = {
        shopName: h('input', { type: 'text', value: st.shopName, maxlength: 80 }),
        shopPhone: h('input', { type: 'tel', value: st.shopPhone, maxlength: 40 }),
        shopAddress: h('textarea', { value: st.shopAddress, maxlength: 250 }),
        currencyLabel: U.select([{ value: 'ကျပ်', label: 'ကျပ်' }, { value: 'MMK', label: 'MMK' }], st.currencyLabel),
        lowStockDefault: h('input', { type: 'number', min: 0, step: 1, value: st.lowStockDefault }),
        receiptFooter: h('textarea', { value: st.receiptFooter, maxlength: 250 }),
        receiptWidth: U.select([{ value: '58mm', label: '58mm (သေးငယ်)' }, { value: '80mm', label: '80mm (ပုံမှန်)' }, { value: 'A4', label: 'A4' }], st.receiptWidth),
        defaultPayment: U.select(Object.keys(SS.PAY).map((k) => ({ value: k, label: SS.PAY[k] })), st.defaultPayment),
        taxEnabled: h('input', { type: 'checkbox', checked: st.taxEnabled }),
        taxRate: h('input', { type: 'number', min: 0, max: 100, step: '0.01', value: st.taxRate }),
        allowCredit: h('input', { type: 'checkbox', checked: st.allowCredit }),
        allowDuplicateSku: h('input', { type: 'checkbox', checked: st.allowDuplicateSku }),
        dateFormat: U.select([{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }], st.dateFormat),
        theme: U.select([{ value: 'light', label: 'အလင်း (Light)' }, { value: 'dark', label: 'အမှောင် (Dark)' }], st.theme),
        expenseCategories: h('textarea', { value: st.expenseCategories.join('\n'), rows: 6 })
      };
      const logoPrev = h('div');
      const drawLogo = () => { U.clear(logoPrev); if (logo) logoPrev.appendChild(h('img', { src: logo, alt: 'Logo', style: 'max-height:60px;border-radius:8px' })); };
      drawLogo();
      const logoIn = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp', onChange: async () => {
        const file = logoIn.files[0]; if (!file) return;
        try { logo = await U.readImage(file, 200); drawLogo(); } catch (e) { U.toast(e.message, 'error'); }
      } });
      const unitsBox = h('div');
      let units = st.units.map((u) => Object.assign({}, u));
      const drawUnits = () => {
        U.clear(unitsBox);
        units.forEach((u, i) => unitsBox.appendChild(h('div', { class: 'row', style: 'margin-bottom:6px' }, h('span', { class: 'grow' }, u.name), u.decimal ? U.badge('ဒသမ ခွင့်ပြု', 'info') : null,
          h('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'aria-label': 'ယူနစ်ဖယ်ရန်', onClick: () => { units.splice(i, 1); drawUnits(); } }, '✕'))));
        const nu = h('input', { type: 'text', placeholder: 'ယူနစ်အသစ်', maxlength: 30 }), dc = h('input', { type: 'checkbox' });
        unitsBox.appendChild(h('div', { class: 'row' }, nu, h('label', { class: 'check' }, dc, 'ဒသမ'), h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => {
          const n = nu.value.trim(); if (!n) return; if (units.some((u) => u.name.toLowerCase() === n.toLowerCase())) return U.toast('ယူနစ် ထပ်နေသည်', 'error');
          units.push({ name: n, decimal: dc.checked }); drawUnits();
        } }, '+ ထည့်')));
      };
      drawUnits();

      function save() {
        U.formError(err, '');
        const low = U.parseNum(f.lowStockDefault.value), tax = U.parseNum(f.taxRate.value);
        const cats = f.expenseCategories.value.split('\n').map((x) => x.trim()).filter(Boolean);
        const errs = [];
        if (!f.shopName.value.trim()) errs.push('ဆိုင်အမည် ထည့်ပါ');
        if (!Number.isInteger(low) || low < 0) errs.push('Low-stock threshold သည် ၀ နှင့်အထက် ကိန်းပြည့်ဖြစ်ရမည်');
        if (!(tax >= 0 && tax <= 100)) errs.push('အခွန်နှုန်း ၀–၁၀၀ ကြား ဖြစ်ရမည်');
        if (!cats.length) errs.push('အသုံးစရိတ် အမျိုးအစား အနည်းဆုံး ၁ ခု လိုသည်');
        if (!units.length) errs.push('ယူနစ် အနည်းဆုံး ၁ ခု လိုသည်');
        if (errs.length) return U.formError(err, errs.join('\n'));
        try {
          Settings.set({ shopName: f.shopName.value.trim(), shopPhone: f.shopPhone.value.trim(), shopAddress: f.shopAddress.value.trim(), logo, currencyLabel: f.currencyLabel.value,
            lowStockDefault: low, receiptFooter: f.receiptFooter.value.trim(), receiptWidth: f.receiptWidth.value, defaultPayment: f.defaultPayment.value, taxEnabled: f.taxEnabled.checked,
            taxRate: tax, allowCredit: f.allowCredit.checked, allowDuplicateSku: f.allowDuplicateSku.checked, dateFormat: f.dateFormat.value, theme: f.theme.value, expenseCategories: cats, units });
          U.toast('ဆက်တင်များ သိမ်းဆည်းပြီးပါပြီ', 'success'); SS.refreshShell && SS.refreshShell();
        } catch (e) { U.formError(err, e.message); }
      }

      const danger = h('div', { class: 'card', style: 'border-color:var(--err)' }, h('h3', { style: 'color:var(--err)' }, 'ဒေတာ ပြန်လည်သတ်မှတ်ခြင်း (Reset)'),
        h('p', { class: 'muted' }, 'ကုန်ပစ္စည်း၊ ရောင်းချမှု၊ ဝယ်ယူမှု စသည့် ဒေတာအားလုံးကို ဖျက်ပါမည်။ ပြန်ယူ၍မရနိုင်ပါ။ ဦးစွာ Backup ဒေါင်းလုဒ်လုပ်ထားရန် အသိပေးပါသည်။'),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn btn-ghost', onClick: () => SS.go('backup') }, 'Backup စာမျက်နှာသို့'), h('button', { type: 'button', class: 'btn btn-danger', onClick: resetFlow }, 'ဒေတာအားလုံး ဖျက်မည်…')));
      function resetFlow() {
        const word = h('input', { type: 'text', placeholder: 'RESET', autocomplete: 'off' }), ack = h('input', { type: 'checkbox' });
        const e2 = h('div', { class: 'form-error', role: 'alert', hidden: true });
        U.modal({ title: 'ဒေတာအားလုံး ဖျက်ရန် အတည်ပြုပါ', size: 'sm', body: [e2, h('p', null, 'ဤလုပ်ဆောင်ချက်သည် ပြန်ယူ၍မရပါ။ မဖျက်မီ Backup ဒေါင်းလုဒ်လုပ်ရန် အကြံပြုပါသည်။'),
          h('label', { class: 'check', style: 'margin:10px 0' }, ack, 'Backup ကို ကျွန်ုပ် ဒေါင်းလုဒ်လုပ်ပြီးပြီ / မလိုအပ်ပါ'), U.field('အတည်ပြုရန် "RESET" ဟု ရိုက်ပါ', word)],
          buttons: [{ label: 'မလုပ်တော့ပါ' }, { label: 'ဖျက်မည်', class: 'btn-danger', close: false, onClick: (ev, close) => {
            if (word.value !== 'RESET' || !ack.checked) { U.formError(e2, '"RESET" ရိုက်ပြီး အကွက်ကို အမှန်ခြစ်ပါ'); return false; }
            try { S.snapshotNow(); S.resetAll(); Settings.init(); SS.seed(); close(); U.toast('ဒေတာအားလုံး ဖျက်ပြီးပါပြီ', 'success'); SS.go('dashboard'); SS.refreshShell && SS.refreshShell(); } catch (er) { U.formError(e2, er.message); return false; }
          } }] });
      }
      const demo = !S.all('products').length ? h('div', { class: 'card' }, h('h3', null, 'နမူနာဒေတာ (စမ်းသပ်ရန်သာ)'), h('p', { class: 'muted' }, 'ကုန်ပစ္စည်း ၈ မျိုး၊ အမျိုးအစား ၃ ခု၊ ပေးသွင်းသူ ၁ ဦး၊ ဖောက်သည် ၁ ဦး ထည့်ပေးပါမည်။ စမ်းသပ်ပြီးပါက Reset ဖြင့် ဖယ်ရှားနိုင်သည်။'),
        h('button', { type: 'button', class: 'btn btn-ghost', onClick: async () => { if (!await U.confirm('နမူနာဒေတာ ထည့်မလား?')) return; try { SS.Demo.load(); U.toast('နမူနာဒေတာ ထည့်ပြီးပါပြီ', 'success'); SS.refresh(); } catch (e) { U.toast(e.message, 'error'); } } }, 'နမူနာဒေတာ ထည့်မည်')) : null;

      root.appendChild(U.pageHeader('ဆက်တင်များ', 'ဆိုင်အချက်အလက်၊ ပြသမှု၊ ဘောက်ချာနှင့် စနစ်ရွေးချယ်မှုများ', [h('button', { type: 'button', class: 'btn btn-primary', onClick: save }, 'သိမ်းဆည်းမည်')]));
      root.appendChild(h('div', { class: 'stack' }, err,
        h('div', { class: 'card' }, h('h3', null, 'ဆိုင်အချက်အလက်'), h('div', { class: 'form-grid' },
          U.field('ဆိုင်အမည်', f.shopName, { required: true }), U.field('ဖုန်းနံပါတ်', f.shopPhone), U.field('လိပ်စာ', f.shopAddress, { class: 'full' }),
          h('div', { class: 'field full' }, h('label', null, 'ဆိုင်လိုဂို (ရွေးချယ်ရန်)'), logoIn, logoPrev, h('small', { class: 'hint' }, 'ပုံကို လျှော့ချပြီး ဤ browser တွင်သာ သိမ်းပါသည်'),
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', style: 'align-self:flex-start', onClick: () => { logo = ''; logoIn.value = ''; drawLogo(); } }, 'လိုဂို ဖယ်ရန်')))),
        h('div', { class: 'card' }, h('h3', null, 'ငွေကြေးနှင့် ဆိုင်ဆိုင်ရာ'), h('div', { class: 'form-grid' },
          U.field('ငွေကြေး ပြသမည့်စာလုံး', f.currencyLabel, { hint: 'တန်ဖိုးကို MMK ကိန်းပြည့်ဖြင့်သာ သိမ်းသည်၊ ငွေကြေး မပြောင်းလဲပါ' }), U.field('Low-stock မူလအရေအတွက်', f.lowStockDefault),
          U.field('မူလ ငွေပေးချေမှုနည်းလမ်း', f.defaultPayment), U.field('ရက်စွဲပုံစံ', f.dateFormat), U.field('အခွန်နှုန်း (%)', f.taxRate, { hint: 'အောက်ပါ "အခွန်သုံးမည်" ကို ဖွင့်မှသာ POS တွင် တွက်မည်' }),
          h('div', { class: 'field' }, h('label', { class: 'check' }, f.taxEnabled, 'အခွန်သုံးမည် (မူလ ပိတ်ထား)'), h('label', { class: 'check', style: 'margin-top:8px' }, f.allowCredit, 'အကြွေးရောင်းချမှု ခွင့်ပြုမည်'), h('label', { class: 'check', style: 'margin-top:8px' }, f.allowDuplicateSku, 'SKU ထပ်ခြင်း ခွင့်ပြုမည်')),
          U.field('Theme', f.theme))),
        h('div', { class: 'card' }, h('h3', null, 'ဘောက်ချာ'), h('div', { class: 'form-grid' }, U.field('စာရွက်အကျယ်', f.receiptWidth), U.field('ဘောက်ချာ အောက်ခြေစာသား', f.receiptFooter))),
        h('div', { class: 'grid g2' }, h('div', { class: 'card' }, h('h3', null, 'ယူနစ်များ'), unitsBox), h('div', { class: 'card' }, h('h3', null, 'အသုံးစရိတ် အမျိုးအစားများ'), U.field('တစ်ကြောင်းလျှင် တစ်မျိုး', f.expenseCategories))),
        demo, danger));
    }
  };

  /* =========================== Backup & Restore page =========================== */
  SS.pages.backup = {
    title: 'ဒေတာ Backup / Restore',
    render(root) {
      const meta = S.obj('meta');
      const usage = S.usage();
      const pct = Math.round(usage.ratio * 100);
      const stamp = () => U.dayKey(new Date()) + '_' + U.pad(new Date().getHours()) + U.pad(new Date().getMinutes());
      const exportBox = h('div', { class: 'stack' });

      function doBackup() {
        try {
          const snap = S.exportAll();
          const text = JSON.stringify(snap, null, 1);
          if (!text || text.length < 20) throw new Error('Backup အလွတ် ဖြစ်နေသည်');
          U.download(`smartstock-backup-${stamp()}.json`, text, 'application/json');
          S.setMeta({ lastBackupAt: snap.createdAt });
          U.toast('Backup ဖိုင်ကို ဒေါင်းလုဒ်စတင်ပြီးပါပြီ။ Downloads ဖိုလ်ဒါတွင် ရှိ/မရှိ စစ်ပါ (browser က သိမ်းဆည်းမှုကို အတည်မပြုနိုင်ပါ)။', 'success', 7000);
          SS.refresh();
        } catch (e) { U.toast('Backup မအောင်မြင်ပါ: ' + e.message, 'error'); }
      }
      const csvBtn = (label, fn, name) => h('button', { type: 'button', class: 'btn btn-ghost', onClick: () => { try { U.download(`smartstock-${name}-${stamp()}.csv`, fn(), 'text/csv'); } catch (e) { U.toast(e.message, 'error'); } } }, label);

      /* restore */
      const fileIn = h('input', { type: 'file', accept: '.json,application/json' });
      const preview = h('div');
      let validated = null;
      fileIn.addEventListener('change', async () => {
        U.clear(preview); validated = null;
        const file = fileIn.files[0]; if (!file) return;
        if (!/\.json$/i.test(file.name) && file.type !== 'application/json') return preview.appendChild(h('div', { class: 'form-error' }, 'JSON ဖိုင် (.json) သာ ရွေးပါ'));
        if (file.size > 40 * 1024 * 1024) return preview.appendChild(h('div', { class: 'form-error' }, 'ဖိုင် ကြီးလွန်းသည် (40MB ထက်ကျော်)'));
        let text; try { text = await U.readText(file); } catch (e) { return preview.appendChild(h('div', { class: 'form-error' }, e.message)); }
        validated = S.parseBackupText(text);
        showPreview(validated, 'ဖိုင်: ' + file.name);
      });
      function showPreview(v, from) {
        U.clear(preview);
        if (!v.ok) { preview.appendChild(h('div', { class: 'form-error', role: 'alert' }, 'ဤဖိုင်ကို restore မလုပ်နိုင်ပါ။ လက်ရှိဒေတာ မပြောင်းလဲပါ။\n' + v.errors.join('\n'))); return; }
        const sm = v.summary, labels = { products: 'ကုန်ပစ္စည်း', categories: 'အမျိုးအစား', sales: 'ရောင်းချမှု', purchases: 'ဝယ်ယူမှု', suppliers: 'ပေးသွင်းသူ', customers: 'ဖောက်သည်', expenses: 'အသုံးစရိတ်', stockMovements: 'စတော့လှုပ်ရှားမှု', payments: 'ငွေပေးချေမှု' };
        const ack = h('input', { type: 'checkbox' });
        const go = h('button', { type: 'button', class: 'btn btn-danger', disabled: true, onClick: () => doRestore(v) }, 'လက်ရှိဒေတာကို အစားထိုး restore လုပ်မည်');
        ack.addEventListener('change', () => { go.disabled = !ack.checked; });
        preview.appendChild(h('div', { class: 'card', style: 'margin-top:12px' }, h('h3', null, 'Backup အကျဉ်းချုပ် ' + (from ? '— ' + from : '')),
          h('dl', { class: 'kv' }, h('dt', null, 'ဆိုင်'), h('dd', null, sm.shopName || '—'), h('dt', null, 'ဖန်တီးချိန်'), h('dd', null, sm.createdAt ? U.fmtDateTime(sm.createdAt) : '—'), h('dt', null, 'Schema'), h('dd', null, 'v' + sm.schemaVersion + (sm.schemaVersion < S.SCHEMA_VERSION ? ' (migrate လုပ်မည်)' : ''))),
          U.table([{ label: 'ဒေတာ', render: (r) => labels[r[0]] }, { label: 'အရေအတွက်', class: 'num', render: (r) => U.fmtNum(r[1]) }, { label: 'လက်ရှိ', class: 'num', render: (r) => U.fmtNum(S.all(r[0]).length) }], Object.entries(sm.counts)),
          v.warnings.length ? h('div', { class: 'form-warn', style: 'margin-top:10px' }, v.warnings.join('\n')) : null,
          h('div', { class: 'form-warn', style: 'margin-top:10px' }, 'Restore လုပ်လျှင် လက်ရှိဒေတာအားလုံးကို အစားထိုးမည်။ မလုပ်မီ လက်ရှိဒေတာ၏ snapshot ကို browser ထဲတွင် သိမ်းပြီး backup ဖိုင်လည်း ဒေါင်းလုဒ်လုပ်ပေးမည်။'),
          h('label', { class: 'check', style: 'margin:10px 0' }, ack, 'နားလည်ပါပြီ၊ လက်ရှိဒေတာကို အစားထိုးရန် သဘောတူသည်'), go));
      }
      async function doRestore(v) {
        // 1) automatic backup of the current data (verified read-back) — abort if it cannot be made
        const snap = S.snapshotNow();
        let cont = snap.ok;
        if (!snap.ok) cont = await U.confirm('လက်ရှိဒေတာ၏ အလိုအလျောက် snapshot ကို browser ထဲ သိမ်း၍မရပါ (' + snap.error + ')။\nbackup ဖိုင်ကို သင်ကိုယ်တိုင် ဒေါင်းလုဒ်လုပ်ပြီးပါပြီလား? ဆက်လုပ်မလား?', { danger: true, confirmLabel: 'ဆက်လုပ်မည်' });
        if (!cont) return;
        try { U.download(`smartstock-before-restore-${stamp()}.json`, JSON.stringify(S.exportAll()), 'application/json'); } catch (_) { /* download is best effort */ }
        try {
          S.restore(v); SS.Settings.init(); SS.seed();
          U.toast('Restore အောင်မြင်ပါသည်။ ' + (snap.ok ? 'မလုပ်မီ ဒေတာကို snapshot အဖြစ် သိမ်းထားသည်။' : ''), 'success', 7000);
          SS.refreshShell && SS.refreshShell(); SS.go('dashboard');
        } catch (e) { U.toast('Restore မအောင်မြင်ပါ — လက်ရှိဒေတာကို မူလအတိုင်း ပြန်ထားပါသည်: ' + e.message, 'error'); }
      }
      const snapInfo = S.getSnapshot();
      const lastBackup = meta.lastBackupAt;
      const old = !lastBackup || (Date.now() - new Date(lastBackup).getTime()) > 7 * 864e5;

      root.appendChild(U.pageHeader('ဒေတာ Backup / Restore', 'Browser ဒေတာ ပျောက်ဆုံးနိုင်သဖြင့် Backup ကို မှန်မှန်လုပ်ပါ', []));
      root.appendChild(h('div', { class: 'stack' },
        h('div', { class: 'form-warn' }, 'သတိပြုရန်: ဒေတာကို ဤကွန်ပျူတာ၏ ဤ browser profile ထဲတွင်သာ သိမ်းသည်။ Browser ဒေတာ ရှင်းလိုက်လျှင်၊ browser/ကွန်ပျူတာ ပြောင်းလျှင် ပျောက်နိုင်သည်။ ကွန်ပျူတာများအကြား အလိုအလျောက် ချိတ်ဆက်မပေးပါ။ Backup JSON ဖိုင်ကို USB/Cloud တွင် သိမ်းပါ။'),
        h('div', { class: 'grid g2' },
          h('div', { class: 'card' }, h('h3', null, 'Backup ထုတ်ရန်'), h('p', { class: 'muted' }, 'ဒေတာအားလုံး (ကုန်ပစ္စည်း၊ ရောင်းချမှု၊ ဝယ်ယူမှု၊ ဆက်တင် …) ကို JSON ဖိုင်တစ်ခုအဖြစ် ဒေါင်းလုဒ်လုပ်သည်။'),
            h('p', { class: old ? 'form-warn' : 'muted' }, lastBackup ? 'နောက်ဆုံး backup ဒေါင်းလုဒ်စတင်ချိန်: ' + U.fmtDateTime(lastBackup) : 'Backup မလုပ်ရသေးပါ'),
            h('button', { type: 'button', class: 'btn btn-primary', onClick: doBackup }, 'Backup JSON ဒေါင်းလုဒ်လုပ်မည်')),
          h('div', { class: 'card' }, h('h3', null, 'CSV ထုတ်ယူရန်'), h('p', { class: 'muted' }, 'Excel/Google Sheets တွင် ဖွင့်နိုင်သော CSV ဖိုင်များ (Burmese Unicode ပါ)။ အစီရင်ခံစာ CSV ကို Reports စာမျက်နှာတွင် ထုတ်ပါ။'),
            h('div', { class: 'row' }, csvBtn('ကုန်ပစ္စည်း', () => SS.Products.toCSV(), 'products'), csvBtn('စတော့လက်ကျန်', () => SS.Products.stockCSV(), 'stock'), csvBtn('ရောင်းချမှု', () => SS.Sales.toCSV(), 'sales'), csvBtn('စတော့လှုပ်ရှားမှု', () => SS.Inventory.toCSV(), 'stock-movements')))),
        h('div', { class: 'card' }, h('h3', null, 'Backup မှ ပြန်ယူရန် (Restore)'), h('p', { class: 'muted' }, 'SmartStock backup JSON ဖိုင်ကို ရွေးပါ။ အတည်ပြုမီ အကျဉ်းချုပ်ကို ကြည့်နိုင်သည်၊ မမှန်သောဖိုင်များကို ပယ်ချပြီး လက်ရှိဒေတာကို မထိခိုက်ပါ။'),
          U.field('Backup ဖိုင်', fileIn), preview,
          snapInfo ? h('div', { style: 'margin-top:14px;border-top:1px solid var(--border);padding-top:12px' }, h('p', { class: 'muted small' }, 'Restore/Reset မလုပ်မီ browser ထဲ သိမ်းထားသော နောက်ဆုံး snapshot: ' + U.fmtDateTime(snapInfo.createdAt)),
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => { const v = S.validateBackup(snapInfo); validated = v; showPreview(v, 'အလိုအလျောက် snapshot'); } }, 'ထို snapshot ကို ပြန်ကြည့်/restore လုပ်မည်')) : null),
        h('div', { class: 'card' }, h('h3', null, 'Browser သိုလှောင်မှု'), h('div', { class: 'meter ' + (pct > 90 ? 'err' : pct > 70 ? 'warn' : ''), role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('span', { style: 'width:' + Math.min(100, pct) + '%' })),
          h('p', { class: 'muted small' }, `ခန့်မှန်း ${U.fmtNum(Math.round(usage.bytes / 1024))} KB အသုံးပြုထား (browser ကန့်သတ်ချက် ~၅MB ဟု ယူဆထားသည်၊ ${pct}%)။ ` + (pct > 70 ? 'နေရာ နည်းလာပါပြီ — Backup လုပ်ပြီး ပုံများကို လျှော့ပါ။' : ''))),
        h('div', { class: 'card' }, h('h3', null, 'ဒေတာပျက်စီးလျှင် ပြန်လည်ဆောင်ရွက်ရန်'), h('ol', { class: 'muted' },
          h('li', null, 'အပေါ်ရှိ နောက်ဆုံး Backup JSON ကို Restore လုပ်ပါ။'), h('li', null, 'ပျက်စီးသော ဒေတာကို အက်ပ်က "smartstock:corrupt:…" key အောက်တွင် မူရင်းအတိုင်း သိမ်းထားသည် (browser DevTools → Application → Local Storage တွင် ကြည့်နိုင်)။'),
          h('li', null, 'Backup မရှိလျှင် ဆက်တင်ထဲမှ Reset ဖြင့် အသစ်ပြန်စနိုင်သည်။')))));
    }
  };
})();

;
/* SmartStock — categories.js : category logic + page */
(function () {
  'use strict';
  const SS = window.SS, S = SS.Storage, U = SS.U, h = U.h;
  const C = (SS.Categories = {});

  C.all = () => S.all('categories');
  C.active = () => C.all().filter((c) => c.status === 'active');
  C.get = (id) => S.byId('categories', id);
  C.name = (id) => { const c = C.get(id); return c ? c.name : '—'; };
  C.productCount = (id) => S.all('products').filter((p) => p.categoryId === id).length;
  C.validate = function (data, id) {
    const name = String(data.name || '').trim();
    if (!name) return 'အမျိုးအစားအမည် ထည့်ပါ';
    if (name.length > 80) return 'အမည် ရှည်လွန်းသည် (၈၀ လုံးအထိ)';
    if (C.all().some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) return 'ဤအမည်ဖြင့် အမျိုးအစား ရှိပြီးသားဖြစ်သည်';
    return null;
  };
  C.add = (data) => S.tx(() => {
    const err = C.validate(data); if (err) throw new Error(err);
    const now = U.nowISO();
    const c = { id: U.uid('cat'), name: data.name.trim(), description: String(data.description || '').trim(), status: 'active', createdAt: now, updatedAt: now };
    C.all().push(c); S.save('categories'); return c;
  });
  C.update = (id, data) => S.tx(() => {
    const c = C.get(id); if (!c) throw new Error('အမျိုးအစား ရှာမတွေ့ပါ');
    const err = C.validate(data, id); if (err) throw new Error(err);
    c.name = data.name.trim(); c.description = String(data.description || '').trim(); c.updatedAt = U.nowISO();
    S.save('categories'); return c;
  });
  C.setStatus = (id, status) => S.tx(() => {
    const c = C.get(id); if (!c) throw new Error('အမျိုးအစား ရှာမတွေ့ပါ');
    if (status === 'archived' && C.active().length <= 1) throw new Error('နောက်ဆုံး အမျိုးအစားကို archive မလုပ်နိုင်ပါ');
    c.status = status; c.updatedAt = U.nowISO(); S.save('categories');
  });
  C.remove = (id) => S.tx(() => {
    if (C.productCount(id)) throw new Error('ကုန်ပစ္စည်းများ ချိတ်ထားသော အမျိုးအစားကို မဖျက်နိုင်ပါ။ ဦးစွာ ကုန်ပစ္စည်းများကို ရွှေ့ပါ သို့မဟုတ် archive လုပ်ပါ');
    const i = C.all().findIndex((c) => c.id === id); if (i < 0) throw new Error('ရှာမတွေ့ပါ');
    C.all().splice(i, 1); S.save('categories');
  });
  C.reassign = (fromId, toId) => S.tx(() => {
    if (fromId === toId || !C.get(toId)) throw new Error('ပစ်မှတ်အမျိုးအစား မမှန်ပါ');
    let n = 0; const now = U.nowISO();
    S.all('products').forEach((p) => { if (p.categoryId === fromId) { p.categoryId = toId; p.updatedAt = now; n++; } });
    S.save('products'); return n;
  });

  const state = { q: '', status: 'active' };
  function form(existing) {
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    const name = h('input', { type: 'text', value: existing ? existing.name : '', maxlength: 80 });
    const desc = h('textarea', { value: existing ? existing.description : '', maxlength: 300 });
    U.modal({
      title: existing ? 'အမျိုးအစား ပြင်ဆင်ရန်' : 'အမျိုးအစား အသစ်', size: 'sm', body: [err, U.field('အမည်', name, { required: true }), U.field('ဖော်ပြချက်', desc)],
      buttons: [{ label: 'မလုပ်တော့ပါ' }, { label: 'သိမ်းမည်', class: 'btn-primary', close: false, onClick: (e, close) => {
        try { existing ? C.update(existing.id, { name: name.value, description: desc.value }) : C.add({ name: name.value, description: desc.value }); close(); U.toast('သိမ်းဆည်းပြီးပါပြီ', 'success'); SS.refresh(); }
        catch (er) { U.formError(err, er.message); name.setAttribute('aria-invalid', 'true'); return false; }
      } }]
    });
  }
  function reassignForm(c) {
    const others = C.active().filter((x) => x.id !== c.id);
    if (!others.length) return U.toast('ရွှေ့ရန် အခြားအမျိုးအစား မရှိပါ', 'error');
    const sel = U.select(others.map((x) => ({ value: x.id, label: x.name })));
    U.modal({ title: `"${c.name}" ရှိ ကုန်ပစ္စည်း ${C.productCount(c.id)} မျိုးကို ရွှေ့ရန်`, size: 'sm', body: U.field('ပစ်မှတ်အမျိုးအစား', sel),
      buttons: [{ label: 'မလုပ်တော့ပါ' }, { label: 'ရွှေ့မည်', class: 'btn-primary', close: false, onClick: (e, close) => {
        try { const n = C.reassign(c.id, sel.value); close(); U.toast(`ကုန်ပစ္စည်း ${n} မျိုး ရွှေ့ပြီးပါပြီ`, 'success'); SS.refresh(); } catch (er) { U.toast(er.message, 'error'); return false; }
      } }] });
  }

  SS.pages.categories = {
    title: 'အမျိုးအစားများ',
    render(root) {
      const out = h('div');
      const draw = () => {
        U.clear(out);
        const q = state.q.trim().toLowerCase();
        const rows = C.all().filter((c) => (state.status === 'all' || c.status === state.status) && (!q || c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q))).sort((a, b) => a.name.localeCompare(b.name));
        if (!rows.length) return out.appendChild(U.empty('အမျိုးအစား မတွေ့ပါ', 'အပေါ်ရှိ "အမျိုးအစားအသစ်" ခလုတ်ဖြင့် ထည့်ပါ'));
        out.appendChild(U.table([
          { label: 'အမည်', render: (c) => h('strong', null, c.name) }, { label: 'ဖော်ပြချက်', render: (c) => c.description || '—' },
          { label: 'ကုန်ပစ္စည်း', class: 'num', render: (c) => U.fmtNum(C.productCount(c.id)) },
          { label: 'အခြေအနေ', render: (c) => U.badge(c.status === 'active' ? 'သုံးနေသည်' : 'Archived', c.status === 'active' ? 'ok' : 'muted') },
          { label: '', class: 'actions', render: (c) => [
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => form(c) }, 'ပြင်'),
            C.productCount(c.id) ? h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => reassignForm(c) }, 'ပစ္စည်းရွှေ့') : null,
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: async () => {
              const arch = c.status === 'active';
              if (arch && !await U.confirm(`"${c.name}" ကို archive လုပ်မလား?` + (C.productCount(c.id) ? `\n(ကုန်ပစ္စည်း ${C.productCount(c.id)} မျိုး ဆက်ရှိနေမည်၊ အသစ်ထည့်ရာတွင် ရွေး၍မရတော့ပါ)` : ''))) return;
              try { C.setStatus(c.id, arch ? 'archived' : 'active'); SS.refresh(); } catch (er) { U.toast(er.message, 'error'); }
            } }, c.status === 'active' ? 'Archive' : 'ပြန်ဖွင့်'),
            C.productCount(c.id) === 0 ? h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: async () => { if (await U.confirm(`"${c.name}" ကို အပြီးဖျက်မလား?`, { danger: true, confirmLabel: 'ဖျက်မည်' })) { try { C.remove(c.id); U.toast('ဖျက်ပြီးပါပြီ', 'success'); SS.refresh(); } catch (er) { U.toast(er.message, 'error'); } } } }, 'ဖျက်') : null] }
        ], rows));
      };
      const search = h('input', { type: 'search', class: 'grow', placeholder: 'အမျိုးအစား ရှာရန်…', 'aria-label': 'ရှာရန်', value: state.q, onInput: (e) => { state.q = e.target.value; draw(); } });
      const sel = U.select([{ value: 'active', label: 'သုံးနေသည်' }, { value: 'archived', label: 'Archived' }, { value: 'all', label: 'အားလုံး' }], state.status, { 'aria-label': 'အခြေအနေ', onChange: (e) => { state.status = e.target.value; draw(); } });
      root.appendChild(U.pageHeader('အမျိုးအစားများ', 'ကုန်ပစ္စည်းများကို အမျိုးအစားခွဲ၍ စီမံရန်', [h('button', { type: 'button', class: 'btn btn-primary', onClick: () => form(null) }, '+ အမျိုးအစားအသစ်')]));
      root.appendChild(h('div', { class: 'card' }, h('div', { class: 'toolbar' }, search, sel), out));
      draw();
    }
  };
})();

;
/* SmartStock — suppliers.js : supplier logic, supplier payments, page */
(function () {
  'use strict';
  const SS = window.SS, S = SS.Storage, U = SS.U, h = U.h;
  const Sup = (SS.Suppliers = {});

  Sup.all = () => S.all('suppliers');
  Sup.active = () => Sup.all().filter((s) => s.status === 'active');
  Sup.get = (id) => S.byId('suppliers', id);
  Sup.name = (id) => { const s = Sup.get(id); return s ? s.name : '—'; };
  Sup.purchases = (id) => S.all('purchases').filter((p) => p.supplierId === id);
  Sup.payable = (id) => U.sum(Sup.purchases(id), (p) => SS.Purchases.balanceOf(p));
  Sup.payments = (id) => S.all('payments').filter((p) => p.partyType === 'supplier' && p.partyId === id).sort((a, b) => (a.at < b.at ? 1 : -1));
  function clean(d) {
    const c = { name: String(d.name || '').trim(), phone: String(d.phone || '').trim(), address: String(d.address || '').trim(), contactPerson: String(d.contactPerson || '').trim(), notes: String(d.notes || '').trim() };
    if (!c.name) throw new Error('ပေးသွင်းသူအမည် ထည့်ပါ');
    if (c.name.length > 100) throw new Error('အမည် ရှည်လွန်းသည်');
    if (c.phone && !/^[0-9+\-\s()]{5,25}$/.test(U.normDigits(c.phone))) throw new Error('ဖုန်းနံပါတ် မမှန်ပါ');
    return c;
  }
  Sup.add = (d) => S.tx(() => { const c = clean(d), now = U.nowISO(); const s = Object.assign({ id: U.uid('sup'), status: 'active', createdAt: now, updatedAt: now }, c); Sup.all().push(s); S.save('suppliers'); return s; });
  Sup.update = (id, d) => S.tx(() => { const s = Sup.get(id); if (!s) throw new Error('ရှာမတွေ့ပါ'); Object.assign(s, clean(d), { updatedAt: U.nowISO() }); S.save('suppliers'); return s; });
  Sup.setStatus = (id, status) => S.tx(() => {
    const s = Sup.get(id); if (!s) throw new Error('ရှာမတွေ့ပါ');
    if (status === 'archived' && Sup.payable(id) > 0) throw new Error('ပေးရန်ကျန်ငွေ ရှိသေးသဖြင့် archive မလုပ်နိုင်ပါ');
    s.status = status; s.updatedAt = U.nowISO(); S.save('suppliers');
  });
  // Pays down supplier balance, oldest confirmed purchase first (or one specific purchase).
  Sup.pay = (supplierId, amount, method, note, purchaseId) => S.tx(() => {
    if (!Sup.get(supplierId)) throw new Error('ပေးသွင်းသူ ရှာမတွေ့ပါ');
    if (!Number.isInteger(amount) || amount <= 0) throw new Error('ငွေပမာဏသည် ၁ ကျပ်နှင့်အထက် ကိန်းပြည့် ဖြစ်ရမည်');
    if (!SS.PAY[method]) throw new Error('ငွေပေးချေမှုနည်းလမ်း မမှန်ပါ');
    let list = Sup.purchases(supplierId).filter((p) => SS.Purchases.balanceOf(p) > 0).sort((a, b) => (a.date + a.number < b.date + b.number ? -1 : 1));
    if (purchaseId) list = list.filter((p) => p.id === purchaseId);
    const due = U.sum(list, (p) => SS.Purchases.balanceOf(p));
    if (amount > due) throw new Error(`ပေးရန်ကျန်ငွေ ${U.money(due)} ထက် ပိုပေး၍မရပါ`);
    let left = amount; const at = U.nowISO();
    for (const p of list) {
      if (left <= 0) break;
      const a = Math.min(left, SS.Purchases.balanceOf(p));
      p.paid += a; p.updatedAt = at; left -= a;
      S.all('payments').push({ id: U.uid('pay'), direction: 'out', partyType: 'supplier', partyId: supplierId, refType: 'purchase', refId: p.id, amount: a, method, note: note || '', at });
    }
    S.save('purchases'); S.save('payments');
    return amount;
  });

  // Reusable payment dialog (also used for customer receipts)
  SS.UI.paymentModal = function (o) {
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    const amt = h('input', { type: 'text', inputmode: 'numeric', value: o.defaultAmount != null ? String(o.defaultAmount) : '' });
    const method = U.select(Object.keys(SS.PAY).map((k) => ({ value: k, label: SS.PAY[k] })), SS.Settings.get().defaultPayment);
    const note = h('input', { type: 'text', maxlength: 200 });
    U.modal({ title: o.title, size: 'sm', body: [err, o.info ? h('p', { class: 'muted' }, o.info) : null, U.field('ငွေပမာဏ', amt, { required: true, hint: 'အများဆုံး ' + U.money(o.max) }), U.field('နည်းလမ်း', method), U.field('မှတ်ချက်', note)],
      buttons: [{ label: 'မလုပ်တော့ပါ' }, { label: 'မှတ်တမ်းတင်မည်', class: 'btn-primary', close: false, onClick: (e, close) => {
        const a = U.parseMoney(amt.value);
        if (!Number.isInteger(a) || a <= 0) { U.formError(err, 'ငွေပမာဏ မမှန်ပါ'); amt.setAttribute('aria-invalid', 'true'); return false; }
        if (a > o.max) { U.formError(err, `အများဆုံး ${U.money(o.max)} သာ ဖြစ်နိုင်သည်`); return false; }
        try { o.onSubmit(a, method.value, note.value.trim()); close(); U.toast('ငွေပေးချေမှု မှတ်တမ်းတင်ပြီးပါပြီ', 'success'); SS.refresh(); } catch (er) { U.formError(err, er.message); return false; }
      } }] });
  };

  function form(existing) {
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    const e = existing || {};
    const f = { name: h('input', { type: 'text', value: e.name || '', maxlength: 100 }), phone: h('input', { type: 'tel', value: e.phone || '' }), contactPerson: h('input', { type: 'text', value: e.contactPerson || '' }), address: h('textarea', { value: e.address || '' }), notes: h('textarea', { value: e.notes || '' }) };
    U.modal({ title: existing ? 'ပေးသွင်းသူ ပြင်ရန်' : 'ပေးသွင်းသူ အသစ်', body: [err, h('div', { class: 'form-grid' }, U.field('အမည်', f.name, { required: true }), U.field('ဖုန်း', f.phone), U.field('ဆက်သွယ်ရမည့်သူ', f.contactPerson), h('span'), U.field('လိပ်စာ', f.address, { class: 'full' }), U.field('မှတ်ချက်', f.notes, { class: 'full' }))],
      buttons: [{ label: 'မလုပ်တော့ပါ' }, { label: 'သိမ်းမည်', class: 'btn-primary', close: false, onClick: (ev, close) => {
        const d = { name: f.name.value, phone: f.phone.value, contactPerson: f.contactPerson.value, address: f.address.value, notes: f.notes.value };
        try { existing ? Sup.update(existing.id, d) : Sup.add(d); close(); U.toast('သိမ်းဆည်းပြီးပါပြီ', 'success'); SS.refresh(); } catch (er) { U.formError(err, er.message); return false; }
      } }] });
  }
  function detail(id) {
    const s = Sup.get(id); if (!s) return;
    const pays = Sup.purchases(id).sort((a, b) => (a.date < b.date ? 1 : -1)), due = Sup.payable(id);
    U.modal({ title: s.name, size: 'lg', body: h('div', { class: 'stack' },
      h('dl', { class: 'kv' }, h('dt', null, 'ဖုန်း'), h('dd', null, s.phone || '—'), h('dt', null, 'ဆက်သွယ်ရမည့်သူ'), h('dd', null, s.contactPerson || '—'), h('dt', null, 'လိပ်စာ'), h('dd', null, s.address || '—'), h('dt', null, 'မှတ်ချက်'), h('dd', null, s.notes || '—'), h('dt', null, 'ပေးရန်ကျန်ငွေ'), h('dd', null, h('strong', null, U.money(due)))),
      h('h4', null, 'ဝယ်ယူမှု မှတ်တမ်း'),
      pays.length ? U.table([{ label: 'နံပါတ်', key: 'number' }, { label: 'ရက်စွဲ', render: (p) => U.fmtDate(p.date) }, { label: 'စုစုပေါင်း', class: 'num', render: (p) => U.money(p.total) }, { label: 'ပေးပြီး', class: 'num', render: (p) => U.money(p.paid) }, { label: 'ကျန်', class: 'num', render: (p) => U.money(SS.Purchases.balanceOf(p)) }, { label: 'အခြေအနေ', render: (p) => U.badge(SS.PURCHASE_STATUS[p.status], p.status === 'confirmed' ? 'ok' : p.status === 'draft' ? 'warn' : 'muted') }], pays) : U.empty('ဝယ်ယူမှု မရှိသေးပါ'),
      h('h4', null, 'ငွေပေးချေမှု မှတ်တမ်း'),
      Sup.payments(id).length ? U.table([{ label: 'ရက်စွဲ', render: (p) => U.fmtDateTime(p.at) }, { label: 'ပမာဏ', class: 'num', render: (p) => U.money(p.amount) }, { label: 'နည်းလမ်း', render: (p) => SS.PAY[p.method] || p.method }, { label: 'မှတ်ချက်', render: (p) => p.note || '' }], Sup.payments(id)) : U.empty('ငွေပေးချေမှု မရှိသေးပါ')),
      buttons: [{ label: 'ပိတ်မည်' }, due > 0 ? { label: 'ငွေပေးချေမည်', class: 'btn-primary', close: false, onClick: () => SS.UI.paymentModal({ title: 'ပေးသွင်းသူသို့ ငွေပေးချေရန်', max: due, defaultAmount: due, info: s.name, onSubmit: (a, m, n) => Sup.pay(id, a, m, n) }) } : null].filter(Boolean) });
  }
  const state = { q: '', status: 'active' };
  SS.pages.suppliers = {
    title: 'ပေးသွင်းသူများ',
    render(root) {
      const out = h('div');
      const draw = () => {
        U.clear(out);
        const q = state.q.trim().toLowerCase();
        const rows = Sup.all().filter((s) => (state.status === 'all' || s.status === state.status) && (!q || (s.name + ' ' + s.phone + ' ' + s.contactPerson).toLowerCase().includes(q))).sort((a, b) => a.name.localeCompare(b.name));
        if (!rows.length) return out.appendChild(U.empty('ပေးသွင်းသူ မတွေ့ပါ'));
        out.appendChild(U.table([{ label: 'အမည်', render: (s) => h('strong', null, s.name) }, { label: 'ဖုန်း', render: (s) => s.phone || '—' }, { label: 'ဆက်သွယ်ရမည့်သူ', render: (s) => s.contactPerson || '—' },
          { label: 'ပေးရန်ကျန်ငွေ', class: 'num', render: (s) => { const d = Sup.payable(s.id); return d > 0 ? h('span', { style: 'color:var(--err)' }, U.money(d)) : U.money(0); } },
          { label: 'အခြေအနေ', render: (s) => U.badge(s.status === 'active' ? 'သုံးနေသည်' : 'Archived', s.status === 'active' ? 'ok' : 'muted') },
          { label: '', class: 'actions', render: (s) => [h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => detail(s.id) }, 'ကြည့်'), h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => form(s) }, 'ပြင်'),
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: async () => { const arch = s.status === 'active'; if (arch && !await U.confirm(`"${s.name}" ကို archive လုပ်မလား?`)) return; try { Sup.setStatus(s.id, arch ? 'archived' : 'active'); SS.refresh(); } catch (er) { U.toast(er.message, 'error'); } } }, s.status === 'active' ? 'Archive' : 'ပြန်ဖွင့်')] }], rows,
          { foot: [{ text: 'ပေးရန်ကျန်ငွေ စုစုပေါင်း' }, { text: '' }, { text: '' }, { class: 'num', text: U.money(U.sum(rows, (s) => Sup.payable(s.id))) }, { text: '' }, { text: '' }] }));
      };
      root.appendChild(U.pageHeader('ပေးသွင်းသူများ', 'ကုန်ပစ္စည်းပေးသွင်းသူများနှင့် ပေးရန်ကျန်ငွေ စီမံရန်', [h('button', { type: 'button', class: 'btn btn-primary', onClick: () => form(null) }, '+ ပေးသွင်းသူအသစ်')]));
      root.appendChild(h('div', { class: 'card' }, h('div', { class: 'toolbar' }, h('input', { type: 'search', class: 'grow', placeholder: 'အမည်/ဖုန်း ရှာရန်…', 'aria-label': 'ရှာရန်', value: state.q, onInput: (e) => { state.q = e.target.value; draw(); } }),
        U.select([{ value: 'active', label: 'သုံးနေသည်' }, { value: 'archived', label: 'Archived' }, { value: 'all', label: 'အားလုံး' }], state.status, { 'aria-label': 'အခြေအနေ', onChange: (e) => { state.status = e.target.value; draw(); } })), out));
      draw();
    }
  };
  SS.UI.supplierDetail = detail;
})();

;
/* SmartStock — customers.js : customer logic, credit receipts, page */
(function () {
  'use strict';
  const SS = window.SS, S = SS.Storage, U = SS.U, h = U.h;
  const Cu = (SS.Customers = {});
  const WALKIN = 'cust_walkin';
  Cu.WALKIN = WALKIN;

  Cu.all = () => S.all('customers');
  Cu.active = () => Cu.all().filter((c) => c.status === 'active');
  Cu.get = (id) => S.byId('customers', id);
  Cu.walkin = () => Cu.get(WALKIN);
  Cu.name = (id) => { const c = Cu.get(id); return c ? c.name : '—'; };
  Cu.sales = (id) => S.all('sales').filter((s) => s.customerId === id);
  Cu.totalPurchases = (id) => U.sum(Cu.sales(id), (s) => s.total - (s.refundTotal || 0));
  Cu.receivable = (id) => (id === WALKIN ? 0 : U.sum(Cu.sales(id), (s) => SS.Sales.balanceOf(s)));
  Cu.payments = (id) => S.all('payments').filter((p) => p.partyType === 'customer' && p.partyId === id).sort((a, b) => (a.at < b.at ? 1 : -1));
  function clean(d) {
    const c = { name: String(d.name || '').trim(), phone: String(d.phone || '').trim(), address: String(d.address || '').trim(), notes: String(d.notes || '').trim() };
    if (!c.name) throw new Error('ဖောက်သည်အမည် ထည့်ပါ');
    if (c.name.length > 100) throw new Error('အမည် ရှည်လွန်းသည်');
    if (c.phone && !/^[0-9+\-\s()]{5,25}$/.test(U.normDigits(c.phone))) throw new Error('ဖုန်းနံပါတ် မမှန်ပါ');
    return c;
  }
  Cu.add = (d) => S.tx(() => { const c = clean(d), now = U.nowISO(); const x = Object.assign({ id: U.uid('cus'), system: false, status: 'active', createdAt: now, updatedAt: now }, c); Cu.all().push(x); S.save('customers'); return x; });
  Cu.update = (id, d) => S.tx(() => { const x = Cu.get(id); if (!x) throw new Error('ရှာမတွေ့ပါ'); if (x.system) throw new Error('စနစ်ဖောက်သည်ကို မပြင်နိုင်ပါ'); Object.assign(x, clean(d), { updatedAt: U.nowISO() }); S.save('customers'); return x; });
  Cu.setStatus = (id, status) => S.tx(() => {
    const x = Cu.get(id); if (!x) throw new Error('ရှာမတွေ့ပါ'); if (x.system) throw new Error('Walk-in ဖောက်သည်ကို archive မလုပ်နိုင်ပါ');
    if (status === 'archived' && Cu.receivable(id) > 0) throw new Error('ရရန်ကျန်ငွေ ရှိသေးသဖြင့် archive မလုပ်နိုင်ပါ');
    x.status = status; x.updatedAt = U.nowISO(); S.save('customers');
  });
  // Customer pays down credit sales (oldest first, or a specific sale). Receivables are never counted as cash until received here.
  Cu.receive = (customerId, amount, method, note, saleId) => S.tx(() => {
    if (customerId === WALKIN || !Cu.get(customerId)) throw new Error('ဖောက်သည် မမှန်ပါ');
    if (!Number.isInteger(amount) || amount <= 0) throw new Error('ငွေပမာဏသည် ၁ ကျပ်နှင့်အထက် ကိန်းပြည့် ဖြစ်ရမည်');
    if (!SS.PAY[method]) throw new Error('ငွေပေးချေမှုနည်းလမ်း မမှန်ပါ');
    let list = Cu.sales(customerId).filter((s) => SS.Sales.balanceOf(s) > 0).sort((a, b) => (a.at < b.at ? -1 : 1));
    if (saleId) list = list.filter((s) => s.id === saleId);
    const due = U.sum(list, (s) => SS.Sales.balanceOf(s));
    if (amount > due) throw new Error(`ရရန်ကျန်ငွေ ${U.money(due)} ထက် ပိုလက်ခံ၍မရပါ`);
    let left = amount; const at = U.nowISO();
    for (const s of list) {
      if (left <= 0) break;
      const a = Math.min(left, SS.Sales.balanceOf(s));
      s.paid += a; left -= a;
      S.all('payments').push({ id: U.uid('pay'), direction: 'in', partyType: 'customer', partyId: customerId, refType: 'sale', refId: s.id, amount: a, method, note: note || '', at });
    }
    S.save('sales'); S.save('payments');
    return amount;
  });

  function form(existing, afterSave) {
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    const e = existing || {};
    const f = { name: h('input', { type: 'text', value: e.name || '', maxlength: 100 }), phone: h('input', { type: 'tel', value: e.phone || '' }), address: h('textarea', { value: e.address || '' }), notes: h('textarea', { value: e.notes || '' }) };
    U.modal({ title: existing ? 'ဖောက်သည် ပြင်ရန်' : 'ဖောက်သည် အသစ်', body: [err, h('div', { class: 'form-grid' }, U.field('အမည်', f.name, { required: true }), U.field('ဖုန်း', f.phone), U.field('လိပ်စာ', f.address, { class: 'full' }), U.field('မှတ်ချက်', f.notes, { class: 'full' }))],
      buttons: [{ label: 'မလုပ်တော့ပါ' }, { label: 'သိမ်းမည်', class: 'btn-primary', close: false, onClick: (ev, close) => {
        const d = { name: f.name.value, phone: f.phone.value, address: f.address.value, notes: f.notes.value };
        try { const c = existing ? Cu.update(existing.id, d) : Cu.add(d); close(); U.toast('သိမ်းဆည်းပြီးပါပြီ', 'success'); afterSave ? afterSave(c) : SS.refresh(); } catch (er) { U.formError(err, er.message); return false; }
      } }] });
  }
  SS.UI.customerForm = form;

  function detail(id) {
    const c = Cu.get(id); if (!c) return;
    const sales = Cu.sales(id).sort((a, b) => (a.at < b.at ? 1 : -1)), due = Cu.receivable(id);
    U.modal({ title: c.name, size: 'lg', body: h('div', { class: 'stack' },
      h('dl', { class: 'kv' }, h('dt', null, 'ဖုန်း'), h('dd', null, c.phone || '—'), h('dt', null, 'လိပ်စာ'), h('dd', null, c.address || '—'), h('dt', null, 'မှတ်ချက်'), h('dd', null, c.notes || '—'),
        h('dt', null, 'စုစုပေါင်း ဝယ်ယူမှု'), h('dd', null, U.money(Cu.totalPurchases(id))), h('dt', null, 'ရရန်ကျန်ငွေ'), h('dd', null, h('strong', null, U.money(due)))),
      h('h4', null, 'ဝယ်ယူမှု မှတ်တမ်း'),
      sales.length ? U.table([{ label: 'ဘောက်ချာ', key: 'number' }, { label: 'ရက်စွဲ', render: (s) => U.fmtDateTime(s.at) }, { label: 'စုစုပေါင်း', class: 'num', render: (s) => U.money(s.total) }, { label: 'ကျန်ငွေ', class: 'num', render: (s) => U.money(SS.Sales.balanceOf(s)) }, { label: 'အခြေအနေ', render: (s) => U.badge(SS.SALE_STATUS[s.status], s.status === 'completed' ? 'ok' : 'warn') }], sales) : U.empty('ဝယ်ယူမှု မရှိသေးပါ'),
      h('h4', null, 'ငွေပေးချေမှု (ရရှိမှု) မှတ်တမ်း'),
      Cu.payments(id).length ? U.table([{ label: 'ရက်စွဲ', render: (p) => U.fmtDateTime(p.at) }, { label: 'ပမာဏ', class: 'num', render: (p) => U.money(p.amount) }, { label: 'နည်းလမ်း', render: (p) => SS.PAY[p.method] || p.method }, { label: 'မှတ်ချက်', render: (p) => p.note || '' }], Cu.payments(id)) : U.empty('မရှိသေးပါ')),
      buttons: [{ label: 'ပိတ်မည်' }, due > 0 ? { label: 'အကြွေးငွေ လက်ခံမည်', class: 'btn-primary', close: false, onClick: () => SS.UI.paymentModal({ title: 'အကြွေးငွေ လက်ခံရန်', max: due, defaultAmount: due, info: c.name, onSubmit: (a, m, n) => Cu.receive(id, a, m, n) }) } : null].filter(Boolean) });
  }
  SS.UI.customerDetail = detail;

  const state = { q: '', status: 'active' };
  SS.pages.customers = {
    title: 'ဖောက်သည်များ',
    render(root) {
      const out = h('div');
      const draw = () => {
        U.clear(out);
        const q = state.q.trim().toLowerCase();
        const rows = Cu.all().filter((c) => (state.status === 'all' || c.status === state.status) && (!q || (c.name + ' ' + c.phone).toLowerCase().includes(q))).sort((a, b) => (a.system ? -1 : b.system ? 1 : a.name.localeCompare(b.name)));
        if (!rows.length) return out.appendChild(U.empty('ဖောက်သည် မတွေ့ပါ'));
        out.appendChild(U.table([{ label: 'အမည်', render: (c) => [h('strong', null, c.name), c.system ? U.badge('မူလ', 'info') : null] }, { label: 'ဖုန်း', render: (c) => c.phone || '—' },
          { label: 'စုစုပေါင်းဝယ်ယူမှု', class: 'num', render: (c) => U.money(Cu.totalPurchases(c.id)) },
          { label: 'ရရန်ကျန်ငွေ', class: 'num', render: (c) => { const d = Cu.receivable(c.id); return d > 0 ? h('span', { style: 'color:var(--err)' }, U.money(d)) : U.money(0); } },
          { label: '', class: 'actions', render: (c) => [h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => detail(c.id) }, 'ကြည့်'),
            c.system ? null : h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => form(c) }, 'ပြင်'),
            c.system ? null : h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: async () => { const arch = c.status === 'active'; if (arch && !await U.confirm(`"${c.name}" ကို archive လုပ်မလား?`)) return; try { Cu.setStatus(c.id, arch ? 'archived' : 'active'); SS.refresh(); } catch (er) { U.toast(er.message, 'error'); } } }, c.status === 'active' ? 'Archive' : 'ပြန်ဖွင့်')] }], rows,
          { foot: [{ text: 'ရရန်ကျန်ငွေ စုစုပေါင်း' }, { text: '' }, { text: '' }, { class: 'num', text: U.money(U.sum(rows, (c) => Cu.receivable(c.id))) }, { text: '' }] }));
      };
      root.appendChild(U.pageHeader('ဖောက်သည်များ', 'ဖောက်သည်စာရင်း၊ ဝယ်ယူမှုနှင့် အကြွေးငွေ', [h('button', { type: 'button', class: 'btn btn-primary', onClick: () => form(null) }, '+ ဖောက်သည်အသစ်')]));
      root.appendChild(h('div', { class: 'card' }, h('div', { class: 'toolbar' }, h('input', { type: 'search', class: 'grow', placeholder: 'အမည်/ဖုန်း ရှာရန်…', 'aria-label': 'ရှာရန်', value: state.q, onInput: (e) => { state.q = e.target.value; draw(); } }),
        U.select([{ value: 'active', label: 'သုံးနေသည်' }, { value: 'archived', label: 'Archived' }, { value: 'all', label: 'အားလုံး' }], state.status, { 'aria-label': 'အခြေအနေ', onChange: (e) => { state.status = e.target.value; draw(); } })), out));
      draw();
    }
  };
})();

;
/* SmartStock — products.js : product logic, search picker widget, products page (CRUD, filters, bulk count) */
(function () {
  'use strict';
  const SS = window.SS, S = SS.Storage, U = SS.U, h = U.h;
  const P = (SS.Products = {});

  P.all = () => S.all('products');
  P.get = (id) => S.byId('products', id);
  P.status = (p) => (p.stock <= 0 ? 'out' : p.stock <= p.lowStock ? 'low' : 'ok');
  P.search = function (q, opt) {
    q = String(q || '').trim().toLowerCase(); opt = opt || {};
    return P.all().filter((p) => (!opt.activeOnly || p.status === 'active') && (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q)));
  };
  P.validate = function (d, id) {
    const errors = [], warnings = [], st = SS.Settings.get();
    const c = { name: String(d.name || '').trim(), sku: String(d.sku || '').trim(), barcode: String(d.barcode || '').trim(), categoryId: d.categoryId, brand: String(d.brand || '').trim(), unit: String(d.unit || '').trim(),
      decimal: !!d.decimal, cost: d.cost, price: d.price, lowStock: d.lowStock, supplierId: d.supplierId || '', description: String(d.description || '').trim(), image: U.safeImg(d.image || '') };
    if (!c.name) errors.push('ကုန်ပစ္စည်းအမည် ထည့်ပါ'); else if (c.name.length > 150) errors.push('အမည် ရှည်လွန်းသည် (၁၅၀ လုံးအထိ)');
    if (!c.unit) errors.push('ယူနစ် ရွေး/ထည့်ပါ');
    if (!SS.Categories.get(c.categoryId)) errors.push('အမျိုးအစား ရွေးပါ');
    if (!Number.isInteger(c.cost) || c.cost < 0) errors.push('ဝယ်ဈေးသည် ၀ နှင့်အထက် ကိန်းပြည့် (MMK) ဖြစ်ရမည်');
    if (!Number.isInteger(c.price) || c.price < 0) errors.push('ရောင်းဈေးသည် ၀ နှင့်အထက် ကိန်းပြည့် (MMK) ဖြစ်ရမည်');
    if (!(Number.isFinite(c.lowStock) && c.lowStock >= 0)) errors.push('Low-stock အရေအတွက်သည် ၀ နှင့်အထက် ဖြစ်ရမည်');
    if (c.supplierId && !SS.Suppliers.get(c.supplierId)) errors.push('ပေးသွင်းသူ မမှန်ပါ');
    if (c.sku && !st.allowDuplicateSku && P.all().some((p) => p.id !== id && p.sku.toLowerCase() === c.sku.toLowerCase())) errors.push('SKU ထပ်နေသည်: ' + c.sku + ' (ဆက်တင်တွင် ခွင့်ပြုနိုင်သည်)');
    if (c.barcode && P.all().some((p) => p.id !== id && p.barcode && p.barcode === c.barcode)) errors.push('ဘားကုဒ် ထပ်နေသည်');
    if (!errors.length && c.price < c.cost) warnings.push('ရောင်းဈေး (' + U.money(c.price) + ') သည် ဝယ်ဈေး (' + U.money(c.cost) + ') ထက် နိမ့်နေသည် — ရောင်းတိုင်း ရှုံးမည်။');
    return { errors, warnings, clean: c };
  };
  P.create = (d, openingStock) => S.tx(() => {
    const v = P.validate(d, null); if (v.errors.length) throw new Error(v.errors.join('\n'));
    const c = v.clean, now = U.nowISO();
    const open = U.r3(openingStock || 0);
    if (!Number.isFinite(open) || open < 0) throw new Error('ဖွင့်လှစ်လက်ကျန် မမှန်ပါ');
    if (!c.decimal && !Number.isInteger(open)) throw new Error('ဤယူနစ်သည် ဒသမ မခွင့်ပြုပါ');
    if (!c.sku) c.sku = S.nextNumber('sku', 'SKU-', 5);
    const p = Object.assign({ id: U.uid('prd') }, c, { stock: 0, status: 'active', createdAt: now, updatedAt: now });
    P.all().push(p); S.save('products');
    if (open > 0) SS.Inventory.apply({ productId: p.id, delta: open, type: 'opening', reason: 'ဖွင့်လှစ်လက်ကျန်' });
    return p;
  });
  // Stock is never edited here — only through Inventory (keeps movement history consistent).
  P.update = (id, d) => S.tx(() => {
    const p = P.get(id); if (!p) throw new Error('ကုန်ပစ္စည်း ရှာမတွေ့ပါ');
    const v = P.validate(d, id); if (v.errors.length) throw new Error(v.errors.join('\n'));
    if (!v.clean.decimal && !Number.isInteger(p.stock)) throw new Error('လက်ကျန်တွင် ဒသမပါနေသဖြင့် ဒသမကို မပိတ်နိုင်ပါ');
    Object.assign(p, v.clean, { updatedAt: U.nowISO() });
    if (!p.sku) p.sku = S.nextNumber('sku', 'SKU-', 5);
    S.save('products'); return p;
  });
  P.setStatus = (id, status) => S.tx(() => { const p = P.get(id); if (!p) throw new Error('ရှာမတွေ့ပါ'); p.status = status; p.updatedAt = U.nowISO(); S.save('products'); });
  P.canDelete = (id) => !S.all('stockMovements').some((m) => m.productId === id) && !S.all('sales').some((s) => s.items.some((i) => i.productId === id)) && !S.all('purchases').some((x) => x.items.some((i) => i.productId === id));
  P.remove = (id) => S.tx(() => {
    if (!P.canDelete(id)) throw new Error('မှတ်တမ်းများ ရှိပြီးသား ကုန်ပစ္စည်းကို မဖျက်နိုင်ပါ — Archive လုပ်ပါ');
    const i = P.all().findIndex((p) => p.id === id); if (i < 0) throw new Error('ရှာမတွေ့ပါ'); P.all().splice(i, 1); S.save('products');
  });
  P.toCSV = () => U.csv(['ID', 'SKU', 'Barcode', 'Name', 'Category', 'Brand', 'Unit', 'Cost (MMK)', 'Price (MMK)', 'Stock', 'Low-stock threshold', 'Supplier', 'Status', 'Created', 'Updated'],
    P.all().map((p) => [p.id, p.sku, p.barcode, p.name, SS.Categories.name(p.categoryId), p.brand, p.unit, p.cost, p.price, p.stock, p.lowStock, p.supplierId ? SS.Suppliers.name(p.supplierId) : '', p.status, p.createdAt, p.updatedAt]));
  P.stockCSV = () => U.csv(['SKU', 'Name', 'Unit', 'Stock', 'Avg cost (MMK)', 'Stock cost value (MMK)', 'Price (MMK)', 'Stock retail value (MMK)', 'Status'],
    P.all().map((p) => [p.sku, p.name, p.unit, p.stock, p.cost, Math.round(p.stock * p.cost), p.price, Math.round(p.stock * p.price), P.status(p)]));

  /* ---------- reusable search picker ---------- */
  SS.UI.productPicker = function (o) {
    const input = h('input', { type: 'search', placeholder: o.placeholder || 'ကုန်ပစ္စည်း ရှာရန် (အမည်/SKU/ဘားကုဒ်)…', autocomplete: 'off', 'aria-label': o.placeholder || 'ကုန်ပစ္စည်း ရှာရန်', role: 'combobox', 'aria-autocomplete': 'list' });
    const list = h('ul', { class: 'picker-list', role: 'listbox', hidden: true });
    let items = [], idx = -1;
    const hide = () => { list.hidden = true; idx = -1; };
    function pick(p) { hide(); if (o.clearOnPick !== false) input.value = ''; o.onPick(p); }
    function render() {
      U.clear(list);
      items.forEach((p, i) => list.appendChild(h('li', { role: 'option', 'aria-selected': String(i === idx), onMousedown: (e) => { e.preventDefault(); pick(p); } },
        h('span', null, p.name, ' ', h('small', { class: 'muted' }, p.sku)), h('span', { class: 'muted small' }, U.qty(p.stock) + ' · ' + U.money(o.useCost ? p.cost : p.price)))));
      list.hidden = !items.length;
    }
    function search() { const q = input.value.trim(); if (!q) { items = []; return hide(); } items = P.search(q, { activeOnly: true }).slice(0, 8); idx = items.length ? 0 : -1; render(); }
    input.addEventListener('input', search);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(items.length - 1, idx + 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(0, idx - 1); render(); }
      else if (e.key === 'Escape') hide();
      else if (e.key === 'Enter') {
        e.preventDefault(); const q = input.value.trim().toLowerCase(); if (!q) return;
        const exact = P.all().find((p) => p.status === 'active' && ((p.barcode || '').toLowerCase() === q || p.sku.toLowerCase() === q));
        if (exact) pick(exact); else if (items[idx]) pick(items[idx]);
      }
    });
    input.addEventListener('blur', () => setTimeout(hide, 150));
    const wrap = h('div', { class: 'picker' }, input, list); wrap.input = input; return wrap;
  };

  /* ---------- forms ---------- */
  function productForm(existing) {
    const st = SS.Settings.get(), e = existing || {};
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    let image = e.image || '';
    const cats = SS.Categories.all().filter((c) => c.status === 'active' || c.id === e.categoryId);
    const unitList = h('datalist', { id: 'unit-list' }, st.units.map((u) => h('option', { value: u.name })));
    const f = {
      name: h('input', { type: 'text', value: e.name || '', maxlength: 150 }), sku: h('input', { type: 'text', value: e.sku || '', maxlength: 40, placeholder: 'ကွက်လပ်ထားလျှင် အလိုအလျောက်' }),
      barcode: h('input', { type: 'text', value: e.barcode || '', maxlength: 40 }), categoryId: U.select(cats.map((c) => ({ value: c.id, label: c.name })), e.categoryId || (cats[0] && cats[0].id)),
      brand: h('input', { type: 'text', value: e.brand || '', maxlength: 60 }), unit: h('input', { type: 'text', list: 'unit-list', value: e.unit || st.units[0].name, maxlength: 30 }),
      decimal: h('input', { type: 'checkbox', checked: !!e.decimal }), cost: h('input', { type: 'text', inputmode: 'numeric', value: e.cost != null ? e.cost : '' }), price: h('input', { type: 'text', inputmode: 'numeric', value: e.price != null ? e.price : '' }),
      opening: h('input', { type: 'text', inputmode: 'decimal', value: '0' }), lowStock: h('input', { type: 'text', inputmode: 'decimal', value: e.lowStock != null ? e.lowStock : st.lowStockDefault }),
      supplierId: U.select([{ value: '', label: '— မရွေးပါ —' }].concat(SS.Suppliers.all().filter((s) => s.status === 'active' || s.id === e.supplierId).map((s) => ({ value: s.id, label: s.name }))), e.supplierId || ''),
      description: h('textarea', { value: e.description || '', maxlength: 500 })
    };
    f.unit.addEventListener('change', () => { const u = st.units.find((x) => x.name === f.unit.value.trim()); if (u) f.decimal.checked = u.decimal; });
    const prev = h('div'); const drawImg = () => { U.clear(prev); if (U.safeImg(image)) prev.appendChild(h('img', { src: image, alt: 'ကုန်ပစ္စည်းပုံ', class: 'thumb', style: 'width:64px;height:64px' })); };
    drawImg();
    const imgIn = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp', onChange: async () => { const fl = imgIn.files[0]; if (!fl) return; try { image = await U.readImage(fl, 240); drawImg(); } catch (er) { U.toast(er.message, 'error'); } } });
    U.modal({
      title: existing ? 'ကုန်ပစ္စည်း ပြင်ဆင်ရန်' : 'ကုန်ပစ္စည်း အသစ်', size: 'lg',
      body: [err, unitList, h('div', { class: 'form-grid' },
        U.field('ကုန်ပစ္စည်းအမည်', f.name, { required: true, class: 'full' }), U.field('SKU / ကုဒ်', f.sku), U.field('ဘားကုဒ် (ရွေးချယ်ရန်)', f.barcode),
        U.field('အမျိုးအစား', f.categoryId, { required: true }), U.field('အမှတ်တံဆိပ် (Brand)', f.brand),
        U.field('ယူနစ်', f.unit, { required: true, hint: 'စာရင်းမှ ရွေးနိုင်သည် သို့မဟုတ် ကိုယ်ပိုင်ရိုက်ထည့်နိုင်သည်' }), h('div', { class: 'field' }, h('label', { class: 'check', style: 'margin-top:26px' }, f.decimal, 'ဒသမ အရေအတွက် ခွင့်ပြု (kg, လီတာ …)')),
        U.field('ဝယ်ဈေး (တစ်ယူနစ်, MMK)', f.cost, { required: true, hint: 'ပျမ်းမျှကုန်ကျစရိတ် — ဝယ်ယူမှု အတည်ပြုတိုင်း အလိုအလျောက် ပြန်တွက်သည်' }), U.field('ရောင်းဈေး (တစ်ယူနစ်, MMK)', f.price, { required: true }),
        existing ? h('div', { class: 'field' }, h('label', null, 'လက်ကျန်'), h('div', { class: 'input' }, U.qty(existing.stock) + ' ' + existing.unit), h('small', { class: 'hint' }, 'လက်ကျန်ကို "စတော့စီမံခန့်ခွဲမှု" မှ ချိန်ညှိပါ')) : U.field('ဖွင့်လှစ်လက်ကျန်', f.opening, { hint: 'စတော့မှတ်တမ်းတွင် opening stock အဖြစ် သိမ်းမည်' }),
        U.field('Low-stock သတိပေးအရေအတွက်', f.lowStock), U.field('ပေးသွင်းသူ (ရွေးချယ်ရန်)', f.supplierId), h('div'),
        U.field('ဖော်ပြချက်', f.description, { class: 'full' }), h('div', { class: 'field full' }, h('label', null, 'ပုံ (ရွေးချယ်ရန်)'), imgIn, prev, image ? h('button', { type: 'button', class: 'btn btn-ghost btn-sm', style: 'align-self:flex-start', onClick: () => { image = ''; imgIn.value = ''; drawImg(); } }, 'ပုံဖယ်ရန်') : null))],
      buttons: [{ label: 'မလုပ်တော့ပါ' }, { label: 'သိမ်းမည်', class: 'btn-primary', close: false, onClick: async (ev, close) => {
        const d = { name: f.name.value, sku: f.sku.value, barcode: f.barcode.value, categoryId: f.categoryId.value, brand: f.brand.value, unit: f.unit.value, decimal: f.decimal.checked,
          cost: U.parseMoney(f.cost.value), price: U.parseMoney(f.price.value), lowStock: U.parseNum(f.lowStock.value), supplierId: f.supplierId.value, description: f.description.value, image };
        const v = P.validate(d, existing && existing.id);
        if (v.errors.length) { U.formError(err, v.errors.join('\n')); return false; }
        if (v.warnings.length && !await U.confirm(v.warnings.join('\n') + '\n\nဆက်သိမ်းမလား?', { confirmLabel: 'ဆက်သိမ်းမည်' })) return false;
        try {
          if (existing) P.update(existing.id, d); else { const o = U.parseNum(f.opening.value); P.create(d, Number.isNaN(o) ? -1 : o); }
          close(); U.toast('သိမ်းဆည်းပြီးပါပြီ', 'success'); SS.refresh();
        } catch (er) { U.formError(err, er.message); return false; }
      } }]
    });
  }
  function viewProduct(id) {
    const p = P.get(id); if (!p) return;
    const moves = SS.Inventory.movements({ productId: id }).slice(0, 10);
    U.modal({ title: p.name, size: 'lg', body: h('div', { class: 'stack' },
      h('div', { class: 'row' }, U.safeImg(p.image) ? h('img', { src: p.image, alt: '', class: 'thumb', style: 'width:84px;height:84px' }) : null, h('div', null, h('div', null, U.stockBadge(p), ' ', U.badge(p.status === 'active' ? 'သုံးနေသည်' : 'Archived', p.status === 'active' ? 'ok' : 'muted')))),
      h('dl', { class: 'kv' }, h('dt', null, 'ID'), h('dd', { class: 'mono' }, p.id), h('dt', null, 'SKU'), h('dd', null, p.sku), h('dt', null, 'ဘားကုဒ်'), h('dd', null, p.barcode || '—'), h('dt', null, 'အမျိုးအစား'), h('dd', null, SS.Categories.name(p.categoryId)),
        h('dt', null, 'Brand'), h('dd', null, p.brand || '—'), h('dt', null, 'ယူနစ်'), h('dd', null, p.unit), h('dt', null, 'ဝယ်ဈေး (ပျမ်းမျှ)'), h('dd', null, U.money(p.cost)), h('dt', null, 'ရောင်းဈေး'), h('dd', null, U.money(p.price)),
        h('dt', null, 'လက်ကျန်'), h('dd', null, U.qty(p.stock) + ' ' + p.unit), h('dt', null, 'Low-stock'), h('dd', null, U.qty(p.lowStock)), h('dt', null, 'ပေးသွင်းသူ'), h('dd', null, p.supplierId ? SS.Suppliers.name(p.supplierId) : '—'),
        h('dt', null, 'ဖော်ပြချက်'), h('dd', null, p.description || '—'), h('dt', null, 'ဖန်တီးချိန်'), h('dd', null, U.fmtDateTime(p.createdAt)), h('dt', null, 'နောက်ဆုံးပြင်ချိန်'), h('dd', null, U.fmtDateTime(p.updatedAt))),
      h('h4', null, 'မကြာမီ စတော့လှုပ်ရှားမှု'), moves.length ? SS.Inventory.movementTable(moves) : U.empty('မှတ်တမ်း မရှိသေးပါ')), buttons: [{ label: 'ပိတ်မည်' }] });
  }
  function bulkCount(ids) {
    const prods = ids.map(P.get).filter(Boolean);
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    const reason = h('input', { type: 'text', value: 'စတော့ရေတွက်စစ်ဆေးမှု', maxlength: 200 });
    const inputs = prods.map((p) => h('input', { type: 'text', inputmode: 'decimal', value: String(p.stock), 'aria-label': p.name + ' အသစ်', class: 'mini' }));
    U.modal({ title: `စတော့ အစုလိုက် ချိန်ညှိရန် (${prods.length} မျိုး)`, size: 'lg', body: [err, h('p', { class: 'muted' }, 'ရေတွက်စစ်ဆေးထားသော အမှန်တကယ် လက်ကျန်ကို ထည့်ပါ။ ကွာခြားမှုအတွက် "ပြင်ဆင်ချက်" မှတ်တမ်းများ ဖန်တီးမည်။'),
      U.table([{ label: 'ကုန်ပစ္စည်း', render: (p) => p.name }, { label: 'လက်ရှိ', class: 'num', render: (p) => U.qty(p.stock) }, { label: 'အမှန်တကယ်', render: (p) => inputs[prods.indexOf(p)] }], prods), h('div', { style: 'margin-top:12px' }, U.field('အကြောင်းရင်း', reason, { required: true }))],
      buttons: [{ label: 'မလုပ်တော့ပါ' }, { label: 'ချိန်ညှိမည်', class: 'btn-primary', close: false, onClick: async (ev, close) => {
        const items = prods.map((p, i) => ({ productId: p.id, newCount: U.parseNum(inputs[i].value) }));
        if (items.some((x) => !(x.newCount >= 0))) { U.formError(err, 'အရေအတွက်များ မမှန်ပါ (၀ နှင့်အထက်)'); return false; }
        if (!reason.value.trim()) { U.formError(err, 'အကြောင်းရင်း ထည့်ပါ'); return false; }
        if (!await U.confirm('စတော့ လက်ကျန်ကို ပြောင်းလဲမည်။ ဆက်လုပ်မလား?')) return false;
        try { const n = SS.Inventory.bulkCount(items, reason.value.trim()); close(); U.toast(n + ' မျိုး ချိန်ညှိပြီးပါပြီ', 'success'); state.selected.clear(); SS.refresh(); } catch (er) { U.formError(err, er.message); return false; }
      } }] });
  }

  /* ---------- page ---------- */
  const state = { q: '', cat: '', stat: 'active', sort: 'name:asc', page: 1, selected: new Set() };
  const PER = 15;
  SS.pages.products = {
    title: 'ကုန်ပစ္စည်းများ',
    render(root) {
      const prm = SS.takeParams ? SS.takeParams() : {};
      if (prm.q != null) { state.q = prm.q; state.page = 1; }
      const out = h('div');
      function filtered() {
        let rows = P.search(state.q).filter((p) => !state.cat || p.categoryId === state.cat);
        rows = rows.filter((p) => state.stat === 'all' ? true : state.stat === 'archived' ? p.status === 'archived' : p.status === 'active' && (state.stat === 'active' || P.status(p) === state.stat));
        const [k, dir] = state.sort.split(':'), m = dir === 'asc' ? 1 : -1;
        return rows.sort((a, b) => (k === 'name' ? a.name.localeCompare(b.name) : a[k] - b[k]) * m);
      }
      function draw() {
        U.clear(out);
        const rows = filtered(), pages = Math.max(1, Math.ceil(rows.length / PER)); if (state.page > pages) state.page = pages;
        const slice = rows.slice((state.page - 1) * PER, state.page * PER);
        if (!P.all().length) return out.appendChild(U.empty('ကုန်ပစ္စည်း မရှိသေးပါ', '"+ ကုန်ပစ္စည်းအသစ်" ကိုနှိပ်၍ စတင်ပါ (သို့) ဆက်တင်တွင် နမူနာဒေတာ ထည့်နိုင်သည်'));
        if (!rows.length) return out.appendChild(U.empty('စစ်ထုတ်မှုနှင့် ကိုက်ညီသော ကုန်ပစ္စည်း မတွေ့ပါ'));
        const all = h('input', { type: 'checkbox', 'aria-label': 'ဤစာမျက်နှာရှိ အားလုံးရွေးရန်', checked: slice.every((p) => state.selected.has(p.id)), onChange: (e) => { slice.forEach((p) => (e.target.checked ? state.selected.add(p.id) : state.selected.delete(p.id))); draw(); } });
        out.appendChild(U.table([
          { label: all, render: (p) => h('input', { type: 'checkbox', 'aria-label': p.name + ' ရွေးရန်', checked: state.selected.has(p.id), onChange: (e) => { e.target.checked ? state.selected.add(p.id) : state.selected.delete(p.id); updateBulk(); } }) },
          { label: '', render: (p) => U.safeImg(p.image) ? h('img', { src: p.image, alt: '', class: 'thumb' }) : h('span', { class: 'thumb', 'aria-hidden': 'true' }, '▢') },
          { label: 'ကုန်ပစ္စည်း', render: (p) => [h('strong', null, p.name), h('div', { class: 'muted small' }, p.sku + (p.barcode ? ' · ' + p.barcode : ''))] },
          { label: 'အမျိုးအစား', render: (p) => SS.Categories.name(p.categoryId) },
          { label: 'လက်ကျန်', class: 'num', render: (p) => [U.qty(p.stock) + ' ', h('span', { class: 'muted small' }, p.unit), ' ', U.stockBadge(p)] },
          { label: 'ဝယ်ဈေး', class: 'num', render: (p) => U.money(p.cost) }, { label: 'ရောင်းဈေး', class: 'num', render: (p) => U.money(p.price) },
          { label: '', class: 'actions', render: (p) => [h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => viewProduct(p.id) }, 'ကြည့်'), h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => productForm(p) }, 'ပြင်'),
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: async () => {
              const arch = p.status === 'active';
              if (arch && !await U.confirm(`"${p.name}" ကို archive လုပ်မလား?\nရောင်းချမှုမှတ်တမ်းဟောင်းများတွင် ဆက်ရှိနေမည်။` + (p.stock > 0 ? `\nလက်ကျန် ${U.qty(p.stock)} ${p.unit} ရှိနေသေးသည်။` : ''))) return;
              try { P.setStatus(p.id, arch ? 'archived' : 'active'); SS.refresh(); } catch (er) { U.toast(er.message, 'error'); }
            } }, p.status === 'active' ? 'Archive' : 'ပြန်ဖွင့်'),
            P.canDelete(p.id) ? h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: async () => { if (await U.confirm(`"${p.name}" ကို အပြီးဖျက်မလား?`, { danger: true, confirmLabel: 'ဖျက်မည်' })) { try { P.remove(p.id); U.toast('ဖျက်ပြီးပါပြီ', 'success'); SS.refresh(); } catch (er) { U.toast(er.message, 'error'); } } } }, 'ဖျက်') : null] }
        ], slice, { rowClass: (p) => (p.status === 'archived' ? 'muted' : '') }));
        out.appendChild(U.pager(rows.length, state.page, PER, (n) => { state.page = n; draw(); }));
      }
      const bulkBtn = h('button', { type: 'button', class: 'btn btn-ghost', onClick: () => { if (!state.selected.size) return U.toast('ကုန်ပစ္စည်း ရွေးပါ', 'error'); bulkCount([...state.selected]); } }, 'အစုလိုက် စတော့ချိန်ညှိ');
      const updateBulk = () => { U.clear(bulkBtn); bulkBtn.appendChild(document.createTextNode('အစုလိုက် စတော့ချိန်ညှိ' + (state.selected.size ? ` (${state.selected.size})` : ''))); };
      updateBulk();
      const on = (k) => (e) => { state[k] = e.target.value; state.page = 1; draw(); };
      root.appendChild(U.pageHeader('ကုန်ပစ္စည်းများ', 'ကုန်ပစ္စည်းစာရင်း၊ ဈေးနှုန်းနှင့် လက်ကျန်', [bulkBtn, h('button', { type: 'button', class: 'btn btn-primary', onClick: () => productForm(null) }, '+ ကုန်ပစ္စည်းအသစ်')]));
      root.appendChild(h('div', { class: 'card' }, h('div', { class: 'toolbar' },
        h('input', { type: 'search', class: 'grow', placeholder: 'အမည် / SKU / ဘားကုဒ် ရှာရန်…', 'aria-label': 'ရှာရန်', value: state.q, onInput: on('q') }),
        U.select([{ value: '', label: 'အမျိုးအစားအားလုံး' }].concat(SS.Categories.all().map((c) => ({ value: c.id, label: c.name }))), state.cat, { 'aria-label': 'အမျိုးအစား', onChange: on('cat') }),
        U.select([{ value: 'active', label: 'သုံးနေသည့်အားလုံး' }, { value: 'ok', label: 'လုံလောက်' }, { value: 'low', label: 'နည်းနေပြီ' }, { value: 'out', label: 'ကုန်သွားပြီ' }, { value: 'archived', label: 'Archived' }, { value: 'all', label: 'အားလုံး' }], state.stat, { 'aria-label': 'စတော့အခြေအနေ', onChange: on('stat') }),
        U.select([{ value: 'name:asc', label: 'အမည် A→Z' }, { value: 'name:desc', label: 'အမည် Z→A' }, { value: 'stock:asc', label: 'လက်ကျန် နည်း→များ' }, { value: 'stock:desc', label: 'လက်ကျန် များ→နည်း' }, { value: 'cost:asc', label: 'ဝယ်ဈေး နိမ့်→မြင့်' }, { value: 'cost:desc', label: 'ဝယ်ဈေး မြင့်→နိမ့်' }, { value: 'price:asc', label: 'ရောင်းဈေး နိမ့်→မြင့်' }, { value: 'price:desc', label: 'ရောင်းဈေး မြင့်→နိမ့်' }], state.sort, { 'aria-label': 'စီရန်', onChange: on('sort') })), out));
      draw();
    }
  };
})();

;
/* SmartStock — inventory.js
   The ONLY place stock quantities change (Inventory.apply). Every change writes a stock-movement record.
   Also: manual adjustments, stock counts, movement history, and the Stock Management page. */
(function () {
  'use strict';
  const SS = window.SS, S = SS.Storage, U = SS.U, h = U.h;
  const I = (SS.Inventory = {});

  I.TYPES = {
    opening: { label: 'ဖွင့်လှစ်လက်ကျန်', sign: 1, manual: true }, add: { label: 'စတော့ ထပ်ထည့်', sign: 1, manual: true }, reduce: { label: 'စတော့ လျှော့', sign: -1, manual: true },
    damaged: { label: 'ပျက်စီး / သက်တမ်းကုန်', sign: -1, manual: true }, lost: { label: 'ပျောက်ဆုံး', sign: -1, manual: true },
    customer_return: { label: 'ဖောက်သည် ပြန်အပ်', sign: 1, manual: true }, supplier_return: { label: 'ပေးသွင်းသူသို့ ပြန်ပို့', sign: -1, manual: true }, correction: { label: 'စာရင်းပြင်ဆင်ချက်', sign: 0, manual: true },
    sale: { label: 'ရောင်းချမှု', sign: -1 }, sale_return: { label: 'ရောင်းချမှု ပြန်အမ်း', sign: 1 }, purchase: { label: 'ဝယ်ယူမှု', sign: 1 }, purchase_edit: { label: 'ဝယ်ယူမှု ပြင်ဆင်', sign: 0 }, purchase_cancel: { label: 'ဝယ်ယူမှု ပယ်ဖျက်', sign: -1 }
  };

  // Central stock mutation. Must run inside Storage.tx so product + movement are saved together or not at all.
  I.apply = function (o) {
    if (!S.inTx()) throw new Error('Inventory.apply must be called inside Storage.tx');
    const p = SS.Products.get(o.productId); if (!p) throw new Error('ကုန်ပစ္စည်း ရှာမတွေ့ပါ');
    const delta = U.r3(o.delta);
    if (!Number.isFinite(delta) || delta === 0) throw new Error('အရေအတွက် မမှန်ပါ');
    if (!p.decimal && !Number.isInteger(delta)) throw new Error(`"${p.name}" သည် ဒသမ အရေအတွက် မခွင့်ပြုပါ`);
    const prev = p.stock, next = U.r3(prev + delta);
    if (next < 0) throw new Error(`"${p.name}" လက်ကျန် မလုံလောက်ပါ (လက်ကျန် ${U.qty(prev)}၊ လိုအပ်သည် ${U.qty(-delta)})`);
    p.stock = next; p.updatedAt = U.nowISO();
    const m = { id: U.uid('mov'), productId: p.id, type: o.type, qty: delta, prev, next, reason: o.reason || '', refType: o.refType || '', refId: o.refId || '', at: o.at || U.nowISO() };
    S.all('stockMovements').push(m); S.save('products'); S.save('stockMovements');
    return m;
  };

  // Manual adjustment (reason required). For "correction", `newCount` is the counted quantity.
  I.adjust = (o) => S.tx(() => {
    const T = I.TYPES[o.type]; if (!T || !T.manual) throw new Error('မှတ်တမ်းအမျိုးအစား မမှန်ပါ');
    const reason = String(o.reason || '').trim(); if (reason.length < 3) throw new Error('အကြောင်းရင်း ရေးရန် လိုအပ်သည်');
    const p = SS.Products.get(o.productId); if (!p) throw new Error('ကုန်ပစ္စည်း ရှာမတွေ့ပါ');
    let delta;
    if (o.type === 'correction') { const n = U.r3(o.newCount); if (!(n >= 0)) throw new Error('အမှန်တကယ် လက်ကျန် မမှန်ပါ'); delta = U.r3(n - p.stock); if (delta === 0) throw new Error('လက်ရှိလက်ကျန်နှင့် တူနေသဖြင့် ပြောင်းလဲစရာ မရှိပါ'); }
    else { const q = U.r3(o.qty); if (!(q > 0)) throw new Error('အရေအတွက်သည် ၀ ထက်ကြီးရမည်'); delta = q * T.sign; }
    return I.apply({ productId: p.id, delta, type: o.type, reason });
  });
  I.bulkCount = (items, reason) => S.tx(() => {
    let n = 0;
    for (const it of items) {
      const p = SS.Products.get(it.productId); if (!p) continue;
      const delta = U.r3(U.r3(it.newCount) - p.stock); if (delta === 0) continue;
      I.apply({ productId: p.id, delta, type: 'correction', reason }); n++;
    }
    return n;
  });
  I.movements = function (f) {
    f = f || {};
    return S.all('stockMovements').filter((m) => (!f.productId || m.productId === f.productId) && (!f.type || m.type === f.type) && U.inRange(U.dayKey(m.at), f.from, f.to)).sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  };
  I.movementTable = (rows) => U.table([
    { label: 'အချိန်', render: (m) => U.fmtDateTime(m.at) }, { label: 'ကုန်ပစ္စည်း', render: (m) => { const p = SS.Products.get(m.productId); return p ? p.name : m.productId; } },
    { label: 'အမျိုးအစား', render: (m) => (I.TYPES[m.type] || { label: m.type }).label }, { label: 'အပြောင်းအလဲ', class: 'num', render: (m) => h('span', { style: 'color:' + (m.qty < 0 ? 'var(--err)' : 'var(--ok)') }, (m.qty > 0 ? '+' : '') + U.qty(m.qty)) },
    { label: 'ယခင်', class: 'num', render: (m) => U.qty(m.prev) }, { label: 'အသစ်', class: 'num', render: (m) => U.qty(m.next) }, { label: 'အကြောင်းရင်း / ကိုးကား', render: (m) => (m.reason || '') + (m.refType ? ' [' + m.refType + ']' : '') }], rows);
  I.toCSV = (rows) => U.csv(['Movement ID', 'Time', 'Product ID', 'Product', 'Type', 'Qty change', 'Previous', 'New', 'Reason', 'Ref type', 'Ref ID'],
    (rows || I.movements()).map((m) => { const p = SS.Products.get(m.productId); return [m.id, m.at, m.productId, p ? p.name : '', m.type, m.qty, m.prev, m.next, m.reason, m.refType, m.refId]; }));

  /* ---------- page ---------- */
  const hist = { productQ: '', type: '', from: '', to: '', page: 1 };
  SS.pages.stock = {
    title: 'စတော့စီမံခန့်ခွဲမှု',
    render(root) {
      const prm = SS.takeParams ? SS.takeParams() : {};
      const tabs = U.tabs([
        { id: 'adjust', label: 'စတော့ ချိန်ညှိရန်', render: () => adjustTab(prm.productId) },
        { id: 'alerts', label: 'သတိပေးချက်များ', render: alertsTab },
        { id: 'history', label: 'စတော့လှုပ်ရှားမှု မှတ်တမ်း', render: historyTab }
      ], prm.tab || 'adjust');
      root.appendChild(U.pageHeader('စတော့စီမံခန့်ခွဲမှု', 'လက်ကျန်ချိန်ညှိခြင်း၊ သတိပေးချက်နှင့် လှုပ်ရှားမှုမှတ်တမ်း'));
      root.appendChild(h('div', { class: 'card' }, tabs));
    }
  };

  function adjustTab(preId) {
    let prod = preId ? SS.Products.get(preId) : null;
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    const info = h('div', { class: 'card', style: 'background:var(--hover);box-shadow:none' });
    const typeSel = U.select(Object.keys(I.TYPES).filter((k) => I.TYPES[k].manual).map((k) => ({ value: k, label: I.TYPES[k].label + (I.TYPES[k].sign > 0 ? ' (+)' : I.TYPES[k].sign < 0 ? ' (−)' : '') })), 'add');
    const qty = h('input', { type: 'text', inputmode: 'decimal' });
    const qtyLabel = h('span');
    const reason = h('input', { type: 'text', maxlength: 200, placeholder: 'ဥပမာ - ပုံးကွဲသွားသည်၊ လက်ကျန်ရေတွက်စစ်ဆေးမှု' });
    const drawInfo = () => {
      U.clear(info);
      if (!prod) return info.appendChild(h('span', { class: 'muted' }, 'အပေါ်တွင် ကုန်ပစ္စည်း ရှာ၍ ရွေးပါ'));
      prod = SS.Products.get(prod.id);
      info.appendChild(h('div', { class: 'row between' }, h('div', null, h('strong', null, prod.name), h('div', { class: 'muted small' }, prod.sku)), h('div', null, 'လက်ကျန်: ', h('strong', null, U.qty(prod.stock) + ' ' + prod.unit), ' ', U.stockBadge(prod))));
    };
    const setLabel = () => { qtyLabel.textContent = typeSel.value === 'correction' ? 'အမှန်တကယ် ရေတွက်ရသော လက်ကျန်' : 'အရေအတွက်'; };
    typeSel.addEventListener('change', setLabel); setLabel(); drawInfo();
    const picker = SS.UI.productPicker({ onPick: (p) => { prod = p; drawInfo(); qty.focus(); } });
    async function submit() {
      U.formError(err, '');
      if (!prod) return U.formError(err, 'ကုန်ပစ္စည်း ရွေးပါ');
      const n = U.parseNum(qty.value);
      if (!(n >= 0) || (typeSel.value !== 'correction' && n <= 0)) return U.formError(err, 'အရေအတွက် မမှန်ပါ');
      if (reason.value.trim().length < 3) return U.formError(err, 'အကြောင်းရင်း ရေးရန် လိုအပ်သည်');
      const T = I.TYPES[typeSel.value];
      const msg = typeSel.value === 'correction' ? `"${prod.name}" လက်ကျန်ကို ${U.qty(prod.stock)} မှ ${U.qty(n)} သို့ ပြင်မည်။` : `"${prod.name}" ${T.label}: ${T.sign > 0 ? '+' : '−'}${U.qty(n)} ${prod.unit}`;
      if (!await U.confirm(msg + '\nအကြောင်းရင်း: ' + reason.value.trim(), { title: 'စတော့ ပြောင်းလဲမှု အတည်ပြုပါ' })) return;
      try { I.adjust({ productId: prod.id, type: typeSel.value, qty: n, newCount: n, reason: reason.value }); U.toast('စတော့ ချိန်ညှိပြီးပါပြီ', 'success'); qty.value = ''; reason.value = ''; drawInfo(); }
      catch (e) { U.formError(err, e.message); }
    }
    return h('div', { class: 'stack', style: 'max-width:720px' }, err, U.field('ကုန်ပစ္စည်း', picker, { required: true }), info,
      h('div', { class: 'form-grid' }, U.field('လုပ်ဆောင်ချက်', typeSel), h('div', { class: 'field' }, h('label', null, qtyLabel), qty)), U.field('အကြောင်းရင်း (မဖြစ်မနေ)', reason, { required: true }),
      h('div', null, h('button', { type: 'button', class: 'btn btn-primary', onClick: submit }, 'ချိန်ညှိမည်')),
      h('p', { class: 'muted small' }, 'ရောင်းချမှု/ဝယ်ယူမှုကြောင့် ဖြစ်သော စတော့ပြောင်းလဲမှုများကို ထိုစာမျက်နှာများမှသာ ပြုလုပ်ပါ။ ဤနေရာသည် လက်ဖြင့် ချိန်ညှိရန်သာ ဖြစ်သည်။'));
  }
  function alertsTab() {
    const act = SS.Products.all().filter((p) => p.status === 'active');
    const out = act.filter((p) => p.stock <= 0), low = act.filter((p) => p.stock > 0 && p.stock <= p.lowStock);
    const tbl = (rows) => rows.length ? U.table([{ label: 'ကုန်ပစ္စည်း', render: (p) => [h('strong', null, p.name), h('div', { class: 'muted small' }, p.sku)] }, { label: 'လက်ကျန်', class: 'num', render: (p) => U.qty(p.stock) + ' ' + p.unit }, { label: 'သတိပေးအမှတ်', class: 'num', render: (p) => U.qty(p.lowStock) },
      { label: '', class: 'actions', render: (p) => h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => SS.go('stock', { productId: p.id, tab: 'adjust' }) }, 'ချိန်ညှိ') }], rows) : U.empty('မရှိပါ ✓');
    return h('div', { class: 'stack' }, h('h3', null, ['ကုန်သွားပြီ (', out.length, ')']), tbl(out), h('h3', null, ['နည်းနေပြီ (', low.length, ')']), tbl(low));
  }
  function historyTab() {
    const out = h('div');
    const draw = () => {
      U.clear(out);
      const q = hist.productQ.trim().toLowerCase();
      let rows = I.movements({ type: hist.type, from: hist.from, to: hist.to });
      if (q) rows = rows.filter((m) => { const p = SS.Products.get(m.productId); return p && (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)); });
      if (!rows.length) return out.appendChild(U.empty('မှတ်တမ်း မရှိပါ'));
      const per = 20, pages = Math.max(1, Math.ceil(rows.length / per)); if (hist.page > pages) hist.page = pages;
      out.appendChild(I.movementTable(rows.slice((hist.page - 1) * per, hist.page * per)));
      out.appendChild(U.pager(rows.length, hist.page, per, (n) => { hist.page = n; draw(); }));
      out.dataset.rows = String(rows.length);
      out._rows = rows;
    };
    const on = (k) => (e) => { hist[k] = e.target.value; hist.page = 1; draw(); };
    return h('div', null, h('div', { class: 'toolbar' }, h('input', { type: 'search', class: 'grow', placeholder: 'ကုန်ပစ္စည်း ရှာရန်…', 'aria-label': 'ကုန်ပစ္စည်း', value: hist.productQ, onInput: on('productQ') }),
      U.select([{ value: '', label: 'အမျိုးအစားအားလုံး' }].concat(Object.keys(I.TYPES).map((k) => ({ value: k, label: I.TYPES[k].label }))), hist.type, { 'aria-label': 'အမျိုးအစား', onChange: on('type') }),
      h('input', { type: 'date', value: hist.from, 'aria-label': 'မှ', onChange: on('from') }), h('input', { type: 'date', value: hist.to, 'aria-label': 'ထိ', onChange: on('to') }),
      h('button', { type: 'button', class: 'btn btn-ghost', onClick: () => { const rows = out._rows || I.movements(); U.download('smartstock-stock-movements.csv', I.toCSV(rows), 'text/csv'); } }, 'CSV ထုတ်ရန်')), out, (draw(), null));
  }
})();

;
/* SmartStock — purchases.js : purchase logic (draft → confirm → edit/cancel) and page
   Stock rule: stock increases exactly once, at confirmation (purchase.stockApplied). Edits/cancels of a
   confirmed purchase post compensating stock movements (types purchase_edit / purchase_cancel).
   Cost rule (weighted average): newCost = round((stockBefore*oldCost + landedLineCost) / (stockBefore + qty)),
   where landedLineCost = line amount + proportional share of (additional costs − discount). */
(function () {
  'use strict';
  const SS = window.SS, S = SS.Storage, U = SS.U, h = U.h;
  const Pu = (SS.Purchases = {});

  Pu.all = () => S.all('purchases');
  Pu.get = (id) => S.byId('purchases', id);
  Pu.balanceOf = (p) => (p.status === 'confirmed' ? Math.max(0, p.total - p.paid) : 0);
  Pu.payments = (id) => S.all('payments').filter((x) => x.refType === 'purchase' && x.refId === id).sort((a, b) => (a.at < b.at ? 1 : -1));

  // Pure calculation used by both UI preview and persistence
  Pu.calc = function (items, extra, discount) {
    const lines = items.map((i) => Math.round(i.qty * i.unitCost));
    const itemsTotal = U.sum(lines);
    const adj = (extra || 0) - (discount || 0);
    const share = U.allocate(adj, lines);
    return { lines, landed: lines.map((l, i) => l + share[i]), itemsTotal, total: itemsTotal + adj };
  };
  function normalise(d) {
    const errs = [];
    const supplier = SS.Suppliers.get(d.supplierId); if (!supplier) errs.push('ပေးသွင်းသူ ရွေးပါ');
    if (!U.isDayKey(d.date)) errs.push('ရက်စွဲ မမှန်ပါ');
    const extra = d.extraCost || 0, disc = d.discount || 0;
    if (!Number.isInteger(extra) || extra < 0) errs.push('အပိုကုန်ကျစရိတ်သည် ၀ နှင့်အထက် ကိန်းပြည့် ဖြစ်ရမည်');
    if (!Number.isInteger(disc) || disc < 0) errs.push('လျှော့ငွေသည် ၀ နှင့်အထက် ကိန်းပြည့် ဖြစ်ရမည်');
    if (!Array.isArray(d.items) || !d.items.length) errs.push('ကုန်ပစ္စည်း အနည်းဆုံး ၁ ခု ထည့်ပါ');
    const seen = new Set(), items = [];
    (d.items || []).forEach((i) => {
      const p = SS.Products.get(i.productId);
      if (!p) return errs.push('ကုန်ပစ္စည်း ရှာမတွေ့ပါ');
      if (seen.has(p.id)) return errs.push(`"${p.name}" ထပ်နေသည်`); seen.add(p.id);
      const q = U.r3(i.qty);
      if (!(q > 0)) errs.push(`"${p.name}" အရေအတွက် မမှန်ပါ`); else if (!p.decimal && !Number.isInteger(q)) errs.push(`"${p.name}" ကို ကိန်းပြည့်ဖြင့်သာ ထည့်ပါ`);
      if (!Number.isInteger(i.unitCost) || i.unitCost < 0) errs.push(`"${p.name}" ဝယ်ဈေး မမှန်ပါ`);
      items.push({ productId: p.id, name: p.name, qty: q, unitCost: i.unitCost });
    });
    let c = null;
    if (!errs.length) { c = Pu.calc(items, extra, disc); if (c.total < 0) errs.push('လျှော့ငွေသည် စုစုပေါင်းထက် မများရ'); }
    const ip = d.initialPayment || { amount: 0, method: SS.Settings.get().defaultPayment };
    if (!Number.isInteger(ip.amount || 0) || (ip.amount || 0) < 0) errs.push('ပေးငွေ မမှန်ပါ'); else if (c && (ip.amount || 0) > c.total) errs.push('ပေးငွေသည် စုစုပေါင်းထက် မများရ');
    if (!SS.PAY[ip.method]) errs.push('ငွေပေးချေမှုနည်းလမ်း မမှန်ပါ');
    if (errs.length) throw new Error(errs.join('\n'));
    items.forEach((it, i) => { it.lineTotal = c.lines[i]; it.landed = c.landed[i]; });
    return { supplierId: supplier.id, date: d.date, items, extraCost: extra, discount: disc, itemsTotal: c.itemsTotal, total: c.total, initialPayment: { amount: ip.amount || 0, method: ip.method }, notes: String(d.notes || '').trim().slice(0, 500) };
  }
  Pu.saveDraft = (d, id) => S.tx(() => {
    const n = normalise(d), now = U.nowISO();
    if (id) {
      const p = Pu.get(id); if (!p) throw new Error('ရှာမတွေ့ပါ'); if (p.status !== 'draft') throw new Error('မူကြမ်းကိုသာ ဤနည်းဖြင့် ပြင်နိုင်သည်');
      Object.assign(p, n, { updatedAt: now }); S.save('purchases'); return p;
    }
    const p = Object.assign({ id: U.uid('pur'), number: S.nextNumber('purchase', 'PO-', 5), status: 'draft', paid: 0, paymentMethod: n.initialPayment.method, stockApplied: false, createdAt: now, updatedAt: now }, n);
    Pu.all().push(p); S.save('purchases'); return p;
  });
  function costAdjust(prod, valueBefore, deltaValue) {
    const after = prod.stock;
    if (after > 0) prod.cost = Math.max(0, Math.round((valueBefore + deltaValue) / after));
  }
  Pu.confirm = (id) => S.tx(() => {
    const p = Pu.get(id); if (!p) throw new Error('ရှာမတွေ့ပါ');
    if (p.status !== 'draft' || p.stockApplied) throw new Error('ဤဝယ်ယူမှုကို အတည်ပြုပြီးသား/မလုပ်နိုင်ပါ (စတော့ နှစ်ကြိမ် မတိုးစေရန်)');
    const n = normalise(p); // re-validate everything at commit time
    const at = U.nowISO();
    p.items.forEach((it, i) => {
      const prod = SS.Products.get(it.productId), line = n.items[i];
      const valueBefore = prod.stock * prod.cost;
      SS.Inventory.apply({ productId: prod.id, delta: line.qty, type: 'purchase', reason: 'ဝယ်ယူမှု ' + p.number, refType: 'purchase', refId: p.id, at });
      costAdjust(prod, valueBefore, line.landed); prod.updatedAt = at;
      it.qty = line.qty; it.unitCost = line.unitCost; it.lineTotal = line.lineTotal; it.landed = line.landed;
    });
    S.save('products');
    p.total = n.total; p.itemsTotal = n.itemsTotal;
    p.status = 'confirmed'; p.stockApplied = true; p.confirmedAt = at; p.updatedAt = at;
    const amt = p.initialPayment ? p.initialPayment.amount : 0;
    if (amt > 0) { p.paid = amt; p.paymentMethod = p.initialPayment.method; S.all('payments').push({ id: U.uid('pay'), direction: 'out', partyType: 'supplier', partyId: p.supplierId, refType: 'purchase', refId: p.id, amount: amt, method: p.initialPayment.method, note: 'ဝယ်ယူမှုနှင့်အတူ ပေးချေ', at }); S.save('payments'); }
    S.save('purchases'); return p;
  });
  Pu.updateConfirmed = (id, d) => S.tx(() => {
    const p = Pu.get(id); if (!p || p.status !== 'confirmed') throw new Error('အတည်ပြုပြီး ဝယ်ယူမှုကိုသာ ပြင်နိုင်သည်');
    if (d.supplierId !== p.supplierId && p.paid > 0) throw new Error('ငွေပေးချေပြီးသော ဝယ်ယူမှု၏ ပေးသွင်းသူကို မပြောင်းနိုင်ပါ');
    const n = normalise(Object.assign({}, d, { initialPayment: { amount: 0, method: p.paymentMethod } }));
    if (n.total < p.paid) throw new Error(`စုစုပေါင်း (${U.money(n.total)}) သည် ပေးပြီးငွေ (${U.money(p.paid)}) ထက် နည်းမရပါ`);
    const old = new Map(p.items.map((i) => [i.productId, i])), neu = new Map(n.items.map((i) => [i.productId, i])), at = U.nowISO();
    for (const pid of new Set([...old.keys(), ...neu.keys()])) {
      const o = old.get(pid), w = neu.get(pid), prod = SS.Products.get(pid);
      const dq = U.r3((w ? w.qty : 0) - (o ? o.qty : 0)), dv = (w ? w.landed : 0) - (o ? o.landed : 0);
      if (dq === 0 && dv === 0) continue;
      const valueBefore = prod.stock * prod.cost;
      if (dq !== 0) SS.Inventory.apply({ productId: pid, delta: dq, type: 'purchase_edit', reason: 'ဝယ်ယူမှု ပြင်ဆင်ချက် ' + p.number, refType: 'purchase', refId: p.id, at });
      costAdjust(prod, valueBefore, dv); prod.updatedAt = at;
    }
    S.save('products');
    Object.assign(p, { supplierId: n.supplierId, date: n.date, items: n.items, extraCost: n.extraCost, discount: n.discount, itemsTotal: n.itemsTotal, total: n.total, notes: n.notes, updatedAt: at });
    S.save('purchases'); return p;
  });
  Pu.cancel = (id, reason) => S.tx(() => {
    const p = Pu.get(id); if (!p) throw new Error('ရှာမတွေ့ပါ');
    if (p.status === 'cancelled') throw new Error('ပယ်ဖျက်ပြီးသား');
    if (!reason || reason.trim().length < 3) throw new Error('အကြောင်းရင်း လိုအပ်သည်');
    const at = U.nowISO();
    if (p.status === 'confirmed') {
      p.items.forEach((it) => {
        const prod = SS.Products.get(it.productId), valueBefore = prod.stock * prod.cost;
        SS.Inventory.apply({ productId: it.productId, delta: -it.qty, type: 'purchase_cancel', reason: 'ဝယ်ယူမှု ပယ်ဖျက် ' + p.number + ': ' + reason.trim(), refType: 'purchase', refId: p.id, at });
        costAdjust(prod, valueBefore, -it.landed); prod.updatedAt = at;
      });
      S.save('products');
      if (p.paid > 0) { S.all('payments').push({ id: U.uid('pay'), direction: 'in', partyType: 'supplier', partyId: p.supplierId, refType: 'purchase_cancel', refId: p.id, amount: p.paid, method: p.paymentMethod, note: 'ပယ်ဖျက်ခြင်းကြောင့် ပြန်ရငွေ', at }); S.save('payments'); p.refunded = p.paid; }
    }
    p.status = 'cancelled'; p.cancelReason = reason.trim(); p.cancelledAt = at; p.updatedAt = at; S.save('purchases'); return p;
  });
  Pu.pay = (id, amount, method, note) => { const p = Pu.get(id); if (!p || p.status !== 'confirmed') throw new Error('အတည်ပြုပြီး ဝယ်ယူမှုသာ'); return SS.Suppliers.pay(p.supplierId, amount, method, note, id); };
  Pu.toCSV = (rows) => U.csv(['No.', 'Date', 'Supplier', 'Status', 'Items total', 'Additional costs', 'Discount', 'Total', 'Paid', 'Balance'], (rows || Pu.all()).map((p) => [p.number, p.date, SS.Suppliers.name(p.supplierId), p.status, p.itemsTotal, p.extraCost, p.discount, p.total, p.paid, Pu.balanceOf(p)]));

  function printNode(p) {
    const sup = SS.Suppliers.get(p.supplierId), st = SS.Settings.get();
    return h('div', { class: 'report-print' }, h('h2', null, st.shopName + ' — ဝယ်ယူမှုမှတ်တမ်း ' + p.number),
      h('p', null, `ရက်စွဲ: ${U.fmtDate(p.date)} · ပေးသွင်းသူ: ${sup ? sup.name : '—'} · အခြေအနေ: ${SS.PURCHASE_STATUS[p.status]}`),
      U.table([{ label: 'ကုန်ပစ္စည်း', key: 'name' }, { label: 'အရေအတွက်', class: 'num', render: (i) => U.qty(i.qty) }, { label: 'ဝယ်ဈေး', class: 'num', render: (i) => U.money(i.unitCost) }, { label: 'ပေါင်း', class: 'num', render: (i) => U.money(i.lineTotal) }], p.items),
      h('ul', { class: 'summary-list' }, h('li', null, h('span', null, 'ကုန်ပစ္စည်းပေါင်း'), h('span', null, U.money(p.itemsTotal))), h('li', null, h('span', null, 'အပိုကုန်ကျစရိတ်'), h('span', null, U.money(p.extraCost))), h('li', null, h('span', null, 'လျှော့ငွေ'), h('span', null, U.money(p.discount))),
        h('li', null, h('strong', null, 'စုစုပေါင်း'), h('strong', null, U.money(p.total))), h('li', null, h('span', null, 'ပေးပြီး'), h('span', null, U.money(p.paid))), h('li', null, h('span', null, 'ပေးရန်ကျန်'), h('span', null, U.money(Pu.balanceOf(p))))), p.notes ? h('p', null, 'မှတ်ချက်: ' + p.notes) : null);
  }

  /* ---------- form ---------- */
  function purchaseForm(existing) {
    const e = existing || {}, confirmedEdit = existing && existing.status === 'confirmed';
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    let items = (e.items || []).map((i) => ({ productId: i.productId, qty: i.qty, unitCost: i.unitCost }));
    const supplier = U.select([{ value: '', label: '— ရွေးပါ —' }].concat(SS.Suppliers.all().filter((s) => s.status === 'active' || s.id === e.supplierId).map((s) => ({ value: s.id, label: s.name }))), e.supplierId || '');
    const date = h('input', { type: 'date', value: e.date || U.todayKey() });
    const extra = h('input', { type: 'text', inputmode: 'numeric', value: String(e.extraCost || 0) }), disc = h('input', { type: 'text', inputmode: 'numeric', value: String(e.discount || 0) });
    const paid = h('input', { type: 'text', inputmode: 'numeric', value: String(e.initialPayment ? e.initialPayment.amount : 0) });
    const method = U.select(Object.keys(SS.PAY).map((k) => ({ value: k, label: SS.PAY[k] })), (e.initialPayment && e.initialPayment.method) || SS.Settings.get().defaultPayment);
    const notes = h('textarea', { value: e.notes || '', maxlength: 500 });
    const tbl = h('div'), sum = h('div');
    const val = (el) => { const n = U.parseMoney(el.value); return Number.isNaN(n) ? NaN : n; };
    function drawSum() {
      U.clear(sum);
      const ok = items.every((i) => i.qty > 0 && Number.isInteger(i.unitCost) && i.unitCost >= 0), ex = val(extra), di = val(disc);
      if (!ok || Number.isNaN(ex) || Number.isNaN(di)) return sum.appendChild(h('span', { class: 'muted' }, 'ဂဏန်းများ ပြည့်စုံမှန်ကန်ရန် လိုအပ်သည်'));
      const c = Pu.calc(items, ex, di);
      sum.appendChild(h('div', null, h('div', { class: 'sum-row' }, h('span', null, 'ကုန်ပစ္စည်းပေါင်း'), h('span', null, U.money(c.itemsTotal))), h('div', { class: 'sum-row' }, h('span', null, '+ အပိုကုန်ကျစရိတ်'), h('span', null, U.money(ex))), h('div', { class: 'sum-row' }, h('span', null, '− လျှော့ငွေ'), h('span', null, U.money(di))), h('div', { class: 'sum-row big' }, h('span', null, 'စုစုပေါင်း'), h('span', null, U.money(c.total)))));
    }
    function drawItems() {
      U.clear(tbl);
      if (!items.length) { tbl.appendChild(U.empty('အပေါ်တွင် ကုန်ပစ္စည်းရှာ၍ ထည့်ပါ')); return drawSum(); }
      const lt = {};
      tbl.appendChild(U.table([{ label: 'ကုန်ပစ္စည်း', render: (i) => (SS.Products.get(i.productId) || {}).name },
        { label: 'အရေအတွက်', render: (i) => h('input', { type: 'text', inputmode: 'decimal', class: 'mini', value: String(i.qty), 'aria-label': 'အရေအတွက်', onInput: (ev) => { const n = U.parseNum(ev.target.value); i.qty = n > 0 ? n : 0; upd(i); } }) },
        { label: 'ဝယ်ဈေး', render: (i) => h('input', { type: 'text', inputmode: 'numeric', class: 'mini', style: 'width:110px!important', value: String(i.unitCost), 'aria-label': 'ဝယ်ဈေး', onInput: (ev) => { const n = U.parseMoney(ev.target.value); i.unitCost = Number.isNaN(n) ? NaN : n; upd(i); } }) },
        { label: 'ပေါင်း', class: 'num', render: (i) => (lt[i.productId] = h('span', null, U.money(Math.round(i.qty * (i.unitCost || 0))))) },
        { label: '', render: (i) => h('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'aria-label': 'ဖယ်ရန်', onClick: () => { items = items.filter((x) => x !== i); drawItems(); } }, '✕') }], items));
      function upd(i) { lt[i.productId].textContent = U.money(Math.round((i.qty || 0) * (i.unitCost || 0))); drawSum(); }
      drawSum();
    }
    [extra, disc].forEach((x) => x.addEventListener('input', drawSum));
    const picker = SS.UI.productPicker({ useCost: true, placeholder: 'ကုန်ပစ္စည်း ရှာ၍ ထည့်ရန်…', onPick: (p) => { const ex = items.find((i) => i.productId === p.id); if (ex) ex.qty = U.r3(ex.qty + 1); else items.push({ productId: p.id, qty: 1, unitCost: p.cost }); drawItems(); } });
    function gather() { return { supplierId: supplier.value, date: date.value, items: items.map((i) => ({ productId: i.productId, qty: i.qty, unitCost: i.unitCost })), extraCost: val(extra), discount: val(disc), notes: notes.value, initialPayment: { amount: confirmedEdit ? 0 : val(paid), method: method.value } }; }
    async function run(mode, close) {
      U.formError(err, '');
      try {
        const d = gather();
        if (confirmedEdit) { if (!await U.confirm('အတည်ပြုပြီး ဝယ်ယူမှုကို ပြင်လျှင် စတော့ပြင်ဆင်မှတ်တမ်း ဖန်တီးမည်။ ဆက်လုပ်မလား?')) return false; Pu.updateConfirmed(existing.id, d); }
        else { const p = Pu.saveDraft(d, existing && existing.id); if (mode === 'confirm') { if (!await U.confirm('အတည်ပြုလျှင် စတော့ တိုးသွားမည်။ အတည်ပြုမလား?')) { U.toast('မူကြမ်းအဖြစ် သိမ်းပြီးပါပြီ', 'success'); close(); SS.refresh(); return false; } Pu.confirm(p.id); } }
        U.toast(mode === 'confirm' ? 'ဝယ်ယူမှု အတည်ပြုပြီး စတော့တိုးပြီးပါပြီ' : 'သိမ်းဆည်းပြီးပါပြီ', 'success'); close(); SS.refresh();
      } catch (er) { U.formError(err, er.message); return false; }
    }
    drawItems();
    U.modal({ title: existing ? `ဝယ်ယူမှု ${e.number} ပြင်ရန်` : 'ဝယ်ယူမှု အသစ်', size: 'xl', sticky: true, body: [err,
      h('div', { class: 'form-grid' }, U.field('ပေးသွင်းသူ', supplier, { required: true }), U.field('ရက်စွဲ', date, { required: true })), U.field('ကုန်ပစ္စည်း ထည့်ရန်', picker), tbl,
      h('div', { class: 'grid g2', style: 'margin-top:12px' }, h('div', null, U.field('အပိုကုန်ကျစရိတ် (ပို့ခ စသည်)', extra), U.field('လျှော့ငွေ', disc),
        confirmedEdit ? h('p', { class: 'muted small' }, 'ငွေပေးချေမှုကို "ငွေပေးချေ" ခလုတ်ဖြင့် သီးခြားမှတ်တမ်းတင်ပါ။') : h('div', { class: 'form-grid' }, U.field('ယခုပေးငွေ', paid, { hint: 'အတည်ပြုချိန်တွင် မှတ်တမ်းတင်မည်၊ ကျန်ငွေကို ပေးရန်ကျန်ဟု သတ်မှတ်မည်' }), U.field('နည်းလမ်း', method)), U.field('မှတ်ချက်', notes)), h('div', { class: 'card', style: 'box-shadow:none;align-self:start' }, sum))],
      buttons: confirmedEdit ? [{ label: 'မလုပ်တော့ပါ' }, { label: 'ပြင်ဆင်မှု သိမ်းမည်', class: 'btn-primary', close: false, onClick: (ev, close) => run('edit', close) }]
        : [{ label: 'မလုပ်တော့ပါ' }, { label: 'မူကြမ်းသိမ်းမည်', class: 'btn-ghost', close: false, onClick: (ev, close) => run('draft', close) }, { label: 'သိမ်းပြီး အတည်ပြုမည်', class: 'btn-primary', close: false, onClick: (ev, close) => run('confirm', close) }] });
  }

  function detail(id) {
    const p = Pu.get(id); if (!p) return;
    const sup = SS.Suppliers.get(p.supplierId), bal = Pu.balanceOf(p);
    U.modal({ title: 'ဝယ်ယူမှု ' + p.number, size: 'lg', body: h('div', { class: 'stack' },
      h('dl', { class: 'kv' }, h('dt', null, 'ပေးသွင်းသူ'), h('dd', null, sup ? sup.name : '—'), h('dt', null, 'ရက်စွဲ'), h('dd', null, U.fmtDate(p.date)), h('dt', null, 'အခြေအနေ'), h('dd', null, U.badge(SS.PURCHASE_STATUS[p.status], p.status === 'confirmed' ? 'ok' : p.status === 'draft' ? 'warn' : 'muted')),
        h('dt', null, 'ကုန်ပစ္စည်းပေါင်း'), h('dd', null, U.money(p.itemsTotal)), h('dt', null, 'အပိုကုန်ကျစရိတ်'), h('dd', null, U.money(p.extraCost)), h('dt', null, 'လျှော့ငွေ'), h('dd', null, U.money(p.discount)), h('dt', null, 'စုစုပေါင်း'), h('dd', null, h('strong', null, U.money(p.total))),
        h('dt', null, 'ပေးပြီး'), h('dd', null, U.money(p.paid)), h('dt', null, 'ပေးရန်ကျန်'), h('dd', null, h('strong', null, U.money(bal))), h('dt', null, 'မှတ်ချက်'), h('dd', null, p.notes || '—'), p.cancelReason ? [h('dt', null, 'ပယ်ဖျက်အကြောင်းရင်း'), h('dd', null, p.cancelReason)] : null),
      U.table([{ label: 'ကုန်ပစ္စည်း', key: 'name' }, { label: 'အရေအတွက်', class: 'num', render: (i) => U.qty(i.qty) }, { label: 'ဝယ်ဈေး', class: 'num', render: (i) => U.money(i.unitCost) }, { label: 'ပေါင်း', class: 'num', render: (i) => U.money(i.lineTotal) }], p.items),
      h('h4', null, 'ငွေပေးချေမှုများ'), Pu.payments(id).length ? U.table([{ label: 'ရက်စွဲ', render: (x) => U.fmtDateTime(x.at) }, { label: 'ပမာဏ', class: 'num', render: (x) => U.money(x.amount) }, { label: 'နည်းလမ်း', render: (x) => SS.PAY[x.method] || x.method }, { label: 'မှတ်ချက်', render: (x) => x.note || '' }], Pu.payments(id)) : U.empty('မရှိသေးပါ')),
      buttons: [{ label: 'ပိတ်မည်' }, { label: 'ပရင့်', class: 'btn-ghost', close: false, onClick: () => U.printNode(printNode(p), 'A4') }, bal > 0 ? { label: 'ငွေပေးချေမည်', class: 'btn-primary', close: false, onClick: () => SS.UI.paymentModal({ title: 'ပေးသွင်းသူသို့ ငွေပေးချေရန်', max: bal, defaultAmount: bal, info: p.number, onSubmit: (a, m, n) => Pu.pay(id, a, m, n) }) } : null].filter(Boolean) });
  }

  const state = { q: '', status: '', supplier: '', from: '', to: '', page: 1 };
  SS.pages.purchases = {
    title: 'ဝယ်ယူမှု စီမံခန့်ခွဲမှု',
    render(root) {
      const out = h('div');
      function draw() {
        U.clear(out);
        const q = state.q.trim().toLowerCase();
        const rows = Pu.all().filter((p) => (!state.status || p.status === state.status) && (!state.supplier || p.supplierId === state.supplier) && U.inRange(p.date, state.from, state.to) && (!q || (p.number + ' ' + SS.Suppliers.name(p.supplierId)).toLowerCase().includes(q))).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.number < b.number ? 1 : -1));
        if (!rows.length) return out.appendChild(U.empty(Pu.all().length ? 'စစ်ထုတ်မှုနှင့် ကိုက်ညီသည့် မှတ်တမ်း မရှိပါ' : 'ဝယ်ယူမှု မရှိသေးပါ', '"+ ဝယ်ယူမှုအသစ်" ဖြင့် စတင်ပါ'));
        const per = 15, pages = Math.max(1, Math.ceil(rows.length / per)); if (state.page > pages) state.page = pages;
        out.appendChild(U.table([{ label: 'နံပါတ်', render: (p) => h('strong', null, p.number) }, { label: 'ရက်စွဲ', render: (p) => U.fmtDate(p.date) }, { label: 'ပေးသွင်းသူ', render: (p) => SS.Suppliers.name(p.supplierId) },
          { label: 'စုစုပေါင်း', class: 'num', render: (p) => U.money(p.total) }, { label: 'ပေးပြီး', class: 'num', render: (p) => U.money(p.paid) }, { label: 'ကျန်', class: 'num', render: (p) => { const b = Pu.balanceOf(p); return b > 0 ? h('span', { style: 'color:var(--err)' }, U.money(b)) : U.money(0); } },
          { label: 'အခြေအနေ', render: (p) => U.badge(SS.PURCHASE_STATUS[p.status], p.status === 'confirmed' ? 'ok' : p.status === 'draft' ? 'warn' : 'muted') },
          { label: '', class: 'actions', render: (p) => [h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => detail(p.id) }, 'ကြည့်'),
            p.status !== 'cancelled' ? h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => purchaseForm(p) }, 'ပြင်') : null,
            p.status === 'draft' ? h('button', { type: 'button', class: 'btn btn-primary btn-sm', onClick: async () => { if (!await U.confirm(`${p.number} ကို အတည်ပြုမလား? စတော့ တိုးသွားမည်။`)) return; try { Pu.confirm(p.id); U.toast('အတည်ပြုပြီးပါပြီ', 'success'); SS.refresh(); } catch (er) { U.toast(er.message, 'error'); } } }, 'အတည်ပြု') : null,
            p.status !== 'cancelled' ? h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: async () => { const r = await U.askReason({ title: `${p.number} ပယ်ဖျက်ရန်`, message: p.status === 'confirmed' ? 'စတော့ကို ပြန်လျှော့မည်၊ ပေးပြီးငွေရှိလျှင် ပြန်ရငွေအဖြစ် မှတ်တမ်းတင်မည်။' : 'မူကြမ်းကို ပယ်ဖျက်မည်။', danger: true, confirmLabel: 'ပယ်ဖျက်မည်' }); if (!r) return; try { Pu.cancel(p.id, r); U.toast('ပယ်ဖျက်ပြီးပါပြီ', 'success'); SS.refresh(); } catch (er) { U.toast(er.message, 'error'); } } }, 'ပယ်ဖျက်') : null] }],
          rows.slice((state.page - 1) * per, state.page * per)));
        out.appendChild(U.pager(rows.length, state.page, per, (n) => { state.page = n; draw(); }));
        out._rows = rows;
      }
      const on = (k) => (e) => { state[k] = e.target.value; state.page = 1; draw(); };
      root.appendChild(U.pageHeader('ဝယ်ယူမှု စီမံခန့်ခွဲမှု', 'ပေးသွင်းသူထံမှ ကုန်ပစ္စည်းဝယ်ယူမှုများ — အတည်ပြုမှသာ စတော့တိုးမည်', [h('button', { type: 'button', class: 'btn btn-primary', onClick: () => { if (!SS.Suppliers.active().length) return U.toast('ဦးစွာ ပေးသွင်းသူ ထည့်ပါ', 'error'); if (!SS.Products.all().length) return U.toast('ဦးစွာ ကုန်ပစ္စည်း ထည့်ပါ', 'error'); purchaseForm(null); } }, '+ ဝယ်ယူမှုအသစ်')]));
      root.appendChild(h('div', { class: 'card' }, h('div', { class: 'toolbar' }, h('input', { type: 'search', class: 'grow', placeholder: 'နံပါတ်/ပေးသွင်းသူ ရှာရန်…', 'aria-label': 'ရှာရန်', value: state.q, onInput: on('q') }),
        U.select([{ value: '', label: 'အခြေအနေအားလုံး' }].concat(Object.keys(SS.PURCHASE_STATUS).map((k) => ({ value: k, label: SS.PURCHASE_STATUS[k] }))), state.status, { 'aria-label': 'အခြေအနေ', onChange: on('status') }),
        U.select([{ value: '', label: 'ပေးသွင်းသူအားလုံး' }].concat(SS.Suppliers.all().map((s) => ({ value: s.id, label: s.name }))), state.supplier, { 'aria-label': 'ပေးသွင်းသူ', onChange: on('supplier') }),
        h('input', { type: 'date', value: state.from, 'aria-label': 'မှ', onChange: on('from') }), h('input', { type: 'date', value: state.to, 'aria-label': 'ထိ', onChange: on('to') }),
        h('button', { type: 'button', class: 'btn btn-ghost', onClick: () => U.download('smartstock-purchases.csv', Pu.toCSV(out._rows), 'text/csv') }, 'CSV')), out));
      draw();
    }
  };
})();

;
/* SmartStock — sales.js : sales transaction, returns/cancellations, receipts, POS and sales history pages
   Money rules (all integer MMK):
     gross      = round(qty × unitPrice)
     line disc  = fixed (≤ gross) or percent (rounded)
     txn disc   = fixed/percent on Σ(gross − line disc), allocated to lines by largest-remainder so parts sum exactly
     tax        = round(taxBase × rate), allocated to lines (only if enabled in Settings; default OFF)
     item.net   = gross − line disc − allocated txn disc   (revenue, excl. tax)
     item.cost  = product weighted-average cost AT SALE TIME (snapshot; never rewritten)
   Paid vs. balance: sale.paid is cash actually collected (net of cash refunds); balance = total − returned − paid. */
(function () {
  'use strict';
  const SS = window.SS, St = SS.Storage, U = SS.U, h = U.h;
  const Sa = (SS.Sales = {});

  Sa.all = () => St.all('sales');
  Sa.get = (id) => St.byId('sales', id);
  Sa.returnedTotal = (s) => s.refundTotal || 0;
  Sa.balanceOf = (s) => Math.max(0, s.total - (s.refundTotal || 0) - s.paid);
  Sa.netTotal = (s) => s.total - (s.refundTotal || 0);

  function discAmount(base, type, value, label) {
    if (value === '' || value == null) value = 0;
    const v = typeof value === 'number' ? value : U.parseNum(value);
    if (!Number.isFinite(v) || v < 0) throw new Error(label + ' လျှော့စျေး မမှန်ပါ');
    if (type === 'pct') { if (v > 100) throw new Error(label + ' လျှော့စျေး ၁၀၀% ထက် မများရ'); return Math.round((base * v) / 100); }
    if (!Number.isInteger(v)) throw new Error(label + ' လျှော့ငွေသည် ကိန်းပြည့် ဖြစ်ရမည်');
    if (v > base) throw new Error(label + ' လျှော့ငွေသည် ' + U.money(base) + ' ထက် မများရ');
    return v;
  }
  // Pure calculator used by both POS preview and the committed transaction.
  Sa.calc = function (items, txn, taxRate) {
    const lines = items.map((i) => {
      const gross = Math.round(i.qty * i.price);
      const disc = discAmount(gross, i.discType, i.discValue, 'ကုန်ပစ္စည်း');
      return { gross, disc, net1: gross - disc };
    });
    const subtotal = U.sum(lines, (l) => l.net1);
    const txnDisc = discAmount(subtotal, txn && txn.type, txn && txn.value, 'ဘောက်ချာ');
    const alloc = U.allocate(txnDisc, lines.map((l) => l.net1));
    lines.forEach((l, i) => { l.alloc = alloc[i]; l.net = l.net1 - alloc[i]; });
    const base = subtotal - txnDisc;
    const tax = taxRate > 0 ? Math.round((base * taxRate) / 100) : 0;
    const taxParts = U.allocate(tax, lines.map((l) => l.net));
    lines.forEach((l, i) => { l.tax = taxParts[i]; l.total = l.net + l.tax; });
    return { lines, subtotal, txnDisc, base, tax, total: base + tax, discountTotal: U.sum(lines, (l) => l.disc) + txnDisc };
  };

  // Single centralized sale transaction. All-or-nothing via Storage.tx.
  Sa.create = (d) => St.tx(() => {
    if (d.requestKey) { const dup = Sa.all().find((s) => s.requestKey === d.requestKey); if (dup) return dup; } // duplicate-submit guard
    const st = SS.Settings.get();
    if (!Array.isArray(d.items) || !d.items.length) throw new Error('ဈေးခြင်းတောင်း ဗလာဖြစ်နေသည်');
    const cust = SS.Customers.get(d.customerId || SS.Customers.WALKIN);
    if (!cust || cust.status !== 'active') throw new Error('ဖောက်သည် မမှန်ပါ');
    if (!SS.PAY[d.method]) throw new Error('ငွေပေးချေမှုနည်းလမ်း မမှန်ပါ');
    const seen = new Set(), items = [];
    for (const i of d.items) {
      const p = SS.Products.get(i.productId);
      if (!p || p.status !== 'active') throw new Error('ကုန်ပစ္စည်း မရှိ/Archive လုပ်ထားသည်');
      if (seen.has(p.id)) throw new Error(`"${p.name}" ထပ်နေသည်`); seen.add(p.id);
      const q = U.r3(i.qty);
      if (!(q > 0)) throw new Error(`"${p.name}" အရေအတွက် မမှန်ပါ`);
      if (!p.decimal && !Number.isInteger(q)) throw new Error(`"${p.name}" ကို ကိန်းပြည့်ဖြင့်သာ ရောင်းနိုင်သည်`);
      if (q > p.stock) throw new Error(`"${p.name}" လက်ကျန် မလုံလောက်ပါ (လက်ကျန် ${U.qty(p.stock)}၊ တောင်းဆို ${U.qty(q)})`);
      items.push({ p, qty: q, price: p.price, discType: i.discType, discValue: i.discValue });
    }
    const c = Sa.calc(items, { type: d.discType, value: d.discValue }, st.taxEnabled ? st.taxRate : 0);
    if (c.total <= 0) throw new Error('စုစုပေါင်းသည် ၀ ထက်ကြီးရမည်');
    let received = d.received == null || d.received === '' ? c.total : d.received;
    if (!Number.isInteger(received) || received < 0) throw new Error('လက်ခံငွေ မမှန်ပါ');
    const paid = Math.min(received, c.total), change = Math.max(0, received - c.total);
    if (paid < c.total) {
      if (cust.id === SS.Customers.WALKIN) throw new Error('ဧည့်သည် (Walk-in) သည် ငွေအပြည့် ပေးရမည်။ အကြွေးရောင်းလိုပါက ဖောက်သည်ကို ရွေးပါ');
      if (!st.allowCredit) throw new Error('အကြွေးရောင်းချမှုကို ဆက်တင်တွင် ပိတ်ထားသည်');
    }
    const at = U.nowISO(), number = St.nextNumber('sale', 'INV-', 6), id = U.uid('sal');
    const sale = { id, number, at, customerId: cust.id, customerName: cust.name, method: d.method, status: 'completed', requestKey: d.requestKey || '',
      subtotal: c.subtotal, discType: d.discType === 'pct' ? 'pct' : 'fixed', discValue: Number(d.discValue) || 0, txnDiscount: c.txnDisc, discountTotal: c.discountTotal,
      taxRate: st.taxEnabled ? st.taxRate : 0, tax: c.tax, total: c.total, received, change, paid, refundTotal: 0, notes: String(d.notes || '').slice(0, 300), returns: [], items: [] };
    items.forEach((it, i) => {
      const l = c.lines[i], p = it.p;
      sale.items.push({ productId: p.id, name: p.name, sku: p.sku, unit: p.unit, qty: it.qty, unitPrice: it.price, cost: p.cost, discType: it.discType === 'pct' ? 'pct' : 'fixed', discValue: Number(it.discValue) || 0,
        gross: l.gross, disc: l.disc, allocDisc: l.alloc, net: l.net, tax: l.tax, total: l.total, returnedQty: 0, returnedNet: 0, returnedTax: 0, returnedAmt: 0, returnedCogs: 0 });
      SS.Inventory.apply({ productId: p.id, delta: -it.qty, type: 'sale', reason: 'ရောင်းချမှု ' + number, refType: 'sale', refId: id, at });
    });
    Sa.all().push(sale); St.save('sales');
    if (paid > 0) { St.all('payments').push({ id: U.uid('pay'), direction: 'in', partyType: 'customer', partyId: cust.id, refType: 'sale', refId: id, amount: paid, method: d.method, note: 'ရောင်းချချိန်တွင် လက်ခံ', at }); St.save('payments'); }
    return sale;
  });

  // Return (kind 'return') or whole-sale cancellation (kind 'cancel'). Original sale record is preserved; a return entry is appended.
  Sa.processReturn = (saleId, o) => St.tx(() => {
    const s = Sa.get(saleId); if (!s) throw new Error('ရောင်းချမှု ရှာမတွေ့ပါ');
    if (s.status === 'cancelled' || s.status === 'returned') throw new Error('ပြန်အမ်း/ပယ်ဖျက်ပြီးသား ဖြစ်သည်');
    const reason = String(o.reason || '').trim(); if (reason.length < 3) throw new Error('အကြောင်းရင်း ရေးရန် လိုအပ်သည်');
    const method = o.method || s.method; if (!SS.PAY[method]) throw new Error('ငွေပေးချေမှုနည်းလမ်း မမှန်ပါ');
    const restock = o.restock !== false, at = U.nowISO();
    let req = o.items;
    if (o.kind === 'cancel') req = s.items.filter((i) => i.qty - i.returnedQty > 0).map((i) => ({ productId: i.productId, qty: U.r3(i.qty - i.returnedQty) }));
    if (!req || !req.length) throw new Error('ပြန်အမ်းမည့် ကုန်ပစ္စည်း ရွေးပါ');
    const ret = { id: U.uid('ret'), at, kind: o.kind === 'cancel' ? 'cancel' : 'return', reason, restock, items: [], net: 0, tax: 0, amount: 0, cogs: 0, cashRefund: 0, method };
    for (const r of req) {
      const it = s.items.find((x) => x.productId === r.productId); if (!it) throw new Error('ရောင်းချမှုတွင် မပါသော ကုန်ပစ္စည်း');
      const q = U.r3(r.qty), remain = U.r3(it.qty - it.returnedQty);
      if (!(q > 0) || q > remain) throw new Error(`"${it.name}" ပြန်အမ်းနိုင်သည့် အများဆုံး ${U.qty(remain)} သာ`);
      const last = q === remain;
      const net = last ? it.net - it.returnedNet : Math.round((it.net * q) / it.qty);
      const tax = last ? it.tax - it.returnedTax : Math.round((it.tax * q) / it.qty);
      const cogs = Math.round(it.cost * q);
      it.returnedQty = U.r3(it.returnedQty + q); it.returnedNet += net; it.returnedTax += tax; it.returnedAmt += net + tax; it.returnedCogs += restock ? cogs : 0;
      ret.items.push({ productId: it.productId, name: it.name, qty: q, net, tax, amount: net + tax, cogs: restock ? cogs : 0 });
      ret.net += net; ret.tax += tax; ret.amount += net + tax; ret.cogs += restock ? cogs : 0;
      if (restock) SS.Inventory.apply({ productId: it.productId, delta: q, type: 'sale_return', reason: (ret.kind === 'cancel' ? 'ပယ်ဖျက် ' : 'ပြန်အမ်း ') + s.number + ': ' + reason, refType: 'sale', refId: s.id, at });
    }
    s.refundTotal = (s.refundTotal || 0) + ret.amount;
    // Goods value first cancels any unpaid balance (credit note); only cash actually collected beyond the new net total is paid back.
    const cashRefund = Math.max(0, s.paid - (s.total - s.refundTotal));
    ret.cashRefund = cashRefund; s.paid -= cashRefund;
    s.returns.push(ret);
    const fully = s.items.every((i) => U.r3(i.qty - i.returnedQty) === 0);
    s.status = fully ? (ret.kind === 'cancel' ? 'cancelled' : 'returned') : 'partially_returned';
    if (ret.kind === 'cancel') { s.status = 'cancelled'; s.cancelReason = reason; }
    St.save('sales');
    if (cashRefund > 0) { St.all('payments').push({ id: U.uid('pay'), direction: 'out', partyType: 'customer', partyId: s.customerId, refType: 'sale_refund', refId: s.id, amount: cashRefund, method, note: (ret.kind === 'cancel' ? 'ပယ်ဖျက်' : 'ပြန်အမ်း') + ' ငွေပြန်အမ်း: ' + reason, at }); St.save('payments'); }
    return ret;
  });
  Sa.cancel = (id, reason, restock) => Sa.processReturn(id, { kind: 'cancel', reason, restock });

  Sa.toCSV = (rows) => U.csv(['Sale No.', 'Time', 'Customer', 'Status', 'Payment method', 'Product', 'SKU', 'Qty', 'Unit price', 'Line discount', 'Allocated bill discount', 'Net (excl. tax)', 'Tax', 'Unit cost (snapshot)', 'Returned qty', 'Sale total', 'Paid'],
    [].concat(...(rows || Sa.all()).map((s) => s.items.map((i) => [s.number, s.at, s.customerName, s.status, s.method, i.name, i.sku, i.qty, i.unitPrice, i.disc, i.allocDisc, i.net, i.tax, i.cost, i.returnedQty, s.total, s.paid]))));

  /* ---------------- receipt ---------------- */
  Sa.receiptNode = function (s, width) {
    const st = SS.Settings.get(); width = width || st.receiptWidth;
    const cls = width === 'A4' ? 'receipt receipt-a4' : width === '58mm' ? 'receipt receipt-58' : 'receipt receipt-80';
    const row = (a, b, bold) => h('tr', { class: bold ? 'tot' : '' }, h('td', null, a), h('td', { class: 'r' }, b));
    const lines = [];
    s.items.forEach((i) => {
      lines.push(h('tr', null, h('td', { colspan: 2 }, i.name)));
      lines.push(row(`${U.qty(i.qty)} × ${U.money(i.unitPrice)}`, U.money(i.gross)));
      if (i.disc > 0) lines.push(row('  လျှော့စျေး' + (i.discType === 'pct' ? ` (${i.discValue}%)` : ''), '-' + U.money(i.disc)));
    });
    const logo = U.safeImg(st.logo);
    const sums = [row('ကုန်ပစ္စည်းစုစုပေါင်း', U.money(s.subtotal + U.sum(s.items, (i) => i.disc)))];
    if (s.discountTotal > 0) sums.push(row('လျှော့စျေးစုစုပေါင်း', '-' + U.money(s.discountTotal)));
    if (s.tax > 0) sums.push(row(`အခွန် (${s.taxRate}%)`, U.money(s.tax)));
    sums.push(row('စုစုပေါင်း', U.money(s.total), true));
    if ((s.refundTotal || 0) > 0) sums.push(row('ပြန်အမ်းတန်ဖိုး', '-' + U.money(s.refundTotal)));
    sums.push(row('ငွေပေးချေမှု (' + (SS.PAY[s.method] || s.method) + ')', ''), row('လက်ခံငွေ', U.money(s.received)), row('ပြန်အမ်းငွေ (အကြွေး)', U.money(s.change)));
    if (Sa.balanceOf(s) > 0) sums.push(row('ကျန်ငွေ (အကြွေး)', U.money(Sa.balanceOf(s)), true));
    return h('div', { class: cls }, logo ? h('img', { class: 'logo', src: logo, alt: '' }) : null, h('h4', null, st.shopName), st.shopAddress ? h('div', { class: 'c' }, st.shopAddress) : null, st.shopPhone ? h('div', { class: 'c' }, 'ဖုန်း: ' + st.shopPhone) : null, h('hr'),
      h('div', null, 'ဘောက်ချာ: ' + s.number), h('div', null, 'ရက်စွဲ: ' + U.fmtDateTime(s.at)), h('div', null, 'ဖောက်သည်: ' + s.customerName), s.status !== 'completed' ? h('div', null, 'အခြေအနေ: ' + SS.SALE_STATUS[s.status]) : null, h('hr'),
      h('table', null, h('tbody', null, lines)), h('hr'), h('table', null, h('tbody', null, sums)), h('hr'), h('div', { class: 'c' }, st.receiptFooter));
  };
  SS.UI.receiptModal = function (s) {
    const st = SS.Settings.get();
    const sel = U.select([{ value: '58mm', label: '58mm' }, { value: '80mm', label: '80mm' }, { value: 'A4', label: 'A4' }], st.receiptWidth, { 'aria-label': 'စာရွက်အကျယ်' });
    const box = h('div', { style: 'overflow:auto;max-height:60vh' });
    const draw = () => { U.clear(box).appendChild(Sa.receiptNode(s, sel.value)); };
    sel.addEventListener('change', draw); draw();
    // sticky: a stray second click on "complete sale" must not dismiss the receipt by hitting the overlay
    U.modal({ title: 'ဘောက်ချာ ' + s.number, size: 'md', sticky: true, body: [h('div', { class: 'toolbar' }, h('span', null, 'စာရွက်:'), sel), box],
      buttons: [{ label: 'ပိတ်မည်' }, { label: 'ပရင့်ထုတ်မည်', class: 'btn-primary', close: false, onClick: () => U.printNode(Sa.receiptNode(s, sel.value), sel.value) }] });
  };

  /* ---------------- return dialog ---------------- */
  function returnDialog(s) {
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    const rows = s.items.filter((i) => U.r3(i.qty - i.returnedQty) > 0);
    const ins = rows.map(() => h('input', { type: 'text', inputmode: 'decimal', class: 'mini', value: '0' }));
    const reason = h('input', { type: 'text', maxlength: 200 }), restock = h('input', { type: 'checkbox', checked: true });
    const method = U.select(Object.keys(SS.PAY).map((k) => ({ value: k, label: SS.PAY[k] })), s.method);
    U.modal({ title: 'ပြန်အမ်းခြင်း — ' + s.number, size: 'lg', body: [err,
      U.table([{ label: 'ကုန်ပစ္စည်း', key: 'name' }, { label: 'ရောင်းခဲ့', class: 'num', render: (i) => U.qty(i.qty) }, { label: 'ပြန်အမ်းပြီး', class: 'num', render: (i) => U.qty(i.returnedQty) }, { label: 'ယခု ပြန်အမ်းမည်', render: (i) => ins[rows.indexOf(i)] }], rows),
      h('div', { class: 'form-grid', style: 'margin-top:12px' }, U.field('အကြောင်းရင်း (မဖြစ်မနေ)', reason, { required: true }), U.field('ငွေပြန်အမ်းနည်းလမ်း', method)),
      h('label', { class: 'check' }, restock, 'ကုန်ပစ္စည်းကို စတော့ထဲ ပြန်ထည့်မည် (ပျက်စီးနေလျှင် အမှန်ခြစ်ကို ဖြုတ်ပါ)'),
      h('p', { class: 'muted small' }, 'ပြန်အမ်းတန်ဖိုးကို လျှော့စျေး/အခွန် အချိုးကျ တွက်ပါမည်။ မပေးရသေးသော အကြွေးရှိလျှင် ဦးစွာ ထိုအကြွေးမှ လျှော့ပြီး ကျန်သာ ငွေသားပြန်အမ်းမည်။')],
      buttons: [{ label: 'မလုပ်တော့ပါ' }, { label: 'ပြန်အမ်းမည်', class: 'btn-danger', close: false, onClick: async (ev, close) => {
        const items = rows.map((i, k) => ({ productId: i.productId, qty: U.parseNum(ins[k].value) })).filter((x) => x.qty !== 0);
        if (items.some((x) => !(x.qty > 0))) { U.formError(err, 'အရေအတွက် မမှန်ပါ'); return false; }
        if (!items.length) { U.formError(err, 'ပြန်အမ်းမည့် အရေအတွက် ထည့်ပါ'); return false; }
        if (!await U.confirm('ပြန်အမ်းမှုကို မှတ်တမ်းတင်မလား? (မူရင်းရောင်းချမှုကို မဖျက်ပါ)', { danger: true, confirmLabel: 'အတည်ပြုသည်' })) return false;
        try { const r = Sa.processReturn(s.id, { items, reason: reason.value, restock: restock.checked, method: method.value }); close(); U.toast('ပြန်အမ်းပြီးပါပြီ' + (r.cashRefund ? ' — ငွေသားပြန်အမ်း ' + U.money(r.cashRefund) : ''), 'success'); SS.refresh(); } catch (er) { U.formError(err, er.message); return false; }
      } }] });
  }

  function detail(id) {
    const s = Sa.get(id); if (!s) return;
    const bal = Sa.balanceOf(s), canReturn = s.status === 'completed' || s.status === 'partially_returned';
    const pays = St.all('payments').filter((p) => p.refId === s.id && (p.refType === 'sale' || p.refType === 'sale_refund')).sort((a, b) => (a.at < b.at ? -1 : 1));
    U.modal({ title: 'ရောင်းချမှု ' + s.number, size: 'lg', body: h('div', { class: 'stack' },
      h('dl', { class: 'kv' }, h('dt', null, 'ရက်စွဲ'), h('dd', null, U.fmtDateTime(s.at)), h('dt', null, 'ဖောက်သည်'), h('dd', null, s.customerName), h('dt', null, 'အခြေအနေ'), h('dd', null, U.badge(SS.SALE_STATUS[s.status], s.status === 'completed' ? 'ok' : s.status === 'cancelled' ? 'muted' : 'warn')),
        h('dt', null, 'ငွေပေးချေမှု'), h('dd', null, SS.PAY[s.method] || s.method), h('dt', null, 'လျှော့စျေးစုစုပေါင်း'), h('dd', null, U.money(s.discountTotal)), h('dt', null, 'အခွန်'), h('dd', null, U.money(s.tax)),
        h('dt', null, 'စုစုပေါင်း'), h('dd', null, h('strong', null, U.money(s.total))), h('dt', null, 'ပြန်အမ်းတန်ဖိုး'), h('dd', null, U.money(s.refundTotal || 0)), h('dt', null, 'လက်ခံရရှိငွေ (အသားတင်)'), h('dd', null, U.money(s.paid)), h('dt', null, 'ကျန်ငွေ (အကြွေး)'), h('dd', null, h('strong', null, U.money(bal))),
        s.cancelReason ? [h('dt', null, 'ပယ်ဖျက်အကြောင်းရင်း'), h('dd', null, s.cancelReason)] : null),
      U.table([{ label: 'ကုန်ပစ္စည်း', key: 'name' }, { label: 'အရေအတွက်', class: 'num', render: (i) => U.qty(i.qty) }, { label: 'ဈေး', class: 'num', render: (i) => U.money(i.unitPrice) }, { label: 'လျှော့', class: 'num', render: (i) => U.money(i.disc + i.allocDisc) }, { label: 'ပေါင်း', class: 'num', render: (i) => U.money(i.total) }, { label: 'ပြန်အမ်း', class: 'num', render: (i) => (i.returnedQty ? U.qty(i.returnedQty) : '') }], s.items),
      s.returns.length ? [h('h4', null, 'ပြန်အမ်း/ပယ်ဖျက် မှတ်တမ်း'), U.table([{ label: 'ရက်စွဲ', render: (r) => U.fmtDateTime(r.at) }, { label: 'အမျိုးအစား', render: (r) => (r.kind === 'cancel' ? 'ပယ်ဖျက်' : 'ပြန်အမ်း') }, { label: 'တန်ဖိုး', class: 'num', render: (r) => U.money(r.amount) }, { label: 'ငွေသားပြန်အမ်း', class: 'num', render: (r) => U.money(r.cashRefund) }, { label: 'အကြောင်းရင်း', key: 'reason' }], s.returns)] : null,
      pays.length ? [h('h4', null, 'ငွေစာရင်း'), U.table([{ label: 'ရက်စွဲ', render: (p) => U.fmtDateTime(p.at) }, { label: 'ဝင်/ထွက်', render: (p) => (p.direction === 'in' ? 'လက်ခံ' : 'ပြန်အမ်း') }, { label: 'ပမာဏ', class: 'num', render: (p) => U.money(p.amount) }, { label: 'နည်းလမ်း', render: (p) => SS.PAY[p.method] || p.method }], pays)] : null),
      buttons: [{ label: 'ပိတ်မည်' }, { label: 'ဘောက်ချာ', class: 'btn-ghost', close: false, onClick: () => SS.UI.receiptModal(s) },
        bal > 0 && s.customerId !== SS.Customers.WALKIN && s.status !== 'cancelled' ? { label: 'အကြွေးငွေ လက်ခံ', class: 'btn-primary', close: false, onClick: () => SS.UI.paymentModal({ title: 'အကြွေးငွေ လက်ခံရန်', max: bal, defaultAmount: bal, info: s.number, onSubmit: (a, m, n) => SS.Customers.receive(s.customerId, a, m, n, s.id) }) } : null,
        canReturn ? { label: 'ပြန်အမ်း…', class: 'btn-ghost', close: false, onClick: () => returnDialog(s) } : null,
        canReturn ? { label: 'ပယ်ဖျက်…', class: 'btn-danger', close: false, onClick: async () => {
          const r = await U.askReason({ title: s.number + ' ကို ပယ်ဖျက်ရန်', message: 'ကျန်ရှိသော ကုန်ပစ္စည်းအားလုံးကို စတော့ထဲ ပြန်ထည့်ပြီး ပေးထားငွေကို ပြန်အမ်းမည်။ မူရင်းမှတ်တမ်းကို ထိန်းသိမ်းထားမည်။', danger: true, confirmLabel: 'ပယ်ဖျက်မည်' });
          if (!r) return; try { Sa.cancel(s.id, r, true); U.toast('ပယ်ဖျက်ပြီးပါပြီ', 'success'); SS.refresh(); } catch (er) { U.toast(er.message, 'error'); }
        } } : null].filter(Boolean) });
  }
  SS.UI.saleDetail = detail;

  /* ---------------- POS ---------------- */
  const pos = { cart: [], customerId: null, method: null, received: '', discType: 'fixed', discValue: '', key: null, busy: false, cat: '' };
  function posView() {
    const st = SS.Settings.get();
    if (!pos.customerId || !SS.Customers.get(pos.customerId)) pos.customerId = SS.Customers.WALKIN;
    if (!pos.method) pos.method = st.defaultPayment;
    pos.cart = pos.cart.filter((l) => SS.Products.get(l.productId) && SS.Products.get(l.productId).status === 'active');
    const linesBox = h('div'), totals = h('div'), changeBox = h('div'), tiles = h('div', { class: 'prod-grid' });
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    const completeBtn = h('button', { type: 'button', class: 'btn btn-accent btn-lg btn-block' }, 'ရောင်းချမှု အပြီးသတ်မည်');
    const prod = (l) => SS.Products.get(l.productId);
    const lineSpans = new Map();

    function calcNow() {
      const items = pos.cart.map((l) => ({ qty: l.qty, price: prod(l).price, discType: l.discType, discValue: l.discValue }));
      return Sa.calc(items, { type: pos.discType, value: pos.discValue }, st.taxEnabled ? st.taxRate : 0);
    }
    function refreshTotals() {
      U.clear(totals); U.clear(changeBox);
      pos.cart.forEach((l) => { const w = lineSpans.get(l); if (w) { const p = prod(l); w.warn.textContent = l.qty > p.stock ? `လက်ကျန် ${U.qty(p.stock)} သာ ရှိသည်` : ''; } });
      if (!pos.cart.length) { completeBtn.disabled = true; return totals.appendChild(h('span', { class: 'muted' }, 'ကုန်ပစ္စည်း ထည့်ပါ')); }
      let c;
      try { c = calcNow(); } catch (e) { completeBtn.disabled = true; return totals.appendChild(h('div', { class: 'form-error' }, e.message)); }
      pos.cart.forEach((l, i) => { const w = lineSpans.get(l); if (w) w.total.textContent = U.money(c.lines[i].net1); });
      const row = (a, b, cls) => h('div', { class: 'sum-row' + (cls ? ' ' + cls : '') }, h('span', null, a), h('span', { class: 'mono' }, b));
      totals.appendChild(h('div', null, row('ကုန်ပစ္စည်းစုစုပေါင်း (လျှော့ပြီး)', U.money(c.subtotal)), c.txnDisc ? row('ဘောက်ချာလျှော့စျေး', '-' + U.money(c.txnDisc)) : null, c.tax ? row(`အခွန် (${st.taxRate}%)`, U.money(c.tax)) : null, row('ပေးရန်စုစုပေါင်း', U.money(c.total), 'big')));
      const rec = pos.received.trim() === '' ? c.total : U.parseMoney(pos.received);
      if (Number.isNaN(rec) || rec < 0) { changeBox.appendChild(h('div', { class: 'form-error' }, 'လက်ခံငွေ မမှန်ပါ')); }
      else if (rec >= c.total) changeBox.appendChild(row('ပြန်အမ်းငွေ', U.money(rec - c.total), 'big'));
      else changeBox.appendChild(h('div', { class: 'form-warn' }, `ကျန်ငွေ ${U.money(c.total - rec)} ကို အကြွေးအဖြစ် မှတ်တမ်းတင်မည် (ငွေသားရရှိမှု မဟုတ်ပါ)`));
      completeBtn.disabled = pos.busy;
    }
    function drawLines() {
      U.clear(linesBox); lineSpans.clear();
      if (!pos.cart.length) { linesBox.appendChild(U.empty('ဈေးခြင်းတောင်း ဗလာ', 'ကုန်ပစ္စည်း ရှာ၍ ထည့်ပါ')); return refreshTotals(); }
      pos.cart.forEach((l) => {
        const p = prod(l), total = h('span', { class: 'line-total mono' }), warn = h('div', { class: 'small', style: 'color:var(--err)' });
        lineSpans.set(l, { total, warn });
        const qin = h('input', { type: 'text', inputmode: 'decimal', value: String(l.qty), 'aria-label': p.name + ' အရေအတွက်', onInput: (e) => { const n = U.parseNum(e.target.value); l.qty = n > 0 ? n : 0; refreshTotals(); } });
        const setQ = (n) => { l.qty = Math.max(p.decimal ? 0.001 : 1, U.r3(n)); qin.value = String(l.qty); refreshTotals(); };
        l.qtyInput = qin;
        linesBox.appendChild(h('div', { class: 'cart-line' }, h('div', { class: 'top' }, h('div', null, h('strong', null, p.name), h('div', { class: 'muted small' }, U.money(p.price) + ' / ' + p.unit + ' · လက်ကျန် ' + U.qty(p.stock))), total),
          h('div', { class: 'ctl' }, h('div', { class: 'qty-box' }, h('button', { type: 'button', 'aria-label': 'လျှော့', onClick: () => setQ(l.qty - 1) }, '−'), qin, h('button', { type: 'button', 'aria-label': 'တိုး', onClick: () => setQ(l.qty + 1) }, '+')),
            h('input', { type: 'text', inputmode: 'decimal', class: 'mini', placeholder: 'လျှော့', 'aria-label': p.name + ' လျှော့စျေး', value: l.discValue, onInput: (e) => { l.discValue = e.target.value; refreshTotals(); } }),
            U.select([{ value: 'fixed', label: 'ကျပ်' }, { value: 'pct', label: '%' }], l.discType, { class: 'mini-sel', 'aria-label': 'လျှော့စျေးအမျိုးအစား', onChange: (e) => { l.discType = e.target.value; refreshTotals(); } }),
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'aria-label': p.name + ' ဖယ်ရန်', onClick: () => { pos.cart = pos.cart.filter((x) => x !== l); if (!pos.cart.length) pos.key = null; drawLines(); } }, '✕')), warn));
      });
      refreshTotals();
    }
    function add(p) {
      if (p.stock <= 0) return U.toast(`"${p.name}" ကုန်နေသည်`, 'error');
      const ex = pos.cart.find((l) => l.productId === p.id);
      if (ex) { if (ex.qty + 1 > p.stock) return U.toast(`"${p.name}" လက်ကျန် ${U.qty(p.stock)} သာ ရှိသည်`, 'warn'); ex.qty = U.r3(ex.qty + 1); }
      else { if (!pos.cart.length) pos.key = U.uid('req'); pos.cart.push({ productId: p.id, qty: 1, discType: 'fixed', discValue: '' }); }
      drawLines();
    }
    function drawTiles() {
      U.clear(tiles);
      const list = SS.Products.all().filter((p) => p.status === 'active' && (!pos.cat || p.categoryId === pos.cat)).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 36);
      if (!list.length) return tiles.appendChild(U.empty('ရောင်းချရန် ကုန်ပစ္စည်း မရှိသေးပါ', 'ကုန်ပစ္စည်းများ စာမျက်နှာတွင် ဦးစွာ ထည့်ပါ'));
      list.forEach((p) => tiles.appendChild(h('button', { type: 'button', class: 'prod-tile', disabled: p.stock <= 0, onClick: () => add(p) }, h('span', { class: 'n' }, p.name), h('span', { class: 'mono' }, U.money(p.price)), h('span', { class: 'muted small' }, p.stock <= 0 ? 'ကုန်သွားပြီ' : 'လက်ကျန် ' + U.qty(p.stock)))));
    }
    const picker = SS.UI.productPicker({ onPick: add, placeholder: 'ကုန်ပစ္စည်းရှာရန် / ဘားကုဒ်စကင်ဖတ်ပြီး Enter နှိပ်ပါ…' });
    const custSel = h('select', { 'aria-label': 'ဖောက်သည်', onChange: (e) => { pos.customerId = e.target.value; refreshTotals(); } });
    const fillCust = () => { U.clear(custSel); SS.Customers.active().forEach((c) => custSel.appendChild(h('option', { value: c.id }, c.name + (SS.Customers.receivable(c.id) > 0 ? ' (အကြွေး ' + U.money(SS.Customers.receivable(c.id)) + ')' : '')))); custSel.value = pos.customerId; };
    fillCust();
    const methodSel = U.select(Object.keys(SS.PAY).map((k) => ({ value: k, label: SS.PAY[k] })), pos.method, { 'aria-label': 'ငွေပေးချေမှု', onChange: (e) => { pos.method = e.target.value; } });
    const received = h('input', { type: 'text', inputmode: 'numeric', value: pos.received, placeholder: 'ကွက်လပ် = အပြည့်ပေး', 'aria-label': 'လက်ခံငွေ', onInput: (e) => { pos.received = e.target.value; refreshTotals(); } });
    const dv = h('input', { type: 'text', inputmode: 'decimal', class: 'mini', value: pos.discValue, 'aria-label': 'ဘောက်ချာလျှော့စျေး', onInput: (e) => { pos.discValue = e.target.value; refreshTotals(); } });
    const dt = U.select([{ value: 'fixed', label: 'ကျပ်' }, { value: 'pct', label: '%' }], pos.discType, { class: 'mini-sel', 'aria-label': 'လျှော့စျေးအမျိုးအစား', onChange: (e) => { pos.discType = e.target.value; refreshTotals(); } });

    completeBtn.addEventListener('click', async () => {
      if (pos.busy) return;
      pos.busy = true; completeBtn.disabled = true; U.formError(err, '');
      try {
        const c = calcNow(); const rec = pos.received.trim() === '' ? c.total : U.parseMoney(pos.received);
        if (Number.isNaN(rec)) throw new Error('လက်ခံငွေ မမှန်ပါ');
        if (rec < c.total && !await U.confirm(`ငွေ ${U.money(c.total - rec)} ကျန်ပါမည်။ အကြွေးအဖြစ် မှတ်တမ်းတင်မလား?`)) { pos.busy = false; return refreshTotals(); }
        const sale = Sa.create({ customerId: pos.customerId, method: pos.method, received: rec, discType: pos.discType, discValue: pos.discValue, requestKey: pos.key || (pos.key = U.uid('req')),
          items: pos.cart.map((l) => ({ productId: l.productId, qty: l.qty, discType: l.discType, discValue: l.discValue })) });
        Object.assign(pos, { cart: [], received: '', discValue: '', key: null, customerId: SS.Customers.WALKIN });
        received.value = ''; dv.value = ''; fillCust(); drawLines(); drawTiles();
        U.toast(`ရောင်းချမှု ${sale.number} အောင်မြင်ပါသည် (${U.money(sale.total)})`, 'success');
        SS.refreshShell && SS.refreshShell(); SS.UI.receiptModal(sale);
      } catch (e) { U.formError(err, e.message); }
      pos.busy = false; refreshTotals();
    });
    const clearBtn = h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: async () => { if (pos.cart.length && !await U.confirm('ဈေးခြင်းတောင်းကို ရှင်းမလား?')) return; pos.cart = []; pos.key = null; drawLines(); } }, 'ရှင်းမည်');
    const catSel = U.select([{ value: '', label: 'အမျိုးအစားအားလုံး' }].concat(SS.Categories.active().map((c) => ({ value: c.id, label: c.name }))), pos.cat, { 'aria-label': 'အမျိုးအစား', onChange: (e) => { pos.cat = e.target.value; drawTiles(); } });
    drawTiles(); drawLines();
    return h('div', { class: 'pos' },
      h('div', { class: 'card' }, h('div', { class: 'toolbar' }, h('div', { class: 'grow' }, picker), catSel), tiles),
      h('div', { class: 'card pos-cart' }, h('div', { class: 'row between', style: 'margin-bottom:8px' }, h('h3', { style: 'margin:0' }, 'ဈေးခြင်းတောင်း'), clearBtn),
        h('div', { class: 'row', style: 'margin-bottom:8px' }, h('div', { class: 'grow' }, custSel), h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => SS.UI.customerForm(null, (c) => { pos.customerId = c.id; fillCust(); refreshTotals(); }) }, '+ အသစ်')),
        linesBox, h('div', { class: 'row', style: 'margin:10px 0' }, h('span', null, 'ဘောက်ချာလျှော့စျေး'), dv, dt), totals,
        h('div', { class: 'form-grid', style: 'margin-top:10px' }, U.field('ငွေပေးချေမှုနည်းလမ်း', methodSel), U.field('လက်ခံငွေ (MMK)', received)), changeBox, err, h('div', { style: 'margin-top:10px' }, completeBtn)));
  }

  /* ---------------- history ---------------- */
  const hist = { q: '', status: '', method: '', from: '', to: '', page: 1 };
  function historyView() {
    const out = h('div');
    function draw() {
      U.clear(out);
      const q = hist.q.trim().toLowerCase();
      const rows = Sa.all().filter((s) => (!hist.status || s.status === hist.status) && (!hist.method || s.method === hist.method) && U.inRange(U.dayKey(s.at), hist.from, hist.to) && (!q || (s.number + ' ' + s.customerName + ' ' + U.fmtDate(s.at) + ' ' + (SS.PAY[s.method] || '')).toLowerCase().includes(q))).sort((a, b) => (a.at < b.at ? 1 : -1));
      out._rows = rows;
      if (!rows.length) return out.appendChild(U.empty(Sa.all().length ? 'စစ်ထုတ်မှုနှင့် ကိုက်ညီသော ရောင်းချမှု မတွေ့ပါ' : 'ရောင်းချမှု မရှိသေးပါ'));
      const per = 15, pages = Math.max(1, Math.ceil(rows.length / per)); if (hist.page > pages) hist.page = pages;
      out.appendChild(U.table([{ label: 'ဘောက်ချာ', render: (s) => h('strong', null, s.number) }, { label: 'ရက်စွဲ/အချိန်', render: (s) => U.fmtDateTime(s.at) }, { label: 'ဖောက်သည်', key: 'customerName' }, { label: 'စုစုပေါင်း', class: 'num', render: (s) => U.money(s.total) },
        { label: 'လက်ခံရရှိ', class: 'num', render: (s) => U.money(s.paid) }, { label: 'ကျန်ငွေ', class: 'num', render: (s) => { const b = Sa.balanceOf(s); return b > 0 ? h('span', { style: 'color:var(--err)' }, U.money(b)) : U.money(0); } },
        { label: 'နည်းလမ်း', render: (s) => SS.PAY[s.method] || s.method }, { label: 'အခြေအနေ', render: (s) => U.badge(SS.SALE_STATUS[s.status], s.status === 'completed' ? 'ok' : s.status === 'cancelled' ? 'muted' : 'warn') },
        { label: '', class: 'actions', render: (s) => [h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => detail(s.id) }, 'ကြည့်'), h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => SS.UI.receiptModal(s) }, 'ဘောက်ချာ')] }], rows.slice((hist.page - 1) * per, hist.page * per)));
      out.appendChild(U.pager(rows.length, hist.page, per, (n) => { hist.page = n; draw(); }));
    }
    const on = (k) => (e) => { hist[k] = e.target.value; hist.page = 1; draw(); };
    const wrap = h('div', null, h('div', { class: 'toolbar' }, h('input', { type: 'search', class: 'grow', placeholder: 'ဘောက်ချာနံပါတ်/ဖောက်သည်/ရက်စွဲ/နည်းလမ်း…', 'aria-label': 'ရှာရန်', value: hist.q, onInput: on('q') }),
      U.select([{ value: '', label: 'အခြေအနေအားလုံး' }].concat(Object.keys(SS.SALE_STATUS).map((k) => ({ value: k, label: SS.SALE_STATUS[k] }))), hist.status, { 'aria-label': 'အခြေအနေ', onChange: on('status') }),
      U.select([{ value: '', label: 'နည်းလမ်းအားလုံး' }].concat(Object.keys(SS.PAY).map((k) => ({ value: k, label: SS.PAY[k] }))), hist.method, { 'aria-label': 'နည်းလမ်း', onChange: on('method') }),
      h('input', { type: 'date', value: hist.from, 'aria-label': 'မှ', onChange: on('from') }), h('input', { type: 'date', value: hist.to, 'aria-label': 'ထိ', onChange: on('to') }),
      h('button', { type: 'button', class: 'btn btn-ghost', onClick: () => U.download('smartstock-sales.csv', Sa.toCSV(out._rows), 'text/csv') }, 'CSV')), out);
    draw(); return wrap;
  }

  SS.pages.sales = {
    title: 'ရောင်းချမှု / POS',
    render(root) {
      const prm = SS.takeParams ? SS.takeParams() : {};
      root.appendChild(U.pageHeader('ရောင်းချမှု / POS', 'ကုန်ပစ္စည်းရောင်းချရန်နှင့် ရောင်းချမှုမှတ်တမ်း'));
      const tabs = U.tabs([{ id: 'pos', label: 'POS ရောင်းချရန်', render: posView }, { id: 'history', label: 'ရောင်းချမှု မှတ်တမ်း', render: historyView }], prm.tab || 'pos');
      root.appendChild(tabs);
    }
  };
})();

;
/* SmartStock — expenses.js : operating expenses (separate from inventory purchases), void with history, page */
(function () {
  'use strict';
  const SS = window.SS, S = SS.Storage, U = SS.U, h = U.h;
  const E = (SS.Expenses = {});

  E.all = () => S.all('expenses');
  E.get = (id) => S.byId('expenses', id);
  E.active = () => E.all().filter((x) => x.status === 'active');
  E.total = (rows) => U.sum(rows, (x) => x.amount);
  function clean(d) {
    const c = { category: String(d.category || '').trim(), description: String(d.description || '').trim(), amount: d.amount, method: d.method, date: d.date, reference: String(d.reference || '').trim() };
    if (!c.category) throw new Error('အမျိုးအစား ရွေးပါ');
    if (!c.description) throw new Error('အကြောင်းအရာ ထည့်ပါ');
    if (c.description.length > 200) throw new Error('အကြောင်းအရာ ရှည်လွန်းသည်');
    if (!Number.isInteger(c.amount) || c.amount <= 0) throw new Error('ပမာဏသည် ၁ ကျပ်နှင့်အထက် ကိန်းပြည့် ဖြစ်ရမည်');
    if (!SS.PAY[c.method]) throw new Error('ငွေပေးချေမှုနည်းလမ်း မမှန်ပါ');
    if (!U.isDayKey(c.date)) throw new Error('ရက်စွဲ မမှန်ပါ');
    return c;
  }
  E.add = (d) => S.tx(() => { const c = clean(d), now = U.nowISO(); const x = Object.assign({ id: U.uid('exp'), number: S.nextNumber('expense', 'EXP-', 5), status: 'active', createdAt: now, updatedAt: now }, c); E.all().push(x); S.save('expenses'); return x; });
  E.update = (id, d) => S.tx(() => { const x = E.get(id); if (!x) throw new Error('ရှာမတွေ့ပါ'); if (x.status !== 'active') throw new Error('Void လုပ်ပြီးသားကို မပြင်နိုင်ပါ'); Object.assign(x, clean(d), { updatedAt: U.nowISO() }); S.save('expenses'); return x; });
  E.void = (id, reason) => S.tx(() => {
    const x = E.get(id); if (!x) throw new Error('ရှာမတွေ့ပါ'); if (x.status !== 'active') throw new Error('Void လုပ်ပြီးသား');
    if (!reason || reason.trim().length < 3) throw new Error('အကြောင်းရင်း လိုအပ်သည်');
    x.status = 'voided'; x.voidReason = reason.trim(); x.voidedAt = U.nowISO(); x.updatedAt = x.voidedAt; S.save('expenses'); return x;
  });
  E.toCSV = (rows) => U.csv(['No.', 'Date', 'Category', 'Description', 'Amount (MMK)', 'Method', 'Reference', 'Status', 'Void reason'], (rows || E.all()).map((x) => [x.number, x.date, x.category, x.description, x.amount, x.method, x.reference, x.status, x.voidReason || '']));

  function form(existing) {
    const e = existing || {}, st = SS.Settings.get();
    const err = h('div', { class: 'form-error', role: 'alert', hidden: true });
    const cats = st.expenseCategories.slice(); if (e.category && !cats.includes(e.category)) cats.push(e.category);
    const f = { category: U.select(cats.map((c) => ({ value: c, label: c })), e.category || cats[0]), description: h('input', { type: 'text', value: e.description || '', maxlength: 200 }), amount: h('input', { type: 'text', inputmode: 'numeric', value: e.amount != null ? String(e.amount) : '' }),
      method: U.select(Object.keys(SS.PAY).map((k) => ({ value: k, label: SS.PAY[k] })), e.method || st.defaultPayment), date: h('input', { type: 'date', value: e.date || U.todayKey() }), reference: h('input', { type: 'text', value: e.reference || '', maxlength: 100 }) };
    U.modal({ title: existing ? 'အသုံးစရိတ် ပြင်ရန်' : 'အသုံးစရိတ် အသစ်', size: 'md', body: [err, h('p', { class: 'muted small' }, 'ကုန်ပစ္စည်းဝယ်ယူမှုကို ဤနေရာတွင် မထည့်ပါနှင့် — ဝယ်ယူမှုစာမျက်နှာတွင် မှတ်တမ်းတင်ပါ (အမြတ်ကို နှစ်ထပ်မကျစေရန်)။'),
      h('div', { class: 'form-grid' }, U.field('အမျိုးအစား', f.category, { required: true }), U.field('ရက်စွဲ', f.date, { required: true }), U.field('အကြောင်းအရာ', f.description, { required: true, class: 'full' }), U.field('ပမာဏ (MMK)', f.amount, { required: true }), U.field('ငွေပေးချေမှုနည်းလမ်း', f.method), U.field('ကိုးကား / မှတ်ချက်', f.reference, { class: 'full' }))],
      buttons: [{ label: 'မလုပ်တော့ပါ' }, { label: 'သိမ်းမည်', class: 'btn-primary', close: false, onClick: (ev, close) => {
        const d = { category: f.category.value, description: f.description.value, amount: U.parseMoney(f.amount.value), method: f.method.value, date: f.date.value, reference: f.reference.value };
        try { existing ? E.update(existing.id, d) : E.add(d); close(); U.toast('သိမ်းဆည်းပြီးပါပြီ', 'success'); SS.refresh(); } catch (er) { U.formError(err, er.message); return false; }
      } }] });
  }

  const state = { cat: '', status: 'active', from: '', to: '', q: '', page: 1 };
  SS.pages.expenses = {
    title: 'အသုံးစရိတ်များ',
    render(root) {
      const out = h('div'), totalBox = h('div');
      function draw() {
        U.clear(out); U.clear(totalBox);
        const q = state.q.trim().toLowerCase();
        const rows = E.all().filter((x) => (state.status === 'all' || x.status === state.status) && (!state.cat || x.category === state.cat) && U.inRange(x.date, state.from, state.to) && (!q || (x.description + ' ' + x.reference + ' ' + x.number).toLowerCase().includes(q))).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.number < b.number ? 1 : -1));
        out._rows = rows;
        const act = rows.filter((x) => x.status === 'active');
        totalBox.appendChild(h('div', { class: 'grid g3' }, h('div', { class: 'card stat' }, h('span', { class: 'label' }, 'ရွေးထားသော အသုံးစရိတ်စုစုပေါင်း (Void မပါ)'), h('span', { class: 'value' }, U.money(E.total(act)))), h('div', { class: 'card stat' }, h('span', { class: 'label' }, 'မှတ်တမ်းအရေအတွက်'), h('span', { class: 'value' }, U.fmtNum(act.length))),
          h('div', { class: 'card stat' }, h('span', { class: 'label' }, 'ယနေ့ အသုံးစရိတ်'), h('span', { class: 'value' }, U.money(E.total(E.active().filter((x) => x.date === U.todayKey())))))));
        if (!rows.length) return out.appendChild(U.empty(E.all().length ? 'စစ်ထုတ်မှုနှင့် ကိုက်ညီသော မှတ်တမ်း မတွေ့ပါ' : 'အသုံးစရိတ် မှတ်တမ်း မရှိသေးပါ'));
        const per = 15, pages = Math.max(1, Math.ceil(rows.length / per)); if (state.page > pages) state.page = pages;
        out.appendChild(U.table([{ label: 'နံပါတ်', key: 'number' }, { label: 'ရက်စွဲ', render: (x) => U.fmtDate(x.date) }, { label: 'အမျိုးအစား', key: 'category' }, { label: 'အကြောင်းအရာ', render: (x) => [x.description, x.reference ? h('div', { class: 'muted small' }, x.reference) : null, x.voidReason ? h('div', { class: 'small', style: 'color:var(--err)' }, 'Void: ' + x.voidReason) : null] },
          { label: 'ပမာဏ', class: 'num', render: (x) => (x.status === 'voided' ? h('s', null, U.money(x.amount)) : U.money(x.amount)) }, { label: 'နည်းလမ်း', render: (x) => SS.PAY[x.method] || x.method }, { label: 'အခြေအနေ', render: (x) => U.badge(x.status === 'active' ? 'ကျသင့်' : 'Void', x.status === 'active' ? 'ok' : 'muted') },
          { label: '', class: 'actions', render: (x) => x.status === 'active' ? [h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: () => form(x) }, 'ပြင်'), h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: async () => { const r = await U.askReason({ title: x.number + ' ကို Void လုပ်ရန်', message: 'မှတ်တမ်းကို မဖျက်ဘဲ Void အဖြစ် ထိန်းသိမ်းမည်။ အမြတ်တွက်ချက်မှုမှ ဖယ်မည်။', danger: true, confirmLabel: 'Void လုပ်မည်' }); if (!r) return; try { E.void(x.id, r); U.toast('Void လုပ်ပြီးပါပြီ', 'success'); SS.refresh(); } catch (er) { U.toast(er.message, 'error'); } } }, 'Void')] : null }], rows.slice((state.page - 1) * per, state.page * per)));
        out.appendChild(U.pager(rows.length, state.page, per, (n) => { state.page = n; draw(); }));
      }
      const on = (k) => (e) => { state[k] = e.target.value; state.page = 1; draw(); };
      root.appendChild(U.pageHeader('အသုံးစရိတ်များ', 'ဆိုင်လည်ပတ်စရိတ်များ (ကုန်ပစ္စည်းဝယ်ယူမှု မပါ)', [h('button', { type: 'button', class: 'btn btn-primary', onClick: () => form(null) }, '+ အသုံးစရိတ်အသစ်')]));
      root.appendChild(h('div', { class: 'stack' }, totalBox, h('div', { class: 'card' }, h('div', { class: 'toolbar' }, h('input', { type: 'search', class: 'grow', placeholder: 'ရှာရန်…', 'aria-label': 'ရှာရန်', value: state.q, onInput: on('q') }),
        U.select([{ value: '', label: 'အမျိုးအစားအားလုံး' }].concat(SS.Settings.get().expenseCategories.map((c) => ({ value: c, label: c }))), state.cat, { 'aria-label': 'အမျိုးအစား', onChange: on('cat') }),
        U.select([{ value: 'active', label: 'ကျသင့်သည့်' }, { value: 'voided', label: 'Void' }, { value: 'all', label: 'အားလုံး' }], state.status, { 'aria-label': 'အခြေအနေ', onChange: on('status') }),
        h('input', { type: 'date', value: state.from, 'aria-label': 'မှ', onChange: on('from') }), h('input', { type: 'date', value: state.to, 'aria-label': 'ထိ', onChange: on('to') }),
        h('button', { type: 'button', class: 'btn btn-ghost', onClick: () => U.download('smartstock-expenses.csv', E.toCSV(out._rows), 'text/csv') }, 'CSV')), out)));
      draw();
    }
  };
})();

;
/* SmartStock — reports.js : financial engine, dashboard page, reports page
   DOCUMENTED FORMULAS (all integer MMK; period = local calendar days, inclusive)
     Sales revenue     = Σ item.net of sales dated in period            (after line + bill discounts, EXCLUDING tax)
     Returns           = Σ return.net of returns/cancellations dated in period   (refund treatment: reduces revenue on the day of the return)
     Net revenue       = Sales revenue − Returns
     COGS              = Σ round(item.cost × qty) of sales in period − Σ cogs of restocked returns in period
                         (item.cost = weighted-average cost snapshot taken at sale time; later cost edits never change it)
     Gross profit      = Net revenue − COGS
     Operating profit  = Gross profit − active operating expenses dated in period   (estimate)
     Inventory value   = current stock × current weighted-average cost   (retail value = stock × selling price)
   NOT revenue / NOT expenses: receivables (credit balances), supplier payables, stock purchases (they become COGS only when sold), tax collected. */
(function () {
  'use strict';
  const SS = window.SS, S = SS.Storage, U = SS.U, h = U.h;
  const R = (SS.Reports = {});
  const dk = (iso) => U.dayKey(iso);

  R.finance = function (from, to) {
    const f = { from, to, salesCount: 0, grossBeforeDiscount: 0, discounts: 0, salesRevenue: 0, tax: 0, returns: 0, returnTax: 0, cogsSold: 0, cogsReturned: 0, netRevenue: 0, cogs: 0, grossProfit: 0, expenses: 0, operatingProfit: 0,
      cashIn: 0, cashRefunds: 0, cashNet: 0, byDay: {}, expenseByCat: {} };
    const day = (k) => (f.byDay[k] = f.byDay[k] || { count: 0, gross: 0, discounts: 0, returns: 0, revenue: 0, cogs: 0, profit: 0, expenses: 0, cash: 0 });
    for (const s of S.all('sales')) {
      const k = dk(s.at);
      if (U.inRange(k, from, to)) {
        const d = day(k), rev = U.sum(s.items, (i) => i.net), cogs = U.sum(s.items, (i) => Math.round(i.cost * i.qty));
        f.salesCount++; f.salesRevenue += rev; f.discounts += s.discountTotal; f.tax += s.tax; f.cogsSold += cogs; f.grossBeforeDiscount += U.sum(s.items, (i) => i.gross);
        d.count++; d.gross += U.sum(s.items, (i) => i.gross); d.discounts += s.discountTotal; d.revenue += rev; d.cogs += cogs;
      }
      for (const r of s.returns) { const rk = dk(r.at); if (U.inRange(rk, from, to)) { const d = day(rk); f.returns += r.net; f.returnTax += r.tax; f.cogsReturned += r.cogs; d.returns += r.net; d.revenue -= r.net; d.cogs -= r.cogs; } }
    }
    for (const x of S.all('expenses')) if (x.status === 'active' && U.inRange(x.date, from, to)) { f.expenses += x.amount; f.expenseByCat[x.category] = (f.expenseByCat[x.category] || 0) + x.amount; day(x.date).expenses += x.amount; }
    for (const p of S.all('payments')) if (p.partyType === 'customer' && U.inRange(dk(p.at), from, to)) {
      if (p.direction === 'in') { f.cashIn += p.amount; day(dk(p.at)).cash += p.amount; } else { f.cashRefunds += p.amount; day(dk(p.at)).cash -= p.amount; }
    }
    f.netRevenue = f.salesRevenue - f.returns; f.cogs = f.cogsSold - f.cogsReturned; f.grossProfit = f.netRevenue - f.cogs; f.operatingProfit = f.grossProfit - f.expenses; f.cashNet = f.cashIn - f.cashRefunds;
    Object.keys(f.byDay).forEach((k) => { const d = f.byDay[k]; d.profit = d.revenue - d.cogs; });
    return f;
  };
  // per-product sold qty / revenue / cogs in period (returns netted off)
  R.byProduct = function (from, to) {
    const m = new Map(); const get = (id, name, sku) => { if (!m.has(id)) m.set(id, { id, name, sku, qty: 0, revenue: 0, cogs: 0 }); return m.get(id); };
    for (const s of S.all('sales')) {
      if (U.inRange(dk(s.at), from, to)) for (const i of s.items) { const e = get(i.productId, i.name, i.sku); e.qty += i.qty; e.revenue += i.net; e.cogs += Math.round(i.cost * i.qty); }
      for (const r of s.returns) if (U.inRange(dk(r.at), from, to)) for (const i of r.items) { const src = s.items.find((x) => x.productId === i.productId); const e = get(i.productId, i.name, src ? src.sku : ''); e.qty -= i.qty; e.revenue -= i.net; e.cogs -= i.cogs; }
    }
    return [...m.values()].map((e) => Object.assign(e, { qty: U.r3(e.qty), profit: e.revenue - e.cogs }));
  };
  R.byCategory = function (from, to) {
    const m = new Map();
    R.byProduct(from, to).forEach((e) => { const p = SS.Products.get(e.id); const name = p ? SS.Categories.name(p.categoryId) : '—'; const c = m.get(name) || { name, qty: 0, revenue: 0, cogs: 0, profit: 0 }; c.qty += e.qty; c.revenue += e.revenue; c.cogs += e.cogs; c.profit += e.profit; m.set(name, c); });
    return [...m.values()];
  };
  R.inventory = function () {
    const all = S.all('products');
    const act = all.filter((p) => p.status === 'active');
    return { activeCount: act.length, units: U.r3(U.sum(all, (p) => p.stock)), costValue: U.sum(all, (p) => Math.round(p.stock * p.cost)), retailValue: U.sum(all, (p) => Math.round(p.stock * p.price)), low: act.filter((p) => p.stock > 0 && p.stock <= p.lowStock), out: act.filter((p) => p.stock <= 0) };
  };
  R.receivables = () => S.all('customers').map((c) => ({ c, due: SS.Customers.receivable(c.id) })).filter((x) => x.due > 0);
  R.payables = () => S.all('suppliers').map((s) => ({ s, due: SS.Suppliers.payable(s.id) })).filter((x) => x.due > 0);

  /* ---------------- shared period picker ---------------- */
  const periodState = { dash: { kind: 'today', from: '', to: '' }, rep: { kind: 'today', from: '', to: '' } };
  function periodBar(st, onChange) {
    const kinds = [['today', 'ယနေ့'], ['7d', 'ရက် ၇'], ['30d', 'ရက် ၃၀'], ['month', 'ဤလ'], ['custom', 'ရက်ရွေး']];
    const from = h('input', { type: 'date', value: st.from, 'aria-label': 'မှ' }), to = h('input', { type: 'date', value: st.to, 'aria-label': 'ထိ' });
    const custom = h('span', { class: 'row', hidden: st.kind !== 'custom' }, from, '–', to);
    const sel = U.select(kinds.map((k) => ({ value: k[0], label: k[1] })), st.kind, { 'aria-label': 'ကာလ', onChange: (e) => { st.kind = e.target.value; custom.hidden = st.kind !== 'custom'; if (st.kind === 'custom' && !st.from) { st.from = st.to = U.todayKey(); from.value = to.value = st.from; } onChange(); } });
    const upd = () => { st.from = from.value; st.to = to.value; if (st.from && st.to && st.from > st.to) { U.toast('စတင်ရက်သည် ဆုံးရက်ထက် မနောက်ကျရ', 'error'); return; } onChange(); };
    from.addEventListener('change', upd); to.addEventListener('change', upd);
    return h('div', { class: 'row' }, sel, custom);
  }
  const range = (st) => U.period(st.kind, st.from, st.to);
  const periodLabel = (st, r) => (st.kind === 'today' ? 'ယနေ့' : r.from === r.to ? U.fmtDate(r.from) : U.fmtDate(r.from) + ' – ' + U.fmtDate(r.to));
  const stat = (label, value, cls, sub) => h('div', { class: 'card stat ' + (cls || '') }, h('span', { class: 'label' }, label), h('span', { class: 'value' }, value), sub ? h('span', { class: 'sub' }, sub) : null);

  /* ---------------- dashboard ---------------- */
  SS.pages.dashboard = {
    title: 'ဒက်ရှ်ဘုတ်',
    render(root) {
      const st = periodState.dash, body = h('div', { class: 'stack' });
      function draw() {
        U.clear(body);
        const r = range(st), f = R.finance(r.from, r.to), inv = R.inventory(), lab = periodLabel(st, r);
        const hasData = S.all('products').length || S.all('sales').length;
        if (!hasData) body.appendChild(h('div', { class: 'card' }, U.empty('ဒေတာ မရှိသေးပါ', 'ကုန်ပစ္စည်းများ စာမျက်နှာတွင် ကုန်ပစ္စည်း ထည့်ပါ၊ သို့မဟုတ် ဆက်တင်တွင် နမူနာဒေတာ ထည့်နိုင်သည်'), h('div', { class: 'center' }, h('button', { type: 'button', class: 'btn btn-primary', onClick: () => SS.go('products') }, 'ကုန်ပစ္စည်းများသို့'))));
        body.appendChild(h('div', { class: 'grid g-auto' }, stat('သုံးနေသော ကုန်ပစ္စည်း', U.fmtNum(inv.activeCount)), stat('စတော့ယူနစ် စုစုပေါင်း', U.qty(inv.units)), stat('စတော့ ကုန်ကျတန်ဖိုး', U.money(inv.costValue), '', 'ပျမ်းမျှကုန်ကျစရိတ်ဖြင့်'), stat('ခန့်မှန်း ရောင်းတန်ဖိုး', U.money(inv.retailValue)),
          stat('စတော့နည်းနေသော', U.fmtNum(inv.low.length), inv.low.length ? 'warn' : 'ok'), stat('စတော့ကုန်နေသော', U.fmtNum(inv.out.length), inv.out.length ? 'err' : 'ok')));
        body.appendChild(h('h3', { style: 'margin:6px 0 0' }, lab + ' ရလဒ်'));
        body.appendChild(h('div', { class: 'grid g-auto' }, stat(lab + ' အရောင်း (အသားတင်)', U.money(f.netRevenue), '', `${f.salesCount} ဘောက်ချာ · လျှော့ ${U.money(f.discounts)} · ပြန်အမ်း ${U.money(f.returns)}`), stat('စုစုပေါင်း အမြတ် (Gross)', U.money(f.grossProfit), f.grossProfit < 0 ? 'err' : 'ok', 'COGS ' + U.money(f.cogs)),
          stat('အသုံးစရိတ်', U.money(f.expenses), 'warn'), stat('လုပ်ငန်းအမြတ် ခန့်မှန်း', U.money(f.operatingProfit), f.operatingProfit < 0 ? 'err' : 'ok', 'Gross − အသုံးစရိတ်'), stat('ငွေသား/လွှဲငွေ လက်ခံရရှိ', U.money(f.cashNet), '', 'အကြွေးမပါ · ပြန်အမ်းနုတ်ပြီး')));
        // charts
        const keys = []; { let k = r.from; let n = 0; while (k <= r.to && n < 92) { keys.push(k); k = U.addDays(k, 1); n++; } }
        const lc = keys.length > 1 ? U.lineChart(keys.map((k) => k.slice(5)), [{ name: 'အရောင်း', values: keys.map((k) => (f.byDay[k] ? f.byDay[k].revenue : 0)) }, { name: 'Gross အမြတ်', values: keys.map((k) => (f.byDay[k] ? f.byDay[k].profit : 0)) }]) : null;
        const cats = R.byCategory(r.from, r.to).filter((c) => c.revenue > 0).sort((a, b) => b.revenue - a.revenue);
        const best = R.byProduct(r.from, r.to).filter((p) => p.qty > 0).sort((a, b) => b.qty - a.qty).slice(0, 6);
        body.appendChild(h('div', { class: 'grid g2' }, h('div', { class: 'card' }, h('h3', null, 'အရောင်း ခေတ်ရေစီးကြောင်း'), lc || (f.salesCount ? h('p', { class: 'muted' }, 'ရက်တစ်ရက်တည်းဖြစ်၍ ဇယားမပြပါ — ' + U.money(f.netRevenue)) : U.empty('ဤကာလတွင် ရောင်းချမှု မရှိပါ'))),
          h('div', { class: 'card' }, h('h3', null, 'အမျိုးအစားအလိုက် အရောင်း'), cats.length ? U.donut(cats.map((c) => ({ label: c.name, value: c.revenue }))) : U.empty('ဒေတာ မရှိပါ'))));
        const recentSales = S.all('sales').slice().sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 6), moves = SS.Inventory.movements().slice(0, 6);
        body.appendChild(h('div', { class: 'grid g2' }, h('div', { class: 'card' }, h('h3', null, 'အရောင်းရဆုံး ကုန်ပစ္စည်း'), best.length ? U.barList(best.map((p) => ({ label: p.name, value: p.qty })), (v) => U.qty(v)) : U.empty('ဒေတာ မရှိပါ')),
          h('div', { class: 'card' }, h('h3', null, 'စတော့ သတိပေးချက်'), (inv.out.length + inv.low.length) ? U.table([{ label: 'ကုန်ပစ္စည်း', key: 'name' }, { label: 'လက်ကျန်', class: 'num', render: (p) => U.qty(p.stock) }, { label: '', render: (p) => U.stockBadge(p) }], inv.out.concat(inv.low).slice(0, 8)) : U.empty('စတော့ သတိပေးစရာ မရှိပါ ✓'))));
        body.appendChild(h('div', { class: 'grid g2' }, h('div', { class: 'card' }, h('h3', null, 'မကြာမီ ရောင်းချမှုများ'), recentSales.length ? U.table([{ label: 'ဘောက်ချာ', render: (s) => h('a', { href: '#', onClick: (e) => { e.preventDefault(); SS.UI.saleDetail(s.id); } }, s.number) }, { label: 'အချိန်', render: (s) => U.fmtDateTime(s.at) }, { label: 'စုစုပေါင်း', class: 'num', render: (s) => U.money(s.total) }, { label: '', render: (s) => (s.status === 'completed' ? '' : U.badge(SS.SALE_STATUS[s.status], 'warn')) }], recentSales) : U.empty('ရောင်းချမှု မရှိသေးပါ')),
          h('div', { class: 'card' }, h('h3', null, 'မကြာမီ စတော့လှုပ်ရှားမှုများ'), moves.length ? SS.Inventory.movementTable(moves) : U.empty('မှတ်တမ်း မရှိသေးပါ'))));
      }
      root.appendChild(U.pageHeader('ဒက်ရှ်ဘုတ်', 'သိမ်းဆည်းထားသော ဒေတာမှ တိုက်ရိုက်တွက်ချက်ထားသည်', [periodBar(st, draw)]));
      root.appendChild(body); draw();
    }
  };

  /* ---------------- reports ---------------- */
  const T = { text: (v) => (v == null ? '' : v), money: (v) => U.money(v), qty: (v) => U.qty(v), int: (v) => U.fmtNum(v), pct: (v) => (v == null ? '—' : v.toFixed(1) + '%') };
  const margin = (profit, rev) => (rev > 0 ? (profit / rev) * 100 : null);
  const REPORTS = {
    sales: { label: 'အရောင်းအစီရင်ခံစာ (နေ့စဉ်/အပတ်/လ/ရက်ရွေး)', period: true, build(r) {
      const f = R.finance(r.from, r.to), days = Object.keys(f.byDay).sort();
      return { summary: [['ဘောက်ချာအရေအတွက်', T.int(f.salesCount)], ['အရောင်း (လျှော့စျေးပြီး, အခွန်မပါ)', T.money(f.salesRevenue)], ['ပြန်အမ်း', T.money(f.returns)], ['အသားတင်အရောင်း', T.money(f.netRevenue)], ['လက်ခံရရှိငွေ (အကြွေးမပါ, ပြန်အမ်းနုတ်ပြီး)', T.money(f.cashNet)], ['အခွန်ကောက်ခံ (အရောင်းမဟုတ်)', T.money(f.tax)]],
        cols: [['ရက်စွဲ', 'text'], ['ဘောက်ချာ', 'int'], ['လျှော့စျေးမတိုင်မီ', 'money'], ['လျှော့စျေး', 'money'], ['ပြန်အမ်း', 'money'], ['အသားတင်အရောင်း', 'money'], ['COGS', 'money'], ['Gross အမြတ်', 'money'], ['လက်ခံရရှိ', 'money']],
        rows: days.map((k) => { const d = f.byDay[k]; return [k, d.count, d.gross, d.discounts, d.returns, d.revenue, d.cogs, d.profit, d.cash]; }), total: ['စုစုပေါင်း', f.salesCount, f.grossBeforeDiscount, f.discounts, f.returns, f.netRevenue, f.cogs, f.grossProfit, f.cashNet] };
    } },
    byProduct: { label: 'ကုန်ပစ္စည်းအလိုက် အရောင်း', period: true, build(r) {
      const rows = R.byProduct(r.from, r.to).sort((a, b) => b.revenue - a.revenue);
      return { cols: [['ကုန်ပစ္စည်း', 'text'], ['SKU', 'text'], ['ရောင်းရအရေအတွက်', 'qty'], ['အသားတင်အရောင်း', 'money'], ['COGS', 'money'], ['အမြတ်', 'money']], rows: rows.map((e) => [e.name, e.sku, e.qty, e.revenue, e.cogs, e.profit]), total: ['စုစုပေါင်း', '', U.r3(U.sum(rows, (e) => e.qty)), U.sum(rows, (e) => e.revenue), U.sum(rows, (e) => e.cogs), U.sum(rows, (e) => e.profit)] };
    } },
    byCategory: { label: 'အမျိုးအစားအလိုက် အရောင်း', period: true, build(r) {
      const rows = R.byCategory(r.from, r.to).sort((a, b) => b.revenue - a.revenue);
      return { cols: [['အမျိုးအစား', 'text'], ['ရောင်းရအရေအတွက်', 'qty'], ['အသားတင်အရောင်း', 'money'], ['COGS', 'money'], ['အမြတ်', 'money']], rows: rows.map((e) => [e.name, e.qty, e.revenue, e.cogs, e.profit]), total: ['စုစုပေါင်း', U.r3(U.sum(rows, (e) => e.qty)), U.sum(rows, (e) => e.revenue), U.sum(rows, (e) => e.cogs), U.sum(rows, (e) => e.profit)] };
    } },
    best: { label: 'အရောင်းရဆုံး ကုန်ပစ္စည်း', period: true, build(r) {
      const rows = R.byProduct(r.from, r.to).filter((e) => e.qty > 0).sort((a, b) => b.qty - a.qty).slice(0, 20);
      return { cols: [['#', 'int'], ['ကုန်ပစ္စည်း', 'text'], ['ရောင်းရအရေအတွက်', 'qty'], ['အသားတင်အရောင်း', 'money']], rows: rows.map((e, i) => [i + 1, e.name, e.qty, e.revenue]) };
    } },
    low: { label: 'စတော့နည်းနေသော ကုန်ပစ္စည်း', build() {
      const rows = R.inventory().low;
      return { cols: [['ကုန်ပစ္စည်း', 'text'], ['SKU', 'text'], ['လက်ကျန်', 'qty'], ['သတိပေးအမှတ်', 'qty'], ['ယူနစ်', 'text'], ['ပေးသွင်းသူ', 'text']], rows: rows.map((p) => [p.name, p.sku, p.stock, p.lowStock, p.unit, p.supplierId ? SS.Suppliers.name(p.supplierId) : '']) };
    } },
    out: { label: 'စတော့ကုန်နေသော ကုန်ပစ္စည်း', build() {
      const rows = R.inventory().out;
      return { cols: [['ကုန်ပစ္စည်း', 'text'], ['SKU', 'text'], ['အမျိုးအစား', 'text'], ['ပေးသွင်းသူ', 'text']], rows: rows.map((p) => [p.name, p.sku, SS.Categories.name(p.categoryId), p.supplierId ? SS.Suppliers.name(p.supplierId) : '']) };
    } },
    movements: { label: 'စတော့လှုပ်ရှားမှု', period: true, build(r) {
      const rows = SS.Inventory.movements({ from: r.from, to: r.to });
      return { cols: [['အချိန်', 'text'], ['ကုန်ပစ္စည်း', 'text'], ['အမျိုးအစား', 'text'], ['အပြောင်းအလဲ', 'qty'], ['ယခင်', 'qty'], ['အသစ်', 'qty'], ['အကြောင်းရင်း', 'text']],
        rows: rows.map((m) => { const p = SS.Products.get(m.productId); return [U.fmtDateTime(m.at), p ? p.name : m.productId, (SS.Inventory.TYPES[m.type] || { label: m.type }).label, m.qty, m.prev, m.next, m.reason]; }) };
    } },
    valuation: { label: 'စတော့တန်ဖိုး (Inventory Valuation)', build() {
      const rows = S.all('products').filter((p) => p.stock > 0 || p.status === 'active').sort((a, b) => a.name.localeCompare(b.name));
      const cv = U.sum(rows, (p) => Math.round(p.stock * p.cost)), rv = U.sum(rows, (p) => Math.round(p.stock * p.price));
      return { summary: [['ကုန်ကျစရိတ်အခြေခံ', 'ပျမ်းမျှကုန်ကျစရိတ် (Weighted average)'], ['စတော့ ကုန်ကျတန်ဖိုး', T.money(cv)], ['ခန့်မှန်း ရောင်းတန်ဖိုး', T.money(rv)], ['ခန့်မှန်းအမြတ်', T.money(rv - cv)]],
        cols: [['ကုန်ပစ္စည်း', 'text'], ['လက်ကျန်', 'qty'], ['ပျမ်းမျှကုန်ကျ', 'money'], ['ကုန်ကျတန်ဖိုး', 'money'], ['ရောင်းဈေး', 'money'], ['ရောင်းတန်ဖိုး', 'money']], rows: rows.map((p) => [p.name + (p.status === 'archived' ? ' (archived)' : ''), p.stock, p.cost, Math.round(p.stock * p.cost), p.price, Math.round(p.stock * p.price)]), total: ['စုစုပေါင်း', U.r3(U.sum(rows, (p) => p.stock)), '', cv, '', rv] };
    } },
    purchases: { label: 'ဝယ်ယူမှု အစီရင်ခံစာ', period: true, build(r) {
      const rows = S.all('purchases').filter((p) => U.inRange(p.date, r.from, r.to)).sort((a, b) => (a.date < b.date ? -1 : 1)), c = rows.filter((p) => p.status === 'confirmed');
      return { summary: [['အတည်ပြုပြီး ဝယ်ယူမှုစုစုပေါင်း', T.money(U.sum(c, (p) => p.total))], ['ပေးပြီး', T.money(U.sum(c, (p) => p.paid))], ['ပေးရန်ကျန်', T.money(U.sum(c, (p) => SS.Purchases.balanceOf(p)))], ['မှတ်ချက်', 'ဝယ်ယူမှုသည် အသုံးစရိတ် မဟုတ်ပါ — ရောင်းမှ COGS ဖြစ်သည်']],
        cols: [['နံပါတ်', 'text'], ['ရက်စွဲ', 'text'], ['ပေးသွင်းသူ', 'text'], ['အခြေအနေ', 'text'], ['စုစုပေါင်း', 'money'], ['ပေးပြီး', 'money'], ['ကျန်', 'money']], rows: rows.map((p) => [p.number, U.fmtDate(p.date), SS.Suppliers.name(p.supplierId), SS.PURCHASE_STATUS[p.status], p.total, p.paid, SS.Purchases.balanceOf(p)]) };
    } },
    payables: { label: 'ပေးသွင်းသူ ပေးရန်ကျန်ငွေ', build() {
      const rows = R.payables();
      return { cols: [['ပေးသွင်းသူ', 'text'], ['ဖုန်း', 'text'], ['ပေးရန်ကျန်ငွေ', 'money']], rows: rows.map((x) => [x.s.name, x.s.phone, x.due]), total: ['စုစုပေါင်း', '', U.sum(rows, (x) => x.due)] };
    } },
    receivables: { label: 'ဖောက်သည် ရရန်ကျန်ငွေ', build() {
      const rows = R.receivables();
      return { cols: [['ဖောက်သည်', 'text'], ['ဖုန်း', 'text'], ['ရရန်ကျန်ငွေ', 'money']], rows: rows.map((x) => [x.c.name, x.c.phone, x.due]), total: ['စုစုပေါင်း', '', U.sum(rows, (x) => x.due)], summary: [['မှတ်ချက်', 'ရရန်ကျန်ငွေသည် ငွေသားရရှိမှု မဟုတ်ပါ']] };
    } },
    expenses: { label: 'အသုံးစရိတ် အစီရင်ခံစာ', period: true, build(r) {
      const f = R.finance(r.from, r.to), cats = Object.keys(f.expenseByCat).sort();
      return { cols: [['အမျိုးအစား', 'text'], ['ပမာဏ', 'money']], rows: cats.map((c) => [c, f.expenseByCat[c]]), total: ['စုစုပေါင်း (Void မပါ)', f.expenses] };
    } },
    grossProfit: { label: 'Gross Profit အစီရင်ခံစာ', period: true, build(r) {
      const rows = R.byProduct(r.from, r.to).sort((a, b) => b.profit - a.profit), f = R.finance(r.from, r.to);
      return { summary: [['အသားတင်အရောင်း', T.money(f.netRevenue)], ['COGS', T.money(f.cogs)], ['Gross Profit', T.money(f.grossProfit)], ['Gross Margin', T.pct(margin(f.grossProfit, f.netRevenue))]],
        cols: [['ကုန်ပစ္စည်း', 'text'], ['အရေအတွက်', 'qty'], ['အသားတင်အရောင်း', 'money'], ['COGS', 'money'], ['အမြတ်', 'money'], ['Margin', 'pct']], rows: rows.map((e) => [e.name, e.qty, e.revenue, e.cogs, e.profit, margin(e.profit, e.revenue)]) };
    } },
    pnl: { label: 'ခန့်မှန်း လုပ်ငန်းအမြတ်/အရှုံး (P&L)', period: true, build(r) {
      const f = R.finance(r.from, r.to), cats = Object.keys(f.expenseByCat).sort(), rows = [];
      rows.push(['အရောင်း (လျှော့စျေးပြီး, အခွန်မပါ)', f.salesRevenue], ['လျှော့: ပြန်အမ်း/ပယ်ဖျက်', -f.returns], ['အသားတင်အရောင်း', f.netRevenue], ['လျှော့: ရောင်းချသော ကုန်ပစ္စည်း ကုန်ကျစရိတ် (COGS)', -f.cogs], ['Gross Profit', f.grossProfit]);
      cats.forEach((c) => rows.push(['  အသုံးစရိတ် — ' + c, -f.expenseByCat[c]]));
      rows.push(['အသုံးစရိတ်စုစုပေါင်း', -f.expenses], ['ခန့်မှန်း လုပ်ငန်းအမြတ်/(အရှုံး)', f.operatingProfit]);
      return { summary: [['အသုံးပြုသော COGS နည်းလမ်း', 'ရောင်းချချိန် ပျမ်းမျှကုန်ကျစရိတ် snapshot'], ['အမြတ်ကို မထိသော ငွေစာရင်းများ', 'ကုန်ပစ္စည်းဝယ်ယူမှု (' + T.money(U.sum(S.all('purchases').filter((p) => p.status === 'confirmed' && U.inRange(p.date, r.from, r.to)), (p) => p.total)) + ')၊ အကြွေး၊ အခွန် (' + T.money(f.tax - f.returnTax) + ')'], ['ငွေသားရရှိမှု (အသားတင်)', T.money(f.cashNet)]],
        cols: [['အကြောင်းအရာ', 'text'], ['ပမာဏ', 'money']], rows, boldRows: [2, 4, rows.length - 1] };
    } }
  };
  R.REPORTS = REPORTS;
  function renderTable(rep) {
    const align = (t) => (t === 'text' ? '' : 'num');
    const rows = rep.rows.map((r) => rep.cols.map((c, i) => T[c[1]](r[i])));
    const body = rep.rows.map((r, ri) => h('tr', { style: rep.boldRows && rep.boldRows.includes(ri) ? 'font-weight:700' : null }, rep.cols.map((c, i) => h('td', { class: align(c[1]) }, T[c[1]](r[i])))));
    const foot = rep.total ? h('tfoot', null, h('tr', null, rep.cols.map((c, i) => h('td', { class: align(c[1]) }, rep.total[i] === '' || rep.total[i] == null ? '' : typeof rep.total[i] === 'string' ? rep.total[i] : T[c[1]](rep.total[i]))))) : null;
    void rows;
    return h('div', { class: 'table-wrap' }, h('table', { class: 'table' }, h('thead', null, h('tr', null, rep.cols.map((c) => h('th', { scope: 'col', class: align(c[1]) }, c[0])))), h('tbody', null, body), foot));
  }
  R.toCSV = function (rep) {
    const rows = rep.rows.map((r) => r.slice()); if (rep.total) rows.push(rep.total.map((v) => (v == null ? '' : v)));
    return U.csv(rep.cols.map((c) => c[0]), rows);
  };

  SS.pages.reports = {
    title: 'အစီရင်ခံစာများ',
    render(root) {
      const st = periodState.rep; let key = (SS.takeParams && SS.takeParams().report) || R.lastKey || 'sales';
      const out = h('div'), periodHost = h('div');
      let current = null;
      function draw() {
        R.lastKey = key; U.clear(out); U.clear(periodHost);
        const def = REPORTS[key], r = range(st);
        if (def.period) periodHost.appendChild(periodBar(st, draw));
        current = def.build(r); current.title = def.label; current.range = def.period ? r : null;
        out.appendChild(h('div', { class: 'card' }, h('h3', null, def.label + (def.period ? ' — ' + periodLabel(st, r) : '')),
          current.summary ? h('div', { class: 'grid g2', style: 'margin-bottom:12px' }, current.summary.map((s) => h('div', { class: 'sum-row' }, h('span', { class: 'muted' }, s[0]), h('strong', { class: 'mono' }, s[1])))) : null,
          current.rows.length ? renderTable(current) : U.empty('ဤအစီရင်ခံစာအတွက် ဒေတာ မရှိပါ')));
      }
      const sel = U.select(Object.keys(REPORTS).map((k) => ({ value: k, label: REPORTS[k].label })), key, { 'aria-label': 'အစီရင်ခံစာ အမျိုးအစား', onChange: (e) => { key = e.target.value; draw(); } });
      const print = () => {
        const st2 = SS.Settings.get();
        const node = h('div', { class: 'report-print' }, h('h2', null, st2.shopName + ' — ' + current.title), h('p', null, (current.range ? 'ကာလ: ' + U.fmtDate(current.range.from) + ' – ' + U.fmtDate(current.range.to) + ' · ' : '') + 'ထုတ်ယူချိန်: ' + U.fmtDateTime(U.nowISO())),
          current.summary ? h('ul', { class: 'summary-list' }, current.summary.map((s) => h('li', null, h('span', null, s[0]), h('strong', null, s[1])))) : null, renderTable(current));
        U.printNode(node, 'A4');
      };
      root.appendChild(U.pageHeader('အစီရင်ခံစာများ', 'ဘဏ္ဍာရေးနည်းပညာ ဖော်မြူလာများကို README တွင် ရှင်းပြထားသည်', [h('button', { type: 'button', class: 'btn btn-ghost', onClick: print }, 'ပရင့်'), h('button', { type: 'button', class: 'btn btn-ghost', onClick: () => { if (!current.rows.length) return U.toast('ထုတ်ရန် ဒေတာ မရှိပါ', 'error'); U.download('smartstock-report-' + key + '-' + U.todayKey() + '.csv', R.toCSV(current), 'text/csv'); } }, 'CSV ထုတ်ရန်')]));
      root.appendChild(h('div', { class: 'card', style: 'margin-bottom:16px' }, h('div', { class: 'toolbar', style: 'margin:0' }, h('div', { class: 'grow' }, sel), periodHost)));
      root.appendChild(out); draw();
    }
  };
})();

;
/* SmartStock — app.js : bootstrap, hash router, shell (sidebar / top bar / global search / notifications / profile menu) */
(function () {
  'use strict';
  const SS = window.SS, S = SS.Storage, U = SS.U, h = U.h;

  const NAV = [
    ['dashboard', 'ဒက်ရှ်ဘုတ်', 'Dashboard', 'home'], ['products', 'ကုန်ပစ္စည်းများ', 'Products', 'box'], ['categories', 'အမျိုးအစားများ', 'Categories', 'tag'], ['stock', 'စတော့စီမံခန့်ခွဲမှု', 'Stock Management', 'layers'],
    ['sales', 'ရောင်းချမှု / POS', 'Sales / POS', 'cart'], ['purchases', 'ဝယ်ယူမှု စီမံခန့်ခွဲမှု', 'Purchase Management', 'truck'], ['suppliers', 'ပေးသွင်းသူများ', 'Suppliers', 'store'], ['customers', 'ဖောက်သည်များ', 'Customers', 'users'],
    ['expenses', 'အသုံးစရိတ်များ', 'Expenses', 'wallet'], ['reports', 'အစီရင်ခံစာများ', 'Reports', 'chart'], ['backup', 'Backup / Restore', 'Data Backup & Restore', 'database'], ['settings', 'ဆက်တင်များ', 'Settings', 'settings']
  ];
  let params = {}, current = 'dashboard', shell = null;
  SS.takeParams = () => { const p = params; params = {}; return p; };

  SS.go = function (name, p) {
    if (!SS.pages[name]) name = 'dashboard';
    params = p || {};
    const target = '#/' + name;
    if (location.hash === target) renderPage(); else location.hash = target;
  };
  SS.refresh = function () { const y = window.scrollY; renderPage(true); window.scrollTo(0, y); };

  function renderPage(keep) {
    const name = (location.hash.match(/^#\/([a-z]+)/) || [])[1] || 'dashboard';
    current = SS.pages[name] ? name : 'dashboard';
    if (!shell) return;
    const page = SS.pages[current];
    U.clear(shell.content);
    try { page.render(shell.content); }
    catch (e) {
      console.error(e);
      U.clear(shell.content).appendChild(h('div', { class: 'card' }, h('h3', { style: 'color:var(--err)' }, 'စာမျက်နှာ ပြသရာတွင် အမှားဖြစ်ပါသည်'), h('p', null, e.message), h('p', { class: 'muted' }, 'ဒေတာကို မထိခိုက်ပါ။ စာမျက်နှာကို ပြန်လည်စတင်ပါ သို့မဟုတ် Backup စာမျက်နှာသို့ သွားပါ။'), h('button', { type: 'button', class: 'btn btn-ghost', onClick: () => SS.go('backup') }, 'Backup စာမျက်နှာ')));
    }
    shell.title.textContent = page.title;
    document.title = page.title + ' — SmartStock';
    shell.nav.querySelectorAll('a').forEach((a) => { const on = a.getAttribute('data-page') === current; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    shell.app.classList.remove('nav-open'); const sc = document.querySelector('.scrim'); if (sc) sc.remove();
    if (!keep) { window.scrollTo(0, 0); shell.content.focus({ preventScroll: true }); }
    SS.refreshShell();
  }

  function alerts() {
    const inv = SS.Reports.inventory(), items = [];
    inv.out.forEach((p) => items.push({ text: `${p.name} — ကုန်သွားပြီ`, kind: 'err', p }));
    inv.low.forEach((p) => items.push({ text: `${p.name} — နည်းနေပြီ (${U.qty(p.stock)})`, kind: 'warn', p }));
    const lb = S.obj('meta').lastBackupAt;
    if (S.all('products').length && (!lb || Date.now() - new Date(lb).getTime() > 7 * 864e5)) items.push({ text: 'Backup မလုပ်ရတာ ၇ ရက်ကျော်ပါပြီ', kind: 'warn', backup: true });
    return items;
  }
  SS.refreshShell = function () {
    if (!shell) return;
    shell.brandName.textContent = SS.Settings.get().shopName;
    const a = alerts(), stockAlerts = a.filter((x) => !x.backup).length;
    shell.bell.textContent = stockAlerts + (a.some((x) => x.backup) ? 1 : 0) > 0 ? String(stockAlerts + (a.some((x) => x.backup) ? 1 : 0)) : '';
    shell.bell.hidden = !shell.bell.textContent;
    U.clear(shell.banners);
    S.errors.forEach((e) => shell.banners.appendChild(h('div', { class: 'banner err', role: 'alert' }, e.message, ' ', h('a', { href: '#/backup' }, 'Backup စာမျက်နှာ'))));
    const u = S.usage();
    if (u.ratio > 0.8) shell.banners.appendChild(h('div', { class: 'banner' }, `Browser သိုလှောင်မှု ${Math.round(u.ratio * 100)}% ပြည့်လာပါပြီ။ Backup ဒေါင်းလုဒ်လုပ်ပါ။`));
  };

  function buildShell() {
    const app = h('div', { class: 'app' + (SS.Settings.get().sidebarCollapsed ? ' collapsed' : '') });
    const brandName = h('span', { class: 'brand-name' });
    const nav = h('ul', { class: 'nav' }, NAV.map((n) => h('li', null, h('a', { href: '#/' + n[0], 'data-page': n[0], title: n[1] }, U.icon(n[3]), h('span', { class: 'lbl' }, n[1], h('small', null, n[2]))))));
    const sidebar = h('aside', { class: 'sidebar', 'aria-label': 'မီနူး' }, h('div', { class: 'brand' }, h('span', { class: 'brand-logo', 'aria-hidden': 'true' }, 'S'), h('span', { class: 'brand-name' }, h('div', null, 'SmartStock'), h('small', { style: 'font-weight:400;color:#94A3B8;display:block;font-size:11px;line-height:1.2' }, '')), ''), h('nav', { 'aria-label': 'အဓိက မီနူး' }, nav),
      h('div', { class: 'sidebar-foot' }, 'ဤ browser ထဲတွင်သာ သိမ်းထားသည် — Backup မှန်မှန်လုပ်ပါ'));
    sidebar.querySelector('.brand-name small').appendChild(brandName);

    const title = h('h1');
    const toggle = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'မီနူး ဖွင့်/ပိတ်', onClick: () => {
      if (window.matchMedia('(max-width: 900px)').matches) { const open = app.classList.toggle('nav-open'); const old = document.querySelector('.scrim'); if (old) old.remove(); if (open) app.appendChild(h('div', { class: 'scrim', onClick: () => { app.classList.remove('nav-open'); document.querySelector('.scrim').remove(); } })); }
      else { const c = app.classList.toggle('collapsed'); SS.Settings.setDebounced({ sidebarCollapsed: c }); }
    } }, U.icon('menu'));

    // global search
    const gInput = h('input', { type: 'search', placeholder: 'ရှာရန် — ကုန်ပစ္စည်း၊ ဘောက်ချာ၊ ဖောက်သည်…', 'aria-label': 'ကမ္ဘာလုံးဆိုင်ရာ ရှာဖွေမှု', autocomplete: 'off' });
    const gDrop = h('div', { class: 'dropdown', hidden: true });
    const gHide = () => { gDrop.hidden = true; };
    function gSearch() {
      const q = gInput.value.trim().toLowerCase(); U.clear(gDrop);
      if (!q) return gHide();
      const prods = S.all('products').filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode || '').toLowerCase().includes(q)).slice(0, 5);
      const sales = S.all('sales').filter((s) => s.number.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q)).slice(0, 4);
      const custs = S.all('customers').filter((c) => (c.name + ' ' + c.phone).toLowerCase().includes(q)).slice(0, 4);
      const item = (t, fn) => gDrop.appendChild(h('button', { type: 'button', class: 'item', onMousedown: (e) => { e.preventDefault(); gInput.value = ''; gHide(); fn(); } }, t));
      if (prods.length) { gDrop.appendChild(h('div', { class: 'hd' }, 'ကုန်ပစ္စည်း')); prods.forEach((p) => item(`${p.name} · ${p.sku} · ${U.qty(p.stock)}`, () => SS.go('products', { q: p.name }))); }
      if (sales.length) { gDrop.appendChild(h('div', { class: 'hd' }, 'ရောင်းချမှု')); sales.forEach((s) => item(`${s.number} · ${s.customerName} · ${U.money(s.total)}`, () => SS.UI.saleDetail(s.id))); }
      if (custs.length) { gDrop.appendChild(h('div', { class: 'hd' }, 'ဖောက်သည်')); custs.forEach((c) => item(c.name + (c.phone ? ' · ' + c.phone : ''), () => SS.UI.customerDetail(c.id))); }
      if (!gDrop.firstChild) gDrop.appendChild(h('div', { class: 'empty small' }, 'မတွေ့ပါ'));
      gDrop.hidden = false;
    }
    gInput.addEventListener('input', U.debounce(gSearch, 120));
    gInput.addEventListener('keydown', (e) => { if (e.key === 'Escape') gHide(); else if (e.key === 'Enter' && gInput.value.trim()) { const q = gInput.value.trim(); gInput.value = ''; gHide(); SS.go('products', { q }); } });
    gInput.addEventListener('blur', () => setTimeout(gHide, 150));

    // notifications
    const bell = h('span', { class: 'badge-dot', hidden: true });
    const nDrop = h('div', { class: 'dropdown', hidden: true, role: 'menu' });
    const nBtn = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'သတိပေးချက်များ', 'aria-haspopup': 'true', onClick: () => {
      U.clear(nDrop);
      const a = alerts();
      if (!a.length) nDrop.appendChild(h('div', { class: 'empty small' }, 'သတိပေးချက် မရှိပါ ✓'));
      a.slice(0, 12).forEach((x) => nDrop.appendChild(h('button', { type: 'button', class: 'item', role: 'menuitem', onClick: () => { nDrop.hidden = true; x.backup ? SS.go('backup') : SS.go('stock', { tab: 'alerts' }); } }, h('span', { class: 'badge badge-' + x.kind }, x.kind === 'err' ? '!' : '•'), ' ', x.text)));
      if (a.length > 12) nDrop.appendChild(h('div', { class: 'hd' }, `… နှင့် အခြား ${a.length - 12} ခု`));
      nDrop.hidden = !nDrop.hidden; pDrop.hidden = true;
    } }, U.icon('bell'), bell);

    // profile
    const pDrop = h('div', { class: 'dropdown', hidden: true, role: 'menu' });
    const pBtn = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'ပရိုဖိုင်နှင့် ဆက်တင်', 'aria-haspopup': 'true', onClick: () => {
      U.clear(pDrop);
      const dark = SS.Settings.get().theme === 'dark', go = (n) => () => { pDrop.hidden = true; SS.go(n); };
      pDrop.appendChild(h('div', { class: 'hd' }, SS.Settings.get().shopName));
      pDrop.appendChild(h('button', { type: 'button', class: 'item', role: 'menuitem', onClick: () => { pDrop.hidden = true; SS.Settings.set({ theme: dark ? 'light' : 'dark' }); if (SS.pages[current] && current === 'settings') SS.refresh(); } }, dark ? 'အလင်း theme သို့' : 'အမှောင် theme သို့'));
      pDrop.appendChild(h('button', { type: 'button', class: 'item', role: 'menuitem', onClick: go('settings') }, 'ဆက်တင်များ'));
      pDrop.appendChild(h('button', { type: 'button', class: 'item', role: 'menuitem', onClick: go('backup') }, 'Backup / Restore'));
      pDrop.hidden = !pDrop.hidden; nDrop.hidden = true;
    } }, U.icon('user'));
    document.addEventListener('click', (e) => { if (!e.target.closest('.menu-wrap')) { nDrop.hidden = true; pDrop.hidden = true; } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { nDrop.hidden = true; pDrop.hidden = true; } });

    const banners = h('div');
    const content = h('main', { id: 'main', class: 'content', tabindex: '-1' });
    const topbar = h('header', { class: 'topbar' }, toggle, title, h('div', { class: 'gsearch', role: 'search' }, h('span', { class: 'ico' }, U.icon('search', 16)), gInput, gDrop), h('div', { class: 'menu-wrap' }, nBtn, nDrop), h('div', { class: 'menu-wrap' }, pBtn, pDrop));
    app.appendChild(sidebar); app.appendChild(h('div', { class: 'main' }, topbar, banners, content));
    return { app, nav, title, content, banners, bell, brandName };
  }

  function boot() {
    const root = document.getElementById('app');
    try { S.init(); } catch (e) { S.errors.push({ message: 'Storage စတင်၍မရပါ: ' + e.message }); }
    SS.Settings.init();
    if (!S.readOnly) { try { SS.seed(); } catch (e) { S.errors.push({ message: 'ပထမအကြိမ် ပြင်ဆင်မှု မအောင်မြင်ပါ: ' + e.message }); } }
    shell = buildShell(); root.appendChild(shell.app);
    window.addEventListener('hashchange', () => renderPage());
    window.addEventListener('pagehide', () => SS.Settings.flush());
    window.addEventListener('beforeunload', () => SS.Settings.flush());
    window.addEventListener('error', (e) => { U.toast('မမျှော်လင့်သော အမှား: ' + (e.message || ''), 'error'); });
    window.addEventListener('unhandledrejection', (e) => { U.toast('မမျှော်လင့်သော အမှား: ' + ((e.reason && e.reason.message) || e.reason), 'error'); });
    if (!location.hash) location.hash = '#/dashboard'; else renderPage();
    // Ask the browser not to evict our data under storage pressure (best effort; iOS/Safari may ignore it).
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (_) { /* ignore */ }
    // Offline app shell for tablets: only on HTTPS (service workers need a secure context).
    // Deliberately NOT on localhost, so a cache-first worker never serves stale files while you develop with Live Server.
    try { if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (_) { /* ignore */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
