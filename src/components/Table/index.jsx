import React, { useState, useEffect } from 'react';
import './styles.css';
import axios from 'axios';

const Table = ({ filters }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [filteredData, setFilteredData] = useState([]);
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [saldoFiltrado, setSaldoFiltrado] = useState(0);

  const { dataInicio, dataFim, operador, conta } = filters;


  function mapApiResponseToDataFormat(apiResponse) {
    return apiResponse.map((item) => {
      return {
        id: item.id,
        data_transferencia: item.dataTransferencia,
        valor: item.valor,
        tipo: item.tipo,
        nome_operador_transacao: item.nomeOperadorTransacao,
        conta_id: item.conta.id,
      };
    });
  }

  function formatDateToISO(dateString) {
    // assumindo que dateString está no formato "YYYY-MM-DD"
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
  
  useEffect(() => {
    const params = {};
    let endpoint = 'http://localhost:8080/banco/transferencias';
    
    // Define qual endpoint será usado de acordo com os filtros
    if (dataInicio && dataFim && operador) {
      params.dataInicial = formatDateToISO(dataInicio) + 'T00:00:00';
      params.dataFinal = formatDateToISO(dataFim) + 'T00:00:00';
      params.nomeOperador = operador;
      endpoint = 'http://localhost:8080/banco/transferencias-todos-filtros';
    } else if (dataInicio && dataFim && operador &&numeroConta) {
      params.dataInicial = formatDateToISO(dataInicio) + 'T00:00:00';
      params.dataFinal = formatDateToISO(dataFim) + 'T00:00:00';
      params.nomeOperador = operador;
      endpoint = 'http://localhost:8080/banco/transferencias-todos-filtros-conta';
    } else if (dataInicio && dataFim) {
      params.dataInicial = formatDateToISO(dataInicio) + 'T00:00:00';
      params.dataFinal = formatDateToISO(dataFim) + 'T00:00:00';
      endpoint = `http://localhost:8080/banco/transferencias-por-data`;
    } else if (operador) {
      endpoint = `http://localhost:8080/banco/transferencias-por-operador/${operador}`;
    } else if(conta) {
      params.conta = conta;
      endpoint = `http://localhost:8080/banco/transferencias-por-conta/${conta}`;
    }
  
    // Get total balance
    if (conta) {
      axios.get(`http://localhost:8080/banco/saldo-total/${conta}`)
        .then((response) => {
          setSaldoTotal(response.data);
        })
        .catch((error) => {
          console.error(`There was an error retrieving the total balance: ${error}`);
        });
    } else {  // Caso nenhuma conta seja selecionada, pegar o saldo de todas as transações
      axios.get(`http://localhost:8080/banco/saldo-total`)
        .then((response) => {
          setSaldoTotal(response.data);
        })
        .catch((error) => {
          console.error(`There was an error retrieving the total balance: ${error}`);
        });
    }
  
    // Get filtered balance
    if (conta) {
      let endpointSaldoFiltrado = 'http://localhost:8080/banco/saldo-total-periodo';
      const paramsSaldoFiltrado = {
        numeroConta: conta,
      };
      if (dataInicio && dataFim) {
        paramsSaldoFiltrado.dataInicial = formatDateToISO(dataInicio) + 'T00:00:00';
        paramsSaldoFiltrado.dataFinal = formatDateToISO(dataFim) + 'T00:00:00';
      }
      axios.get(endpointSaldoFiltrado, {
        params: paramsSaldoFiltrado,
      })
      .then((response) => {
        setSaldoFiltrado(response.data);
      })
      .catch((error) => {
        console.error(`There was an error retrieving the filtered balance: ${error}`);
      });
    } else {  // Caso nenhuma conta seja selecionada, pegar o saldo filtrado de todas as transações
      let endpointSaldoFiltrado = 'http://localhost:8080/banco/saldo-filtrado-todos';  // Novo endpoint que retorna o saldo filtrado considerando todos os registros
      const paramsSaldoFiltrado = {};
      if (dataInicio && dataFim) {
        paramsSaldoFiltrado.dataInicial = formatDateToISO(dataInicio) + 'T00:00:00';
        paramsSaldoFiltrado.dataFinal = formatDateToISO(dataFim) + 'T00:00:00';
      }
      if (operador) {
        paramsSaldoFiltrado.operador = operador;
      }
      axios.get(endpointSaldoFiltrado, {
        params: paramsSaldoFiltrado,
      })
      .then((response) => {
        setSaldoFiltrado(response.data);
      })
      .catch((error) => {
        console.error(`There was an error retrieving the filtered balance: ${error}`);
      });
    }
  
    // Get transactions
    axios.get(endpoint, { params })
      .then((response) => {
        setFilteredData(mapApiResponseToDataFormat(response.data));
      })
      .catch((error) => {
        console.error(`There was an error retrieving the transactions: ${error}`);
      });

  }, [dataInicio, dataFim, operador, conta]);  // Adicionado "conta" como dependência do useEffect


  useEffect(() => {
    if (!dataInicio && !dataFim && !operador) {
      setSaldoFiltrado(saldoTotal);
    }
  }, [dataInicio, dataFim, operador, saldoTotal]);


  const formatReal = (amount) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  }

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
            <div className='w-1/2'>
              <span className='mr-1'>Saldo total: </span>
              <span className={saldoTotal < 0 ? "text-red-500" : "text-blue-500"}>
                {conta ? formatReal(saldoTotal) : "Selecione uma conta"}
              </span>
            </div>
            <div className='w-1/2'>
            <span className='mr-1'>Saldo filtrado: </span> 
              <span className={saldoFiltrado < 0 ? "text-red-500" : "text-blue-500"}>
                {conta ? formatReal(saldoFiltrado) : "Selecione uma conta"}
              </span>
            </div>
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