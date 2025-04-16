const worker = new Worker('worker.js');
const input = document.getElementById('textInput');
const saveBtn = document.getElementById('saveBtn');
const list = document.getElementById('itemList');

console.log('Main script loaded');

worker.onmessage = (e) => {
  const { type, data, error } = e.data;
  console.log('Message from worker:', type, data, error);

  if (type === 'ready') {
    console.log('DB is ready');
    worker.postMessage({
      action: 'exec',
      payload: 'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT);',
      requestId: 'init'
    });

    worker.postMessage({
      action: 'select',
      payload: 'SELECT * FROM items;',
      requestId: 'load'
    });
  }

  if (type === 'insert-done') {
    console.log('Insert completed');
    // After insert, re-load list
    worker.postMessage({
      action: 'select',
      payload: 'SELECT * FROM items;',
      requestId: 'refresh'
    });
  }

  if (type === 'select-result') {
    console.log('Received select results:', data);
    list.innerHTML = '';
    
    if (!data[0]) {
      console.log('No data returned or empty result set');
      return;
    }
    
    const results = data[0].values || [];
    console.log('Processing results:', results);
    
    results.forEach(([id, content]) => {
      console.log('Creating list item:', id, content);
      const li = document.createElement('li');
      li.textContent = content;
      list.appendChild(li);
    });
  }

  if (type === 'error') {
    console.error('SQLite error:', error);
  }
};

worker.onerror = (err) => {
  console.error('Worker error:', err);
};

saveBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;
  console.log('Saving text:', text);

  // Send the text to the worker and let it handle SQL parameter binding
  worker.postMessage({
    action: 'insert',
    payload: text,
    requestId: 'insert'
  });

  input.value = '';
};

console.log('Event listeners set up');