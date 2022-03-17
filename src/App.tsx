//import React from 'react'
import logo from './logo.svg'
import './App.css'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
//import { FieldTag, RelatedDatasetCard } from './Home';

function App() {


  const [datasets, setDatasets] = useState<dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<dataset>()
  const [relatedDatasets, setRelatedDatasets] = useState<dataset[]>([])

  const getRelatedDatasets =(dataset:dataset)=>{
    if(!dataset || !dataset.name) return [];
    console.log('Determine related datasets...')
    let datasetId = dataset.name + 'Id'
    // Strip white spaces
    datasetId = datasetId.replace(/ /g, '')
    //console.log('The relationship is by', datasetId)
    // Get all datasets with this relationship in their fields
    let relatedDatasets: dataset[] = []
    for(let i = 0; i < datasets.length; i++){
      let fields = datasets[i].fields
      fields.map(f=>{
        let fieldLast2Characters = f.name.substring(f.name.length - 2)
        if(fieldLast2Characters === 'Id') {
          console.log('Found one or more related datasets')

          // Prevent duplicate entries
          let datasetExist = relatedDatasets.filter(d=>d.name === datasets[i].name)[0]
          if(!datasetExist){            

            let relatedDataset = datasets[i]            

            // Prevent adding selected dataset
            if(dataset.name !== relatedDataset.name){

              // If Compensation has MedicalInsuranceId or MedicalInsurance has CompensationId
              let datasetCommaFields = dataset.fields.map(f=>f.name).join(',') // Compensation
              
              let relationCommaFields = relatedDataset.fields.map(f=>f.name).join(',') // Medical Insurance
              let relatedDatasetId = relatedDataset.name + 'Id'
              
                if(datasetCommaFields.includes(relatedDatasetId) || relationCommaFields.includes(datasetId)){
                  relatedDatasets.push(relatedDataset)
                  //console.log(dataset.name + ' has ' + relatedDatasetId + ' or ' + relatedDataset.name + ' has ' + datasetId)
                }else{
                  //console.log(dataset.name + ' does not have ' + relatedDatasetId + ' and ' + relatedDataset.name + ' does not have ' + datasetId)
                }
              }
          }            
        }
        return f        
      })
    }
    
    console.log('Related datasets', relatedDatasets)
    
    return relatedDatasets
  }

  const handleDownloadClick = ()=>{

    console.log('User clicked Download.')    
    if(relatedDatasets.length > 0){
      
      console.log('Automatically generated SQL query with join...')
      console.log('SELECT * FROM Employee LEFT JOIN Compensation ON Employee.Id = Compensation.EmployeeId')
    }else{
      console.log("But we're not interested in this boring scenario yet. Please select Employee dataset")
    }   
    
    //alert('Download in progress...')
  }

  const handleFieldClick = (relatedDatasetIndex:number, fieldIndex:number)=>{

    if(relatedDatasets){
      console.log('User selected Field', relatedDatasets[relatedDatasetIndex].fields[fieldIndex])
      let isSelected = relatedDatasets[relatedDatasetIndex].fields[fieldIndex].isSelected
      relatedDatasets[relatedDatasetIndex].fields[fieldIndex].isSelected = !isSelected
      setRelatedDatasets([...relatedDatasets])
    }

  }

  const handleSelectDataset = (dataset: dataset)=>{
    console.log('User selected Dataset', dataset)

    // Get related datasets
    let relatedDatasets = getRelatedDatasets(dataset);

    // Update state
    setRelatedDatasets([...relatedDatasets])
    setSelectedDataset(dataset)
  }

    useEffect(()=>{

      const url = process.env.REACT_APP_API_BASE + '/datasets'

      fetch(url, {
        method: 'GET',
        headers : {'Content-Type' : 'application/json'}
      }).then(resp=>{
        if(resp) return resp.json();        
      }).then(datasets=>{
        console.log('Metadata fetched from API, maybe powered by a document db like mongodb.', datasets)
        setDatasets(datasets)
        
        // if(datasets && datasets[0]) {
        //   for(let i = 0; i < relatedDatasets.length; i++){
        //     relatedDatasets[i].selectedFieldIndex = 0
        //   }
        // }
      })

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
                      <small className='d-none'>3 fields</small>
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
                <h1 className="display-5 fw-bold">{selectedDataset?.name} {!selectedDataset?'Reports':'reports'}</h1>
                <p className="col-md-8 fs-4">What {selectedDataset?.name} information do you need?</p>

                {
                  selectedDataset? <p className="fs-4">
                  How about realtime, live preview as you curate, filter and add details into your report.
                </p>: <></>
                }
                
                <p className="d-none">The related datasets below have been determined automatically by parsing metadata only, sparing the user the agony of manually creating and maintainig joins for their reports.</p>
                {selectedDataset ? <button className="btn btn-primary btn-lg" onClick={()=> handleDownloadClick()} type="button">Download</button> : <></>}
              </div>
            </div>
            </div>
            {
              relatedDatasets.length > 0 ? 
                <>
                  <h5>
                    Related details
                </h5>
                <p>
                  Enrich your report by adding related information easily.
                </p>
                </>                
                :
                <></>
            }
            
            

            {
              // relatedDatasets?.map((relation, index)=>{
              //   return (
              //     <RelatedDatasetCard 
              //       dataset={relation} 
              //       handleFieldClick={handleFieldClick}
              //       datasetIndex={index}
              //       key={index}
              //       ></RelatedDatasetCard>
              //   )
              // })
            }
            
            <div className="accordion" id="accordionExample">
              <div className="card-group">
                {
                  relatedDatasets?.map((relation, relationIndex)=>{
                    return(
                      <div className="card" key={relationIndex}>
                        <div className="card-body">
                          <h5 className="card-title">{relation.name}</h5>
                          <p className="card-text">{relationIndex === 0 ? 'Toggle to add or remove' : 'Maybe some basic user instruction here.'}</p>                    
                          
                          <div className="mb-3">
                            {
                              relation.fields.map((field, fieldIndex)=>{
                                if(fieldIndex === 0) return null;
                                return (<Link to="#" onClick={()=> handleFieldClick(relationIndex, fieldIndex)} key={fieldIndex}>
                                  <span className={field.isSelected ? 'badge rounded-pill bg-light text-dark border border-secondary me-1' : 'badge rounded-pill bg-light text-dark me-1'}>
                                    {field.name}
                                  </span></Link>)

                              })
                            }
                            
                            {/* <Link to="#"><span className="badge rounded-pill bg-light text-dark me-1">Compensation Plan</span></Link>
                            <Link to="#"><span className="badge rounded-pill bg-light text-dark me-1">Height</span></Link> */}
                          </div>
                          <p className="card-text"><small className="text-muted">Last updated {relationIndex === 0 ? '3 mins' : '2 days'} ago</small></p>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
            

          </div>
        </div>
        
      </div>
    </div>
  );
}

export default App;
