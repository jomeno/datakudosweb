import logo from './logo.svg'
import './App.css'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function App() {

  const [datasets, setDatasets] = useState<dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<dataset>()
  const [relatedDatasets, setRelatedDatasets] = useState<dataset[]>([])
  const [relatedFields, setRelatedFields] = useState<field[]>([])
  const [reportQuery, setReportQuery] = useState<string>()
  const [downloadRequested, setDownloadRequested] = useState<boolean>(false)

  const getRelatedDatasets =(dataset:dataset)=>{
    if(!dataset || !dataset.name) return [];

    console.log('Determine related datasets...')
    let datasetId = dataset.name + 'Id'

    // Get all datasets with this relationship in their fields
    let relatedDatasets: dataset[] = []
    for(let i = 0; i < datasets.length; i++){
      let fields = datasets[i].fields
      fields.map(field=>{
        let fieldLast2Characters = field.name.substring(field.name.length - 2)
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
        return field        
      })
    }
    
    console.log('Related datasets', relatedDatasets)
    
    return relatedDatasets
  }

  const getRelatedFields = (relatedDatasets:dataset[]): field[] => {

    // Extract participating related fields

    let relatedFields:field[] = []
    relatedDatasets.forEach((d, datasetIndex) => d.fields.forEach((f, fieldIndex)=> {
      f.datasetIndex = datasetIndex
      if(fieldIndex > 0 && f.isSelected) relatedFields.push(f)
    }))

    return relatedFields
  }

  const getResultQuery = (selectedDataset:dataset | undefined, relatedFields:field[]) => {
    if(!selectedDataset) return

    let baseDatasetName = selectedDataset.name
    let baseQuery = 'SELECT * FROM ' + baseDatasetName + ' d0 '

    let joinQuery = ''
    for(let i = 0; i < relatedDatasets.length; i++){

      let datasetName = relatedDatasets[i].name
      let datasetAlias = 'd' + (i + 1)

      // Determine the join dataset
      let joinFieldName1 = baseDatasetName + 'Id'

      //console.log('joinFieldName', joinFieldName1)

      // Determine if joinField is valid
      let joinField = relatedDatasets[i].fields.filter(f=>f.name === joinFieldName1)[0]

      //console.log('joinField', joinField)
      if(!joinField){
        joinFieldName1 = relatedDatasets[i].name + 'Id'
      }else{
        //if(baseDatasetName === selectedDataset.name) joinFieldName1 = 'Id'
      }

      //console.log('joinFieldName', joinFieldName1)      

      // Only add a left join if there is atleast 1 field from the dataset
      let fieldFromDataset = relatedFields.filter(f=>f.datasetIndex === i)[0]
      //console.log('fieldFromDataset', fieldFromDataset)
      if(fieldFromDataset){
        //let fromDataset = relatedDatasets[fieldFromDataset.datasetIndex]
        //console.log('fromDataset', fromDataset)

        let joinFieldName2 = joinFieldName1 + ' '

        //if(joinFieldName2 === fromDataset.name + 'Id') joinFieldName2 = 'Id'
        joinQuery += 'LEFT JOIN ' + datasetName + ' ' + datasetAlias + ' ON d0.' + joinFieldName1 + ' = ' + datasetAlias + '.' + joinFieldName2
      }
    }

    let query = baseQuery + joinQuery

    return query.trim()
  }

  const handleDownloadClick = ()=>{

    console.log('User clicked Download.')
    console.log('Generating SQL query...')
    let query = getResultQuery(selectedDataset, relatedFields)

    console.log(query)
    setReportQuery(query)
    setDownloadRequested(true)  
  }

  const handleFieldClick = (relatedDatasetIndex:number, fieldIndex:number)=>{

    if(relatedDatasets){
      console.log('User selected Field', relatedDatasets[relatedDatasetIndex].fields[fieldIndex])
      let isSelected = relatedDatasets[relatedDatasetIndex].fields[fieldIndex].isSelected
      relatedDatasets[relatedDatasetIndex].fields[fieldIndex].isSelected = !isSelected

      let relatedFields = getRelatedFields(relatedDatasets)

      setRelatedDatasets([...relatedDatasets])
      setRelatedFields(relatedFields)
      let query = getResultQuery(selectedDataset, relatedFields)
      setReportQuery(query)
    }

  }

  const handleSelectDataset = (dataset: dataset)=>{
    console.log('User selected Dataset', dataset)

    // Get related datasets
    let relatedDatasets = getRelatedDatasets(dataset);
    
    setRelatedFields([...relatedFields])

    // Update state
    setRelatedDatasets([...relatedDatasets])
    setSelectedDataset(dataset)
    setReportQuery('')
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
                      <h5 className="mb-1">{item.friendlyName}</h5>
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
            <div className="mt-5">
              <div className="h-100 p-5 bg-light rounded-3">
                <h5>Use case</h5>
                <p>Compensation and Medical Insurance are both related to Employee by EmployeeId</p>
                <p>Therefore, as a user, when I choose a dataset above, say Employee for example, I want to see only related datasets in the Related details section.</p>                
              </div>
            </div>
          </div>
          <div className="col-md-8 p-4">
            <div className="mb-5">
            <div className="p-5 mb-4 bg-light rounded-3">
              <div className="container-fluid py-3">
                <h1 className="display-5 fw-bold">{selectedDataset?.friendlyName} {!selectedDataset?'Reports':'reports'}</h1>
                <p className="col-md-8 fs-4">What {selectedDataset?.friendlyName} information do you need?</p>

                {
                  selectedDataset? <p className="fs-4">
                  How about realtime, live preview as you curate, filter and add details into your report.
                </p>: <></>
                }
                
                <p className="pt-4"><code className="fs-5">{reportQuery}</code></p>
                {selectedDataset ? <button className="btn btn-primary btn-lg mb-3" onClick={()=> handleDownloadClick()} type="button">Download</button> : <></>}
                
                {
                  downloadRequested && 
                  <>
                    <p><small>Okay, sending your request off to a backend service, will keep you posted.</small></p>
                  </>
                }                
                
              </div>
            </div>
            </div>
            {
              relatedDatasets.length > 0 && 
                <>
                  <h5>
                      {
                        relatedFields.length === 0 ? <>Related details</>
                        :
                        <>
                          {
                            relatedFields.length === 1 ? '1 Related detail' : relatedFields.length + ' Related details'
                          }                      
                        </>
                      }
                  </h5>
                  <p>
                    Enrich your report by adding related information easily.
                  </p>
                </>
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
                          <h5 className="card-title">{relation.friendlyName}</h5>
                          <p className="card-text">{relationIndex === 0 ? 'Toggle to add or remove' : 'Maybe some basic user instruction here.'}</p>                    
                          
                          <div className="mb-3">
                            {
                              relation.fields.map((field, fieldIndex)=>{
                                if(fieldIndex === 0) return null;
                                return (<Link to="#" onClick={()=> handleFieldClick(relationIndex, fieldIndex)} key={fieldIndex}>
                                  <span className={field.isSelected ? 'badge rounded-pill bg-light text-dark border border-secondary me-1' : 'badge rounded-pill bg-light text-dark me-1'}>
                                    {field.friendlyName}
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
