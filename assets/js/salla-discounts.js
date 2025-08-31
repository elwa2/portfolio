function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(function() {
    button.classList.add('copied');
    setTimeout(function() {
      button.classList.remove('copied');
    }, 2000);
  }, function(err) {
    console.error('Could not copy text: ', err);
  });
}
