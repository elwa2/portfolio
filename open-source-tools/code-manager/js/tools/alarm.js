  // ── ALARM BOOTSTRAP — يشتغل مع الصفحة ويستمر في أي تاب ──
  alEnsureTick();
  alBuildOverlay();
  if (alStore.ringing){
    // الصفحة اتقفلت وهو بيرن → كمّل نفس المرحلة، أو ارجع للرن لو الاستراحة خلصت
    const restLeft = (alStore.phase === 'rest') ? alStore.phaseEndsAt - Date.now() : 0;
    if (alStore.phase === 'rest' && restLeft > 1000){
      alStore.phaseEndsAt = Date.now() + Math.min(restLeft, alStore.restFor);
    } else {
      alStore.phase = 'ring';
      alStore.phaseEndsAt = Date.now() + alStore.ringFor;
    }
    saveAl();
    alRingStart();
  } else if (alStore.armed && Date.now() >= alStore.dueAt) alFire();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) alTick(); });
  window.addEventListener('focus', alTick);
  window.addEventListener('pageshow', alTick);

  if (currentHash()) { hashGo(); }
  else { restoreDashState(); renderAll(); }
  document.getElementById('wrapBtn').classList.add('active');
  document.querySelectorAll('.code-pre').forEach(el => el.classList.add('wrap'));
