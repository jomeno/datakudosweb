import React from 'react'
import logo from './logo.svg'
import './App.css'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

type dataset = {
  name:string;

}

function App() {


  const [datasets, setDatasets] = useState<dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<dataset>()

  const handleSelectDataset = (dataset: dataset)=>{
    console.log('Selected dataset', dataset)
    if(!dataset) return;
    setSelectedDataset(dataset);
  }

    useEffect(()=>{

      const url = process.env.REACT_APP_API_BASE + '/datasets'

      fetch(url, {
        method: 'GET',
        headers : {'Content-Type' : 'application/json'}
      }).then(resp=>{
        if(resp) return resp.json();        
      }).then(result=>{
        console.log('Metadata fetched from API, powered by document db like mongodb.', result)
        setDatasets(result)
        if(result && result[0]) setSelectedDataset(result[0])
      })        
      
      //console.log('datasets', datasets)

    }, [])


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" style={{width: 100}} alt="logo" /> Datakudos    
      </header>
      
      <div className="container">
        <div className="row">
          <div className="col-md-4 mt-4">

            <div className="list-group">
              {
                datasets.map((item, index)=>{
                  return (<Link to="#" onClick={()=>handleSelectDataset(item)} className={selectedDataset?.name === item?.name ? 'list-group-item list-group-item-dark active' : 'list-group-item list-group-item-action'} key={index}>
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">{item.name}</h5>
                      <small>3 fields</small>
                    </div>
                    <p className="mb-1 text-left">{
                      index === 0 ? 'Some user friendly description' : 
                      index === 1 ? 'Maybe another user friendly description' : 'Or maybe not, up to design team'
                    }</p>
                  </Link>)
                })
              }
              
            </div>
          </div>
          <div className="col-md-8 p-4">
            <div className="mb-5">
            <div className="p-5 mb-4 bg-light rounded-3">
              <div className="container-fluid py-5">
                <h1 className="display-5 fw-bold">{selectedDataset?.name} report</h1>
                <p className="col-md-8 fs-4">Maybe a realtime, live preview as the user is curating their report by picking fields and filters from the related datasets below.</p>
                <p>The related datasets below have been determined automatically by parsing metadata only, sparing the user the agony of manually creating and maintainig joins for their reports.</p>
                <button className="btn btn-primary btn-lg" type="button">Download Report</button>
              </div>
            </div>
            </div>
            <h5>
              Related details
            </h5>
            <p>
              Enrich your report by adding related information.
            </p>
            <div className="accordion" id="accordionExample">
              <div className="card-group">
                
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Compensation</h5>
                    <p className="card-text">Click to add or remove</p>                    
                    
                    <div className="mb-3">
                      <span className="badge rounded-pill bg-light text-dark border border-secondary me-1">Firstname</span>
                      <span className="badge rounded-pill bg-light text-dark me-1">Compensation Plan</span>
                      <span className="badge rounded-pill bg-light text-dark me-1">Height</span>
                    </div>
                    <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Medical Insurance</h5>
                    <p className="card-text">Maybe some basic instruction here for user guidance.</p>
                    <p className="card-text"><small className="text-muted">Last updated 1 hr ago</small></p>
                  </div>
                </div>



              </div>
            </div>
            

          </div>
        </div>
        
      </div>
    </div>
  );
}

export default App;
