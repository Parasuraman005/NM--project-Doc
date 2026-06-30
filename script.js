function openDoc(type) {
  switch (type) {
    case 'phase':
      alert('Open Phase Document');
      break;
    case 'ppt':
      alert('Open PPT');
      break;
    case 'final':
      alert('Open Final Document');
      break;
    case 'team':
      alert('Open Team Info');
      break;
    default:
      alert('Invalid Option');
  }
}
function openFile(filePath, errorMsg) {
  const link = document.createElement('a');
  link.href = filePath;
  const filename = filePath.split('/').pop();
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
function goBack() {
  window.history.back();
}