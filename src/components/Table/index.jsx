import React, { useState, useEffect } from 'react';
import { data } from '../../db.js';
import './styles.css';

const Table = ({ filters }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [filteredData, setFilteredData] = useState([]);

  const { dataInicio, dataFim, operador } = filters;

  useEffect(() => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (dataFim) {
      fim.setDate(fim.getDate() + 1);
    }

    const filterData = (transacao) => {
      let isValidDate = true;
      let isValidOperador = !operador || (transacao.nome_operador_transacao && transacao.nome_operador_transacao.toLowerCase().includes(operador.toLowerCase()));
    
      if (dataInicio || dataFim) {
        let dataTransacao = new Date(transacao.data_transferencia);
    
        if (dataInicio) {
          let inicio = new Date(dataInicio);
          isValidDate = dataTransacao >= inicio;
        }
    
        if (isValidDate && dataFim) {
          let fim = new Date(dataFim);
          fim.setDate(fim.getDate() + 1);
          isValidDate = dataTransacao < fim;
        }
      }
    
      return isValidDate && isValidOperador;
    }

    setFilteredData(Object.values(data.transferencia).filter(filterData));
    setCurrentPage(0); // reseta a paginação para 0 quando os filtros mudarem
  }, [dataInicio, dataFim, operador]);

  const formatReal = (amount) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  }

  const saldoTotal = Object.values(data.transferencia).reduce((total, transacao) => total + transacao.valor, 0);
  const saldoFiltrado = filteredData.reduce((total, transacao) => total + transacao.valor, 0);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const pagination = () => {
    let start = Math.max(currentPage - 4, 0);
    let end = Math.min(start + 9, totalPages);
    start = Math.max(end - 9, 0); // recalcula o start se o end for menor que 9
    let pages = Array(end - start).fill().map((_, idx) => start + idx);

    return pages;
  };

  return (
    <div className="mt-1 flex flex-col max-w-full overflow-auto">
      <div className="my-2">
        <div className="align-middle inline-block min-w-full px-0 m-0 sm:px-6 lg:px-20">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg divide-y divide-x">
          <div className='flex w-full text-center text-xs font-medium text-gray-500 uppercase tracking-wider overflow-ellipsis overflow-hidden bg-gray-50 items-center h-8'>
            <div className='w-1/2'>Saldo total: <span className={saldoTotal < 0 ? "text-red-500" : "text-green-500"}>{formatReal(saldoTotal)}</span></div>
            <div className='w-1/2'>Saldo filtrado: <span className={saldoFiltrado < 0 ? "text-red-500" : "text-green-500"}>{formatReal(saldoFiltrado)}</span></div>
      </div>
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className='divide-x'>
                  <th className='w-1/12'>Id</th>
                  <th>Data</th>
                  <th>Quantia</th>
                  <th>Tipo</th>
                  <th className='w-2/6'>Nome Operador Transacionado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {Array.from({ length: itemsPerPage }).map((_, i) => {
                  const transacao = filteredData[i + currentPage * itemsPerPage];

                  if (transacao) {
                    return (
                      <tr key={transacao.id} className='divide-x divide-slate-50'>
                        <td className='w-1/12'>{transacao.id}</td>
                        <td>{new Date(transacao.data_transferencia).toLocaleDateString()}</td>
                        <td>{formatReal(transacao.valor)}</td>
                        <td>{transacao.tipo}</td>
                        <td className='w-2/6'>{transacao.nome_operador_transacao || "N/A"}</td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr key={`empty-row-${i}`}>
                        <td className='w-1/12'>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td className='w-2/6'>&nbsp;</td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
          <div className="text-sm text-gray-500 pt-3 w-full mx-auto flex justify-center">
            <span className='pr-1'><strong>{filteredData.length}</strong> registros encontrados. Exibindo</span>  
            {filteredData.length > 0 ? (
              (currentPage * itemsPerPage + 1 === Math.min((currentPage + 1) * itemsPerPage, filteredData.length)) ? 
                `o ${currentPage * itemsPerPage + 1}`: 
                `de ${currentPage * itemsPerPage + 1} a ${Math.min((currentPage + 1) * itemsPerPage, filteredData.length)}`
            ) : ""}
          </div>
          <div className="flex justify-center space-x-2 text-xs p-3">
            <button onClick={(e) => { e.preventDefault(); setCurrentPage(0) }} disabled={currentPage === 0} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">{"<<"}</button>
            <button onClick={(e) => { e.preventDefault(); setCurrentPage(currentPage - 1) }} disabled={currentPage === 0} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">{"<"}</button>
            {pagination().map((page) => (
              <button onClick={(e) => { e.preventDefault(); setCurrentPage(page) }} className={page === currentPage ? 'px-3 py-1 border border-blue-500 bg-blue-500 text-white rounded-md text-sm font-medium' : 'px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'} key={page}>{page + 1}</button>
            ))}
            <button onClick={(e) => { e.preventDefault(); setCurrentPage(currentPage + 1) }} disabled={currentPage >= totalPages - 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">{">"}</button>
            <button onClick={(e) => { e.preventDefault(); setCurrentPage(totalPages - 1) }} disabled={currentPage >= totalPages - 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">{">>"}</button>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Table;
