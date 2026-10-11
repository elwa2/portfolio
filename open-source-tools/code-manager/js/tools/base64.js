  // ── BASE64 DASHBOARD ──
  let showB64Dash = false;
  let b64ActiveTab = 'encode';
  let b64EncodeFile = null;
  let b64ImageFiles = [];
  let b64ImageCounter = 0;
  let showQrDash = false;
  let qrSize = 280;
  let qrDark = '#1a1a2e';
  let qrLight = '#ffffff';
  let qrECC = 'M';
  let qrMargin = 1;
  let qrCache = null;

  function toggleB64Dash(){
    showB64Dash = !showB64Dash;
    document.getElementById('b64DashBtn').classList.toggle('b64-active', showB64Dash);
    if(showB64Dash){
      document.querySelectorAll('.filter-tag:not(#b64DashBtn)').forEach(b => b.classList.remove('active'));
      showCssDash = false;
      document.getElementById('cssDashBtn').classList.remove('css-active');
      showHomeDash = false;
      document.getElementById('homeBtn').classList.remove('home-active');

      showScrollbarDash = false;


      showEdDash = false;
      showDevDash = false;
      showQrDash = false;
      showCpDash = false;
      showRtDash = false;

      document.getElementById('sbDashBtn').classList.remove('scrollbar-active');


      document.getElementById('edDashBtn').classList.remove('ed-active');
      document.getElementById('devDashBtn').classList.remove('dev-active');
      document.getElementById('qrDashBtn').classList.remove('qr-active');
      document.getElementById('cpDashBtn').classList.remove('cp-active');
      document.getElementById('rtDashBtn').classList.remove('rt-active');
    }
    renderAll();
  }

  function toggleQrDash(){
    showQrDash = !showQrDash;
    document.getElementById('qrDashBtn').classList.toggle('qr-active', showQrDash);
    if(showQrDash){
      document.querySelectorAll('.filter-tag:not(#qrDashBtn)').forEach(b => b.classList.remove('active'));
      showCssDash = false;
      document.getElementById('cssDashBtn').classList.remove('css-active');
      showHomeDash = false;
      document.getElementById('homeBtn').classList.remove('home-active');

      showScrollbarDash = false;


      showEdDash = false;
      showDevDash = false;
      showB64Dash = false;

      document.getElementById('sbDashBtn').classList.remove('scrollbar-active');


      document.getElementById('edDashBtn').classList.remove('ed-active');
      document.getElementById('devDashBtn').classList.remove('dev-active');
      document.getElementById('b64DashBtn').classList.remove('b64-active');
      showCpDash = false;
      showRtDash = false;
      document.getElementById('cpDashBtn').classList.remove('cp-active');
      document.getElementById('rtDashBtn').classList.remove('rt-active');
    }
    renderAll();
  }

  function toggleCpDash(){
    showCpDash = !showCpDash;
    document.getElementById('cpDashBtn').classList.toggle('cp-active', showCpDash);
    if(showCpDash){
      document.querySelectorAll('.filter-tag:not(#cpDashBtn)').forEach(b => b.classList.remove('active'));
      showCssDash = false;
      document.getElementById('cssDashBtn').classList.remove('css-active');
      showHomeDash = false;
      document.getElementById('homeBtn').classList.remove('home-active');

      showScrollbarDash = false;


      showEdDash = false;
      showDevDash = false;
      showB64Dash = false;
      showQrDash = false;
      showRtDash = false;

      document.getElementById('sbDashBtn').classList.remove('scrollbar-active');


      document.getElementById('edDashBtn').classList.remove('ed-active');
      document.getElementById('devDashBtn').classList.remove('dev-active');
      document.getElementById('b64DashBtn').classList.remove('b64-active');
      document.getElementById('qrDashBtn').classList.remove('qr-active');
      document.getElementById('rtDashBtn').classList.remove('rt-active');
    }
    renderAll();
  }

