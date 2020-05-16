import React from 'react';
import './App.css';
import TextMap from './components/TextMap/TextMap';
import { StoreProvider, useStore } from './store/store';

function App() {

  const store = useStore();

  return (
    <StoreProvider value={store}>
    <div className="App">
      <TextMap/>
    </div>
    </StoreProvider>
  );
}

export default App;
