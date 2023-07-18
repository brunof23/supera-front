// App.js
import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import Table from './components/Table';
import './App.css';

function App() {
  const [filters, setFilters] = useState({
    dataInicio: '',
    dataFim: '',
    operador: '',
    conta: '',
  });

  return (
    <div className="App">
      <SearchBar onFilterSubmit={setFilters} />
      <Table filters={filters} />
    </div>
  );
}

export default App;