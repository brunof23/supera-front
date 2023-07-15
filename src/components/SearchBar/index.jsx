import React, { useState } from 'react';
import './styles.css';

const SearchBar = ({ onFilterSubmit }) => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [operador, setOperador] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterSubmit({ dataInicio, dataFim, operador });
  };

  const handleClear = (e) => {
    e.preventDefault();
    setDataInicio('');
    setDataFim('');
    setOperador('');
    onFilterSubmit({ dataInicio: '', dataFim: '', operador: '' });
  };

  return (
    <div className="mt-2 max-w-full md:mx-20 mx-auto bg-white rounded-xl shadow items-center">
      <form onSubmit={handleSubmit} className='flex-column w-full p-4 px-6'>
        <div className='flex flex-wrap justify-between gap-3 w-full'>
          <div className='w-full md:w-1/4 flex flex-col'>
            <label htmlFor='dataInicio'>Data de Início</label>
            <input 
              type="date" 
              id="dataInicio" 
              name="dataInicio" 
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)}
              className='border-2 rounded p-1'
              max="2999-12-31"
              min="1900-01-01"
            />
          </div>
          <div className='w-full md:w-1/4 flex flex-col'>
            <label htmlFor='dataFim' className='font-bold text-xs mb-1'>Data de Fim</label>
            <input 
              type="date" 
              id="dataFim" 
              name="dataFim" 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)}
              className='border-2 rounded p-1'
              max="2999-12-31"
              min="1900-01-01"
            />
          </div>
          <div className='w-full md:w-1/4 flex flex-col'>
            <label htmlFor='operador' className='font-bold text-xs mb-1'>Nome operador transacionado</label>
            <input 
              type="text" 
              id="operador" 
              name="operador" 
              value={operador} 
              onChange={(e) => setOperador(e.target.value)}
              className='border-2 rounded p-1'
            />
          </div>
        </div>
        <div className='flex justify-around mt-2'>
          <button type="button" onClick={handleClear} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 mt-2 px-4 rounded text-sm">LIMPAR FILTROS</button>
          <button type="submit" id='submit'>PESQUISAR</button>
        </div>
      </form>
    </div>
  )
}

export default SearchBar
